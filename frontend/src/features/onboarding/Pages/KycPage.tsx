import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks"
import { KycDocumentUpload } from "../components/KycDocumentUpload";
import { KycLayout } from "../../../shared/components/layouts/KycLayout";
import { KycSuccess } from "../components/KycSuccess";
import { DeviceSelection } from "../components/DeviceSelection";

const LivenessCheck = () => <div>Liveness Biometric Check (Desktop Camera)</div>;
const OnboardingComplete = () => <div>KYC Complete. Redirecting to Profile Setup...</div>;

export const KycPage = () => {
    // 1. Verify the user is actually authenticated before they can access onboarding
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    // 2.Reac the current KYC step from kycSlice
    const currentStep = useAppSelector((state) => state.kyc.currentStep);

    // If they somehow land here without logging in, kick them back to login
    if(!isAuthenticated){
        return <Navigate to='/login' replace/>
    }

    // 3. Render the correct component based on the Redux state
    const renderCurrentStep = () => {
        switch(currentStep){
            case 'DOCUMENT_UPLOAD':
                return <KycDocumentUpload/>;
            case 'DOCUMENT_SUCCESS':
                return <KycSuccess/>;
            case 'DEVICE_SELECTION':
                return <DeviceSelection/>
            case 'LIVENESS_CHECK':
                return <LivenessCheck/>
            case 'SUCCESS':
                return <OnboardingComplete/>
            default:
                return <KycDocumentUpload/>;
        }
    }

    // 4. Wrap everything in the layout
    return (
        <KycLayout>
            {renderCurrentStep()}
        </KycLayout>
    )
}