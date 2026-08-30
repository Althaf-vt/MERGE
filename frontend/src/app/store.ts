import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import kycReducer from "../features/onboarding/slices/kycSlice";
import { authApi } from "../features/auth/api/authApi";
import { kycApi } from "../features/onboarding/api/kycApi";


export const store = configureStore({
    reducer: {
        // 1. Client State (our Redux Slices)
        auth: authReducer,

        // 2. Server State (RTK Query cache)
        // We use a dynamic key here so it scales perfectly as we add more APIs
        [authApi.reducerPath]: authApi.reducer,

        kyc: kycReducer,
        [kycApi.reducerPath]: kycApi.reducer,
    },

    // 3. The Middleware
    // We take the default Redux middleware and add the RTK Query middleware on top of it.
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(authApi.middleware, kycApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;