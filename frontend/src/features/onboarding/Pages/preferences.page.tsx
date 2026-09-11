import { useNavigate } from 'react-router-dom';
import { UserPreferences } from '../components/user-preferences.component';
import { KycLayout } from '../../../shared/components/layouts/kyc.layout.component';

export const PreferencesPage = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/onboarding/bio', { replace: true });
    };

    return (
        <KycLayout>
            <UserPreferences onSuccess={handleSuccess} />
        </KycLayout>
    );
};