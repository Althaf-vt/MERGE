import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

// DTO used to type the data sent to the auth API
import type { RegisterUserDto, VerifyOtpDto } from '../types';

// Defines the auth API endpoints and manages their server communication
export const authApi = createApi({

    // Unique key used by Redux to store RTK Query state for this API
    reducerPath: 'authApi',

    // Base URL shared by all auth API requests
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:3110/api/v1/auth'}),
    endpoints: (builder) => ({

        // Sends the registration data to the backend
        registerUser: builder.mutation<any, RegisterUserDto>({ // mutation means changing something on server
            query: (credentials) => ({
                url: '/register',
                method: 'POST',
                body: credentials,
            })
        }),

        // Sends the email and OTP to the backend for verification
        verifyOtp: builder.mutation<any, VerifyOtpDto>({
            query: (data) => ({
                url: '/verify-otp',
                method: 'POST',
                body: data
            })
        })
    })
})

// RTK Query automatically generates hooks for calling these endpoints
export const {useRegisterUserMutation, useVerifyOtpMutation} = authApi;