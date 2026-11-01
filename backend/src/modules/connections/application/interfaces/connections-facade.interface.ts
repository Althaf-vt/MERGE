export const CONNECTIONS_FACADE = 'CONNECTIONS_FACADE';

export interface IConnectionsFacade {
    /**
     * Retrieves all user IDs the specified user has interacted with across:
     * - Connections (active, pending, declined, cancelled, revoked)
     * - Private lists (shortlisted or review later)
     * - Priority intros (sent or received)
     */
    getInteractedUserIds(userId: string): Promise<string[]>;
}