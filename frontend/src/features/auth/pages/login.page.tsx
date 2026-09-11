import { AuthLayout } from "../../../shared/components/layouts/auth.layout.component"
import { LoginForm } from "../components/login-form.component"

export const LoginPage = () => {
    return(
        <AuthLayout>
            <LoginForm/>
        </AuthLayout>
    )
}