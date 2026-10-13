import { UserAggregate } from "../../domain/entities/user.entity";
import { FacadeUserDto, FacadeUserStatus } from "../interfaces/user-management-facade.interface";

export class UserFacadeMapper {
    public static toDto(user: UserAggregate): FacadeUserDto {
        return {
            id: user.id as string,
            email: user.email.getValue(),
            accountStatus: user.accountStatus as FacadeUserStatus,
            kycCompleted: user.kycCompleted,
            suspendedUntil: user.suspendedUntil ?? null,
            statusReason: user.statusReason ?? null,
            createdAt: user.createdAt as Date,
        };
    }
}