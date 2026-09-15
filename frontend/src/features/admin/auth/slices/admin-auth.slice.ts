import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    permissions: string[];
    profilePhotoUrl?: string;
    lastLoginAt?: string;
}

interface AdminAuthState {
    accessToken: string | null;
    admin: AdminUser | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
}

const initialState: AdminAuthState = {
    accessToken: null,
    admin: null,
    isAuthenticated: false,
    isInitializing: true,
};

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState,
    reducers: {
        setAdminCredentials: (
            state,
            action: PayloadAction<{accessToken: string; admin: AdminUser}>
        ) => {
            state.accessToken = action.payload.accessToken;
            state.admin = action.payload.admin;
            state.isAuthenticated = true;
            state.isInitializing = false;
        },

        adminLogout: (state) => {
            state.accessToken = null;
            state.admin = null;
            state.isAuthenticated = false;
            state.isInitializing = false;
        },
        setAdminInitialized: (state) => {
            state.isInitializing = false;
        },
    },
});

export const {setAdminCredentials, adminLogout, setAdminInitialized } = adminAuthSlice.actions;
export default adminAuthSlice.reducer