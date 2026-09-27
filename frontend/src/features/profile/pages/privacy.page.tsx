import React, { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdatePrivacySettingsMutation } from '../api/profile.api';
import type { ProfileVisibility } from '../types/profile.types';
import styles from './privacy.module.css';

interface PrivacyFormData {
    outnessLevel: number;
    showAge: boolean;
    showOccupation: boolean;
    blurPhotos: boolean;
    profileVisibility: ProfileVisibility;
}

export const PrivacyPage: React.FC = () => {
    const { data: profileResponse, isLoading: isLoadingProfile } = useGetProfileQuery();
    const [updatePrivacySettings, { isLoading: isSaving }] = useUpdatePrivacySettingsMutation();
    const [globalError, setGlobalError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [initialData, setInitialData] = useState<PrivacyFormData | null>(null);

    const [formData, setFormData] = useState<PrivacyFormData>({
        outnessLevel: 3,
        showAge: true,
        showOccupation: true,
        blurPhotos: false,
        profileVisibility: 'VISIBLE',
    });

    useEffect(() => {
        const privacy = (profileResponse?.data as any)?.privacySettings;
        const profile = (profileResponse?.data as any)?.profile;
        
        if (profileResponse?.data) {
            const mapped: PrivacyFormData = {
                outnessLevel: profile?.outnessLevel ?? 3,
                showAge: privacy?.showAge ?? true,
                showOccupation: privacy?.showOccupation ?? true,
                blurPhotos: privacy?.blurPhotos ?? false,
                profileVisibility: (privacy?.profileVisibility as ProfileVisibility) ?? 'VISIBLE',
            };
            setFormData(mapped);
            setInitialData(mapped);
        }
    }, [profileResponse]);

    const isDirty = initialData && JSON.stringify(formData) !== JSON.stringify(initialData);

    const handleSave = async () => {
        if (!isDirty) return;
        setGlobalError('');
        setSuccessMsg('');
        try {
            await updatePrivacySettings(formData).unwrap();
            setInitialData({ ...formData });
            setSuccessMsg('Privacy settings updated successfully.');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err: any) {
            const apiMessage = err?.data?.message;
            if (Array.isArray(apiMessage)) {
                setGlobalError(apiMessage.join(' • '));
            } else if (typeof apiMessage === 'string') {
                setGlobalError(apiMessage);
            } else {
                setGlobalError(err?.data?.error || 'Failed to update privacy settings.');
            }
        }
    };

    // UI Helpers for the Discovery Toggles
    const isHidden = formData.profileVisibility === 'HIDDEN';
    const isPaused = formData.profileVisibility === 'PAUSED';

    const handleDiscoveryToggle = (type: 'HIDE' | 'PAUSE') => {
        if (type === 'HIDE') {
            setFormData((prev) => ({ 
                ...prev, 
                profileVisibility: prev.profileVisibility === 'HIDDEN' ? 'VISIBLE' : 'HIDDEN',
            }));
        } else if (type === 'PAUSE') {
            setFormData((prev) => ({ 
                ...prev, 
                profileVisibility: prev.profileVisibility === 'PAUSED' ? 'VISIBLE' : 'PAUSED',
            }));
        }
    };

    if (isLoadingProfile) return <div className={styles.loadingState}>Loading privacy settings...</div>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Privacy</h1>
                <p className={styles.subtitle}>Control what information is visible and how your profile appears to others.</p>
            </header>

            {globalError && <div className={styles.errorMsg}>{globalError}</div>}
            {successMsg && <div className={styles.successMsg}>{successMsg}</div>}

            {/* Privacy Overview Card */}
            <div className={styles.overviewCard}>
                <div className={styles.cardHeaderWithIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <h2 className={styles.cardTitle}>Privacy Overview</h2>
                </div>
                <div className={styles.pillWrap}>
                    <span className={styles.overviewPillPurple}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/></svg>
                        Outness Level: {formData.outnessLevel}
                    </span>
                    <span className={formData.showAge ? styles.overviewPillPurple : styles.overviewPillGray}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {formData.showAge ? 'Age Visible' : 'Age Hidden'}
                    </span>
                    <span className={formData.profileVisibility === 'VISIBLE' ? styles.overviewPillPurple : styles.overviewPillGray}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                        {formData.profileVisibility === 'VISIBLE' ? 'Discovery Active' : formData.profileVisibility === 'PAUSED' ? 'Discovery Paused' : 'Profile Hidden'}
                    </span>
                    <span className={formData.showOccupation ? styles.overviewPillPurple : styles.overviewPillGray}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        {formData.showOccupation ? 'Occupation Visible' : 'Occupation Hidden'}
                    </span>
                    <span className={formData.blurPhotos ? styles.overviewPillGray : styles.overviewPillPurple}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        {formData.blurPhotos ? 'Photos Blurred' : 'Photos Visible'}
                    </span>
                </div>
            </div>

            <div className={styles.layoutGrid}>
                {/* Left Column */}
                <div className={styles.mainColumn}>
                    {/* Visibility Settings */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderWithIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <h2 className={styles.cardTitle}>Visibility Settings</h2>
                        </div>
                        <p className={styles.cardDesc}>Manage exactly what details others can see.</p>

                        <div className={styles.fieldSection}>
                            <div className={styles.labelRow}>
                                <label>Outness Level</label>
                                <span className={styles.accentValuePurple}>Level {formData.outnessLevel}</span>
                            </div>
                            <div className={styles.sliderContainer}>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={formData.outnessLevel}
                                    onChange={(e) => setFormData(p => ({ ...p, outnessLevel: Number(e.target.value) }))}
                                    className={styles.rangeInput}
                                />
                                <div className={styles.sliderLabels}>
                                    <span>Closeted</span>
                                    <span>Fully Out</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.toggleRow}>
                            <label className={styles.toggleLabel}>Show Age</label>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={formData.showAge} onChange={(e) => setFormData(p => ({ ...p, showAge: e.target.checked }))} />
                                <span className={styles.sliderRound}></span>
                            </label>
                        </div>
                        <div className={styles.toggleRow}>
                            <label className={styles.toggleLabel}>Show Occupation</label>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={formData.showOccupation} onChange={(e) => setFormData(p => ({ ...p, showOccupation: e.target.checked }))} />
                                <span className={styles.sliderRound}></span>
                            </label>
                        </div>
                    </div>

                    {/* Discovery */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderWithIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
                            <h2 className={styles.cardTitle}>Discovery</h2>
                        </div>
                        <p className={styles.cardDesc}>Manage your presence in the match pool.</p>

                        <div className={styles.discoveryGrid}>
                            <div className={`${styles.discoveryBox} ${isHidden ? styles.discoveryBoxActive : ''}`}>
                                <div className={styles.discoveryHeader}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                    <label className={styles.switch}>
                                        <input type="checkbox" checked={isHidden} onChange={() => handleDiscoveryToggle('HIDE')} />
                                        <span className={styles.sliderRound}></span>
                                    </label>
                                </div>
                                <strong>Hide Profile</strong>
                                <p>Completely invisible to everyone.</p>
                            </div>

                            <div className={`${styles.discoveryBox} ${isPaused ? styles.discoveryBoxActive : ''}`}>
                                <div className={styles.discoveryHeader}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                    <label className={styles.switch}>
                                        <input type="checkbox" checked={isPaused} onChange={() => handleDiscoveryToggle('PAUSE')} disabled={isHidden} />
                                        <span className={styles.sliderRound}></span>
                                    </label>
                                </div>
                                <strong>Pause Discovery</strong>
                                <p>Keep current matches, pause new ones.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className={styles.sidebarColumn}>
                    {/* Photo Privacy */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderWithIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <h2 className={styles.cardTitle}>Photo Privacy</h2>
                        </div>
                        <p className={styles.cardDesc}>Control who can see your unblurred photos.</p>

                        <div className={styles.photoBlurBox}>
                            <div className={styles.blurText}>
                                <strong>Blur Photos</strong>
                                <p>Require a request to view clearly.</p>
                            </div>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={formData.blurPhotos} onChange={(e) => setFormData(p => ({ ...p, blurPhotos: e.target.checked }))} />
                                <span className={styles.sliderRound}></span>
                            </label>
                        </div>

                        <div className={styles.infoBox}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            <span>Photos can only be viewed by users whose connection requests you have approved.</span>
                        </div>
                    </div>

                    {/* Safety Tips */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderWithIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <h2 className={styles.cardTitle}>Safety & Privacy Tips</h2>
                        </div>
                        <ul className={styles.tipsList}>
                            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Keep conversations on the platform until you feel completely safe.</li>
                            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Use the 'Report' feature if anyone makes you uncomfortable.</li>
                            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Never share financial information or exact home addresses.</li>
                            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Verify profiles utilizing our secure photo verification system.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className={styles.bottomBar}>
                <button type="button" className={styles.cancelBtn} onClick={() => { if (initialData) setFormData(initialData); }} disabled={!isDirty}>
                    Cancel
                </button>
                <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving || !isDirty}>
                    {isSaving ? 'Saving...' : 'Save Privacy Settings'}
                </button>
            </div>
        </div>
    );
};