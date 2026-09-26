import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { useUpdateFullProfileMutation } from '../api/profile.api';
import { 
    ADOPTION_OPTIONS, DIET_OPTIONS, DISABILITY_OPTIONS, DRINKING_HABITS, 
    IMMIGRATION_OPTIONS, INTERSEX_OPTIONS, MARITAL_STATUS_OPTIONS, 
    RELATIONSHIP_GOALS, RELATIONSHIP_STATUS_OPTIONS, SMOKING_HABITS,
    PRONOUN_SUGGESTIONS, GENDER_IDENTITY_OPTIONS, SEXUAL_ORIENTATIONS,
    LANGUAGE_SUGGESTIONS, OCCUPATION_SUGGESTIONS, EDUCATION_LEVELS,
    INCOME_RANGES, RELIGION_OPTIONS, BIO_TRAITS, BIO_INTERESTS
} from '../constants/profile-form.constants';
import styles from './edit-profile.module.css';

export const EditProfilePage: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const profile = user?.profile;

    const [updateFullProfile] = useUpdateFullProfileMutation();

    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [globalError, setGlobalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [initialData, setInitialData] = useState<any>(null);
    const [formData, setFormData] = useState({
        displayName: '', customLabel: '', bio: '', pronouns: '', genderIdentity: '',
        sexualOrientation: '', intersex: '', heightCm: 170, languages: [] as string[],
        religion: '', education: [] as string[], occupation: '', incomeRange: [] as string[],
        diet: '', smokingHabit: '', drinkingHabit: '', disability: '',
        relationshipGoal: '', relationshipStatus: '', maritalStatus: '', openToAdoption: '',
        immigrationReady: '', selectedTraits: [] as string[], interests: [] as string[]
    });

    const [inputStates, setInputStates] = useState({
        languages: '', education: '', traits: '', interests: ''
    });

    useEffect(() => {
        if (profile) {
            const mappedData = {
                displayName: profile.displayName || '', customLabel: profile.customLabel || '',
                bio: profile.bio || '', pronouns: profile.pronouns || '',
                genderIdentity: profile.genderIdentity || '', sexualOrientation: profile.sexualOrientation || '',
                intersex: profile.intersex || '', heightCm: profile.heightCm || 170,
                languages: profile.languages || [], religion: profile.religion || '',
                education: profile.education || [], occupation: profile.occupation || '',
                incomeRange: profile.incomeRange || [], diet: profile.diet || '',
                smokingHabit: profile.smokingHabit || '', drinkingHabit: profile.drinkingHabit || '',
                disability: profile.disability || '',
                relationshipGoal: profile.relationshipGoal || '', relationshipStatus: profile.relationshipStatus || '',
                maritalStatus: profile.maritalStatus || '', openToAdoption: profile.openToAdoption || '',
                immigrationReady: profile.immigrationReady || '',
                selectedTraits: profile.selectedTraits || [], interests: profile.interests || []
            };
            setFormData(mappedData);
            setInitialData(mappedData);
        }
    }, [profile]);

    const isDirty = initialData && JSON.stringify(formData) !== JSON.stringify(initialData);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const hasAlphaNumeric = (str: string) => /[a-zA-Z0-9]/.test(str);

        if (!formData.displayName.trim() || formData.displayName.length < 2) {
            errors.displayName = "Display name must be at least 2 characters.";
        } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.displayName)) {
            errors.displayName = "Only letters and single spaces allowed.";
        }

        if (formData.customLabel && !hasAlphaNumeric(formData.customLabel)) {
            errors.customLabel = "Label must contain valid characters.";
        }
        if (formData.bio && !hasAlphaNumeric(formData.bio)) {
            errors.bio = "Bio cannot be empty spaces or symbols only.";
        }

        const h = Number(formData.heightCm);
        if (isNaN(h) || h < 100 || h > 250) {
            errors.heightCm = "Height must be between 100 and 250 cm.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const handleArrayInput = (field: 'languages' | 'education' | 'selectedTraits' | 'interests', stateKey: keyof typeof inputStates) => {
        const val = inputStates[stateKey].trim();
        if (val && !formData[field].includes(val)) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], val] }));
        }
        setInputStates(prev => ({ ...prev, [stateKey]: '' }));
    };

    const removeArrayItem = (field: 'languages' | 'education' | 'selectedTraits' | 'interests', item: string) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter(i => i !== item) }));
    };

    const handleSaveAll = async () => {
        if (!isDirty || !validateForm()) return;
        setIsSaving(true); 
        setGlobalError(''); 
        setSuccessMsg('');

        try {
            await updateFullProfile({ ...formData, heightCm: Number(formData.heightCm) }).unwrap();
            setInitialData({ ...formData });
            setSuccessMsg('Profile updated successfully.');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            
            const apiMessage = err?.data?.message;
            
            if (Array.isArray(apiMessage)) {
                setGlobalError(apiMessage.join(' • '));
            } else if (typeof apiMessage === 'string') {
                setGlobalError(apiMessage);
            } else {
                setGlobalError(err?.data?.error || 'An error occurred while saving.');
            }
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
            </header>

            {globalError && <div className={styles.errorMsg}>{globalError}</div>}
            {successMsg && <div className={styles.successMsg}>{successMsg}</div>}

            {/* BASIC INFO */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Basic Information</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Display Name</label>
                        <input name="displayName" value={formData.displayName} onChange={handleInputChange} maxLength={50} />
                        {fieldErrors.displayName && <span className={styles.inlineError}>{fieldErrors.displayName}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Custom Label</label>
                        <input name="customLabel" value={formData.customLabel} onChange={handleInputChange} placeholder="e.g. Coffee Addict" maxLength={40} />
                        {fieldErrors.customLabel && <span className={styles.inlineError}>{fieldErrors.customLabel}</span>}
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label>Bio</label>
                        <span className={styles.charCount}>{formData.bio.length}/1000</span>
                    </div>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} maxLength={1000} />
                    {fieldErrors.bio && <span className={styles.inlineError}>{fieldErrors.bio}</span>}
                </div>
            </div>

            {/* IDENTITY */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Identity Details</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Pronouns</label>
                        <input list="pronounsList" name="pronouns" value={formData.pronouns} onChange={handleInputChange} placeholder="Select or type..." />
                        <datalist id="pronounsList">{PRONOUN_SUGGESTIONS.map(p => <option key={p} value={p}/>)}</datalist>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Gender Identity</label>
                        <input list="genderList" name="genderIdentity" value={formData.genderIdentity} onChange={handleInputChange} placeholder="Select or type..." />
                        <datalist id="genderList">{GENDER_IDENTITY_OPTIONS.map(g => <option key={g} value={g}/>)}</datalist>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Sexual Orientation</label>
                        <input list="orientationList" name="sexualOrientation" value={formData.sexualOrientation} onChange={handleInputChange} placeholder="Select or type..." />
                        <datalist id="orientationList">{SEXUAL_ORIENTATIONS.map(s => <option key={s} value={s}/>)}</datalist>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Intersex Status</label>
                        <select name="intersex" value={formData.intersex} onChange={handleInputChange}>
                            <option value="">Select option</option>
                            {INTERSEX_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* PERSONAL INFO */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Personal Information</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Height (cm)</label>
                        <input type="number" name="heightCm" value={formData.heightCm} onChange={handleInputChange} />
                        {fieldErrors.heightCm && <span className={styles.inlineError}>{fieldErrors.heightCm}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Languages</label>
                        <div className={styles.tagInputWrapper}>
                            {formData.languages.map(lang => (
                                <span key={lang} className={styles.purpleTag}>{lang} <button type="button" onClick={() => removeArrayItem('languages', lang)}>×</button></span>
                            ))}
                            <div className={styles.tagAdder}>
                                <input list="langList" value={inputStates.languages} onChange={(e) => setInputStates(p => ({...p, languages: e.target.value}))} onKeyDown={(e) => e.key === 'Enter' && handleArrayInput('languages', 'languages')} placeholder="Add language..." />
                                <datalist id="langList">{LANGUAGE_SUGGESTIONS.map(l => <option key={l} value={l}/>)}</datalist>
                                <button type="button" onClick={() => handleArrayInput('languages', 'languages')}>Add</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Education</label>
                        <div className={styles.tagInputWrapper}>
                            {formData.education.map(edu => (
                                <span key={edu} className={styles.purpleTag}>{edu} <button type="button" onClick={() => removeArrayItem('education', edu)}>×</button></span>
                            ))}
                            <div className={styles.tagAdder}>
                                <input list="eduList" value={inputStates.education} onChange={(e) => setInputStates(p => ({...p, education: e.target.value}))} onKeyDown={(e) => e.key === 'Enter' && handleArrayInput('education', 'education')} placeholder="Add education..." />
                                <datalist id="eduList">{EDUCATION_LEVELS.map(l => <option key={l} value={l}/>)}</datalist>
                                <button type="button" onClick={() => handleArrayInput('education', 'education')}>Add</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Occupation</label>
                        <input list="occList" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="e.g. Architect" />
                        <datalist id="occList">{OCCUPATION_SUGGESTIONS.map(o => <option key={o} value={o}/>)}</datalist>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Religion</label>
                        <select name="religion" value={formData.religion} onChange={handleInputChange}>
                            <option value="">Select religion</option>
                            {RELIGION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Income Range</label>
                        <select name="incomeRange" value={formData.incomeRange[0] || ''} onChange={(e) => setFormData(p => ({...p, incomeRange: [e.target.value]}))}>
                            <option value="">Select range</option>
                            {INCOME_RANGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* LIFESTYLE */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Lifestyle</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Diet</label>
                        <select name="diet" value={formData.diet} onChange={handleInputChange}>
                            <option value="">Select diet</option>
                            {DIET_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Smoking</label>
                        <select name="smokingHabit" value={formData.smokingHabit} onChange={handleInputChange}>
                            <option value="">Select habit</option>
                            {SMOKING_HABITS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Drinking</label>
                        <select name="drinkingHabit" value={formData.drinkingHabit} onChange={handleInputChange}>
                            <option value="">Select habit</option>
                            {DRINKING_HABITS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Disability Status</label>
                        <select name="disability" value={formData.disability} onChange={handleInputChange}>
                            <option value="">Select status</option>
                            {DISABILITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* RELATIONSHIP */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Relationship</h3>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Search Category (Goal)</label>
                        <select name="relationshipGoal" value={formData.relationshipGoal} onChange={handleInputChange}>
                            <option value="">Select goal</option>
                            {RELATIONSHIP_GOALS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Current Status</label>
                        <select name="relationshipStatus" value={formData.relationshipStatus} onChange={handleInputChange}>
                            <option value="">Select status</option>
                            {RELATIONSHIP_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Marital Status</label>
                        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}>
                            <option value="">Select status</option>
                            {MARITAL_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Open To Adoption</label>
                        <div className={styles.radioGroup}>
                            {ADOPTION_OPTIONS.map(opt => (
                                <label key={opt.value}><input type="radio" name="openToAdoption" value={opt.value} checked={formData.openToAdoption === opt.value} onChange={handleInputChange} /> {opt.label}</label>
                            ))}
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Immigration Ready</label>
                        <div className={styles.radioGroup}>
                            {IMMIGRATION_OPTIONS.map(opt => (
                                <label key={opt.value}><input type="radio" name="immigrationReady" value={opt.value} checked={formData.immigrationReady === opt.value} onChange={handleInputChange} /> {opt.label}</label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* INTERESTS */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Interests & Personality</h3>
                <div className={styles.inputGroup}>
                    <label>Personality Tags</label>
                    <div className={styles.tagInputWrapper}>
                        {formData.selectedTraits.map(trait => (
                            <span key={trait} className={styles.purpleTag}>{trait} <button type="button" onClick={() => removeArrayItem('selectedTraits', trait)}>×</button></span>
                        ))}
                        <div className={styles.tagAdder}>
                            <input list="traitsList" value={inputStates.traits} onChange={(e) => setInputStates(p => ({...p, traits: e.target.value}))} onKeyDown={(e) => e.key === 'Enter' && handleArrayInput('selectedTraits', 'traits')} placeholder="Add trait..." />
                            <datalist id="traitsList">{BIO_TRAITS.map(t => <option key={t} value={t}/>)}</datalist>
                            <button type="button" onClick={() => handleArrayInput('selectedTraits', 'traits')}>Add</button>
                        </div>
                    </div>
                </div>
                <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                    <label>Interests</label>
                    <div className={styles.tagInputWrapper}>
                        {formData.interests.map(interest => (
                            <span key={interest} className={styles.purpleTag}>{interest} <button type="button" onClick={() => removeArrayItem('interests', interest)}>×</button></span>
                        ))}
                        <div className={styles.tagAdder}>
                            <input list="interestsList" value={inputStates.interests} onChange={(e) => setInputStates(p => ({...p, interests: e.target.value}))} onKeyDown={(e) => e.key === 'Enter' && handleArrayInput('interests', 'interests')} placeholder="Add interest..." />
                            <datalist id="interestsList">{BIO_INTERESTS.map(t => <option key={t} value={t}/>)}</datalist>
                            <button type="button" onClick={() => handleArrayInput('interests', 'interests')}>Add</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <button 
                    className={styles.cancelBtn} 
                    onClick={() => { if (initialData) setFormData(initialData); setFieldErrors({}); }}
                    disabled={!isDirty}
                >
                    Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSaveAll} disabled={isSaving || !isDirty}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};