import React, { useState, useEffect } from 'react';
import { useGetProfileQuery, useSaveUserFullPreferencesMutation } from '../api/profile.api';
import {
    GENDER_ORIENTATION_OPTIONS,
    RELATIONSHIP_INTENT_OPTIONS,
    ADOPTION_PREFERENCE_OPTIONS,
    HEALTH_OPTION_VALUES,
    HEALTH_CATEGORIES,
} from '../constants/preference-form.constants'
import styles from './user-preferences.module.css';

export const UserPreferencesPage: React.FC = () => {
    const { data: profileResponse, isLoading: isLoadingProfile } = useGetProfileQuery();
    const [savePreferences, { isLoading: isSaving }] = useSaveUserFullPreferencesMutation();

    const [globalError, setGlobalError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [initialData, setInitialData] = useState<any>(null);

    const [formData, setFormData] = useState({
        preferredGender: [] as string[],
        preferredAgeMin: 18,
        preferredAgeMax: 45,
        relationshipGoals: 'LONG_TERM_RELATIONSHIP',
        openToAdoptionState: 'maybe', // 'true' | 'false' | 'maybe'
        diabeteBpPreference: 'no_preference',
        fertilityPreference: 'no_preference',
        geneticPreference: 'no_preference',
        infectiousPreference: 'no_preference',
        disablilityPreferece: 'no_preference',
    });

    useEffect(() => {
        if (!profileResponse?.data) return;

        // Check both potential response keys: preference or preferences
        const pref = (profileResponse.data as any)?.preference || (profileResponse.data as any)?.preferences;

        if (pref) {
            let adoptionVal = 'maybe';
            if (pref.openToAdoption === true) adoptionVal = 'true';
            if (pref.openToAdoption === false) adoptionVal = 'false';

            const mapped = {
                preferredGender: pref.preferredGender || ['Women', 'Non-Binary'],
                preferredAgeMin: pref.preferredAgeMin ?? 18,
                preferredAgeMax: pref.prefferedAgeMax ?? pref.preferredAgeMax ?? 45,
                relationshipGoals: pref.relationShipGoals || pref.relationshipGoals || 'LONG_TERM_RELATIONSHIP',
                openToAdoptionState: adoptionVal,
                diabeteBpPreference: pref.diabeteBpPreference || 'no_preference',
                fertilityPreference: pref.fertilityPreference || 'no_preference',
                geneticPreference: pref.geneticPreference || 'no_preference',
                infectiousPreference: pref.infectiousPreference || 'no_preference',
                disablilityPreferece: pref.disablilityPreferece || 'no_preference',
            };
            setFormData(mapped);
            setInitialData(mapped);
        } else {
            // FIX: If user has no preference record yet, baseline initialData with current default formData
            setInitialData({ ...formData });
        }
    }, [profileResponse]);

    // Sorting arrays ensures order difference doesn't disrupt dirty checking
    const getNormalizedString = (data: typeof formData | null) => {
        if (!data) return '';
        return JSON.stringify({
            ...data,
            preferredGender: [...data.preferredGender].sort(),
        });
    };

    const isDirty = Boolean(initialData) && getNormalizedString(formData) !== getNormalizedString(initialData);

    const toggleGender = (item: string) => {
        setFormData((prev) => {
            const exists = prev.preferredGender.includes(item);
            const updated = exists
                ? prev.preferredGender.filter((g) => g !== item)
                : [...prev.preferredGender, item];
            return { ...prev, preferredGender: updated };
        });
    };

    const handleHealthChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!isDirty) return;
        if (formData.preferredGender.length === 0) {
            setGlobalError('Please select at least one identity in "I\'m looking for".');
            return;
        }

        setGlobalError('');
        setSuccessMsg('');

        const payload: any = {
            preferredGender: formData.preferredGender,
            preferredAgeMin: Number(formData.preferredAgeMin),
            preferredAgeMax: Number(formData.preferredAgeMax),
            relationshipGoals: formData.relationshipGoals,
            diabeteBpPreference: formData.diabeteBpPreference,
            fertilityPreference: formData.fertilityPreference,
            geneticPreference: formData.geneticPreference,
            infectiousPreference: formData.infectiousPreference,
            disablilityPreferece: formData.disablilityPreferece,
            openToAdoption: formData.openToAdoptionState === 'maybe' ? undefined : formData.openToAdoptionState === 'true',
        };

        try {
            await savePreferences(payload).unwrap();
            setInitialData({ ...formData });
            setSuccessMsg('Preferences saved successfully.');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err: any) {
            const apiMessage = err?.data?.message;
            if (Array.isArray(apiMessage)) {
                setGlobalError(apiMessage.join(' • '));
            } else if (typeof apiMessage === 'string') {
                setGlobalError(apiMessage);
            } else {
                setGlobalError(err?.data?.error || 'Failed to update preferences.');
            }
        }
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'activity':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
            case 'heart':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
            case 'git-commit':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><line x1="1.05" y1="12" x2="7" y2="12" /><line x1="17.01" y1="12" x2="22.96" y2="12" /></svg>;
            case 'shield':
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
            default:
                return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>;
        }
    };

    if (isLoadingProfile) {
        return <div className={styles.loadingState}>Loading preferences...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Preferences</h1>
                <p className={styles.subtitle}>Control who appears in your discovery experience and improve match relevance.</p>
            </header>

            {globalError && <div className={styles.errorMsg}>{globalError}</div>}
            {successMsg && <div className={styles.successMsg}>{successMsg}</div>}

            <div className={styles.layoutGrid}>
                {/* Main Content Area */}
                <div className={styles.mainColumn}>
                    {/* Discovery Preferences */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderWithIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                            <h2 className={styles.cardTitle}>Discovery Preferences</h2>
                        </div>

                        <div className={styles.fieldSection}>
                            <div className={styles.labelRow}>
                                <label>Age Range</label>
                                <span className={styles.accentValue}>{formData.preferredAgeMin} - {formData.preferredAgeMax}</span>
                            </div>
                            <div className={styles.rangeSliders}>
                                <input
                                    type="range"
                                    min="18"
                                    max="80"
                                    value={formData.preferredAgeMin}
                                    onChange={(e) => setFormData(p => ({ ...p, preferredAgeMin: Math.min(Number(e.target.value), p.preferredAgeMax) }))}
                                    className={styles.rangeInput}
                                />
                                <input
                                    type="range"
                                    min="18"
                                    max="80"
                                    value={formData.preferredAgeMax}
                                    onChange={(e) => setFormData(p => ({ ...p, preferredAgeMax: Math.max(Number(e.target.value), p.preferredAgeMin) }))}
                                    className={styles.rangeInput}
                                />
                            </div>
                        </div>

                        <div className={styles.fieldSection}>
                            <label className={styles.sectionLabel}>I'm looking for</label>
                            <p className={styles.helperText}>Select all identities you would like to discover.</p>
                            <div className={styles.pillWrap}>
                                {GENDER_ORIENTATION_OPTIONS.map((item) => {
                                    const isSelected = formData.preferredGender.includes(item);
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => toggleGender(item)}
                                            className={`${styles.pillBtn} ${isSelected ? styles.pillBtnActive : ''}`}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Relationship Preferences */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderWithIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            <h2 className={styles.cardTitle}>Relationship Preferences</h2>
                        </div>

                        <div className={styles.fieldSection}>
                            <label className={styles.sectionLabel}>Intent</label>
                            <div className={styles.intentGrid}>
                                {RELATIONSHIP_INTENT_OPTIONS.map((intent) => {
                                    const isSelected = formData.relationshipGoals === intent.value;
                                    return (
                                        <div
                                            key={intent.value}
                                            onClick={() => setFormData(p => ({ ...p, relationshipGoals: intent.value }))}
                                            className={`${styles.intentCard} ${isSelected ? styles.intentCardActive : ''}`}
                                        >
                                            <div className={styles.intentHeader}>
                                                <strong>{intent.label}</strong>
                                                {isSelected && (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                )}
                                            </div>
                                            <p>{intent.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.fieldSection}>
                            <label className={styles.sectionLabel}>Open to Adoption / Kids?</label>
                            <div className={styles.radioGroup}>
                                {ADOPTION_PREFERENCE_OPTIONS.map((opt) => (
                                    <label key={opt.value} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="openToAdoptionState"
                                            value={opt.value}
                                            checked={formData.openToAdoptionState === opt.value}
                                            onChange={(e) => setFormData(p => ({ ...p, openToAdoptionState: e.target.value }))}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Health & Medical Compatibility */}
                    <div className={styles.card}>
                        <div className={styles.cardHeaderWithIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
                            <h2 className={styles.cardTitle}>Health & Medical Compatibility</h2>
                        </div>
                        <p className={styles.cardDesc}>
                            Optional. Set how open you are to different health conditions in a match — this affects match relevance, not a hard filter.
                        </p>

                        <div className={styles.noticeBox}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                            <div>
                                This reflects your own openness, not a verified requirement. A partner's medical info is self-declared and not verified by MERGE.
                            </div>
                        </div>

                        <div className={styles.healthList}>
                            {HEALTH_CATEGORIES.map((cat) => (
                                <div key={cat.key} className={styles.healthCategory}>
                                    <div className={styles.healthCategoryHeader}>
                                        {renderIcon(cat.icon)}
                                        <h4>{cat.title}</h4>
                                    </div>
                                    <div className={styles.healthOptionsWrap}>
                                        {HEALTH_OPTION_VALUES.map((opt) => {
                                            const active = (formData as any)[cat.key] === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => handleHealthChange(cat.key, opt.value)}
                                                    className={`${styles.optionChip} ${active ? styles.optionChipActive : ''}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {'subtext' in cat && <p className={styles.subtext}>{cat.subtext}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar[cite: 7] */}
                <div className={styles.sidebarColumn}>
                    {/* Active Filters[cite: 7] */}
                    <div className={styles.sideCard}>
                        <h3 className={styles.sideCardTitle}>ACTIVE FILTERS</h3>
                        <div className={styles.activeTagWrap}>
                            <span className={styles.activeTag}>Age: {formData.preferredAgeMin}-{formData.preferredAgeMax}</span>
                            {formData.preferredGender.slice(0, 3).map((g) => (
                                <span key={g} className={styles.activeTag}>{g}</span>
                            ))}
                            {formData.preferredGender.length > 3 && (
                                <span className={styles.activeTag}>+{formData.preferredGender.length - 3} more</span>
                            )}
                        </div>
                    </div>

                    {/* Promotional Locked Premium Card[cite: 7] */}
                    <div className={styles.premiumCard}>
                        <div className={styles.premiumHeader}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                            <h3>Advanced Filters</h3>
                        </div>
                        <p className={styles.premiumDesc}>
                            Unlock premium compatibility criteria to refine your matches.
                        </p>

                        <ul className={styles.lockedFeatures}>
                            <li><span>Income Level</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></li>
                            <li><span>Education</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></li>
                            <li><span>Family Plans</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></li>
                        </ul>

                        <button type="button" className={styles.upgradeBtn}>
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className={styles.bottomBar}>
                <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => { if (initialData) setFormData(initialData); }}
                    disabled={!isDirty}
                >
                    Reset Preferences
                </button>
                <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={isSaving || !isDirty}
                >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
};