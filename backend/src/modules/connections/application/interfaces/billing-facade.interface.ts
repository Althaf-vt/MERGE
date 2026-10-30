// Strict cross-module boundary to prevent direct imports to the Billing domain
export const BILLING_FACADE = 'BILLING_FACADE';

export interface IBillingFacade {
    // Attemps to deduct a priority intro credit.
    // Throws a DomainException if the user has insufficient credits.
    deductPriorityCredit(userId: string): Promise<void>;
}