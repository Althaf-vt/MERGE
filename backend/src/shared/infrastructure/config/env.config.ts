//Centralized infrastructure and environment configuration.
//Encapsulates environment variable retrieval with validated fallbacks.
export const EnvConfig = {
    // Database
    database: {
        get mongoUri(): string {
            return process.env.MONGO_URI || 'mongodb://localhost:27017/merge_db';
        },
    },

    // Redis
    redis: {
        get uri(): string {
            if (process.env.REDIS_URI) return process.env.REDIS_URI;
            if (process.env.REDIS_URL) return process.env.REDIS_URL;
            const host = process.env.REDIS_HOST || 'localhost';
            const port = Number(process.env.REDIS_PORT) || 6379;
            return `redis://${host}:${port}`;
        },
        get host(): string {
            return process.env.REDIS_HOST || 'localhost';
        },
        get port(): number {
            return Number(process.env.REDIS_PORT) || 6379;
        },
    },

    // Email / SMTP
    smtp: {
        get host(): string | undefined {
            return process.env.SMTP_HOST;
        },
        get port(): number {
            return parseInt(process.env.SMTP_PORT || '587', 10);
        },
        get secure(): boolean {
            return process.env.SMTP_SECURE === 'true';
        },
        get user(): string | undefined {
            return process.env.SMTP_USER;
        },
        get pass(): string | undefined {
            return process.env.SMTP_PASS;
        },
        get from(): string {
            return process.env.SMTP_FROM || 'noreply@merge.com';
        },
    },

    // App & Frontend
    app: {
        get url(): string {
            return process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
        },
        get name(): string {
            return process.env.APP_NAME || 'MERGE';
        },
        get isProduction(): boolean {
            return process.env.NODE_ENV === 'production';
        },
    },
} as const;