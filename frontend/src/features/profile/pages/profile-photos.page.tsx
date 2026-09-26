import React, { useRef, useState } from 'react';
import { useUploadProfilePhotoMutation, useRemoveProfilePhotoMutation, useSetPrimaryPhotoMutation, useUpdatePrivacySettingsMutation, useGetProfileQuery } from '../api/profile.api';
import styles from './profile-photos.module.css';

export const ProfilePhotosPage: React.FC = () => {
    // Fetch live profile data with dynamically signed presigned URLs from GET /profile
    const { data: profileResponse, refetch: refetchProfile } = useGetProfileQuery();

    // Extract photos and privacy from the query response instead of stale auth state
    const photos = profileResponse?.data?.photos || [];
    const privacy = profileResponse?.data?.privacySettings;

    const [uploadPhoto, { isLoading: isUploading }] = useUploadProfilePhotoMutation();
    const [removePhoto, { isLoading: isRemoving }] = useRemoveProfilePhotoMutation();
    const [setPrimaryPhoto, { isLoading: isSettingPrimary }] = useSetPrimaryPhotoMutation();
    const [updatePrivacy, { isLoading: isUpdatingPrivacy }] = useUpdatePrivacySettingsMutation();

    const [errorMsg, setErrorMsg] = useState('');
    const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxPhotos = 6;
    const showEmptySlot = photos.length < maxPhotos;

    // Calculate Verification Stats
    const stats = {
        approved: photos.filter(p => p.status === 'APPROVED').length,
        pending: photos.filter(p => p.status === 'PENDING').length,
        rejected: photos.filter(p => p.status === 'REJECTED').length,
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMsg('');
        try {
            await uploadPhoto(file).unwrap();
            await refetchProfile(); // Refresh signed URLs instantly
        } catch (err: any) {
            console.error('Failed to upload photo:', err);
            setErrorMsg(err?.data?.error?.message || 'Failed to upload photo. Ensure your face is clearly visible.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmRemove = async () => {
        if (!photoToDelete) return;
        setErrorMsg('');
        try {
            await removePhoto(photoToDelete).unwrap();
            await refetchProfile();
            setPhotoToDelete(null);
        } catch (err: any) {
            setErrorMsg('Failed to remove photo.');
        }
    };

    const handleSetPrimary = async (photoId: string, status: string) => {
        if (status !== 'APPROVED') {
            setErrorMsg('Only approved photos can be set as primary.');
            return;
        }
        setErrorMsg('');
        try {
            await setPrimaryPhoto({ photoId }).unwrap();
            await refetchProfile();
        } catch (err: any) {
            setErrorMsg('Failed to set primary photo.');
        }
    };

    const handleTogglePrivacy = async (field: 'blurPhotos' | 'profileVisibility') => {
        if (!privacy) return;
        try {
            const payload = field === 'blurPhotos'
                ? { blurPhotos: !privacy.blurPhotos }
                : { profileVisibility: privacy.profileVisibility === 'VISIBLE' ? 'HIDDEN' as const : 'VISIBLE' as const };

            await updatePrivacy(payload).unwrap();
            await refetchProfile();
        } catch (err: any) {
            setErrorMsg('Failed to update privacy settings.');
        }
    };

    // Reusable SVG Icons
    const CheckIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
    const ClockIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    const XIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Photos</h1>
                <p className={styles.subtitle}>Manage your profile photos and verification status.</p>
            </header>

            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

            <div className={styles.contentGrid}>
                {/* Main Gallery Area */}
                <div className={styles.mainColumn}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Profile Gallery</h2>
                            <span className={styles.photoCount}>{photos.length}/{maxPhotos} Photos</span>
                        </div>
                        <p className={styles.cardDesc}>
                            The first approved photo automatically becomes your primary profile photo.
                        </p>

                        <div className={styles.galleryGrid}>
                            {/* Render Existing Photos with Presigned URLs */}
                            {photos.map((photo) => (
                                <div key={photo.id} className={`${styles.photoItem} ${photo.isPrimary ? styles.primaryItem : ''}`}>
                                    <img
                                        src={photo.url}
                                        alt="Profile"
                                        className={`${styles.image} ${photo.status !== 'APPROVED' ? styles.blurredImage : ''}`}
                                    />

                                    {/* Badges */}
                                    <div className={styles.badgeContainer}>
                                        {photo.isPrimary && <span className={`${styles.badge} ${styles.badgePrimary}`}>Primary</span>}
                                        {photo.status === 'APPROVED' && <span className={`${styles.badge} ${styles.badgeVerified}`}>{CheckIcon} Verified</span>}
                                        {photo.status === 'PENDING' && <span className={`${styles.badge} ${styles.badgePending}`}>{ClockIcon} Verifying</span>}
                                        {photo.status === 'REJECTED' && <span className={`${styles.badge} ${styles.badgeRejected}`}>{XIcon} Rejected</span>}
                                    </div>

                                    {/* Hover Action Overlay */}
                                    <div className={styles.actionOverlay}>
                                        {!photo.isPrimary && photo.status === 'APPROVED' && (
                                            <button
                                                className={styles.actionBtnPrimary}
                                                onClick={() => handleSetPrimary(photo.id, photo.status)}
                                                disabled={isSettingPrimary}
                                            >
                                                Make Primary
                                            </button>
                                        )}
                                        <button
                                            className={styles.actionBtnDelete}
                                            onClick={() => setPhotoToDelete(photo.id)}
                                            disabled={isRemoving}
                                        >
                                            {XIcon}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Render ONE Empty Slot if limit not reached */}
                            {showEmptySlot && (
                                <div className={styles.emptySlot} onClick={() => !isUploading && fileInputRef.current?.click()}>
                                    {isUploading ? (
                                        <div className={styles.spinner}></div>
                                    ) : (
                                        <>
                                            <span className={styles.addIcon}>+</span>
                                            <span className={styles.addText}>Upload Photo</span>
                                            <span className={styles.addLimits}>JPG, PNG, WEBP<br />Max 5MB</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Area */}
                <div className={styles.sideColumn}>
                    {/* Guidelines */}
                    <div className={styles.sideCard}>
                        <h3 className={styles.sideCardTitle}>Photo Guidelines</h3>
                        <ul className={styles.guidelineList}>
                            <li className={styles.valid}><span className={styles.iconWrapper}>{CheckIcon}</span> Clear, well-lit photos</li>
                            <li className={styles.valid}><span className={styles.iconWrapper}>{CheckIcon}</span> Face clearly visible</li>
                            <li className={styles.invalid}><span className={styles.iconWrapper}>{XIcon}</span> No heavy filters or sunglasses</li>
                            <li className={styles.invalid}><span className={styles.iconWrapper}>{XIcon}</span> No group photos</li>
                        </ul>
                        <p className={styles.sideCardNote}>
                            All photos undergo AI face-matching against your KYC baseline to ensure authenticity.
                        </p>
                    </div>

                    {/* Status Summary */}
                    <div className={styles.sideCard}>
                        <h3 className={styles.sideCardTitle}>Verification Status</h3>
                        <div className={styles.statusRow}>
                            <span className={styles.dotVerified}></span> Verified: <strong>{stats.approved}</strong>
                        </div>
                        <div className={styles.statusRow}>
                            <span className={styles.dotPending}></span> Under Review: <strong>{stats.pending}</strong>
                        </div>
                        <div className={styles.statusRow}>
                            <span className={styles.dotRejected}></span> Rejected: <strong>{stats.rejected}</strong>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className={styles.sideCard}>
                        <h3 className={styles.sideCardTitle}>Photo Privacy</h3>

                        <div className={styles.toggleRow}>
                            <div className={styles.toggleText}>
                                <strong>Blur Photos Until Match</strong>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={privacy?.blurPhotos || false}
                                    onChange={() => handleTogglePrivacy('blurPhotos')}
                                    disabled={isUpdatingPrivacy}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={styles.toggleRow}>
                            <div className={styles.toggleText}>
                                <strong>Allow Full Photo Visibility</strong>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={privacy?.profileVisibility === 'VISIBLE'}
                                    onChange={() => handleTogglePrivacy('profileVisibility')}
                                    disabled={isUpdatingPrivacy}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={styles.infoBox}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            Private photos can only be viewed by approved users.
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Custom Confirm Modal */}
            {photoToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <h3>Delete Photo?</h3>
                        <p>Are you sure you want to delete this photo? This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setPhotoToDelete(null)} className={styles.modalCancel}>Cancel</button>
                            <button onClick={confirmRemove} disabled={isRemoving} className={styles.modalConfirm}>
                                {isRemoving ? 'Deleting...' : 'Delete Photo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};