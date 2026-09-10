import { AuthLayout } from "../../../shared/components/layouts/AuthLayout"
import { ForgotPassword } from "../components/forgot-password.module"

export const ForgotPasswordPage = () => {
    return(
        <AuthLayout>
            <ForgotPassword/>
        </AuthLayout>
    )
}