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
            setError(error?.data?.message || "Cryptographic verification failed. Ensure the file is unmodified.");
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <h1 className={styles.mainTitle}>Verify Your Identity.</h1>
                <p className={styles.subtitle}>Step 1 of 5: Help us keep MERGE safe, authentic, and trusted.</p>

                <h3 className={styles.sectionTitle}>Why Verification Is Required</h3>
                <p className={styles.descriptionText}>Identity verification helps us reduce fake profiles, prevent catfishing, and create a safer environment for everyone on MERGE.</p>
                
                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
                        <div>
                            <h4>Verified Community</h4>
                            <p>Only verified members access discovery/messaging</p>
                        </div>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                        <div>
                            <h4>Anti-Catfishing</h4>
                            <p>Prevents impersonation</p>
                        </div>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                        <div>
                            <h4>Privacy Protected</h4>
                            <p>Encrypted data storage</p>
                        </div>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                        <div>
                            <h4>Human Review</h4>
                            <p>Manual accuracy checks</p>
                        </div>
                    </div>
                </div>

                <div className={styles.securityBanner}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span>Your documents are encrypted in transit and at rest and are never displayed publicly.</span>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.formCard}>
                    <h2 className={styles.formTitle}>Identity Verification</h2>
                    {error && <div className={styles.errorText}>{error}</div>}
                    
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Document Type</label>
                            <select className={styles.input} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                                <option value="AADHAAR_XML">Offline e-KYC (ZIP/XML)</option>
                                <option value="EPAN_PDF">e-PAN (Signed PDF)</option>
                                <option value="DIGILOCKER_DL">DigiLocker Driving License</option>
                                <option value="PASSPORT">Passport (MRZ)</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Issuing Country</label>
                            <select className={styles.input} value={issuingCountry} onChange={(e) => setIssuingCountry(e.target.value)}>
                                <option value="IN">India</option>
                                <option value="US">United States</option>
                            </select>
                        </div>

                        {documentType === 'AADHAAR_XML' && (
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>ZIP Share Code</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="4-Digit Code"
                                    maxLength={4}
                                    value={shareCode}
                                    onChange={(e) => setShareCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    required
                                />
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Upload Cryptographic Document</label>
                            <p className={styles.helperText}>Accepted formats: ZIP, XML, PDF (Max 10 MB)</p>
                            <div className={styles.fileUploadBox}>
                                <label className={styles.fileLabel}>
                                    <div className={styles.uploadIcon}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="12" y2="12"></line><line x1="15" y1="15" x2="12" y2="12"></line></svg>
                                    </div>
                                    <span className={styles.uploadTextTitle}>{documentFile ? documentFile.name : "Document File"}</span>
                                    <span className={styles.uploadTextSubtitle}>Click to upload or drag and drop</span>
                                    <input 
                                    type="file" 
                                    accept=".zip,.pdf,.xml" 
                                    className={styles.hiddenInput} 
                                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} 
                                    />
                                </label>
                            </div>
                        </div>

                        <div className={styles.formFooterBanner}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            <span>Your identity documents are used only for verification purposes and are never displayed publicly.</span>
                        </div>

                        <div className={styles.buttonWrapper}>
                            <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                                {isLoading ? "Running PKI Validation..." : "Continue →"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}