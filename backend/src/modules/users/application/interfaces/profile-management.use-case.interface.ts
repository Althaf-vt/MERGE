import { SetPrimaryPhotoDto, UpdateMedicalRecordDto, UpdatePrivacySettingsDto } from "../dtos/profile-management.dto";

export const UPDATE_MEDICAL_RECORD_USE_CASE = 'UPDATE_MEDICAL_RECORD_USE_CASE';
export const UPDATE_PRIVACY_SETTINGS_USE_CASE = 'UPDATE_PRIVACY_SETTINGS_USE_CASE';
export const UPLOAD_PROFILE_PHOTO_USE_CASE = 'UPLOAD_PROFILE_PHOTO_USE_CASE';
export const SET_PRIMARY_PHOTO_USE_CASE = 'SET_PRIMARY_PHOTO_USE_CASE';
export const REMOVE_PROFILE_PHOTO_USE_CASE = 'REMOVE_PROFILE_PHOTO_USE_CASE';

export interface IUpdateMedicalRecordUseCase {
    execute(userId: string, dto: UpdateMedicalRecordDto): Promise<void>;
}

export interface IUpdatePrivacySettingsUseCase {
    execute(userId: string, dto: UpdatePrivacySettingsDto): Promise<void>;
}

export interface IUploadProfilePhotoUseCase {
    execute(userId: string, fileBuffer: Buffer, mimeType: string): Promise<void>;
}

export interface ISetPrimaryPhotoUseCase {
    execute(userId: string, dto: SetPrimaryPhotoDto): Promise<void>;
}

export interface IRemoveProfilePhotoUseCase {
    execute(userId: string, photoId: string): Promise<void>;
}