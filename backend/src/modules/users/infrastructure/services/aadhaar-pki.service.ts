import { BadRequestException, Injectable } from "@nestjs/common";
import { IPkiResult, IPkiVerificationService } from "../../domain/interfaces/kyc-service.interface";
import path from "path";
import AdmZip from "adm-zip";
import { DOMParser } from "@xmldom/xmldom";
import * as fs from 'fs';
import { SignedXml } from "xml-crypto";


@Injectable()
export class AadharPkiService implements IPkiVerificationService{
    private readonly rootCertPath = path.join(process.cwd(), 'assets', 'uidai_offline_publicKey.cer');

    async verifyAadhaarXml(zipBuffer: Buffer, shareCode: string): Promise<IPkiResult> {
        try {
            // 1. Unzip the password-protected file using the 4-digit share code
            const zip = new AdmZip(zipBuffer);
            const zipEntries = zip.getEntries();

            if(zipEntries.length === 0){
                throw new BadRequestException('Invalid or empty ZIP file.');
            }

            // Extract the raw XML using the user's shareCode as the password
            const xmlBuffer = zip.readFile(zipEntries[0], shareCode);
            if(!xmlBuffer){
                throw new BadRequestException('Invalid Share code or corrupt ZIP file.');
            }

            const xmlString = xmlBuffer.toString('utf-8');

            // 2. Parse the XML structure
            const doc = new DOMParser().parseFromString(xmlString, 'text/xml');

            // 3. Load the official UIDAI public root certificate
            const publicKeyPem = fs.readFileSync(this.rootCertPath, 'utf-8');

            // Strip header, footers, and all whitespaces/newlines for the XML node
            const publicKeyBase64 = publicKeyPem
                .replace(/-----BEGIN CERTIFICATE-----/g, '')
                .replace(/-----END CERTIFICATE-----/g, '')
                .replace(/\s+/g, '');
            
            // 4. Verify the XML-DSig envelope
            const signature = doc.getElementsByTagName("Signature")[0];
            if(!signature){
                throw new BadRequestException('Digital signature missing from XML.');
            }

            const sig = new SignedXml() as any;
            sig.keyInfoProvider = {

                //  Inject the cleaned base64 string here
                getKeyInfo: () => `<X509Data><X509Certificate>${publicKeyPem}</X509Certificate></X509Data>`,
                
                // Pass the original PEM formatted string here for the actual crypto engine
                getKey: () => publicKeyPem,
            };

            sig.loadSignature(signature.toString());
            const isValid = sig.checkSignature(xmlString);

            if(!isValid){
                throw new BadRequestException('Cryptographic signature verification failed. File may be tempered with.');
            }

            // 5.Extract the verified demographic data from the PoI (Proof of Identity) node
            const poiNode = doc.getElementsByTagName("Poi")[0];
            const referenceId = doc.documentElement?.getAttribute("referenceId");

            if(!poiNode || !referenceId){
                throw new BadRequestException('Missing demographic node in verified XML.');
            }

            const legalName = poiNode.getAttribute("name");
            const verifiedDOB = new Date(poiNode.getAttribute("dob") as string);

            return {
                legalName: legalName as string,
                dateOfBirth: verifiedDOB,
                documentNumber: referenceId // Masked identifier for hashing
            }

        } catch (error) {
            if(error instanceof BadRequestException) throw error;
            throw new BadRequestException("Failed to process Offline e-KYC document.");
        }
    }
}