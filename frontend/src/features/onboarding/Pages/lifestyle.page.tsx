import { useNavigate } from "react-router-dom";
import { KycLayout } from "../../../shared/components/layouts/kyc.layout.component";
import { LifestyleBackground } from "../components/lifestyle-background.component";

export const LifestylePage = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/onboarding/preferences", {replace: true});
    }

    return (
        <KycLayout>
            <LifestyleBackground onSuccess={handleSuccess}/>
        </KycLayout>
    )
}