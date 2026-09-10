import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useUpdatePreferencesMutation } from '../api/profileApi';
import { setCredentials } from '../../auth/slices/authSlice';
import {
    DEFAULT_IDENTITY_TAGS,
    SUGGESTED_IDENTITY_TAGS,
    RELATIONSHIP_GOAL_BUTTONS,
} from '../constants/preference-options.constant';
import styles from './user-preferences.module.css';

interface UserPreferencesProps {
    onSuccess: () => void;
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({ onSuccess }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const accessToken = useAppSelector((state) => state.auth.accessToken);

    const [updatePreferences, { isLoading }] = useUpdatePreferencesMutation();
    const [error, setError] = useState<string | null>(null);

    // Reference previously stored preferences from Redux
    const savedPrefs = user?.preference;

    // Form states
    const [selectedGenders, setSelectedGenders] = useState<string[]>(savedPrefs?.preferredGender || ['Trans Man', 'Non-Binary']);
    const [customGenderInput, setCustomGenderInput] = useState('');
    const [relationshipGoal, setRelationshipGoal] = useState(savedPrefs?.relationshipGoals || savedPrefs?.relationShipGoals || 'LONG_TERM_RELATIONSHIP');
    const [ageMin, setAgeMin] = useState(savedPrefs?.preferredAgeMin ?? 24);
    const [ageMax, setAgeMax] = useState(savedPrefs?.preferredAgeMax ?? savedPrefs?.prefferedAgeMax ?? 35);
    const [outnessTolerance, setOutnessTolerance] = useState(savedPrefs?.minimumOutnessLevel ?? 3);
    const [openToAdoption, setOpenToAdoption] = useState(savedPrefs?.openToAdoption ?? true);
    const [immigrationReady, setImmigrationReady] = useState(savedPrefs?.immigrationReady ?? false);
    const [partnerExpectations, setPartnerExpectations] = useState(savedPrefs?.partnerExpectations || '');

    // Synchronize state when Redux user rehydrates or updates
    useEffect(() => {
        if (savedPrefs) {
        if (savedPrefs.preferredGender) {
            setSelectedGenders(savedPrefs.preferredGender);
        }
        setRelationshipGoal(savedPrefs.relationshipGoals || savedPrefs.relationShipGoals || 'LONG_TERM_RELATIONSHIP');
        setAgeMin(savedPrefs.preferredAgeMin ?? 24);
        setAgeMax(savedPrefs.preferredAgeMax ?? savedPrefs.prefferedAgeMax ?? 35);
        setOutnessTolerance(savedPrefs.minimumOutnessLevel ?? 3);
        setOpenToAdoption(savedPrefs.openToAdoption ?? true);
        setImmigrationReady(savedPrefs.immigrationReady ?? false);
        setPartnerExpectations(savedPrefs.partnerExpectations || '');
        }
    }, [savedPrefs]);

    const toggleGender = (gender: string) => {
        setSelectedGenders((prev) =>
            prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
        );
    };

    const handleAddCustomGender = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customGenderInput.trim()) {
            e.preventDefault();
            if (!selectedGenders.includes(customGenderInput.trim())) {
                setSelectedGenders([...selectedGenders, customGenderInput.trim()]);
            }
            setCustomGenderInput('');
        }
    };

    const handleSubmit = async () => {
        setError(null);
        if (selectedGenders.length === 0) {
            setError('Please select at least one identity you are looking for.');
            return;
        }

        try {
            const payload = {
                preferredGender: selectedGenders,
                preferredAgeMin: ageMin,
                preferredAgeMax: ageMax,
                relationshipGoals: relationshipGoal,
                minimumOutnessLevel: outnessTolerance,
                openToAdoption,
                immigrationReady,
                partnerExpectations: partnerExpectations.trim() || undefined,
            };

            const res = await updatePreferences(payload).unwrap();

            if (user && accessToken) {
                dispatch(
                    setCredentials({
                        accessToken,
                        user: {
                            ...user,
                            onboardingStep: Math.max(user.onboardingStep ?? 0, 5),
                            preference: res.preferences
                        },
                    })
                );
            }

            onSuccess();
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to update preferences.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Who are you looking for?</h1>
                <p className={styles.subtitle}>Step 4 of 5: Help us refine your matches.</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.cardGrid}>
                {/* 1. Identities */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Identities</h3>
                    <div className={styles.pillGroup}>
                        {DEFAULT_IDENTITY_TAGS.map((gender) => (
                            <button
                                key={gender}
                                type="button"
                                className={`${styles.pillBtn} ${selectedGenders.includes(gender) ? styles.pillBtnActive : ''}`}
                                onClick={() => toggleGender(gender)}
                            >
                                {gender}
                            </button>
                        ))}
                    </div>

                    <div className={styles.searchInputWrapper}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            className={styles.searchInput}
                            placeholder="Search or add identity..."
                            value={customGenderInput}
                            onChange={(e) => setCustomGenderInput(e.target.value)}
                            onKeyDown={handleAddCustomGender}
                        />
                    </div>

                    <div className={styles.suggestedArea}>
                        <span className={styles.suggestedLabel}>Suggested</span>
                        <div className={styles.pillGroup}>
                            {SUGGESTED_IDENTITY_TAGS.map((sug) => (
                                <button
                                    key={sug}
                                    type="button"
                                    className={`${styles.pillBtn} ${selectedGenders.includes(sug) ? styles.pillBtnActive : ''}`}
                                    onClick={() => toggleGender(sug)}
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Relationship Goals */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Relationship Goals</h3>
                    <div className={styles.pillGroup}>
                        {RELATIONSHIP_GOAL_BUTTONS.map((rg) => (
                            <button
                                key={rg.value}
                                type="button"
                                className={`${styles.pillBtn} ${relationshipGoal === rg.value ? styles.pillBtnActive : ''}`}
                                onClick={() => setRelationshipGoal(rg.value)}
                            >
                                {rg.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Age Range */}
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span>Age Range</span>
                        <span style={{ color: '#6200ea', fontSize: '0.95rem' }}>{ageMin} - {ageMax}</span>
                    </div>
                    <div className={styles.sliderContainer}>
                        <input
                            type="range"
                            min="18"
                            max="70"
                            value={ageMax}
                            onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin))}
                            className={styles.rangeInput}
                        />
                        <div className={styles.sliderLabels}>
                            <span>18</span>
                            <span>{ageMax}</span>
                            <span>70+</span>
                        </div>
                    </div>
                </div>

                {/* 4. Outness Tolerance */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Outness Tolerance</h3>
                    <p className={styles.cardDescription}>
                        I want to match with people whose Outness is at least level {outnessTolerance}.
                    </p>
                    <div className={styles.sliderContainer}>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={outnessTolerance}
                            onChange={(e) => setOutnessTolerance(Number(e.target.value))}
                            className={styles.rangeInput}
                        />
                        <div className={styles.sliderLabels}>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                        </div>
                    </div>
                </div>

                {/* 5. Hard Choices */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>The Hard Choices</h3>
                    <div className={styles.toggleRow}>
                        <span className={styles.toggleLabel}>Open to Adoption</span>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={openToAdoption}
                                onChange={(e) => setOpenToAdoption(e.target.checked)}
                            />
                            <span className={styles.sliderRound}></span>
                        </label>
                    </div>

                    <div className={styles.toggleRow}>
                        <span className={styles.toggleLabel}>Immigration Ready</span>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={immigrationReady}
                                onChange={(e) => setImmigrationReady(e.target.checked)}
                            />
                            <span className={styles.sliderRound}></span>
                        </label>
                    </div>
                </div>

                {/* 6. Partner Expectations */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Partner Expectations</h3>
                    <textarea
                        className={styles.textarea}
                        placeholder="Describe what you're looking for in a partner..."
                        value={partnerExpectations}
                        onChange={(e) => setPartnerExpectations(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.footer}>
                <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => navigate('/onboarding/lifestyle')}
                >
                    ← Back
                </button>

                <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Complete Profile'}
                </button>
            </div>
        </div>
    );
};