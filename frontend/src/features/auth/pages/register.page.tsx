import { RegisterForm } from "../components/register-form.component";
import { OtpVerification } from "../components/otp-verification.component";
import { useAppSelector } from "../../../app/hooks";
import { AuthLayout } from "../../../shared/components/layouts/auth.layout.component";

export const RegisterPage = () => {
    const currentStep = useAppSelector((state: any) => state.auth.currentStep);

    return (
        <AuthLayout>
            {currentStep === "REGISTER" && <RegisterForm/>}
            {currentStep === "OTP" && <OtpVerification/>}
        </AuthLayout>
    )
}