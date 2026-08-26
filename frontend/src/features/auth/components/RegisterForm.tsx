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
    const [confirmPassword, setConfirmPassword] = useState('');
    const [clientError, setClientError] = useState<string | null>(null);

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setClientError(null);

        if(password.length < 8){
            setClientError("Password must be at least 8 characters long");
            return;
        }

        if(password !== confirmPassword){
            setClientError("Password do not match");
            return;
        }

        try {
            // unwrap() extracts the payload or throws the error so we can catch it
            await register({email, password,confirmPassword}).unwrap();

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

            {clientError && <div style={{color:'red'}}>{clientError}</div>}
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
            <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
            />

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Continue"}
            </button>

        </form>
    )
}