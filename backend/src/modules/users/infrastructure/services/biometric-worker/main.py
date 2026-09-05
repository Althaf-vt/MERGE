import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from deepface import DeepFace

app = FastAPI(title="Production Biometric Worker")

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