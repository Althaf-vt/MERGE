import React, { useState } from 'react';
import styles from './kyc-comparison.module.css';

interface KycComparisonProps {
    kycSelfieUrl: string;
    uploadedDocumentUrl: string;
    faceMatchScore: number;
    livenessScore: number;
    documentType: string;
    issuingCountry: string;
}

export const KycComparison: React.FC<KycComparisonProps> = ({
    kycSelfieUrl,
    uploadedDocumentUrl,
    faceMatchScore,
    livenessScore,
    documentType,
    issuingCountry,
}) => {
    const [enlargedImage, setEnlargedImage] = useState<{ src: string; title: string } | null>(null);

    // Determine biometric visual indicators based on distance and confidence thresholds
    const isStrictMatch = faceMatchScore <= 20.0 || faceMatchScore >= 80.0;
    const isMarginal = (faceMatchScore > 20.0 && faceMatchScore <= 35.0) || (faceMatchScore >= 60.0 && faceMatchScore < 80.0);

    let matchScoreClass = styles.scoreDanger;
    let matchBadgeClass = styles.badgeDanger;
    let matchBadgeText = 'HIGH VARIANCE';

    if (isStrictMatch) {
        matchScoreClass = styles.scoreGood;
        matchBadgeClass = styles.badgeGood;
        matchBadgeText = 'STRONG MATCH';
    } else if (isMarginal) {
        matchScoreClass = styles.scoreWarning;
        matchBadgeClass = styles.badgeWarning;
        matchBadgeText = 'MARGINAL';
    }

    const isLivenessPass = livenessScore >= 0.70 || livenessScore >= 70;
    const livenessScoreClass = isLivenessPass ? styles.scoreGood : styles.scoreDanger;
    const livenessBadgeClass = isLivenessPass ? styles.badgeGood : styles.badgeDanger;
    const livenessBadgeText = isLivenessPass ? 'LIVENESS PASS' : 'LIVENESS FAIL';

    return (
        <div className={styles.comparisonContainer}>
            {/* Metadata Strip */}
            <div className={styles.metaStrip}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>DOCUMENT TYPE:</span>
                    <span className={styles.metaValue}>{documentType ? documentType.replace(/_/g, ' ') : 'N/A'}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>ISSUING COUNTRY:</span>
                    <span className={styles.metaValue}>{issuingCountry || 'N/A'}</span>
                </div>
            </div>

            {/* Images Comparison Grid */}
            <div className={styles.imagesWrapper}>
                <div className={styles.imageColumn}>
                    <div className={styles.columnHeader}>
                        <span className={styles.imageLabel}>LIVE SELFIE CAPTURE</span>
                        <span className={styles.zoomHint}>CLICK TO ZOOM</span>
                    </div>
                    <div 
                        className={styles.imageBox}
                        onClick={() => kycSelfieUrl && setEnlargedImage({ src: kycSelfieUrl, title: 'Live Selfie Capture' })}
                    >
                        {kycSelfieUrl ? (
                            <img src={kycSelfieUrl} alt="Live Selfie" className={styles.photo} />
                        ) : (
                            <span className={styles.missingLabel}>NO SELFIE RECORDED</span>
                        )}
                    </div>
                </div>

                <div className={styles.imageColumn}>
                    <div className={styles.columnHeader}>
                        <span className={styles.imageLabel}>GOVERNMENT ID DOCUMENT</span>
                        <span className={styles.zoomHint}>CLICK TO ZOOM</span>
                    </div>
                    <div 
                        className={styles.imageBox}
                        onClick={() => uploadedDocumentUrl && setEnlargedImage({ src: uploadedDocumentUrl, title: `${documentType || 'ID'} Document` })}
                    >
                        {uploadedDocumentUrl ? (
                            <img src={uploadedDocumentUrl} alt="Government Document" className={styles.photo} />
                        ) : (
                            <span className={styles.missingLabel}>NO DOCUMENT RECORDED</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Biometric Scores Grid */}
            <div className={styles.scoresGrid}>
                <div className={styles.scoreBanner}>
                    <div className={styles.scoreInfo}>
                        <span className={styles.scoreLabel}>FACE MATCH SCORE</span>
                        <span className={`${styles.scoreBadge} ${matchBadgeClass}`}>{matchBadgeText}</span>
                    </div>
                    <span className={`${styles.scoreValue} ${matchScoreClass}`}>
                        {typeof faceMatchScore === 'number' ? faceMatchScore.toFixed(2) : faceMatchScore}
                    </span>
                </div>

                <div className={styles.scoreBanner}>
                    <div className={styles.scoreInfo}>
                        <span className={styles.scoreLabel}>LIVENESS VERIFICATION</span>
                        <span className={`${styles.scoreBadge} ${livenessBadgeClass}`}>{livenessBadgeText}</span>
                    </div>
                    <span className={`${styles.scoreValue} ${livenessScoreClass}`}>
                        {typeof livenessScore === 'number' 
                            ? (livenessScore <= 1 ? `${(livenessScore * 100).toFixed(1)}%` : `${livenessScore.toFixed(1)}%`)
                            : livenessScore}
                    </span>
                </div>
            </div>

            {/* Lightbox / Zoom Modal */}
            {enlargedImage && (
                <div className={styles.lightboxOverlay} onClick={() => setEnlargedImage(null)}>
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.lightboxHeader}>
                            <span className={styles.lightboxTitle}>{enlargedImage.title}</span>
                            <button className={styles.lightboxClose} onClick={() => setEnlargedImage(null)}>
                                &times;
                            </button>
                        </div>
                        <div className={styles.lightboxBody}>
                            <img src={enlargedImage.src} alt={enlargedImage.title} className={styles.lightboxImg} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

