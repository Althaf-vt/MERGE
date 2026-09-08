import { type NormalizedLandmark } from "@mediapipe/face_mesh";

// Calculates the 2D Euclidean distance between two MediaPipe landmarks
const getDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark): number => {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// Computes the Eye Aspect Ratio (EAR) to detect blinking
export const calculateEAR = (landmarks: NormalizedLandmark[]): number => {
    // left eye landmarks: vertiacal (159, 145), horizontal (33, 133)
    const leftVertical = getDistance(landmarks[159], landmarks[145]);
    const leftHorizontal = getDistance(landmarks[33], landmarks[133]);
    const leftEar = leftHorizontal > 0 ? leftVertical / leftHorizontal : 0;

    // Right eye landmarks: vertical (386, 374), horizontal (362, 263)
    const rightVertical = getDistance(landmarks[386], landmarks[374]);
    const rightHorizontal = getDistance(landmarks[362], landmarks[263]);
    const rightEar = rightHorizontal > 0 ? rightVertical / rightHorizontal : 0;

    return (leftEar + rightEar) / 2.0;
}

// Calculates horizontal head rotation relative to cheek boundaries
export const calculateYawRatio = (landmarks: NormalizedLandmark[]): number => {
    const nose = landmarks[1].x;
    const rightCheek = landmarks[234].x;
    const leftCheek = landmarks[454].x;

    const totalSpan = Math.abs(leftCheek - rightCheek);
    if(totalSpan === 0) return 0.5;

    return (nose - Math.min(rightCheek, leftCheek)) / totalSpan;
}

// Computes mouth width normalized by outer eye distance to detect smiling
export const calculateSmileRatio = (landmarks: NormalizedLandmark[]): number => {
    const mouthWidth = getDistance(landmarks[61], landmarks[291]);
    const eyeSpan = getDistance(landmarks[33], landmarks[263]);

    return eyeSpan > 0 ? mouthWidth / eyeSpan : 0;
}
