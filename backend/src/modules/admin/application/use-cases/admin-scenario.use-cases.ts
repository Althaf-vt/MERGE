import { Inject, Injectable } from "@nestjs/common";
import {
    AdminScenarioExportItemFacadeDto,
    AdminScenarioFacadeDto,
    AdminScenarioInDepthFacadeDto,
    IScenePartnerAdminFacade,
    PaginatedAdminScenariosFacadeResult,
    SCENE_PARTNER_ADMIN_FACADE,
} from "../../../scene-partner/application/interfaces/scene-partner-admin-facade.interface";
import { ScenarioTimeframe } from "../../../../shared/domain/enums/scene-partner.enums";
import {
    AdminCreateScenarioDto,
    AdminExportScenariosQueryDto,
    AdminGetScenariosQueryDto,
    AdminToggleScenarioStatusDto,
    AdminUpdateScenarioDto,
} from "../dtos/admin-scene-partner.dto";
import {
    IAdminCreateScenarioUseCase,
    IAdminExportScenariosUseCase,
    IAdminGetScenarioByIdUseCase,
    IAdminGetScenarioInDepthUseCase,
    IAdminGetScenariosUseCase,
    IAdminToggleScenarioStatusUseCase,
    IAdminUpdateScenarioUseCase,
} from "../interfaces/admin-scene-partner.use-cases.interface";

@Injectable()
export class AdminCreateScenarioUseCase implements IAdminCreateScenarioUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(dto: AdminCreateScenarioDto): Promise<AdminScenarioFacadeDto> {
        return this._scenePartnerAdminFacade.createScenario(dto);
    }
}

@Injectable()
export class AdminGetScenariosUseCase implements IAdminGetScenariosUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(query: AdminGetScenariosQueryDto): Promise<PaginatedAdminScenariosFacadeResult> {
        return this._scenePartnerAdminFacade.getScenarios(query);
    }
}

@Injectable()
export class AdminGetScenarioByIdUseCase implements IAdminGetScenarioByIdUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(id: string): Promise<AdminScenarioFacadeDto> {
        return this._scenePartnerAdminFacade.getScenarioById(id);
    }
}

@Injectable()
export class AdminGetScenarioInDepthUseCase implements IAdminGetScenarioInDepthUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(id: string, timeframe?: ScenarioTimeframe): Promise<AdminScenarioInDepthFacadeDto> {
        return this._scenePartnerAdminFacade.getScenarioInDepth(id, timeframe);
    }
}

@Injectable()
export class AdminUpdateScenarioUseCase implements IAdminUpdateScenarioUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(id: string, dto: AdminUpdateScenarioDto): Promise<AdminScenarioFacadeDto> {
        return this._scenePartnerAdminFacade.updateScenario(id, dto);
    }
}

@Injectable()
export class AdminToggleScenarioStatusUseCase implements IAdminToggleScenarioStatusUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(id: string, dto: AdminToggleScenarioStatusDto): Promise<AdminScenarioFacadeDto> {
        return this._scenePartnerAdminFacade.toggleScenarioStatus(id, dto);
    }
}

@Injectable()
export class AdminExportScenariosUseCase implements IAdminExportScenariosUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(query: AdminExportScenariosQueryDto): Promise<AdminScenarioExportItemFacadeDto[]> {
        return this._scenePartnerAdminFacade.exportScenarios(query);
    }
}
