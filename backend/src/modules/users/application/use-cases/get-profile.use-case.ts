import { Inject, Injectable } from '@nestjs/common';
import { GetProfileDataResult, IGetProfileUseCase } from '../interfaces/get-profile.use-case.interface';
import { IUserRepository, USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../interfaces/storage-service.interface';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { UserResponseMapper } from '../mappers/user-response.mapper';

@Injectable()
export class GetProfileUseCase implements IGetProfileUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(STORAGE_SERVICE) private readonly _storageService: IStorageService,
    ) {}

    async execute(userId: string): Promise<GetProfileDataResult> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');
        }

        return UserResponseMapper.toProfileDataResult(user, this._storageService);
    }
}
