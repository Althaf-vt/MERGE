import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { useUpdateLifestyleMutation } from "../api/profileApi";
import { setCredentials } from "../../auth/slices/authSlice";
import {
    EDUCATION_LEVELS,
    INCOME_RANGES,
    RELIGION_OPTIONS,
    DIET_OPTIONS,
    SMOKING_HABITS,
    DRINKING_HABITS,
    DISABILITY_OPTIONS,
    RELATIONSHIP_STATUS_OPTIONS,
    MARITAL_STATUS_OPTIONS,
} from "../constants/lifestyle-options.constant";
import styles from "./lifestyle-background.module.css";

interface LifestyleBackgroundProps {
    onSuccess: () => void;
}

export const LifestyleBackground: React.FC<LifestyleBackgroundProps> = ({ onSuccess }) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const accessToken = useAppSelector((state) => state.auth.accessToken);

    const [updateLifestyle, { isLoading }] = useUpdateLifestyleMutation();
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [educationTags, setEducationTags] = useState<string[]>([]);
    const [educationInput, setEducationInput] = useState("");

    const [formData, setFormData] = useState({
        occupation: "",
        incomeRange: "",
        religion: "",
        disability: "NO",
        diet: "VEGETARIAN",
        smokingHabit: "NO",
        drinkingHabit: "NO",
        relationshipStatus: "SINGLE",
        maritalStatus: "NEVER_MARRIED",
    });

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (educationTags.length === 0 && !educationInput.trim()) {
            errors.education = "Provide at least one educational qualification.";
        }

        if (!formData.occupation.trim()) {
            errors.occupation = "Occupation is required.";
        } else if (formData.occupation.trim().length < 2) {
            errors.occupation = "Occupation must be at least 2 characters.";
        }

        if (!formData.incomeRange) {
            errors.incomeRange = "Income range is required.";
        }

        if (!formData.religion) {
            errors.religion = "Religious or philosophical belief is required.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddEducation = (qual: string) => {
        const trimmed = qual.trim();
        if (trimmed && !educationTags.includes(trimmed)) {
            setEducationTags([...educationTags, trimmed]);
        }
        setEducationInput("");
        if (fieldErrors.education) {
            setFieldErrors((prev) => ({ ...prev, education: "" }));
        }
    };

    const handleRemoveEducation = (tagToRemove: string) => {
        setEducationTags(educationTags.filter((t) => t !== tagToRemove));
    };

    const handleEducationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (educationInput.trim()) {
                handleAddEducation(educationInput);
            }
        } else if (e.key === "Backspace" && !educationInput && educationTags.length > 0) {
            handleRemoveEducation(educationTags[educationTags.length - 1]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        try {
            const finalEducation = [...educationTags];
            if (educationInput.trim() && !finalEducation.includes(educationInput.trim())) {
                finalEducation.push(educationInput.trim());
            }

            const payload = {
                ...formData,
                education: finalEducation,
                incomeRange: [formData.incomeRange],
            };

            await updateLifestyle(payload).unwrap();

            if (user && accessToken) {
                dispatch(
                    setCredentials({
                        accessToken,
                        user: { ...user, onboardingStep: 4 },
                    })
                );
            }

            onSuccess();
        } catch (err: any) {
            setError(err?.data?.message || "Failed to save lifestyle and background details.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Lifestyle & Background</h1>
                <p className={styles.subtitle}>Help us understand your day-to-day rhythm, background, and life values.</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Career & Education</h3>
                    <div className={styles.grid}>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Education / Degrees *</label>
                            <div className={styles.tagContainer}>
                                {educationTags.map((tag) => (
                                    <span key={tag} className={styles.tagChip}>
                                        {tag}
                                        <button
                                            type="button"
                                            className={styles.tagRemoveBtn}
                                            onClick={() => handleRemoveEducation(tag)}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    className={styles.tagInput}
                                    value={educationInput}
                                    onChange={(e) => setEducationInput(e.target.value)}
                                    onKeyDown={handleEducationKeyDown}
                                    placeholder={
                                        educationTags.length === 0
                                            ? "Type degree & press Enter (or select below)"
                                            : ""
                                    }
                                    list="education-defaults"
                                />
                                <datalist id="education-defaults">
                                    {EDUCATION_LEVELS.map((lvl) => (
                                        <option key={lvl} value={lvl} />
                                    ))}
                                </datalist>
                            </div>
                            {fieldErrors.education && (
                                <span className={styles.fieldError}>{fieldErrors.education}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Occupation / Field *</label>
                            <input
                                required
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="e.g. Software Engineer, Architect"
                            />
                            {fieldErrors.occupation && (
                                <span className={styles.fieldError}>{fieldErrors.occupation}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Income Range (Annual) *</label>
                            <select
                                required
                                name="incomeRange"
                                value={formData.incomeRange}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Select Annual Income</option>
                                {INCOME_RANGES.map((inc) => (
                                    <option key={inc} value={inc}>
                                        {inc}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.incomeRange && (
                                <span className={styles.fieldError}>{fieldErrors.incomeRange}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Values & Accessibility</h3>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Religion / Worldview *</label>
                            <select
                                required
                                name="religion"
                                value={formData.religion}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Select Belief System</option>
                                {RELIGION_OPTIONS.map((rel) => (
                                    <option key={rel} value={rel}>
                                        {rel}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.religion && (
                                <span className={styles.fieldError}>{fieldErrors.religion}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Disability Option *</label>
                            <select
                                required
                                name="disability"
                                value={formData.disability}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {DISABILITY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Daily Habits</h3>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Dietary Preference *</label>
                            <select
                                required
                                name="diet"
                                value={formData.diet}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {DIET_OPTIONS.map((d) => (
                                    <option key={d.value} value={d.value}>
                                        {d.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Smoking Habit *</label>
                            <select
                                required
                                name="smokingHabit"
                                value={formData.smokingHabit}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {SMOKING_HABITS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Drinking Habit *</label>
                            <select
                                required
                                name="drinkingHabit"
                                value={formData.drinkingHabit}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {DRINKING_HABITS.map((dh) => (
                                    <option key={dh.value} value={dh.value}>
                                        {dh.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Relationship Context</h3>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Relationship Status *</label>
                            <select
                                required
                                name="relationshipStatus"
                                value={formData.relationshipStatus}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {RELATIONSHIP_STATUS_OPTIONS.map((rs) => (
                                    <option key={rs.value} value={rs.value}>
                                        {rs.label}
                                    </option>
                                ))}
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
                                {MARITAL_STATUS_OPTIONS.map((ms) => (
                                    <option key={ms.value} value={ms.value}>
                                        {ms.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                        {isLoading ? "Saving Background..." : "Save & Continue →"}
                    </button>
                </div>
            </form>
        </div>
    );
};