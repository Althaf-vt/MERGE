import { Inject, Injectable } from '@nestjs/common';
import { IGetProfileUseCase } from '../interfaces/get-profile.use-case.interface';
import { IUserRepository, USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../interfaces/storage-service.interface';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';

@Injectable()
export class GetProfileUseCase implements IGetProfileUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(STORAGE_SERVICE) private readonly _storageService: IStorageService,
    ) {}

    async execute(userId: string): Promise<any> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');
        }

        const photosWithSignedUrls = await Promise.all(
            (user.photos || []).map(async (photo) => {
                const signedUrl = await this._storageService.getPresignedUrl(photo.url, 900);
                return {
                    ...photo.toJSON(),
                    url: signedUrl
                };
            })
        );

        return {
            id: user.id,
            email: user.email.getValue(),
            profile: user.profile ? user.profile.toJSON() : null,
            photos: photosWithSignedUrls,
            privacySettings: user.privacySettings ? user.privacySettings.toJSON() : null,
            medicalRecord: user.medicalRecord ? user.medicalRecord.toJSON() : null,
            kycCompleted: user.kycCompleted,
            onboardingCompleted: user.onboardingCompleted,
        };
    }
}