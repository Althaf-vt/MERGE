import { SceneSimulationContext } from "../../domain/interfaces/scene-partner-ai.interface";
import { Scenario } from "../../domain/entities/scenario.entity";
import { SimulationType } from "../../domain/enums/scene-partner.enums";

export const USER_CONTEXT_FACADE = "USER_CONTEXT_FACADE";

export interface IUserContextFacade {
    // Resolves the user profile and simulation partner context (AI Persona or real Match).
    buildSimulationContext(
        userId: string,
        scenario: Scenario,
        simulationType: SimulationType,
        targetUserId?: string | null,
    ): Promise<SceneSimulationContext>;
}

