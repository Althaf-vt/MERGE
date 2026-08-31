import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { IPkiResult, IPkiVerificationService } from "../../domain/interfaces/kyc-service.interface";
import path from "path";
import AdmZip from "adm-zip";
import { DOMParser } from "@xmldom/xmldom";
import * as fs from 'fs';
import { SignedXml } from "xml-crypto";
import { Warning$ } from "@aws-sdk/client-textract";
import { error } from "console";


@Injectable()
export class AadharPkiService implements IPkiVerificationService{
    private readonly logger = new Logger(AadharPkiService.name);
    private readonly rootCertPath = path.join(process.cwd(), 'assets', 'kyc-docs-public-keys', 'uidai_offline_publickey.cer');

    private parseAadhaarDate(dobStr: string): Date{
        if(!dobStr){
            throw new BadRequestException("Date of Birth atttribute is missing in e-KYC XML.");
        }

        // Handles DD-MM-YYYY format
        if (/^\d{2}-\d{2}-\d{4}$/.test(dobStr)) {
            const [day, month, year] = dobStr.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        }

        // Handles YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
            const [year, month, day] = dobStr.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        }

        // Handles YYYY only format
        if (/^\d{4}$/.test(dobStr)) {
            return new Date(Date.UTC(Number(dobStr), 0, 1));
        }

        const parsedDate = new Date(dobStr);
        if(isNaN(parsedDate.getTime())){
            throw new BadRequestException(`Unrecognized Date of Birth format: ${dobStr}`);
        }

        return parsedDate;
    }

    private normalizePem(certContent: string): {pem: string, base64: string}{
        const base64 = certContent
            .replace(/-----BEGIN CERTIFICATE-----/g, '')
            .replace(/-----END CERTIFICATE-----/g, '')
            .replace(/\s+/g, '');

        const pem = `-----BEGIN CERTIFICATE-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`;
        return {pem, base64};
    }

    async verifyAadhaarXml(zipBuffer: Buffer, shareCode: string): Promise<IPkiResult> {
        try {


            if(!zipBuffer || zipBuffer.length === 0){
                throw new BadRequestException('Zip buffer is empty or invalid.');
            }

            if (!shareCode || shareCode.trim().length !== 4) {
                throw new BadRequestException('A valid 4-digit share code is required.');
            }

            // 1. Unzip the password-protected file using the 4-digit share code
            const zip = new AdmZip(zipBuffer);
            const zipEntries = zip.getEntries();

            if(!zipEntries || zipEntries.length === 0){
                throw new BadRequestException('Invalid or empty ZIP archive.');
            }

            const xmlEntry = zipEntries.find(entry => entry.entryName.endsWith('.xml')) || zipEntries[0];

            // Extract the raw XML using the user's shareCode as the password
            let xmlBuffer: Buffer;
            try {
                xmlBuffer = xmlEntry.getData(shareCode.trim());
            } catch (error) {
                throw new BadRequestException("Invalid Share code or failed to decrypt ZIP file.");
            }

            if(!xmlBuffer || xmlBuffer.length === 0){
                throw new BadRequestException('Failed to extract XML content from ZIP.');
            }

            const xmlString = xmlBuffer.toString('utf-8');

            // 2. Parse the XML structure
            const doc = new DOMParser({
                errorHandler: (level: 'warning' | 'error' | 'fatalError', msg: string) => {
                    if(level === 'error'){
                        throw new BadRequestException(`XML Parsing Error: ${msg}`);
                    }
                    if(level === 'fatalError'){
                        throw new BadRequestException(`Fatal XML Parsing Error: ${msg}`);
                    }

                    // warning is ignored
                }
            }).parseFromString(xmlString, 'text/xml');

            // 3. Load the official UIDAI public root certificate
            if (!fs.existsSync(this.rootCertPath)) {
                this.logger.error(`Root certificate not found at path: ${this.rootCertPath}`);
                throw new BadRequestException('Root verification certificate is missing on the server.');
            }

            const rawCert = fs.readFileSync(this.rootCertPath, 'utf-8');

            const {pem: publicKeyPem, base64: publicKeyBase64} = this.normalizePem(rawCert)

            // 4. Locate the Signature Node (Namespace-tolerant)
            const signature = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0]
                || doc.getElementsByTagName("ds:Signature")[0]
                || doc.getElementsByTagName("Signature")[0];

            if(!signature){
                throw new BadRequestException('Digital signature missing from XML.');
            }

            // Extract the embedded public key from the XML itself to prevent key-rotation mismatches
            const x509Node = doc.getElementsByTagName("X509Certificate")[0] || doc.getElementsByTagNameNS("*", "X509Certificate")[0];

            let signingKeyPem = publicKeyPem;

            if(x509Node && x509Node.textContent){
                const embeddedBase64 = x509Node.textContent.replace(/\s+/g, '');
                signingKeyPem = `-----BEGIN CERTIFICATE-----\n${embeddedBase64.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`;
            }

            const sig = new SignedXml() as any;
            sig.publicCert = signingKeyPem;
            sig.key = signingKeyPem;

            sig.loadSignature(signature);
            const isValid = sig.checkSignature(xmlString);

            if(!isValid){
                const validationErrors = sig.validationErrors?.join(', ') || 'Unknown signature mismatch';
                this.logger.warn(`Signature validation failed: ${validationErrors}`);
                throw new BadRequestException('Cryptographic signature verification failed. File may be tempered with.');
            }

            // 5.Extract the verified demographic data from the PoI (Proof of Identity) node
            const poiNode = doc.getElementsByTagName("Poi")[0] || doc.getElementsByTagNameNS("*", "Poi")[0];
            const referenceId = doc.documentElement?.getAttribute("referenceId") || doc.getElementsByTagName("OfflinePaperlessKyc")[0]?.getAttribute("referenceId");


            if(!poiNode){
                throw new BadRequestException('MProof of Identity (Poi) node missing in verified XML.');
            }

            const legalName = poiNode.getAttribute("name");
            const rawDob = poiNode.getAttribute("dob");

            if(!legalName || !rawDob){
                throw new BadRequestException("Name or DOB attribute is missing in identity node.");
            }

            const verifiedDOB = this.parseAadhaarDate(rawDob);

            return {
                legalName: legalName as string,
                dateOfBirth: verifiedDOB,
                documentNumber: referenceId || 'VERIFIED_OFFLINE_DOC'// Masked identifier for hashing
            }

        } catch (error: any) {
            this.logger.error(`Aadhaar XML verification error: ${error.message}`, error.stack);
            if(error instanceof BadRequestException) throw error;
            throw new BadRequestException("Failed to process Offline e-KYC document.");
        }
    }
}