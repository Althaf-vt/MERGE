import { useState } from "react";
import { useGetPresignedUrlMutation, useSubmitKycMutation } from "../api/kycApi"
import styles from './KycDocumentUpload.module.css';

export const KycDocumentUpload = () => {
    const [getPresignedUrl] = useGetPresignedUrlMutation();
    const [submitKyc] = useSubmitKycMutation();

    const [documentType, setDocumentType] = useState('PASSPORT');
    const [issuingCountry, setIssuingCountry] = useState('INDIA');
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);

    const [status, setStatus] = useState<'idle' | 'uploading' | 'extracting' | 'success'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<{legalName: string, dateOfBirth: string} | null>(null);

    const handleFileChange = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if(side === 'front') setFrontFile(file);
        if(side === 'back') setBackFile(file);
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!frontFile) return setError('Front of the document is required.');

        setError(null);
        setStatus('uploading');

        try {
            // 1. Backend return both front and back data in a single call
            const presignedData = await getPresignedUrl({mimeType: frontFile.type}).unwrap();

            // 2. Upload directly to AWS S3 using standart fetch (bypass RTK Query interceptors)
            await fetch(presignedData.front.uploadUrl, {
                method: 'PUT',
                body: frontFile,
                headers: {'Content-Type': frontFile.type}
            })

            let backKey = undefined;

            // Repeat for back image if required by document type
            if(backFile && documentType !== 'PASSPORT'){

                await fetch(presignedData.back.uploadUrl, {
                    method: "PUT",
                    body: backFile,
                    headers: {'Content-Type': backFile.type}
                })

                backKey = presignedData.back.fileKey;
            }

            setStatus('extracting');

            // 3. Submit the file keys to our backend to trigger OCR & hashing
            const result = await submitKyc({
                documentType,
                issuingCountry,
                documentFrontKey: presignedData.front.fileKey,
                documentBackKey: backKey
            }).unwrap();

            setExtractedData(result.extractedData);
            setStatus('success');
        } catch (error: any) {
            console.error(error);
            setError(error?.data?.message || "Failed to process document. Please try again.");
            setStatus('idle');
        }
    }
    // 4. Success UI
    if(status === 'success' && extractedData){
        return(
            <div className={styles.wrapper}>
                <h2 className={styles.title}>Identity Verified</h2>
                <p className={styles.subtitle}>We habe successfully extracted your data.</p>
                <div className={styles.dataCard}>
                    <p><strong>Legal Name:</strong> {extractedData?.legalName}</p>
                    <p><strong>Date of Birth:</strong> {extractedData?.dateOfBirth}</p>
                </div>
                <button className={styles.primaryBtn}>Continue Onboarding</button>
            </div>
        )
    }

    return (
        <div>
            <h2>Verify Your Indetity</h2>
            <p>Upload a valid government-issued ID to secure your account.</p>

            {error && <div className={styles.errorText}>{error}</div>}
            
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <select className={styles.input} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                        <option value="PASSPORT">Passport</option>
                        <option value="NATIONAL_ID">National ID</option>
                        <option value="DRIVING_LICENSE">Driving License</option>
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <select className={styles.input} value={issuingCountry} onChange={(e) => setIssuingCountry(e.target.value)}>
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                    </select>
                </div>

                <div className={styles.fileUploadBox}>
                    <label className={styles.fileLabel}>
                        {frontFile ? frontFile.name : "Upload Front of Document"}
                        <input type="file" accept="image/jpeg, image/png" className={styles.hiddenInput} onChange={(e) => handleFileChange('front', e)}/>
                    </label>
                </div>

                {documentType !== 'PASSPORT' && (
                    <div className={styles.fileUploadBox}>
                        <label className={styles.fileLabel}>
                            {backFile ? backFile.name : "Upload Back of Document"}
                            <input type="file" accept="image/jpeg, image/png" className={styles.hiddenInput} onChange={(e) => handleFileChange('back', e)}/>
                        </label>
                    </div>
                )}

                <button type="submit" className={styles.primaryBtn} disabled={status !== 'idle'}>
                    {status === "uploading" ? "Uploading to secure vault..." : status === 'extracting' ? "Verifying identity..." : "Submit Documents"}
                </button>
            </form>
        </div>
    )
}