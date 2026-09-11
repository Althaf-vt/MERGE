import React, { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { useUpdatePersonaMutation } from "../api/profile.api";
import { useUpdatePersonaMutation } from "../api/profile.api";
import { setCredentials } from "../../auth/slices/auth.slice";
import { getErrorMessage } from "../../../shared/utils/error.util";
import {
    PRONOUN_SUGGESTIONS,
    GENDER_IDENTITY_OPTIONS,
    LANGUAGE_SUGGESTIONS,
    INDIAN_LOCATION_DATA,
} from "../constants/persona-options.constant";
import styles from './build-persona.module.css';

interface BuildPersonaProps {
    onSuccess: () => void;
}

export const BuildPersona: React.FC<BuildPersonaProps> = ({ onSuccess }) => {
    const dispatch = useAppDispatch();

    // Extract user context & immutable KYC data[cite: 8]
    const user = useAppSelector((state) => state.auth.user);
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const verifiedDOB = user?.kycVerification?.verifiedDOB;
    const savedProfile = user?.profile;

    const [updatePersona, { isLoading }] = useUpdatePersonaMutation();
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Dynamic Multi-Select & Autocomplete States
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
        savedProfile?.languages || []
    );
    const [languageInput, setLanguageInput] = useState('');
    const [showLangSuggestions, setShowLangSuggestions] = useState(false);

    const [pronounInput, setPronounInput] = useState(savedProfile?.pronouns || '');
    const [showPronounSuggestions, setShowPronounSuggestions] = useState(false);

    // Click-outside reference listeners
    const langWrapperRef = useRef<HTMLDivElement>(null);
    const pronounWrapperRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        displayName: savedProfile?.displayName || '',
        phoneNumber: savedProfile?.phoneNumber?.replace(/^\+91/, '') || '',
        genderIdentity: savedProfile?.genderIdentity || '',
        customLabel: savedProfile?.customLabel || '',
        country: savedProfile?.country || 'India',
        state: savedProfile?.state || '',
        city: savedProfile?.city || '',
        heightCm: savedProfile?.heightCm ? savedProfile.heightCm.toString() : '',
        intersex: savedProfile?.intersex || 'NO',
        outnessLevel: savedProfile?.outnessLevel ?? 5,
        relationshipStatus: savedProfile?.relationshipStatus || 'SINGLE',
        relationshipGoal: savedProfile?.relationshipGoal || 'LONG_TERM_RELATIONSHIP',
        maritalStatus: savedProfile?.maritalStatus || 'NEVER_MARRIED',
        openToAdoption: savedProfile?.openToAdoption || 'MAYBE',
        immigrationReady: savedProfile?.immigrationReady || 'OPEN_TO_DISCUSSION',
    });

    const availableStates = Object.keys(INDIAN_LOCATION_DATA);
    const availableCities = formData.state ? INDIAN_LOCATION_DATA[formData.state] || [] : [];

    // Close floating dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langWrapperRef.current && !langWrapperRef.current.contains(event.target as Node)) {
                setShowLangSuggestions(false);
            }
            if (pronounWrapperRef.current && !pronounWrapperRef.current.contains(event.target as Node)) {
                setShowPronounSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter dynamic suggestions based on user input
    const filteredLanguages = LANGUAGE_SUGGESTIONS.filter(
        (lang) =>
            lang.toLowerCase().includes(languageInput.toLowerCase().trim()) &&
            !selectedLanguages.includes(lang)
    );

    const filteredPronouns = PRONOUN_SUGGESTIONS.filter((p) =>
        p.toLowerCase().includes(pronounInput.toLowerCase().trim())
    );

    // Language Tag Handlers
    const handleAddLanguage = (lang: string) => {
        const trimmed = lang.trim();
        if (trimmed && !selectedLanguages.includes(trimmed)) {
            setSelectedLanguages([...selectedLanguages, trimmed]);
        }
        setLanguageInput('');
        setShowLangSuggestions(false);
        if (fieldErrors.languages) {
            setFieldErrors((prev) => ({ ...prev, languages: '' }));
        }
    };

    const handleRemoveLanguage = (langToRemove: string) => {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== langToRemove));
    };

    const handleLanguageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (languageInput.trim()) {
                handleAddLanguage(languageInput);
            }
        } else if (e.key === 'Backspace' && !languageInput && selectedLanguages.length > 0) {
            handleRemoveLanguage(selectedLanguages[selectedLanguages.length - 1]);
        }
    };

    // Form Field Validation
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        const cleanName = formData.displayName.trim();
        if (cleanName.length < 3 || cleanName.length > 30) {
            errors.displayName = "Display name must be between 3 and 30 characters.";
        } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(cleanName)) {
            errors.displayName = "Display name can only contain letters and single spaces between words.";
        }

        const rawPhone = formData.phoneNumber.trim().replace(/^(\+91|0)/, '');
        if (!/^[6-9]\d{9}$/.test(rawPhone)) {
            errors.phoneNumber = "Please enter a valid 10-digit Indian phone number starting with 6-9.";
        }

        const heightNum = parseInt(formData.heightCm, 10);
        if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
            errors.heightCm = "Height must be a valid number between 100 cm and 250 cm.";
        }

        if (!formData.genderIdentity) {
            errors.genderIdentity = "Gender identity is required.";
        }

        if (!formData.state) {
            errors.state = "State selection is required.";
        }

        if (!formData.city) {
            errors.city = "City selection is required.";
        }

        if (selectedLanguages.length === 0 && !languageInput.trim()) {
            errors.languages = "At least one language is required.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'state') {
            setFormData((prev) => ({ ...prev, state: value, city: '' }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        try {
            const finalLanguages = [...selectedLanguages];
            if (languageInput.trim() && !finalLanguages.includes(languageInput.trim())) {
                finalLanguages.push(languageInput.trim());
            }

            const cleanPhone = formData.phoneNumber.trim().replace(/^(\+91|0)/, '');
            const payload = {
                ...formData,
                pronouns: pronounInput.trim() || undefined,
                phoneNumber: `+91${cleanPhone}`,
                heightCm: parseInt(formData.heightCm.toString(), 10),
                outnessLevel: parseInt(formData.outnessLevel.toString(), 10),
                languages: finalLanguages,
            };

            const res = await updatePersona(payload).unwrap();

            // Hydrate Redux with onboardingStep progression[cite: 8]
            if (user && accessToken) {
                dispatch(
                    setCredentials({
                        accessToken,
                        user: {
                            ...user,
                            onboardingStep: Math.max(user.onboardingStep ?? 0, 3),
                            profile: res.profile
                        },
                    })
                );
            }

            onSuccess();
        } catch (err: any) {
            setError(getErrorMessage(err, "Failed to save persona details. Please try again."));
        }
    };

    const displayDob = verifiedDOB
        ? new Date(verifiedDOB).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'Loading verified data...';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Build Your Persona</h1>
                <p className={styles.subtitle}>Let's start with the basics. How do you present yourself to the world?</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
                {/* Identity & Contact */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Identity & Contact</h3>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Display Name *</label>
                            <input
                                required
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="e.g. Rahul Sharma"
                            />
                            {fieldErrors.displayName && (
                                <span className={styles.fieldError}>{fieldErrors.displayName}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                Date of Birth
                                <svg className={styles.lockIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </label>
                            <input
                                disabled
                                value={displayDob}
                                className={`${styles.input} ${styles.disabledInput}`}
                                title="Immutable: Extracted from verified government ID"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Phone Number (India) *</label>
                            <input
                                required
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="10-digit mobile number"
                            />
                            {fieldErrors.phoneNumber && (
                                <span className={styles.fieldError}>{fieldErrors.phoneNumber}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Height (cm) *</label>
                            <input
                                required
                                name="heightCm"
                                type="number"
                                min="100"
                                max="250"
                                value={formData.heightCm}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="175"
                            />
                            {fieldErrors.heightCm && (
                                <span className={styles.fieldError}>{fieldErrors.heightCm}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gender & Orientation */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Gender & Orientation</h3>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Gender Identity *</label>
                            <select
                                required
                                name="genderIdentity"
                                value={formData.genderIdentity}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Select Gender Identity</option>
                                {GENDER_IDENTITY_OPTIONS.map((identity) => (
                                    <option key={identity} value={identity}>
                                        {identity}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.genderIdentity && (
                                <span className={styles.fieldError}>{fieldErrors.genderIdentity}</span>
                            )}
                        </div>

                        {/* Custom Pronoun Autocomplete */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Pronouns</label>
                            <div className={styles.autocompleteWrapper} ref={pronounWrapperRef}>
                                <input
                                    name="pronouns"
                                    value={pronounInput}
                                    onChange={(e) => {
                                        setPronounInput(e.target.value);
                                        setShowPronounSuggestions(true);
                                    }}
                                    onFocus={() => setShowPronounSuggestions(true)}
                                    className={styles.input}
                                    placeholder="e.g. They/Them or type custom"
                                    autoComplete="off"
                                />
                                {showPronounSuggestions && filteredPronouns.length > 0 && (
                                    <div className={styles.suggestionDropdown}>
                                        {filteredPronouns.map((pronoun) => (
                                            <div
                                                key={pronoun}
                                                className={styles.suggestionItem}
                                                onClick={() => {
                                                    setPronounInput(pronoun);
                                                    setShowPronounSuggestions(false);
                                                }}
                                            >
                                                {pronoun}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Intersex Status</label>
                            <select name="intersex" value={formData.intersex} onChange={handleChange} className={styles.select}>
                                <option value="NO">No</option>
                                <option value="YES">Yes</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Outness Level (1-5)</label>
                            <input
                                name="outnessLevel"
                                type="number"
                                min="1"
                                max="5"
                                value={formData.outnessLevel}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                {/* Location & Languages */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Location & Languages</h3>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Country *</label>
                            <input
                                disabled
                                name="country"
                                value="India"
                                className={`${styles.input} ${styles.disabledInput}`}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>State *</label>
                            <select
                                required
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Select State</option>
                                {availableStates.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.state && (
                                <span className={styles.fieldError}>{fieldErrors.state}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>City *</label>
                            <select
                                required
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={styles.select}
                                disabled={!formData.state}
                            >
                                <option value="">{formData.state ? 'Select City' : 'Select State First'}</option>
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.city && (
                                <span className={styles.fieldError}>{fieldErrors.city}</span>
                            )}
                        </div>

                        {/* Chip-Based Multi-Select Language Field */}
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Languages Spoken *</label>
                            <div className={styles.autocompleteWrapper} ref={langWrapperRef}>
                                <div
                                    className={styles.tagContainer}
                                    onClick={() => setShowLangSuggestions(true)}
                                >
                                    {selectedLanguages.map((lang) => (
                                        <span key={lang} className={styles.tagChip}>
                                            {lang}
                                            <button
                                                type="button"
                                                className={styles.tagRemoveBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveLanguage(lang);
                                                }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        className={styles.tagInput}
                                        value={languageInput}
                                        onChange={(e) => {
                                            setLanguageInput(e.target.value);
                                            setShowLangSuggestions(true);
                                        }}
                                        onFocus={() => setShowLangSuggestions(true)}
                                        onKeyDown={handleLanguageKeyDown}
                                        placeholder={selectedLanguages.length === 0 ? "Type language & press comma or enter" : ""}
                                        autoComplete="off"
                                    />
                                </div>

                                {showLangSuggestions && filteredLanguages.length > 0 && (
                                    <div className={styles.suggestionDropdown}>
                                        {filteredLanguages.map((lang) => (
                                            <div
                                                key={lang}
                                                className={styles.suggestionItem}
                                                onClick={() => handleAddLanguage(lang)}
                                            >
                                                {lang}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {fieldErrors.languages && (
                                <span className={styles.fieldError}>{fieldErrors.languages}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Relationship & Logistics */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Relationship & Logistics</h3>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Relationship Goal *</label>
                            <select
                                required
                                name="relationshipGoal"
                                value={formData.relationshipGoal}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="LONG_TERM_RELATIONSHIP">Long Term Relationship</option>
                                <option value="MARRIAGE">Marriage</option>
                                <option value="CASUAL_DATING">Casual Dating</option>
                                <option value="FRIENDSHIP">Friendship</option>
                                <option value="OPEN_TO_OPTIONS">Open to Options</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Marital Status *</label>
                            <select
                                required
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="NEVER_MARRIED">Never Married</option>
                                <option value="DIVORCED">Divorced</option>
                                <option value="SEPARATED">Separated</option>
                                <option value="WIDOWED">Widowed</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Open to Adoption? *</label>
                            <select
                                required
                                name="openToAdoption"
                                value={formData.openToAdoption}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="YES">Yes</option>
                                <option value="NO">No</option>
                                <option value="MAYBE">Open to Discussion</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Immigration Ready? *</label>
                            <select
                                required
                                name="immigrationReady"
                                value={formData.immigrationReady}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="YES">Yes</option>
                                <option value="NO">No</option>
                                <option value="OPEN_TO_DISCUSSION">Open to Discussion</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                        {isLoading ? "Saving Persona..." : "Save & Continue →"}
                    </button>
                </div>
            </form>
        </div>
    );
};