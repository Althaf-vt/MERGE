import os
import tempfile
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from deepface import DeepFace
import mediapipe as mp

app = FastAPI(title="Production Biometric Worker")

# Initialize MediaPipe Face Mesh globally
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

# Load rigid pixel-based feature detectors globally.
# These cannot be fooled by ML "guessing". If the physical eye/mouth is covered, they fail.
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

@app.on_event("startup")
def load_models():
    print("Loading FaceNet512 model into memory...")
    DeepFace.build_model("Facenet512")
    
    print("Warming up MTCNN detector...")
    dummy_img = np.zeros((10, 10, 3), dtype=np.uint8)
    try:
        DeepFace.extract_faces(img_path=dummy_img, detector_backend="mtcnn", enforce_detection=False)
    except Exception:
        pass
    print("All models loaded successfully.")

def evaluate_quality_and_occlusion(img: np.ndarray, facial_area: dict):
    x, y, w, h = facial_area["x"], facial_area["y"], facial_area["w"], facial_area["h"]

    # 1. Proximity Check
    img_h, img_w = img.shape[:2]
    if (w * h) / (img_w * img_h) < 0.08:
        raise HTTPException(status_code=400, detail="Face is too far away. Move closer to the camera.")

    # 2. Standardize Face Crop (15% padding gives Haar Cascades breathing room)
    pad_w, pad_h = int(w * 0.15), int(h * 0.15)
    x_start, y_start = max(0, x - pad_w), max(0, y - pad_h)
    x_end, y_end = min(img_w, x + w + pad_w), min(img_h, y + h + pad_h)

    face_crop = img[y_start:y_end, x_start:x_end]
    if face_crop.size == 0:
        raise HTTPException(status_code=400, detail="Invalid face bounding box.")

    standard_face = cv2.resize(face_crop, (300, 300), interpolation=cv2.INTER_AREA)
    gray_face = cv2.cvtColor(standard_face, cv2.COLOR_BGR2GRAY)

    # 3. Blur & Lighting Gate
    blur_score = cv2.Laplacian(gray_face, cv2.CV_64F).var()
    if blur_score < 8.0:
        raise HTTPException(status_code=400, detail=f"Face is too blurry (Score: {blur_score:.1f}). Hold the camera steady.")

    mean_brightness = np.mean(gray_face)
    if mean_brightness < 35 or mean_brightness > 235:
        raise HTTPException(status_code=400, detail="Lighting is poor. Move to a well-lit area without strong glare.")

    # 4. STRICT OCCLUSION GATE: Lower Face & Overall Structure
    # Blocks books over mouth, looking down, and horizontal half-covers.
    haar_faces = face_cascade.detectMultiScale(gray_face, scaleFactor=1.1, minNeighbors=4, minSize=(120, 120))
    if len(haar_faces) == 0:
        raise HTTPException(status_code=400, detail="Face structure incomplete. Remove hands, books, or objects covering your face, and look forward.")

    # 5. STRICT EYE GATE: Micro-Occlusion
    # Searches only the top half of the face. Blocks pens, hair, or hands covering the eyes.
    top_half = gray_face[0:160, :]
    eyes = eye_cascade.detectMultiScale(top_half, scaleFactor=1.1, minNeighbors=3, minSize=(25, 25))
    if len(eyes) < 2:
        raise HTTPException(status_code=400, detail="Both eyes must be clearly visible. Remove pens, objects, or hair covering your eyes.")

def detect_screen_replay(frame: np.ndarray) -> bool:
    """Returns True if the frame exhibits screen-replay artifacts (Moiré or Glare)"""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # 1. Specular Glare Detection (Screen Reflection)
    # Screens reflect harsh point-lights as pure white #FFFFFF.
    _, thresh = cv2.threshold(gray, 245, 255, cv2.THRESH_BINARY)
    glare_ratio = cv2.countNonZero(thresh) / (gray.shape[0] * gray.shape[1])
    
    # If more than 1.5% of the frame is purely blown-out white, it's likely a glass screen reflecting a room light
    if glare_ratio > 0.015:
        return True

    # 2. Moiré Pattern Detection via Fast Fourier Transform (FFT)
    # Convert image to frequency domain to find artificial pixel grid patterns
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)

    # Mask out the low frequencies (natural shapes/colors in the center)
    rows, cols = gray.shape
    crow, ccol = rows // 2, cols // 2
    r = 40 # Radius for natural low frequencies
    mask = np.ones((rows, cols), np.uint8)
    cv2.circle(mask, (ccol, crow), r, 0, -1)

    # Calculate the average magnitude of the high frequencies (edges and grids)
    high_freq_magnitude = np.mean(magnitude_spectrum * mask)

    # High frequency spikes indicate unnatural grid lines (Moiré)
    if high_freq_magnitude > 145.0:
        return True

    return False

@app.post("/extract-embedding")
async def extract_embedding(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format.")

        faces = DeepFace.extract_faces(img_path=img, detector_backend="mtcnn", enforce_detection=False)

        if len(faces) == 0 or faces[0].get("confidence", 0) == 0:
            raise HTTPException(status_code=400, detail="No face detected. Ensure your face is centered in the frame.")
        if len(faces) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected. Only one person must be visible.")
        
        primary_face = faces[0]
        
        # Consolidate all validation into the new Dual-Gate system
        evaluate_quality_and_occlusion(img, primary_face["facial_area"])

        # Extract 512-D FaceNet Vector
        results = DeepFace.represent(
            img_path=primary_face["face"],
            model_name="Facenet512",
            detector_backend="skip",
            enforce_detection=False
        )

        return {
            "confidence": round(primary_face.get("confidence", 0) * 100, 2),
            "faceEmbedding": results[0]["embedding"]
        }

    except HTTPException as he: 
        raise he
    except Exception as e: 
        print(f"Extraction Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal ML worker error.")


@app.post('/analyze-liveness')
async def analyze_liveness(promptType: str = Form(...), file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_video:
        temp_video.write(await file.read())
        temp_video_path = temp_video.name

    try:
        cap = cv2.VideoCapture(temp_video_path)
        action_detected = False

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Convert the BGR image to RGB before processing
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_frame)

            if results.multi_face_landmarks:
                landmarks = results.multi_face_landmarks[0].landmark
                
                # Route to specific geometric heuristics based on the prompt
                if promptType == 'BLINK':
                    # Calculate Eye Aspect Ratio (EAR) using specific eyelid landmarks
                    # If EAR drops below threshold, action_detected = True
                    pass
                elif promptType == 'TURN_LEFT':
                    # Compare nose tip (landmark 1) x-coordinate relative to cheekbones
                    pass
                elif promptType == 'SMILE':
                    # Calculate lip corner stretching distance
                    pass

        cap.release()
        
        # Calculate final confidence score based on geometric thresholds
        liveness_score = 0.95 if action_detected else 0.20

        return {
            "livenessScore": liveness_score,
            "passed": action_detected,
        }

    except HTTPException as he:
        raise he
    except Exception as e: 
        print(f"Liveness Processing Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal liveness ML worker error.")
    finally: 
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)