import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/auth.slice";
import adminAuthReducer from "../features/admin/auth/slices/admin-auth.slice";
import kycReducer from "../features/onboarding/slices/kyc.slice";
import { authApi } from "../features/auth/api/auth.api";
import { kycApi } from "../features/onboarding/api/kyc.api";
import { handoffApi } from "../features/onboarding/api/handoff.api";
import { profileApi } from "../features/onboarding/api/profile.api";
import { adminAuthApi } from "../features/admin/auth/api/admin-auth.api";
import { adminUsersApi } from "../features/admin/users/api/admin-users.api";
import { castingDirectorApi } from "../features/casting-director/api/casting-director.api";
import { adminManagementApi } from "../features/admin/management/api/admin-management.api";


export const store = configureStore({
    reducer: {
        // 1. Client State (our Redux Slices)
        auth: authReducer,
        adminAuth: adminAuthReducer,

        // 2. Server State (RTK Query cache)
        // We use a dynamic key here so it scales perfectly as we add more APIs
        [authApi.reducerPath]: authApi.reducer,
        [adminAuthApi.reducerPath]: adminAuthApi.reducer,
        [adminUsersApi.reducerPath]: adminUsersApi.reducer,
        [castingDirectorApi.reducerPath]: castingDirectorApi.reducer,
        [adminManagementApi.reducerPath]: adminManagementApi.reducer,

        kyc: kycReducer,
        [kycApi.reducerPath]: kycApi.reducer,
        [handoffApi.reducerPath]: handoffApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer
    },

    // 3. The Middleware
    // We take the default Redux middleware and add the RTK Query middleware on top of it.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            adminAuthApi.middleware,
            kycApi.middleware,
            handoffApi.middleware,
            profileApi.middleware,
            adminUsersApi.middleware,
            castingDirectorApi.middleware,
            adminManagementApi.middleware,
        )
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;