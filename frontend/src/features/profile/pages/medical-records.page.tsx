import React, { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdateMedicalRecordMutation } from '../api/profile.api';
import {
    DIABETES_OPTIONS, BLOOD_PRESSURE_OPTIONS, FERTILITY_OPTIONS,
    GENETIC_OPTIONS, INFECTIOUS_STATUS_OPTIONS, INFECTIOUS_VISIBILITY_OPTIONS
} from '../constants/medical-options.constant';
import styles from './medical-records.module.css';

export const MedicalRecordsPage: React.FC = () => {
    const { data: profileResponse, isLoading: isLoadingProfile } = useGetProfileQuery();
    const [updateMedicalRecord, { isLoading: isSaving }] = useUpdateMedicalRecordMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [initialData, setInitialData] = useState<any>(null);
    const [formData, setFormData] = useState({
        diabetes: 'Prefer not to say',
        bloodPressure: 'Prefer not to say',
        fertility: { status: 'Prefer not to say', details: '' },
        genetic: { status: 'Prefer not to say', details: '' },
        infectious: { hiv: 'Prefer not to say', hepatitis: 'Prefer not to say' },
        infectiousVisibility: 'MATCH_ONLY',
        disability: { hasDisability: false, details: '' }
    });

    const medicalRecord = (profileResponse?.data as any)?.medicalRecord;
    const hasData = medicalRecord && Object.keys(medicalRecord).length > 0;

    useEffect(() => {
        if (medicalRecord) {
            const mapped = {
                diabetes: medicalRecord.diabetes || 'Prefer not to say',
                bloodPressure: medicalRecord.bloodPressure || 'Prefer not to say',
                fertility: medicalRecord.fertility || { status: 'Prefer not to say', details: '' },
                genetic: medicalRecord.genetic || { status: 'Prefer not to say', details: '' },
                infectious: medicalRecord.infectious || { hiv: 'Prefer not to say', hepatitis: 'Prefer not to say' },
                infectiousVisibility: medicalRecord.infectiousVisibility || 'MATCH_ONLY',
                disability: medicalRecord.disability || { hasDisability: false, details: '' }
            };
            setFormData(mapped);
            setInitialData(mapped);
        } else {
            setInitialData({ ...formData });
        }
    }, [medicalRecord]);

    const isDirty = initialData && JSON.stringify(formData) !== JSON.stringify(initialData);

    const handleSave = async () => {
        if (!isDirty) return;
        setGlobalError('');
        setSuccessMsg('');

        try {
            await updateMedicalRecord(formData).unwrap();
            setInitialData({ ...formData });
            setSuccessMsg('Medical records updated successfully.');
            setIsEditing(false);
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err: any) {
            const apiMessage = err?.data?.message;
            if (Array.isArray(apiMessage)) {
                setGlobalError(apiMessage.join(' • '));
            } else if (typeof apiMessage === 'string') {
                setGlobalError(apiMessage);
            } else {
                setGlobalError(err?.data?.error || 'Failed to update medical records.');
            }
        }
    };

    const WarningBanner = () => (
        <div className={styles.warningBanner}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div className={styles.warningText}>
                <strong>Self-Declared Information</strong>
                <p>You are fully responsible for the accuracy of the medical information you provide. The platform is not liable for any false information or resulting consequences.</p>
                <a href="#" className={styles.termsLink}>View Terms & Conditions</a>
            </div>
        </div>
    );

    if (isLoadingProfile) return <div className={styles.loadingState}>Loading medical records...</div>;

    if (!isEditing) {
        return (
            <div className={styles.pageContainer}>
                <WarningBanner />
                <div className={styles.viewHeaderRow}>
                    <div>
                        <h1 className={styles.title}>Medical Info</h1>
                        <p className={styles.subtitle}>Self-declared and optional. Not verified by MERGE — see note above.</p>
                    </div>
                    <button className={styles.editBtnPrimary} onClick={() => setIsEditing(true)}>Edit</button>
                </div>
                {successMsg && <div className={styles.successMsg}>{successMsg}</div>}

                {!hasData ? (
                    <div className={styles.emptyStateCard}>
                        <div className={styles.folderIconWrap}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><polygon points="12 11 14 15 18 15 15 17 16 21 12 18 8 21 9 17 6 15 10 15 12 11"/></svg>
                        </div>
                        <h3>No Medical Info Added</h3>
                        <p>Add your medical info so matches have a clearer picture of you. This is completely optional and only visible to your matches.</p>
                        <button className={styles.addBtn} onClick={() => setIsEditing(true)}>+ Add Medical Info</button>
                    </div>
                ) : (
                    <div className={styles.viewCard}>
                        <div className={styles.viewRow}>
                            <span className={styles.viewLabel}>Diabetes & Blood Pressure</span>
                            <div className={styles.pillGroupRight}>
                                {formData.diabetes !== 'Prefer not to say' && <span className={styles.viewPill}>{formData.diabetes}</span>}
                                {formData.bloodPressure !== 'Prefer not to say' && <span className={styles.viewPill}>{formData.bloodPressure}</span>}
                                {formData.diabetes === 'Prefer not to say' && formData.bloodPressure === 'Prefer not to say' && <span className={styles.viewPillGray}>Prefer not to say</span>}
                            </div>
                        </div>
                        <div className={styles.viewRow}>
                            <span className={styles.viewLabel}>Fertility & Reproductive Health</span>
                            <span className={formData.fertility.status === 'Prefer not to say' ? styles.viewPillGray : styles.viewPill}>{formData.fertility.status}</span>
                        </div>
                        <div className={styles.viewRow}>
                            <span className={styles.viewLabel}>Genetic / Hereditary Conditions</span>
                            <span className={formData.genetic.status === 'Prefer not to say' ? styles.viewPillGray : styles.viewPill}>{formData.genetic.status === 'None' ? 'None reported' : formData.genetic.status}</span>
                        </div>
                        <div className={styles.viewRow}>
                            <span className={styles.viewLabel}>Infectious Conditions</span>
                            <div className={styles.pillGroupRight}>
                                {formData.infectious.hiv !== 'Prefer not to say' && <span className={styles.viewPill}>HIV {formData.infectious.hiv}</span>}
                                {formData.infectious.hepatitis !== 'Prefer not to say' && <span className={styles.viewPill}>Hep B/C {formData.infectious.hepatitis}</span>}
                                {formData.infectious.hiv === 'Prefer not to say' && formData.infectious.hepatitis === 'Prefer not to say' && <span className={styles.viewPillGray}>Prefer not to say</span>}
                            </div>
                        </div>
                        <div className={styles.viewRow}>
                            <span className={styles.viewLabel}>Disability</span>
                            <span className={styles.viewTextRight}>{formData.disability.hasDisability ? (formData.disability.details || 'Disability reported') : 'No physical disabilities'}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <WarningBanner />
            <button className={styles.backBtn} onClick={() => { setIsEditing(false); setFormData(initialData); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Edit Medical Info
            </button>
            <p className={styles.editSubtitle}>All fields optional. Choose 'Prefer not to say' for anything you're not comfortable sharing.</p>

            {globalError && <div className={styles.errorMsg}>{globalError}</div>}

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Diabetes & Blood Pressure</h3>
                <div className={styles.fieldBlock}>
                    <label>Diabetes</label>
                    <div className={styles.pillWrap}>
                        {DIABETES_OPTIONS.map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(p => ({ ...p, diabetes: opt }))} className={`${styles.pillBtn} ${formData.diabetes === opt ? styles.pillBtnActive : ''}`}>{opt}</button>
                        ))}
                    </div>
                </div>
                <div className={styles.fieldBlock}>
                    <label>Blood Pressure</label>
                    <div className={styles.pillWrap}>
                        {BLOOD_PRESSURE_OPTIONS.map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(p => ({ ...p, bloodPressure: opt }))} className={`${styles.pillBtn} ${formData.bloodPressure === opt ? styles.pillBtnActive : ''}`}>{opt}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Fertility & Reproductive Health</h3>
                <div className={styles.pillWrap}>
                    {FERTILITY_OPTIONS.map(opt => (
                        <button key={opt} type="button" onClick={() => setFormData(p => ({ ...p, fertility: { ...p.fertility, status: opt } }))} className={`${styles.pillBtn} ${formData.fertility.status === opt ? styles.pillBtnActive : ''}`}>{opt}</button>
                    ))}
                </div>
                {formData.fertility.status !== 'None' && formData.fertility.status !== 'Prefer not to say' && (
                    <input className={styles.detailInput} placeholder="Add more detail (optional)" value={formData.fertility.details} onChange={(e) => setFormData(p => ({ ...p, fertility: { ...p.fertility, details: e.target.value } }))} maxLength={200} />
                )}
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Genetic / Hereditary Conditions</h3>
                <div className={styles.pillWrap}>
                    {GENETIC_OPTIONS.map(opt => (
                        <button key={opt} type="button" onClick={() => setFormData(p => ({ ...p, genetic: { ...p.genetic, status: opt } }))} className={`${styles.pillBtn} ${formData.genetic.status === opt ? styles.pillBtnActive : ''}`}>{opt}</button>
                    ))}
                </div>
                {formData.genetic.status !== 'None' && formData.genetic.status !== 'Prefer not to say' && (
                    <input className={styles.detailInput} placeholder="Add more detail (optional)" value={formData.genetic.details} onChange={(e) => setFormData(p => ({ ...p, genetic: { ...p.genetic, details: e.target.value } }))} maxLength={200} />
                )}
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Infectious Conditions</h3>
                <div className={styles.fieldBlock}>
                    <label>HIV Status</label>
                    <div className={styles.pillWrap}>
                        {INFECTIOUS_STATUS_OPTIONS.map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(p => ({ ...p, infectious: { ...p.infectious, hiv: opt } }))} className={`${styles.pillBtn} ${formData.infectious.hiv === opt ? styles.pillBtnActive : ''}`}>{opt}</button>
                        ))}
                    </div>
                </div>
                <div className={styles.fieldBlock}>
                    <label>Hepatitis B/C</label>
                    <div className={styles.pillWrap}>
                        {INFECTIOUS_STATUS_OPTIONS.map(opt => (
                            <button key={opt} type="button" onClick={() => setFormData(p => ({ ...p, infectious: { ...p.infectious, hepatitis: opt } }))} className={`${styles.pillBtn} ${formData.infectious.hepatitis === opt ? styles.pillBtnActive : ''}`}>{opt}</button>
                        ))}
                    </div>
                </div>
                <div className={styles.fieldBlock}>
                    <label>Who can see this information?</label>
                    <div className={styles.pillWrap}>
                        {INFECTIOUS_VISIBILITY_OPTIONS.map(opt => (
                            <button key={opt.value} type="button" onClick={() => setFormData(p => ({ ...p, infectiousVisibility: opt.value }))} className={`${styles.pillBtnOutline} ${formData.infectiousVisibility === opt.value ? styles.pillBtnOutlineActive : ''}`}>{opt.label}</button>
                        ))}
                    </div>
                    <p className={styles.helperText}>Sharing this is entirely your choice. Selecting 'Prefer not to say' will never limit your use of MERGE.</p>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.toggleRow}>
                    <h3 className={styles.cardTitle}>Disability</h3>
                    <div className={styles.toggleWrap}>
                        <label className={styles.switch}>
                            <input type="checkbox" checked={formData.disability.hasDisability} onChange={(e) => setFormData(p => ({ ...p, disability: { ...p.disability, hasDisability: e.target.checked } }))} />
                            <span className={styles.sliderRound}></span>
                        </label>
                        <span className={styles.toggleLabel}>I have a disability I'd like to mention</span>
                    </div>
                </div>
                {formData.disability.hasDisability && (
                    <input className={styles.detailInput} style={{ marginTop: '1rem' }} placeholder="Describe in your own words (optional)" value={formData.disability.details} onChange={(e) => setFormData(p => ({ ...p, disability: { ...p.disability, details: e.target.value } }))} maxLength={500} />
                )}
            </div>

            <div className={styles.bottomBar}>
                <button type="button" className={styles.cancelBtn} onClick={() => { setIsEditing(false); setFormData(initialData); }}>Cancel</button>
                <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving || !isDirty}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
        </div>
    );
};