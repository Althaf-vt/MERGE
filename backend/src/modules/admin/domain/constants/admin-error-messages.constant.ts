export const ADMIN_ERROR_MESSAGES = {
    // Authentication & Sessions
    INVALID_CREDENTIALS: 'Invalid email or password.',
    INACTIVE_ACCOUNT_LOGIN: 'Inactive admin account cannot login.',
    INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
    SESSION_FORCEFULLY_TERMINATED: 'Session was forcefully terminated. Please log in again.',
    ACCOUNT_INACTIVE_OR_DELETED: 'Admin account is inactive or deleted.',
    INVALID_RESET_CODE: 'Invalid or expired reset code.',
    INVALID_VERIFY_CODE: 'Invalid or expired verification code.',
    AUTH_CONTEXT_MISSING: 'Authentication context missing.',
    SESSION_EXPIRED_OR_TERMINATED: 'Session has expired or was forcefully terminated.',

    // Admin Account Lifecycle & Management
    ADMIN_NOT_FOUND: 'Admin account not found.',
    ADMIN_PERSONNEL_NOT_FOUND: 'Admin personnel not found.',
    USER_NOT_FOUND: 'User not found.',
    EMAIL_ALREADY_EXISTS: 'An admin account with this email already exists.',
    CANNOT_LOGOUT_SUPER_ADMIN: 'Super Admins cannot be forcefully logged out.',
    CANNOT_SUSPEND_DEACTIVATED: 'Cannot suspend a deactivated account.',
    CANNOT_SUSPEND_SUPER_ADMIN: 'Super Admins cannot be suspended.',
    CANNOT_DEACTIVATE_SUPER_ADMIN: 'Super Admins cannot be deactivated.',
    ACCOUNT_ALREADY_ACTIVE: 'Account is already active.',
    CANNOT_CHANGE_ROLE_DEACTIVATED: 'Cannot change the role of a deactivated admin.',
    SUSPENSION_DURATION_GREATER_THAN_ZERO: 'Suspension duration must be greater than zero.',

    // Invitations
    INVALID_INVITATION_TOKEN: 'Invalid or expired invitation token.',
    INVITED_ADMIN_NOT_FOUND: 'Invited admin account could not be found.',
    NOT_PENDING_INVITATION: 'This account is not pending an invitation',
    ONLY_PENDING_INVITATIONS_RENEWED: 'Only pending invitations can be renewed.',
    INVITATION_STILL_ACTIVE: 'Current invitation is still active. You can only re-invite expired accounts.',
    ONLY_PENDING_INVITATIONS_CANCELLED: 'Only pending invitations can be cancelled. Active or suspended accounts must be deactivated.',

    // Review Tasks (KYC & Photo)
    TASK_NOT_FOUND: 'Task not found.',
    KYC_REJECTION_REASON_REQUIRED: 'A reason is required when rejecting a KYC escalation.',
    KYC_RESUBMISSION_REASON_REQUIRED: 'At least one reason is required when requesting KYC resubmission.',
    PHOTO_REJECTION_REASON_REQUIRED: 'A reason is required when rejecting a profile photo.',

    // Claim Details VO
    TASK_MUST_BE_CLAIMED: 'Task must be claimed before taking action.',
    TASK_ALREADY_RESOLVED: 'Task is already resolved and immutable.',
    TASK_CLAIMED_BY_ANOTHER: 'Task is currently claimed by another administrator.',
    CANNOT_CLAIM_RESOLVED_TASK: 'Cannot claim a resolved task.',
    TASK_ALREADY_CLAIMED: 'Task is already claimed.',
    TASK_NOT_CLAIMED: 'Task is not currently claimed.',
    ONLY_CLAIM_OWNER_OR_SUPER_ADMIN_CAN_RELEASE: 'Only the claim owner or a Super Admin can release this claim.',
    CANNOT_TAKEOVER_RESOLVED_TASK: 'Cannot takeover a resolved task.',
} as const;
