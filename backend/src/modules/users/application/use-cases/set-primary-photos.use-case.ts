import { Inject, Injectable } from '@nestjs/common';
import { IRemoveProfilePhotoUseCase, ISetPrimaryPhotoUseCase } from '../interfaces/profile-management.use-case.interface';
import { IUserRepository, USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface';
import { SetPrimaryPhotoDto } from '../dtos/profile-management.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';

@Injectable()
export class SetPrimaryPhotoUseCase implements ISetPrimaryPhotoUseCase {
    constructor(@Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository) {}

    async execute(userId: string, dto: SetPrimaryPhotoDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        // Delegates the validation and state manipulation strictly to the aggregate
        user.setPrimaryPhoto(dto.photoId);
        
        await this._userRepository.update(user);
    }
}

