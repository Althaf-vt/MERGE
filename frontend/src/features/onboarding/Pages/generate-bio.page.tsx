import { BioOptimizer } from '../components/bio-optimizer.component';
import { KycLayout } from '../../../shared/components/layouts/kyc.layout.component';

export const GenerateBioPage = () => {
    return (
        <KycLayout>
            <BioOptimizer />
        </KycLayout>
    );
};