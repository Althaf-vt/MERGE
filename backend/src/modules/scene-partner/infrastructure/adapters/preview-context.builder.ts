import { Injectable } from "@nestjs/common";
import { ScenarioCategory, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";
import { SceneSimulationContext } from "../../domain/interfaces/scene-partner-ai.interface";
import { BuildPreviewContextParams, IPreviewContextBuilder } from "../../application/interfaces/scene-partner-preview.use-cases.interface";

@Injectable()
export class PreviewContextBuilder implements IPreviewContextBuilder {
    public build(params: BuildPreviewContextParams): SceneSimulationContext {
        return {
            scenarioTitle: params.scenarioTitle,
            scenarioCategory: params.scenarioCategory ?? ScenarioCategory.FIRST_MESSAGE,
            scenarioPrompt: params.promptContext,
            simulationType: SimulationType.GENERIC,
            userProfile: {
                displayName: params.adminName || "Admin Previewer",
                relationshipGoals: "Live Preview Simulation",
                selectedTraits: ["Observant", "Conversational"],
            },
            partnerProfile: {
                displayName: "Simulated Partner",
                bio: "Interactive simulation partner for scenario testing.",
                relationshipGoals: "Meaningful Connection",
                selectedTraits: ["Engaging", "Attentive", "Expressive"],
                personalitySummary: "Friendly, responsive dating simulation partner designed to test scenario conversational dynamics.",
            },
        };
    }
}
