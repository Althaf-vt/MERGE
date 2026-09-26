import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IUploadProfilePhotoUseCase } from '../interfaces/profile-management.use-case.interface';
import { IUserRepository, USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface';
import { BIOMETRIC_SERVICE, IBiometricService } from '../../domain/interfaces/biometric-service.interface';
import { IStorageService, STORAGE_SERVICE } from '../interfaces/storage-service.interface';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { UserPhoto } from '../../domain/entities/user-photo.entity';
import { PhotoVerificationStatus } from '../../domain/enums/profile.enums';

@Injectable()
export class UploadProfilePhotoUseCase implements IUploadProfilePhotoUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(BIOMETRIC_SERVICE) private readonly _biometricService: IBiometricService,
        @Inject(STORAGE_SERVICE) private readonly _s3Service: IStorageService,
    ) {}

    async execute(userId: string, fileBuffer: Buffer, mimeType: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        // 1. prevalidation to check the photo limit
        user.validatePhotoLimit();

        // 2. offload to ML worker
        const {faceEmbedding, confidence} = await this._biometricService.extractEmbedding(fileBuffer);

        // 3. Delegate ALL quality and matching validation to Domain
        const kyc = user.kycVerification;
        if(!kyc){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'KYC records are missing.');
        }

        const {score, status} = kyc.evaluateFaceMatch(faceEmbedding, confidence);

        // 4. Execute Infrastructure side effects
        const photoUrl = await this._s3Service.uploadSelfie(userId, fileBuffer, mimeType);

        // 5. Build and attach the resulting entity
        const isFirstphoto = user.photos.length === 0;
        
        const newPhoto = new UserPhoto({
            id: uuidv4(),
            url: photoUrl,
            status,
            faceMatchScore: score,
            isPrimary: isFirstphoto && status === PhotoVerificationStatus.APPROVED,
            uploadedAt: new Date(),
        });

        user.addPhoto(newPhoto);
        await this._userRepository.update(user);
    }
}