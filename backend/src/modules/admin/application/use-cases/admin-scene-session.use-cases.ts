import { Inject, Injectable } from "@nestjs/common";
import {
    AdminPreviewSessionFacadeDto,
    AdminSessionDetailFacadeDto,
    AdminStartPreviewSessionParams,
    IScenePartnerAdminFacade,
    PaginatedAdminSessionsFacadeResult,
    SCENE_PARTNER_ADMIN_FACADE,
    ScenePartnerAnalyticsFacadeDto,
} from "../../../scene-partner/application/interfaces/scene-partner-admin-facade.interface";
import {
    AdminGetSessionsQueryDto,
    AdminSendPreviewTurnDto,
    AdminUpdatePreviewCoachingDto,
} from "../dtos/admin-scene-partner.dto";
import {
    IAdminGetSceneAnalyticsUseCase,
    IAdminGetSceneSessionDetailsUseCase,
    IAdminGetSceneSessionsUseCase,
    IAdminSendPreviewTurnUseCase,
    IAdminStartPreviewSessionUseCase,
    IAdminUpdatePreviewCoachingUseCase,
} from "../interfaces/admin-scene-partner.use-cases.interface";

@Injectable()
export class AdminGetSceneAnalyticsUseCase implements IAdminGetSceneAnalyticsUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(): Promise<ScenePartnerAnalyticsFacadeDto> {
        return this._scenePartnerAdminFacade.getAnalytics();
    }
}

@Injectable()
export class AdminGetSceneSessionsUseCase implements IAdminGetSceneSessionsUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(query: AdminGetSessionsQueryDto): Promise<PaginatedAdminSessionsFacadeResult> {
        return this._scenePartnerAdminFacade.getSessions(query);
    }
}

@Injectable()
export class AdminGetSceneSessionDetailsUseCase implements IAdminGetSceneSessionDetailsUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(id: string): Promise<AdminSessionDetailFacadeDto> {
        return this._scenePartnerAdminFacade.getSessionDetails(id);
    }
}

@Injectable()
export class AdminStartPreviewSessionUseCase implements IAdminStartPreviewSessionUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(adminId: string, params: AdminStartPreviewSessionParams): Promise<AdminPreviewSessionFacadeDto> {
        return this._scenePartnerAdminFacade.startPreviewSession(adminId, params);
    }
}

@Injectable()
export class AdminSendPreviewTurnUseCase implements IAdminSendPreviewTurnUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(adminId: string, sessionId: string, dto: AdminSendPreviewTurnDto): Promise<AdminPreviewSessionFacadeDto> {
        return this._scenePartnerAdminFacade.sendPreviewTurn(adminId, sessionId, dto);
    }
}

@Injectable()
export class AdminUpdatePreviewCoachingUseCase implements IAdminUpdatePreviewCoachingUseCase {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
    ) { }

    async execute(adminId: string, sessionId: string, dto: AdminUpdatePreviewCoachingDto): Promise<AdminPreviewSessionFacadeDto> {
        return this._scenePartnerAdminFacade.updatePreviewCoachingMode(adminId, sessionId, dto);
    }
}
