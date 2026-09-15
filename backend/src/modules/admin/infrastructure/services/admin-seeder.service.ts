import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { IPasswordHasher, PASSWORD_HASHER } from "../../../../shared/interfaces/password-hasher.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { AdminRole, AdminStatus } from "../../domain/enums/admin.enums";
import { EmailVO } from "../../../users/domain/value-objects/email.vo";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
    private readonly _logger = new Logger(AdminSeederService.name);

    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
    ) { }

    async onApplicationBootstrap() {
        try {
            // Check if any SUPER_ADMIN already exists
            const superAdminExists = await this._adminRepository.existsByRole(AdminRole.SUPER_ADMIN);

            if (superAdminExists) {
                this._logger.log("Super Admin already exists. Bypassing seeder");
                return;
            }

            // Fallback credentials if missing from env (only safe during local dev)
            const rootEmail = process.env.INIT_SUPER_ADMIN_EMAIL || 'admin@merge.com';
            const rootPassword = process.env.INIT_SUPER_ADMIN_PASSWORD || 'SuperSecret@123';
            const rootName = process.env.INIT_SUPER_ADMIN_NAME || 'MERGE System Admin';

            const passwordHash = await this._passwordHasher.hash(rootPassword);
            const emailVo = new EmailVO(rootEmail);

            const superAdmin = new AdminAggregate({
                email: emailVo,
                passwordHash,
                fullName: rootName,
                role: AdminRole.SUPER_ADMIN,
                status: AdminStatus.ACTIVE,
                permissions: Object.values(AdminPermission), // Grands all enumerated capabilities
            });

            await this._adminRepository.create(superAdmin);
            this._logger.log(`Initialized primary Super Admin account: ${rootEmail}`);
        } catch (error: any) {
            this._logger.error('Failed to seed Super Admin account on bootstrap.', error);
        }
    }
}