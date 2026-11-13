import { Inject, Injectable, Optional } from "@nestjs/common";
import { IUserContextFacade } from "../../application/interfaces/user-context-facade.interface";
import { SceneSimulationContext } from "../../domain/interfaces/scene-partner-ai.interface";
import { Scenario } from "../../domain/entities/scenario.entity";
import { SimulationType } from "../../domain/enums/scene-partner.enums";
import { IPublicProfileFacade, PUBLIC_PROFILE_FACADE } from "../../../users/application/interfaces/public-profile-facade.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";

@Injectable()
export class UserContextAdapter implements IUserContextFacade {
    constructor(
        @Optional()
        @Inject(PUBLIC_PROFILE_FACADE) private readonly _publicProfileFacade?: IPublicProfileFacade,
    ) { }

    async buildSimulationContext(userId: string, scenario: Scenario, simulationType: SimulationType, targetUserId?: string | null): Promise<SceneSimulationContext> {
        let userDisplayName = "User";
        let userRelationshipGoals: string | undefined;
        let userSelectedTraits: string[] | undefined;

        if (this._publicProfileFacade) {
            try {
                const userProfile = await this._publicProfileFacade.getPublicProfile(userId);
                if (userProfile) {
                    userDisplayName = userProfile.displayName;
                    userRelationshipGoals = userProfile.relationshipGoal ?? undefined;
                    userSelectedTraits = userProfile.selectedTraits;
                }
            } catch {
                // Graceful fallback to default values if profile lookup encounters an issue
            }
        }

        let partnerProfile: SceneSimulationContext["partnerProfile"] = undefined;

        if (simulationType === SimulationType.MATCH_BASED) {
            if (!targetUserId) {
                throw new DomainException(
                    ErrorCode.VALIDATION_FAILED,
                    SCENE_PARTNER_ERROR_MESSAGES.TARGET_USER_REQUIRED_FOR_MATCH,
                );
            }

            if (!this._publicProfileFacade) {
                throw new DomainException(
                    ErrorCode.USER_NOT_FOUND,
                    SCENE_PARTNER_ERROR_MESSAGES.TARGET_PROFILE_UNAVAILABLE,
                );
            }

            const targetProfile = await this._publicProfileFacade.getPublicProfile(targetUserId);
            if (!targetProfile || !targetProfile.isInteractable) {
                throw new DomainException(
                    ErrorCode.USER_NOT_FOUND,
                    SCENE_PARTNER_ERROR_MESSAGES.TARGET_PROFILE_UNAVAILABLE,
                );
            }

            partnerProfile = {
                displayName: targetProfile.displayName,
                bio: targetProfile.bio ?? undefined,
                selectedTraits: targetProfile.selectedTraits,
                relationshipGoals: targetProfile.relationshipGoal ?? undefined,
                personalitySummary: targetProfile.bio || targetProfile.selectedTraits.join(", "),
            };
        }

        return {
            scenarioTitle: scenario.title,
            scenarioCategory: scenario.category,
            scenarioPrompt: scenario.promptContext,
            simulationType,
            userProfile: {
                displayName: userDisplayName,
                relationshipGoals: userRelationshipGoals,
                selectedTraits: userSelectedTraits,
            },
            partnerProfile,
        };
    }
}

