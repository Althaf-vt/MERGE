import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useGenerateBioMutation, useSaveFinalBioMutation } from '../api/profileApi';
import { setCredentials } from '../../auth/slices/authSlice';
import { BIO_TRAITS, BIO_INTERESTS } from '../constants/bio-options.constant';
import styles from './bio-optimizer.module.css';

export const BioOptimizer = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, accessToken } = useAppSelector((state) => state.auth);

    const [generateBio, { isLoading: isGenerating }] = useGenerateBioMutation();
    const [saveFinalBio, { isLoading: isSaving }] = useSaveFinalBioMutation();

    const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    
    const [generatedBios, setGeneratedBios] = useState<string[]>([]);
    const [selectedBioIndex, setSelectedBioIndex] = useState<number | null>(null);
    const [editableBio, setEditableBio] = useState('');
    const [remainingGenerations, setRemainingGenerations] = useState(3);
    const [error, setError] = useState<string | null>(null);

    // Toggles selection with a max limit of 5
    const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else if (list.length < 5) {
            setList([...list, item]);
        }
    };

    const handleGenerate = async () => {
        if (selectedTraits.length === 0 || selectedInterests.length === 0) {
            setError("Please select at least 1 trait and 1 interest.");
            return;
        }
        setError(null);

        try {
            const res = await generateBio({ selectedTraits, interests: selectedInterests }).unwrap();
            setGeneratedBios(res.bios);
            setRemainingGenerations(res.remainingAttempts);
            setSelectedBioIndex(null); // Reset selection on new generation
        } catch (err: any) {
            setError(err?.data?.message || "Generation failed.");
        }
    };

    const handleSelectBio = (index: number) => {
        setSelectedBioIndex(index);
        setEditableBio(generatedBios[index]);
    };

    const handleSave = async () => {
        if (selectedBioIndex === null || !editableBio.trim()) {
            setError("Please select and finalize a bio.");
            return;
        }

        try {
            await saveFinalBio({
                bio: editableBio,
                selectedTraits,
                interests: selectedInterests
            }).unwrap();

            if (user && accessToken) {
                dispatch(setCredentials({
                    accessToken,
                    user: { 
                        ...user, 
                        onboardingStep: 14, 
                        profileCompleted: true,
                        onboardingCompleted: true 
                    }
                }));
            }
            
            // Navigate to Dashboard or Success Screen
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError("Failed to save profile.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>What makes you, you?</h1>
                <p className={styles.subtitle}>Select up to 5 traits. Our AI will craft your perfect bio based on your unique personality mix.</p>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

            <div className={styles.layout}>
                {/* Left Column: Selections */}
                <div className={styles.card}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Select Traits</h3>
                        <span className={styles.counter}>{selectedTraits.length}/5 Selected</span>
                    </div>
                    <div className={styles.pillGrid}>
                        {BIO_TRAITS.map(trait => (
                            <button
                                key={trait}
                                onClick={() => toggleSelection(trait, selectedTraits, setSelectedTraits)}
                                className={`${styles.pill} ${selectedTraits.includes(trait) ? styles.pillActive : ''}`}
                            >
                                {trait}
                            </button>
                        ))}
                    </div>

                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Select Interests</h3>
                        <span className={styles.counter}>{selectedInterests.length}/5 Selected</span>
                    </div>
                    <div className={styles.pillGrid}>
                        {BIO_INTERESTS.map(interest => (
                            <button
                                key={interest}
                                onClick={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
                                className={`${styles.pill} ${selectedInterests.includes(interest) ? styles.pillActive : ''}`}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating || remainingGenerations === 0}
                        className={styles.generateBtn}
                    >
                        ✨ {isGenerating ? 'Generating...' : 'Generate Bio'}
                    </button>
                    <p className={styles.remainingText}>{remainingGenerations} generations remaining</p>
                </div>

                {/* Right Column: AI Results */}
                <div>
                    {generatedBios.length === 0 ? (
                        <div className={styles.card} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                            Your AI-crafted bios will appear here.
                        </div>
                    ) : (
                        <>
                            {generatedBios.map((bio, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleSelectBio(idx)}
                                    className={`${styles.bioOptionCard} ${selectedBioIndex === idx ? styles.bioOptionSelected : ''}`}
                                >
                                    {selectedBioIndex === idx && (
                                        <div className={styles.checkIcon}>✓</div>
                                    )}
                                    {selectedBioIndex === idx ? (
                                        <textarea 
                                            value={editableBio} 
                                            onChange={(e) => setEditableBio(e.target.value)}
                                            className={styles.editableTextarea}
                                            rows={4}
                                        />
                                    ) : (
                                        bio
                                    )}
                                </div>
                            ))}
                            <button onClick={() => setGeneratedBios([])} className={styles.editLink}>
                                Regenerate Options
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.footer}>
                <button onClick={() => navigate('/onboarding/preferences')} className={styles.backBtn}>
                    ← Back
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving || selectedBioIndex === null} 
                    className={styles.saveBtn}
                >
                    {isSaving ? 'Completing...' : 'Save & Complete Profile'}
                </button>
            </div>
        </div>
    );
};