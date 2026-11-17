import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Scenario } from "../../domain/entities/scenario.entity";
import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";
import { AdminScenariosFilter, IScenarioRepository, PaginatedAdminScenariosResult } from "../../domain/interfaces/scenario-repository.interface";
import { ScenarioDocument, ScenarioSchemaClass } from "./scenario.schema";
import { ScenarioPersistenceMapper } from "./mappers/scenario-persistence.mapper";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";

@Injectable()
export class MongoScenarioRepository implements IScenarioRepository {
    constructor(
        @InjectModel(ScenarioSchemaClass.name)
        private readonly _model: Model<ScenarioDocument>,
    ) { }

    async findById(id: string): Promise<Scenario | null> {
        const document = await this._model.findById(id).exec();
        if (!document) return null;
        return ScenarioPersistenceMapper.toDomain(document);
    }

    async findActive(category?: ScenarioCategory): Promise<Scenario[]> {
        const query: Record<string, unknown> = {
            isActive: true,
            isCustom: false,
        };
        if (category) {
            query.category = category;
        }

        const documents = await this._model
            .find(query)
            .sort({ createdAt: 1 })
            .exec();

        return documents.map((doc) => ScenarioPersistenceMapper.toDomain(doc));
    }

    async findAllAdmin(filter: AdminScenariosFilter): Promise<PaginatedAdminScenariosResult> {
        const query: Record<string, unknown> = {
            isCustom: false,
        };

        if (filter.category) {
            query.category = filter.category;
        }

        if (filter.isActive !== undefined) {
            query.isActive = filter.isActive;
        }

        if (filter.search && filter.search.trim().length > 0) {
            const searchRegex = new RegExp(filter.search.trim(), "i");
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
            ];
        }

        const safeLimit = Math.max(1, filter.limit ?? 20);
        const safeSkip = Math.max(0, filter.skip ?? 0);

        const [documents, total] = await Promise.all([
            this._model
                .find(query)
                .sort({ createdAt: -1 })
                .skip(safeSkip)
                .limit(safeLimit)
                .exec(),
            this._model.countDocuments(query).exec(),
        ]);

        return {
            data: documents.map((doc) => ScenarioPersistenceMapper.toDomain(doc)),
            total,
        };
    }

    async findForExport(filter?: { category?: ScenarioCategory; isActive?: boolean }): Promise<Scenario[]> {
        const query: Record<string, unknown> = {
            isCustom: false,
        };

        if (filter?.category) {
            query.category = filter.category;
        }

        if (filter?.isActive !== undefined) {
            query.isActive = filter.isActive;
        }

        const documents = await this._model
            .find(query)
            .sort({ category: 1, title: 1 })
            .exec();

        return documents.map((doc) => ScenarioPersistenceMapper.toDomain(doc));
    }

    async create(scenario: Scenario): Promise<Scenario> {
        const persistenceData = ScenarioPersistenceMapper.toPersistence(scenario);
        const created = new this._model(persistenceData);
        const saved = await created.save();
        return ScenarioPersistenceMapper.toDomain(saved);
    }

    async update(scenario: Scenario): Promise<Scenario> {
        const persistenceData = ScenarioPersistenceMapper.toPersistence(scenario);
        const updated = await this._model
            .findByIdAndUpdate(scenario.id, persistenceData, { returnDocument: 'after' })
            .exec();

        if (!updated) {
            throw new DomainException(
                ErrorCode.USER_NOT_FOUND,
                SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_NOT_FOUND,
            );
        }

        return ScenarioPersistenceMapper.toDomain(updated);
    }

    async count(): Promise<number> {
        return this._model.countDocuments().exec();
    }
}
