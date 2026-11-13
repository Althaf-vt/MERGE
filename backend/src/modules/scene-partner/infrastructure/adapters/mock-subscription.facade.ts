import { Injectable } from "@nestjs/common";
import { IScenePartnerSubscriptionFacade } from "../../application/interfaces/scene-partner-subscription-facade.interface";

@Injectable()
export class MockSubscriptionFacade implements IScenePartnerSubscriptionFacade {
    // Day 4 development stub: all authenticated users are entitled to rehearse scene partner simulations.
    // Swapped with the real billing/subscription module in Day 5 via DI token provider.
    async canStartSession(_userId: string): Promise<boolean> {
        return true;
    }
}

