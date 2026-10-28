// Centralized infrastructure and environment configuration.
// Encapsulates environment variable retrieval with validated fallbacks and type-coercion.
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

    // App & Server
    app: {
        get url(): string {
            return process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
        },
        get frontendUrl(): string {
            return process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
        },
        get name(): string {
            return process.env.APP_NAME || 'MERGE';
        },
        get port(): number {
            return Number(process.env.PORT) || 3110;
        },
        get isProduction(): boolean {
            return process.env.NODE_ENV === 'production';
        },
        get cookieMaxAge(): number {
            return Number(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60 * 1000;
        },
    },

    // JWT Security
    jwt: {
        get accessSecret(): string | undefined {
            return process.env.JWT_ACCESS_SECRET;
        },
        get refreshSecret(): string | undefined {
            return process.env.JWT_REFRESH_SECRET;
        },
        get accessExpiration(): string {
            return process.env.JWT_ACCESS_EXPIRATION || '15m';
        },
        get refreshExpiration(): string {
            return process.env.JWT_REFRESH_EXPIRATION || '7d';
        },
        get refreshExpirationSeconds(): number {
            return parseInt(process.env.JWT_REFRESH_EXPIRATION_SECONDS || '604800', 10);
        },
    },

    // Admin Management & Seeder
    admin: {
        get inviteTtlSeconds(): number {
            return parseInt(process.env.ADMIN_INVITE_TTL_SECONDS || '86400', 10);
        },
        get seederEmail(): string | undefined {
            return process.env.INIT_SUPER_ADMIN_EMAIL;
        },
        get seederPassword(): string | undefined {
            return process.env.INIT_SUPER_ADMIN_PASSWORD;
        },
        get seederName(): string {
            return process.env.INIT_SUPER_ADMIN_NAME || 'MERGE System Admin';
        },
    },

    // AWS & Object Storage
    aws: {
        get region(): string | undefined {
            return process.env.AWS_REGION;
        },
        get accessKeyId(): string | undefined {
            return process.env.AWS_ACCESS_KEY_ID;
        },
        get secretAccessKey(): string | undefined {
            return process.env.AWS_SECRET_ACCESS_KEY;
        },
        get bucketName(): string | undefined {
            return process.env.AWS_S3_BUCKET_NAME;
        },
    },

    // Google OAuth
    google: {
        get clientId(): string | undefined {
            return process.env.GOOGLE_CLIENT_ID;
        },
    },

    // AI & OpenRouter
    ai: {
        get apiKey(): string | undefined {
            return process.env.OPENROUTER_API_KEY;
        },
        get chatModel(): string {
            return process.env.OPENROUTER_CHAT_MODEL || 'openrouter/free';
        },
        get bioModel(): string {
            return process.env.OPENROUTER_BIO_MODEL || process.env.OPENROUTER_CHAT_MODEL || 'openrouter/free';
        },
        get embeddingModel(): string {
            return process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small';
        },
        get chatTemperature(): number {
            return Number(process.env.OPENROUTER_CHAT_TEMPERATURE) || 0.7;
        },
        get summaryTemperature(): number {
            return Number(process.env.OPENROUTER_SUMMARY_TEMPERATURE) || 0.5;
        },
        get bioTemperature(): number {
            return Number(process.env.OPENROUTER_BIO_TEMPERATURE) || 0.7;
        },
    },

    // Biometric & External Services
    services: {
        get mlServiceUrl(): string {
            return process.env.ML_SERVICE_URL || 'http://biometric-worker:8000/extract-embedding';
        },
        get mlServiceBaseUrl(): string {
            return process.env.ML_SERVICE_URL?.replace('/extract-embedding', '') || 'http://biometric-worker:8000';
        },
        get kycPepper(): string | undefined {
            return process.env.KYC_HASH_PEPPER;
        },
    },
} as const;