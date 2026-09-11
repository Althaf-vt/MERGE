export interface BackendErrorPayload {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
  timestamp?: string;
}

//  Extracts the domain error message or falls back to a default string.
export const getErrorMessage = (err: any, fallback: string): string => {
  return err?.data?.error?.message || err?.data?.message || fallback;
};

// Extracts the domain error code if available.

export const getErrorCode = (err: any): string | undefined => {
  return err?.data?.error?.code;
};