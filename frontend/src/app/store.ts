import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/auth.slice";
import adminAuthReducer from "../features/admin/auth/slices/admin-auth.slice";
import kycReducer from "../features/onboarding/slices/kyc.slice";
import { authApi } from "../features/auth/api/auth.api";
import { kycApi } from "../features/onboarding/api/kyc.api";
import { handoffApi } from "../features/onboarding/api/handoff.api";
import { profileApi as onboardingProfileApi } from "../features/onboarding/api/profile.api";
import { adminAuthApi } from "../features/admin/auth/api/admin-auth.api";
import { adminUsersApi } from "../features/admin/users/api/admin-users.api";
import { castingDirectorApi } from "../features/casting-director/api/casting-director.api";
import { adminManagementApi } from "../features/admin/management/api/admin-management.api";
import { profileApi as userProfileApi } from "../features/profile/api/profile.api";

export const store = configureStore({
    reducer: {
        // 1. Client State (Redux Slices)
        auth: authReducer,
        adminAuth: adminAuthReducer,
        kyc: kycReducer,

        // 2. Server State (RTK Query Cache)
        [authApi.reducerPath]: authApi.reducer,
        [adminAuthApi.reducerPath]: adminAuthApi.reducer,
        [adminUsersApi.reducerPath]: adminUsersApi.reducer,
        [castingDirectorApi.reducerPath]: castingDirectorApi.reducer,
        [adminManagementApi.reducerPath]: adminManagementApi.reducer,
        [kycApi.reducerPath]: kycApi.reducer,
        [handoffApi.reducerPath]: handoffApi.reducer,
        [onboardingProfileApi.reducerPath]: onboardingProfileApi.reducer,
        [userProfileApi.reducerPath]: userProfileApi.reducer,
    },

    // 3. Middleware
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            adminAuthApi.middleware,
            kycApi.middleware,
            handoffApi.middleware,
            onboardingProfileApi.middleware,
            adminUsersApi.middleware,
            castingDirectorApi.middleware,
            adminManagementApi.middleware,
            userProfileApi.middleware,
        ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;