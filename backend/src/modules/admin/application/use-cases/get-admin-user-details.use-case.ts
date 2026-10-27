import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminUserDetailsUseCase } from "../interfaces/get-admin-user-details.use-case.interface";
import { FacadeUserDto, IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class GetAdminUserDetailsUseCase implements IGetAdminUserDetailsUseCase {
    constructor(
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
    ) { }

    async execute(userId: string): Promise<FacadeUserDto> {
        const user = await this._userFacade.getUserById(userId);
        if (!user) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');
        }
        return user;
    }
}