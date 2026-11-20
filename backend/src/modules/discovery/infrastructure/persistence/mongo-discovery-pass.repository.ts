import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IDiscoveryPassRepository } from "../../domain/interfaces/discovery-pass-repository.interface";
import { DiscoveryPass } from "../../domain/entities/discovery-pass.entity";
import { DiscoveryPassDocument, DiscoveryPassSchemaClass } from "./discovery-pass.schema";
import { DiscoveryPersistenceMapper } from "./mappers/discovery-persistence.mapper";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";

@Injectable()
export class DiscoveryPassRepository implements IDiscoveryPassRepository {
    constructor(
        @InjectModel(DiscoveryPassSchemaClass.name)
        private readonly _passModel: Model<DiscoveryPassDocument>,
    ) {}

    async recordPass(pass: DiscoveryPass): Promise<void> {
        const data = DiscoveryPersistenceMapper.toPersistencePass(pass);
        await this._passModel.updateOne(
            { userId: data.userId, targetUserId: data.targetUserId },
            { $set: data },
            { upsert: true }
        ).exec();
    }

    async getPassedUserIds(userId: string): Promise<string[]> {
        const cutoffDate = new Date(Date.now() - EnvConfig.discovery.passTtlSeconds * 1000);
        const docs = await this._passModel.find(
            {
                userId,
                createdAt: { $gte: cutoffDate },
            },
            { targetUserId: 1 }
        ).lean().exec();

        return docs
            .map(d => (d as { targetUserId?: string }).targetUserId)
            .filter((id): id is string => Boolean(id));
    }
}
