import React from 'react';
import styles from './photo-comparison.module.css';

interface PhotoComparisonProps {
    kycSelfieUrl: string;
    uploadedPhotoUrl: string;
    faceMatchScore: number;
}

export const PhotoComparison: React.FC<PhotoComparisonProps> = ({
    kycSelfieUrl,
    uploadedPhotoUrl,
    faceMatchScore
}) => {
    // Determine strict visual indicators based on the backend distance thresholds
    const isStrictMatch = faceMatchScore <= 20.0;
    const isMarginal = faceMatchScore > 20.0 && faceMatchScore <= 35.0;

    let scoreClass = styles.scoreDanger;
    let badgeClass = styles.badgeDanger;
    let badgeText = 'High Variance';

    if (isStrictMatch) {
        scoreClass = styles.scoreGood;
        badgeClass = styles.badgeGood;
        badgeText = 'Strong Match';
    } else if (isMarginal) {
        scoreClass = styles.scoreWarning;
        badgeClass = styles.badgeWarning;
        badgeText = 'Marginal';
    }

    return (
        <div className={styles.comparisonContainer}>
            <div className={styles.imagesWrapper}>
                <div className={styles.imageColumn}>
                    <span className={styles.imageLabel}>KYC Golden Baseline</span>
                    <div className={styles.imageBox}>
                        {kycSelfieUrl ? (
                            <img src={kycSelfieUrl} alt="KYC Baseline" className={styles.photo} />
                        ) : (
                            <span className={styles.imageLabel}>Missing</span>
                        )}
                    </div>
                </div>
                <div className={styles.imageColumn}>
                    <span className={styles.imageLabel}>Uploaded Profile Photo</span>
                    <div className={styles.imageBox}>
                        {uploadedPhotoUrl ? (
                            <img src={uploadedPhotoUrl} alt="Pending Upload" className={styles.photo} />
                        ) : (
                            <span className={styles.imageLabel}>Missing</span>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.scoreBanner}>
                <span className={styles.scoreLabel}>Biometric Euclidean Distance (L2 Norm)</span>
                <div className={styles.scoreValueWrap}>
                    <span className={`${styles.scoreValue} ${scoreClass}`}>
                        {faceMatchScore.toFixed(2)}
                    </span>
                    <span className={`${styles.scoreBadge} ${badgeClass}`}>
                        {badgeText}
                    </span>
                </div>
            </div>
        </div>
    );
};