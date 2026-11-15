export const ADMIN_AUDIT_ERROR_MESSAGES = {
    ADMIN_ID_REQUIRED: 'Admin ID is required to create an audit log.',
    INVALID_ACTION: (action: string) => `Invalid audit action: ${action}`,
    INVALID_RESOURCE_TYPE: (type: string) => `Invalid audit resource type: ${type}`,
    RESOURCE_ID_REQUIRED: 'Resource ID is required to create an audit log.',
    SCENARIO_ID_REQUIRED: 'Scenario ID is required to fetch activity history.',
} as const;
