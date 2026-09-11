import { useNavigate } from 'react-router-dom';
import { BuildPersona } from '../components/build-persona.component';
import { KycLayout } from '../../../shared/components/layouts/kyc.layout.component';

export const PersonaPage = () => {
    const navigate = useNavigate();

    // Advances to Phase 10 (Lifestyle and background) once persona details are saved
    const handleSuccess = () => {
        navigate('/onboarding/lifestyle', { replace: true });
    };

    return (
        <KycLayout>
            <BuildPersona onSuccess={handleSuccess} />
        </KycLayout>
    );
};