export const SCENE_PARTNER_SUBSCRIPTION_FACADE = "SCENE_PARTNER_SUBSCRIPTION_FACADE";

export interface IScenePartnerSubscriptionFacade {
    // Determines whether a user is entitled to start a new rehearsal scene session.
    canStartSession(userId: string): Promise<boolean>;
}

