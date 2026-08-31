import { useState } from "react";
import { useSubmitKycMutation } from "../api/kycApi"
import styles from './KycDocumentUpload.module.css';
import { useAppDispatch } from "../../../app/hooks";
import { setExtractedData, setKycStep } from "../slices/kycSlice";

export const KycDocumentUpload = () => {
    const dispatch = useAppDispatch()
    const [submitKyc, {isLoading}] = useSubmitKycMutation();

    const [documentType, setDocumentType] = useState('AADHAAR_XML');
    const [issuingCountry, setIssuingCountry] = useState('IN');
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [shareCode, setShareCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!documentFile) return setError("Cryptographic document file is required.");

        if(documentType === 'AADHAR_XML' && shareCode.length !== 4){
            return setError("A 4-digit share code is required to unlock the ZIP.");
        }
        
        setError(null);

        const formData = new FormData();
        formData.append('documentType',documentType);
        formData.append('issuingCountry',issuingCountry);
        formData.append('document', documentFile);

        if(documentType === 'AADHAAR_XML'){
            formData.append('shareCode', shareCode);
        }

        try {

            // Passed form data directly to RTK Query
            const result = await submitKyc(formData).unwrap();

            dispatch(setExtractedData(result.extractedData));
            dispatch(setKycStep('DEVICE_SELECTION'));
        } catch (error: any) {
            console.error(error);
            setError(error?.data?.message || "Cryptographic verification falied. Ensure the file is unmodified.");
        }
    }

    return (
        <div>
            <h2>Verify Your Indetity</h2>
            <p>Upload you digitally signed government file for verification.</p>

            {error && <div className={styles.errorText}>{error}</div>}
            
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <select className={styles.input} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                        <option value="AADHAAR_XML">Offline e-KYC (ZIP/XML)</option>
                        <option value="EPAN_PDF">e-PAN (Signed PDF)</option>
                        <option value="DIGILOCKER_DL">DigiLocker Driving License</option>
                        <option value="PASSPORT">Passport (MRZ)</option>
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <select className={styles.input} value={issuingCountry} onChange={(e) => setIssuingCountry(e.target.value)}>
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                    </select>
                </div>

                {documentType === 'AADHAAR_XML' && (
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="4-Digit ZIP Share Code"
                            maxLength={4}
                            value={shareCode}
                            onChange={(e) => setShareCode(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                        />
                    </div>
                )}

                <div className={styles.fileUploadBox}>
                    <label className={styles.fileLabel}>
                        {documentFile ? documentFile.name : "Select Cryptographic File"}
                        <input 
                        type="file" 
                        accept=".zip,.pdf,.xml" 
                        className={styles.hiddenInput} 
                        onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} 
                        />
                    </label>
                </div>

                <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                    {isLoading ? "Running PKI Validation..." : "Verify Cryptographic Signature"}
                </button>
            </form>
        </div>
    )
}