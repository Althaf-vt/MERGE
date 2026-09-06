import os
import tempfile
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


@app.post('/analyze-liveness')
async def analyze_liveness(file: UploadFile = File(...)):
    # 1. OpenCV cannot read video byte streams directly from memory
    # We must write the WebM/MP4 buffer to an isolated temporary file.
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_video:
        temp_video.write(await file.read())
        temp_video_path = temp_video.name

    try:
        cap = cv2.VideoCapture(temp_video_path)

        face_centers = []
        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # 2. Frame Sampling:  Process 1 in every 5 frames to bypass CPU bottlenecks
            if frame_count % 5 == 0:
                # Use MTCNN for fast bounding box extraction
                faces = DeepFace.extract_faces(
                    img_path=frame,
                    detector_backend="mtcnn",
                    enforce_detection=False
                )

                # Ensure exactly one high-confidence face is in the frame
                if len(faces) == 1 and faces[0].get("confidence", 0) > 0.85:
                    area = faces[0]["facial_area"]

                    # Track the geometric center of the bounding box
                    center_x = area["x"] + (area["w"] / 2.0)
                    center_y = area["y"] + (area["h"] / 2.0)
                    face_centers.append((center_x, center_y))

            frame_count += 1

        cap.release()

        # 3. Validation Gates
        if len(face_centers) < 3:
            raise HTTPException(status_code=400, detail="Insufficient valid face frames. Keep you face clearly in the camera.")

        # 4. Micro-Movement Variance Heuristic (Anti-Spoofing)
        # A statis printed photo held in front of a camera has virtually zero geometric variance.
        # A live human attempting to hold still naturally produces micro-movements (breathing, pulse, subtle shifts).
        centers_np = np.array(face_centers)
        variance_x = np.var(centers_np[:, 0])
        variance_y = np.var(centers_np[:, 1])
        total_variance = variance_x + variance_y

        # 5. Score calculation
        if total_variance < 1.5:
            # Rigid, mathematically perfect stillness implies a statis printed photo or paused screen
            liveness_score = 0.15
        elif total_variance > 800.0:
            # Extremely erratic movement implies shaking a photo or swiping a digital screen
            liveness_score = 0.35
        else:
            # Natural micro-movements detected within acceptable organic thresholds
            liveness_score = 0.94
        
        passed = liveness_score >= 0.80

        return {
            "livenessScore": liveness_score,
            "passed": passed,
        }
    
    except HTTPException as he:
        raise he
    except Exception as e: 
        print(f"Liveness Processing Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal liveness ML worker error.")
    finally: 
        # 6. Critical memory Management: Delete the temp file so Docker storage doesnt fill up
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)