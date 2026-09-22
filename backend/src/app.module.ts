import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { SharedModule } from "./shared.module";
import { UserModule } from "./modules/users/users.module";
import { AdminModule } from "./modules/admin/admin.module";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CastingDirectorModule } from "./modules/casting-director/casting-director.module";

@Module({
    imports: [
        // Load environment variables
        ConfigModule.forRoot({ isGlobal: true }),

        // Global MongoDB connection
        MongooseModule.forRoot(
            process.env.MONGO_URI || 'mongodb://localhost:27017/merge_db',
        ),

        EventEmitterModule.forRoot(),

        // Application modules
        SharedModule,
        UserModule,
        AdminModule,
        CastingDirectorModule,
    ]
})

export class AppModule { }