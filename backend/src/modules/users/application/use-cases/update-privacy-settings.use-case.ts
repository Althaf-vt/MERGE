import { Inject, Injectable } from '@nestjs/common';
import { IUpdatePrivacySettingsUseCase } from '../interfaces/profile-management.use-case.interface';
import { IUserRepository, USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface';
import { UpdatePrivacySettingsDto } from '../dtos/profile-management.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { UserPrivacy } from '../../domain/entities/user-privacy.entity';

@Injectable()
export class UpdatePrivacySettingsUseCase implements IUpdatePrivacySettingsUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) { }

    async execute(userId: string, dto: UpdatePrivacySettingsDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        const privacySettings = user.privacySettings || new UserPrivacy({
            showAge: true,
            showOccupation: true,
            blurPhotos: false,
            profileVisibility: 'VISIBLE'
        });

        privacySettings.updateSettings(dto);

        user.attachPrivacySettings(privacySettings);
        await this._userRepository.update(user);
    }
}