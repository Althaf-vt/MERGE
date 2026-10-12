export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
}

export interface ApiError {
    code: string;
    message: string;
}

export interface ApiResponse<T = undefined> {
    success: boolean;
    message?: string;
    data?: T;
    meta?: PaginationMeta;
    error?: ApiError;
    timestamp?: string;
}