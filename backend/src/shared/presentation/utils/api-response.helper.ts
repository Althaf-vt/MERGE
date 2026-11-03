import { ApiResponse } from "../interfaces/api-response.interface";

export class ApiResponseHelper {
    static success<T>(message: string, data?: T): ApiResponse<T> {
        return {
            success: true,
            message,
            ...(data !== undefined && { data }),
        };
    }

    static error<T>(message: string, error?: any): ApiResponse<T> {
        return {
            success: false,
            message,
            ...(error !== undefined && { error }),
        };
    }
}