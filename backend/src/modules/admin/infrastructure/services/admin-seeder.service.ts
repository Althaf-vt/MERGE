import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { IPasswordHasher, PASSWORD_HASHER } from "../../../../shared/domain/interfaces/password-hasher.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { AdminRole, AdminStatus } from "../../domain/enums/admin.enums";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";

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

            // Retrieve required bootstrap credentials from environment configuration
            const rootEmail = EnvConfig.admin.seederEmail;
            const rootPassword = EnvConfig.admin.seederPassword;
            const rootName = EnvConfig.admin.seederName;

            if (!rootEmail || !rootPassword) {
                this._logger.warn(
                    "INIT_SUPER_ADMIN_EMAIL or INIT_SUPER_ADMIN_PASSWORD not set in environment. Skipping Super Admin seeding."
                );
                return;
            }

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
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this._logger.error(`Failed to seed Super Admin account on bootstrap: ${errorMessage}`, errorStack);
        }
    }
}