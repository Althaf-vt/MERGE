// frontend/src/features/profile/pages/edit-profile.page.tsx

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { useUpdateFullProfileMutation } from '../api/profile.api';
import styles from './edit-profile.module.css';

export const EditProfilePage: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const profile = user?.profile;

    // Use the single unified hook for post-onboarding profile management
    const [updateFullProfile] = useUpdateFullProfileMutation();

    // Local Form State
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        // Basic Info
        displayName: '',
        customLabel: '',
        bio: '',
        // Identity
        pronouns: '',
        genderIdentity: '',
        sexualOrientation: '',
        intersex: 'NO',
        // Personal Info
        heightCm: 170,
        languages: [] as string[],
        religion: '',
        education: [] as string[],
        occupation: '',
        incomeRange: [] as string[],
        // Lifestyle
        diet: '',
        smokingHabit: '',
        drinkingHabit: '',
        disability: 'PREFER_NOT_TO_SAY',
        // Relationship
        relationshipGoal: '',
        relationshipStatus: '',
        maritalStatus: '',
        openToAdoption: 'MAYBE',
        immigrationReady: 'OPEN_TO_DISCUSSION',
        // Interests
        selectedTraits: [] as string[],
        interests: [] as string[]
    });

    // Inline tag input state
    const [newLanguage, setNewLanguage] = useState('');
    const [newTrait, setNewTrait] = useState('');
    const [newInterest, setNewInterest] = useState('');

    // Hydrate form with Redux state on mount
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                displayName: profile.displayName || '',
                customLabel: profile.customLabel || '',
                bio: profile.bio || '',
                pronouns: profile.pronouns || '',
                genderIdentity: profile.genderIdentity || '',
                sexualOrientation: profile.sexualOrientation || '',
                intersex: profile.intersex || 'NO',
                heightCm: profile.heightCm || 170,
                languages: profile.languages || [],
                religion: profile.religion || '',
                education: profile.education || [],
                occupation: profile.occupation || '',
                incomeRange: profile.incomeRange || [],
                diet: profile.diet || '',
                smokingHabit: profile.smokingHabit || '',
                drinkingHabit: profile.drinkingHabit || '',
                disability: profile.disability || 'PREFER_NOT_TO_SAY',
                relationshipGoal: profile.relationshipGoal || '',
                relationshipStatus: profile.relationshipStatus || '',
                maritalStatus: profile.maritalStatus || '',
                openToAdoption: profile.openToAdoption || 'MAYBE',
                immigrationReady: profile.immigrationReady || 'OPEN_TO_DISCUSSION',
                selectedTraits: profile.selectedTraits || [],
                interests: profile.interests || []
            }));
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddArrayItem = (field: 'languages' | 'selectedTraits' | 'interests', value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        if (value.trim() && !formData[field].includes(value.trim())) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
            setter('');
        }
    };

    const handleRemoveArrayItem = (field: 'languages' | 'selectedTraits' | 'interests', itemToRemove: string) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter(item => item !== itemToRemove) }));
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            // One single atomic API call containing the entire state
            await updateFullProfile({
                ...formData,
                heightCm: Number(formData.heightCm)
            }).unwrap();

            setSuccessMsg('Profile updated successfully.');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setErrorMsg(err?.data?.error?.message || 'An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Edit Profile</h1>
                    <p className={styles.subtitle}>Manage how your profile appears to potential matches.</p>
                </div>
                <button className={styles.saveBtn} onClick={handleSaveAll} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </header>
            
            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
            {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
            
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Basic Information</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Display Name</label>
                        <input name="displayName" value={formData.displayName} onChange={handleInputChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Custom Label</label>
                        <input name="customLabel" value={formData.customLabel} onChange={handleInputChange} placeholder="e.g. Coffee Addict" />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label>Bio</label>
                        <span className={styles.charCount}>{formData.bio.length}/1000</span>
                    </div>
                    <textarea 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleInputChange} 
                        rows={4} 
                        maxLength={1000}
                    />
                </div>
            </div>
            
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Identity Details</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Pronouns</label>
                        <input name="pronouns" value={formData.pronouns} onChange={handleInputChange} placeholder="e.g. They/Them" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Gender Identity</label>
                        <input name="genderIdentity" value={formData.genderIdentity} onChange={handleInputChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Intersex Status</label>
                        <select name="intersex" value={formData.intersex} onChange={handleInputChange}>
                            <option value="YES">Yes</option>
                            <option value="NO">No</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Personal Information</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Height (cm)</label>
                        <input type="number" name="heightCm" value={formData.heightCm} onChange={handleInputChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Languages</label>
                        <div className={styles.tagInputWrapper}>
                            {formData.languages.map(lang => (
                                <span key={lang} className={styles.tag}>
                                    {lang} <button onClick={() => handleRemoveArrayItem('languages', lang)}>×</button>
                                </span>
                            ))}
                            <div className={styles.tagAdder}>
                                <input 
                                    value={newLanguage} 
                                    onChange={(e) => setNewLanguage(e.target.value)} 
                                    placeholder="Add language..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddArrayItem('languages', newLanguage, setNewLanguage)}
                                />
                                <button onClick={() => handleAddArrayItem('languages', newLanguage, setNewLanguage)}>Add</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Religion</label>
                        <input name="religion" value={formData.religion} onChange={handleInputChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Occupation</label>
                        <input name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="e.g. Architect" />
                    </div>
                </div>
            </div>
            
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Lifestyle</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Diet</label>
                        <select name="diet" value={formData.diet} onChange={handleInputChange}>
                            <option value="VEGAN">Vegan</option>
                            <option value="VEGETARIAN">Vegetarian</option>
                            <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                            <option value="OTHER">Other / No Preference</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Smoking</label>
                        <select name="smokingHabit" value={formData.smokingHabit} onChange={handleInputChange}>
                            <option value="NO">Never</option>
                            <option value="OCCASIONALLY">Occasionally</option>
                            <option value="YES">Yes</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Drinking</label>
                        <select name="drinkingHabit" value={formData.drinkingHabit} onChange={handleInputChange}>
                            <option value="NO">Never</option>
                            <option value="OCCASIONALLY">Occasionally</option>
                            <option value="SOCIALLY">Socially</option>
                            <option value="YES">Yes</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Disability Status</label>
                        <select name="disability" value={formData.disability} onChange={handleInputChange}>
                            <option value="YES">Yes</option>
                            <option value="NO">No</option>
                            <option value="PREFER_NOT_TO_SAY">Prefer Not to Say</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Relationship</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Search Category (Goal)</label>
                        <select name="relationshipGoal" value={formData.relationshipGoal} onChange={handleInputChange}>
                            <option value="LONG_TERM_RELATIONSHIP">Long-Term Relationship</option>
                            <option value="MARRIAGE">Marriage</option>
                            <option value="CASUAL_DATING">Casual Dating</option>
                            <option value="FRIENDSHIP">Friendship</option>
                            <option value="OPEN_TO_OPTIONS">Open to Options</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Current Status</label>
                        <select name="relationshipStatus" value={formData.relationshipStatus} onChange={handleInputChange}>
                            <option value="SINGLE">Single</option>
                            <option value="COMPLICATED">Complicated</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Marital Status</label>
                        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}>
                            <option value="NEVER_MARRIED">Never Married</option>
                            <option value="DIVORCED">Divorced</option>
                            <option value="WIDOWED">Widowed</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Open To Adoption</label>
                        <div className={styles.radioGroup}>
                            <label><input type="radio" name="openToAdoption" value="YES" checked={formData.openToAdoption === 'YES'} onChange={handleInputChange} /> Yes</label>
                            <label><input type="radio" name="openToAdoption" value="NO" checked={formData.openToAdoption === 'NO'} onChange={handleInputChange} /> No</label>
                            <label><input type="radio" name="openToAdoption" value="MAYBE" checked={formData.openToAdoption === 'MAYBE'} onChange={handleInputChange} /> Maybe</label>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Immigration Ready</label>
                        <div className={styles.radioGroup}>
                            <label><input type="radio" name="immigrationReady" value="YES" checked={formData.immigrationReady === 'YES'} onChange={handleInputChange} /> Yes</label>
                            <label><input type="radio" name="immigrationReady" value="NO" checked={formData.immigrationReady === 'NO'} onChange={handleInputChange} /> No</label>
                            <label><input type="radio" name="immigrationReady" value="OPEN_TO_DISCUSSION" checked={formData.immigrationReady === 'OPEN_TO_DISCUSSION'} onChange={handleInputChange} /> Open to discussion</label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Interests & Personality</h3>
                <div className={styles.inputGroup}>
                    <label>Personality Tags</label>
                    <div className={styles.tagInputWrapper}>
                        {formData.selectedTraits.map(trait => (
                            <span key={trait} className={styles.purpleTag}>
                                {trait} <button onClick={() => handleRemoveArrayItem('selectedTraits', trait)}>×</button>
                            </span>
                        ))}
                        <div className={styles.tagAdder}>
                            <input 
                                value={newTrait} 
                                onChange={(e) => setNewTrait(e.target.value)} 
                                placeholder="Add trait..."
                                onKeyDown={(e) => e.key === 'Enter' && handleAddArrayItem('selectedTraits', newTrait, setNewTrait)}
                            />
                            <button onClick={() => handleAddArrayItem('selectedTraits', newTrait, setNewTrait)}>Add</button>
                        </div>
                    </div>
                </div>
                <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                    <label>Interests</label>
                    <div className={styles.tagInputWrapper}>
                        {formData.interests.map(interest => (
                            <span key={interest} className={styles.purpleTag}>
                                {interest} <button onClick={() => handleRemoveArrayItem('interests', interest)}>×</button>
                            </span>
                        ))}
                        <div className={styles.tagAdder}>
                            <input 
                                value={newInterest} 
                                onChange={(e) => setNewInterest(e.target.value)} 
                                placeholder="Add interest..."
                                onKeyDown={(e) => e.key === 'Enter' && handleAddArrayItem('interests', newInterest, setNewInterest)}
                            />
                            <button onClick={() => handleAddArrayItem('interests', newInterest, setNewInterest)}>Add</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom sticky save bar for convenience */}
            <div className={styles.bottomBar}>
                <button className={styles.cancelBtn} onClick={() => window.location.reload()}>Cancel</button>
                <button className={styles.saveBtn} onClick={handleSaveAll} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};