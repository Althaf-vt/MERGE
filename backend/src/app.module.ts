import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { SharedModule } from "./shared.module";
import { UserModule } from "./modules/users/users.module";


@Module({
    imports: [
        // Load environment variables
        ConfigModule.forRoot({isGlobal: true}),

        // Global MongoDB connection
        MongooseModule.forRoot(
            process.env.MONGO_URI || 'mongodb://localhost:27017/merge_db',
        ),

        // Application modules
        SharedModule,
        UserModule
    ]
})

export class AppModule{}