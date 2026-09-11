import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { KycDocumentUpload } from "../components/kyc-document-upload.component";
import { KycLayout } from "../../../shared/components/layouts/kyc.layout.component";
import { KycSuccess } from "../components/kyc-success.component";
import { DeviceSelection } from "../components/device-selection.component";
import { useEffect } from "react";
import { setKycStep } from "../slices/kyc.slice";
import { LiveSelfieCapture } from "../components/live-selfie-capture.component";
import { LivenessChallenge } from "../components/liveness-challenge.component";
import { ReviewVerification } from "../components/review-verification.component";
import { KycVerified } from "../components/kyc-verified.component";
import { KycUnderReview } from "../components/kyc-under-review.component";
import { KycFailed } from "../components/kyc-failed.component";

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
        if(!user) return;

        const kyc = user.kycVerification;

        // 1. Fully completed
        if(user.kycCompleted){
            navigate('/onboarding/profile', {replace: true});
            return;
        }

        if(!kyc) return;

        // 2. Terminal review states
        if(kyc.verificationSubmitted){
            if(kyc.verificationStatus === 'UNDER_REVIEW') dispatch(setKycStep('UNDER_REVIEW'));
            else if(kyc.verificationStatus === 'APPROVED') dispatch(setKycStep('VERIFIED'));
            else if(kyc.verificationStatus === 'REJECTED') dispatch(setKycStep('FAILED'));
            return;
        }

        // 3. Granular step restoration (skip completed phases)
        if(kyc.documentType && kyc.selfieVerificationStatus !== 'APPROVED'){
            // Document is verified but selfie is missing
            dispatch(setKycStep('DEVICE_SELECTION'));
        }else if(kyc.selfieVerificationStatus === 'APPROVED' && (kyc.passedPrompts?.length ?? 0) < 4){
            // selfie is approved, but liveness prompts are incomplete/failed
            dispatch(setKycStep('LIVENESS_CHALLENGE'));
        }else if((kyc.passedPrompts?.length ?? 0) === 4 && !kyc.verificationSubmitted){
            // Liveness is done, ready for final review
            dispatch(setKycStep('REVIEW_VERIFICATION'));
        }
    }, [user, dispatch, navigate]);

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
                return <DeviceSelection/>;
            
            // Sequential Biometric Flow (Desktop)
            case 'LIVE_SELFIE':
                return <LiveSelfieCapture onSuccess={() => dispatch(setKycStep('LIVENESS_CHALLENGE'))}/>;
            case 'LIVENESS_CHALLENGE':
                return <LivenessChallenge onSuccess={() => dispatch(setKycStep('REVIEW_VERIFICATION'))}/>;

            case 'REVIEW_VERIFICATION': 
                return <ReviewVerification/> 
            
            case 'VERIFIED':
                return <KycVerified/>;
            case 'UNDER_REVIEW':
                return <KycUnderReview/>;
            case 'FAILED':
                return <KycFailed/>;
            
            case 'SUCCESS':
                return <OnboardingComplete/>;
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