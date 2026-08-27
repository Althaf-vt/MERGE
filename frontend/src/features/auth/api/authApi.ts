import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

// DTO used to type the data sent to the auth API
import type { LoginUserDto, RegisterUserDto, VerifyOtpDto } from '../types';
import type { RootState } from '../../../app/store'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout, setCredentials } from '../slices/authSlice';

// 1. Define the standard base query with the outgoing token injector
const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3110/api/v1',
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as RootState).auth.accessToken;

        if(token){
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    }
})

// 2. Create the Re-authorization wrapper (The incoming checkpoint)
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async(
    args,
    api,
    extraOptions
) => {
    // A. Wait for the initial request to finish
    let result = await baseQuery(args, api, extraOptions);

    // B. If the request fails with a 401 Unauthorized, the token is dead
    if(result.error && result.error.status === 401){

        // Grab the refresh token from Redux state
        const rootState = api.getState() as RootState;
        const refreshToken = rootState.auth.refreshToken || localStorage.getItem('refreshToken');

        if(refreshToken){
            // C. Attempt to get a new access token
            const refreshResult = await baseQuery(
                {
                    url: '/auth/refresh',
                    method: 'POST',
                    body: {refreshToken}
                },
                api,
                extraOptions
            );

            if(refreshResult.data){
                // D. Success! Store the new tokens in Redux
                const data = refreshResult.data as {accessToken: string, refreshToken: string};

                api.dispatch(setCredentials({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    user: rootState.auth.user! // Keep the existing user data intact
                }))

                // E. Retry the original query with the new token automatically
                result = await baseQuery(args, api, extraOptions);
            }else{
                // F. If the refresh token is expired/invalid, log them out completely
                api.dispatch(logout()); 
            }
        }else{
            // Not refresh token available, force logout
            api.dispatch(logout())
        }
    }

    return result
}

// 3. Use the new wrapper in your API
export const authApi = createApi({

    // Unique key used by Redux to store RTK Query state for this API
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,

    endpoints: (builder) => ({

        // Sends the registration data to the backend
        registerUser: builder.mutation<any, RegisterUserDto>({ // mutation means changing something on server
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            })
        }),

        // Sends the email and OTP to the backend for verification
        verifyOtp: builder.mutation<any, VerifyOtpDto>({
            query: (data) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: data
            })
        }),

        // Sends the login credentials to the backend for verification
        loginUser: builder.mutation<any, LoginUserDto>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials
            })
        })
    })
})

// RTK Query automatically generates hooks for calling these endpoints
export const {useRegisterUserMutation, useVerifyOtpMutation, useLoginUserMutation} = authApi;