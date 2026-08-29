import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


type KycStep = 'DOCUMENT_UPLOAD' | 'LIVENESS_CHECK' | 'SUCCESS';

interface ExtractedKycData{
    legalName: string;
    dateOfBirth: string;
}

interface KycState{
    currentStep: KycStep;
    extractedData: ExtractedKycData | null;
}

const initialState: KycState = {
    currentStep: "DOCUMENT_UPLOAD",
    extractedData: null
}

const kycSlice = createSlice({
    name: 'kyc',
    initialState,
    reducers: {
        setKycStep: (state, action: PayloadAction<KycStep>) => {
            state.currentStep = action.payload;
        },
        setExtractedData: (state, action: PayloadAction<ExtractedKycData>) => {
            state.extractedData = action.payload;
        },
        resetKyc: (state) => {
            state.currentStep = 'DOCUMENT_UPLOAD';
            state.extractedData = null;
        }
    }
})

export const {setKycStep, setExtractedData, resetKyc} = kycSlice.actions;
export default kycSlice.reducer;