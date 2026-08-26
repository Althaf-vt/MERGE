import { RegisterForm } from "../components/RegisterForm";
import { OtpVerification } from "../components/OtpVerification";
import { useAppSelector } from "../../../app/hooks";

export const RegisterPage = () => {
    const currentStep = useAppSelector((state: any) => state.auth.currentStep);

    return (
        <div>
            {/* 
                This is where we need to place our Figma layout wappers,
                split screens, or branding assets.
            */}

            {currentStep === "REGISTER" && <RegisterForm/>}
            {currentStep === "OTP" && <OtpVerification/>}
        </div>
    )
}