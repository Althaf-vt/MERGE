import { configureStore } from "@reduxjs/toolkit";
import { rootApi } from "../shared/api/base-api";

// Client State (Redux Slices)
import authReducer from "../features/auth/slices/auth.slice";
import adminAuthReducer from "../features/admin/auth/slices/admin-auth.slice";
import kycReducer from "../features/onboarding/slices/kyc.slice";

export const store = configureStore({
    reducer: {
        // 1. Client State (Redux Slices)
        auth: authReducer,
        adminAuth: adminAuthReducer,
        kyc: kycReducer,

        // 2. Server State (Unified RTK Query Cache)
        [rootApi.reducerPath]: rootApi.reducer,
    },

    // 3. Middleware
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(rootApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;