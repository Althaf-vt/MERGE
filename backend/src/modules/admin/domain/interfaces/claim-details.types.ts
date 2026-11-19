import { ClaimStatus } from "../enums/claim-status.enum";

export interface ClaimDetailsProps {
    status: ClaimStatus;
    claimedBy?: string | null;
    claimedAt?: Date | null;
}

export interface ClaimDetailsSnapshot {
    status: ClaimStatus;
    claimedBy: string | null;
    claimedAt: Date | null;
}
