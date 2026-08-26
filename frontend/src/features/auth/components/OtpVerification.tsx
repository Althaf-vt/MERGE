import { useVerifyOtpMutation } from "../api/authApi";
import { useState } from "react";
import { useAppSelector } from "../../../app/hooks";

export const OtpVerification = () => {
    // Pull the email we just registered with from the Redux slice
    const email = useAppSelector((state: any) => state.auth.registeredEmail);

    const [verifyOtp, {isLoading, error}] = useVerifyOtpMutation();
    const [otp, setOtp] = useState('');

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await verifyOtp({email,otp}).unwrap();
            console.log('OTP Verified successfully!', response);

            // TODO: Save JWT token to localStorage/cookies here
            // TODO: Redirect to the KYC Onboading scree
        } catch (error) {
            console.error('OTP Verification failed: ', error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Verify you email</h2>
            <p>We send a 6-digit code to {email}</p>

            {error && <div style={{color:'red'}}>Invalid or expired code.</div>}

            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
            />

            <button type="submit" disabled={isLoading || otp.length < 6}>
                {isLoading ? "Verifying" : "Verify Email"}
            </button>
        </form>
    )
}