import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "./infrastructure/persistence/admin.schema";
import { JwtModule } from "@nestjs/jwt";
import { AdminSeederService } from "./infrastructure/services/admin-seeder.service";
import { ADMIN_REPOSITORY } from "./domain/interfaces/admin-repository.interface";
import { MongoAdminRepository } from "./infrastructure/persistence/mongo-admin.repository";
import { UserModule } from "../users/users.module";
import { AdminAuthController } from "./presentation/controllers/admin-auth.controller";
import { AdminLoginUseCase } from "./application/use-cases/admin-login.use-case";
import { ADMIN_LOGIN_USE_CASE } from "./application/interfaces/admin-login.use-case.interface";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),

        JwtModule.register({
            secret: process.env.JWT_SECRET || 'super-secret-fallback',
        }),
        UserModule,
    ],

    controllers: [
        AdminAuthController,
    ],

    providers: [
        AdminSeederService,


        AdminLoginUseCase,

        {
            provide: ADMIN_REPOSITORY,
            useClass: MongoAdminRepository,
        },
        {
            provide: ADMIN_LOGIN_USE_CASE,
            useClass: AdminLoginUseCase,
        }
    ],
    exports: [
        ADMIN_REPOSITORY,
    ],

})
export class AdminModule { }