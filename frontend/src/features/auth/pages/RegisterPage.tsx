import { RegisterForm } from "../components/RegisterForm";
import { OtpVerification } from "../components/OtpVerification";
import { useAppSelector } from "../../../app/hooks";
import { AuthLayout } from "../../../shared/components/layouts/AuthLayout";

export const RegisterPage = () => {
    const currentStep = useAppSelector((state: any) => state.auth.currentStep);

    return (
        <AuthLayout>
            {currentStep === "REGISTER" && <RegisterForm/>}
            {currentStep === "OTP" && <OtpVerification/>}
        </AuthLayout>
    )
}