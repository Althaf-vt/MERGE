import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IRemoveProfilePhotoUseCase } from "../interfaces/profile-management.use-case.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class RemoveProfilePhotoUseCase implements IRemoveProfilePhotoUseCase {
    constructor(@Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository) {}

    async execute(userId: string, photoId: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        // Note: Actual S3 deletion can be handled asynchronously via Domain Events in the future
        // For now, we simply sever the relationship in the domain aggregate
        user.removePhoto(photoId);

        await this._userRepository.update(user);
    }
}