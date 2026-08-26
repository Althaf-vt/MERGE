import { useRegisterUserMutation } from "../api/authApi";
import React, { useState } from "react";
import { setRegisteredEmail, setRegistrationStep } from "../slices/authSlice";
import { useAppDispatch } from "../../../app/hooks";

export const RegisterForm = () => {
    const dispatch = useAppDispatch();

    // RTK Query hook gives us the trigger function and the state (isLoading, error)
    const [register, {isLoading, error}] = useRegisterUserMutation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        try {
            // unwrap() extracts the payload or throws the error so we can catch it
            await register({email, password}).unwrap();

            // If successful, save the email to global state and move to OTP screen
            dispatch(setRegisteredEmail(email));
            dispatch(setRegistrationStep("OTP"));
        } catch (error) {
            console.error('Registration falied: ', error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Your MERGE account</h2>

            {/* Error handling from NestJS backend */}
            {error && <div style={{color:'red'}}>Registration failed, Please check the credentials.</div>}

            <input 
                type="emai" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Continue"}
            </button>

        </form>
    )
}