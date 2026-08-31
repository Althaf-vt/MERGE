import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { KycDocumentUpload } from "../components/KycDocumentUpload";
import { KycLayout } from "../../../shared/components/layouts/KycLayout";
import { KycSuccess } from "../components/KycSuccess";
import { DeviceSelection } from "../components/DeviceSelection";
import { useEffect } from "react";
import { setKycStep } from "../slices/kycSlice";

const LivenessCheck = () => <div>Liveness Biometric Check (Desktop Camera)</div>;
const OnboardingComplete = () => <div>KYC Complete. Redirecting to Profile Setup...</div>;

export const KycPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // 1. Grab auth state, the restored user profile, and current Redux step
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const user = useAppSelector((state) => state.auth.user);
    const currentStep = useAppSelector((state) => state.kyc.currentStep);

    // 2. Fast-forward logic: if the user reloads the page, Redux resets to "DOCUMENT_UPLOAD".
    // We check the DB state (user.kycVerification) to restore their progress instantly.
    useEffect(()=> {
        if(user?.kycCompleted){
            navigate('/onboarding/profile', {replace: true});
        }else if(user?.kycVerification?.verificationStatus === 'APPROVED' && currentStep === 'DOCUMENT_UPLOAD'){
            // Document is done, but Redux reset on relaod. Fast-forward to device selection.
            dispatch(setKycStep('DEVICE_SELECTION'));
        }
    }, [user, currentStep, dispatch, navigate]);

    // 3, Unauthenticated safeguard 
    if(!isAuthenticated){
        return <Navigate to='/login' replace/>
    }

    // 4. Render the correct component based on the synchronized Redux state
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