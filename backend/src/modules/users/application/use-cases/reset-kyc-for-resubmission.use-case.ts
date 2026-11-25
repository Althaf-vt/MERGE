import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IResetKycForResubmissionUseCase } from "../interfaces/reset-kyc-for-resubmission.use-case.interface";
import { UserResponseDto } from "../dtos/user-response.dto";
import { UserResponseMapper } from "../mappers/user-response.mapper";

@Injectable()
export class ResetKycForResubmissionUseCase implements IResetKycForResubmissionUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(userId: string): Promise<UserResponseDto> {
        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_FOUND);
        }

        user.resetKycForResubmission();

        await this._userRepository.update(user);

        return UserResponseMapper.toResponse(user);
    }
}
