import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


export type KycStep = 
  | 'DOCUMENT_UPLOAD' 
  | 'DOCUMENT_SUCCESS' 
  | 'DEVICE_SELECTION' 
  | 'LIVE_SELFIE' 
  | 'LIVENESS_CHALLENGE' 
  | 'REVIEW_VERIFICATION'
  | 'VERIFIED'          
  | 'UNDER_REVIEW'      
  | 'FAILED'
  | 'SUCCESS';

interface ExtractedKycData{
    legalName: string;
    dateOfBirth: string;
}

interface LivenessPromptResult {
    prompt: string;
    completed: boolean;
}

interface KycState{
    currentStep: KycStep;
    extractedData: ExtractedKycData | null;
    livenessResults: LivenessPromptResult[];
}

const initialState: KycState = {
    currentStep: "DOCUMENT_UPLOAD",
    extractedData: null,
    livenessResults: []
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
        addLivenessResult: (state, action: PayloadAction<LivenessPromptResult>) => {
            state.livenessResults.push(action.payload);
        },
        resetKyc: (state) => {
            state.currentStep = 'DOCUMENT_UPLOAD';
            state.extractedData = null;
            state.livenessResults = [];
        }
    }
})

export const {setKycStep, setExtractedData,addLivenessResult, resetKyc} = kycSlice.actions;
export default kycSlice.reducer;