import { Inject, Injectable } from '@nestjs/common';
import { ISetPrimaryPhotoUseCase } from '../interfaces/profile-management.use-case.interface';
import { IUserRepository, USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface';
import { SetPrimaryPhotoDto } from '../dtos/profile-management.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { USER_ERROR_MESSAGES } from '../../domain/constants/user-error-messages.constant';

@Injectable()
export class SetPrimaryPhotoUseCase implements ISetPrimaryPhotoUseCase {
    constructor(@Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository) {}

    async execute(userId: string, dto: SetPrimaryPhotoDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_FOUND);

        // Delegates the validation and state manipulation strictly to the aggregate
        user.setPrimaryPhoto(dto.photoId);
        
        await this._userRepository.update(user);
    }
}

