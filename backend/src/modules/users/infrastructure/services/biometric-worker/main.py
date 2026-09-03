import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from deepface import DeepFace

app = FastAPI(title="Biometric ML Worker")

# Pre-load the model to prevent a delay on the very first request
@app.on_event("startup")
def load_models():
    print("Loading FaceNet512 model into memory...")
    DeepFace.build_model("Facenet512")

@app.post("/extract-embedding")
async def extract_embedding(file: UploadFile = File(...)):
    try:
        # Read the raw multipart buffer sent by NestJs
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format.")

        # Extract the 512-dimension vector
        # enforce_detection=True throws an error if not face is found.
        # retainaface is highly accurate and provides a reliable confidence score.
        results = DeepFace.represent(
            img_path=img, 
            model_name="Facenet512", 
            detector_backend="mtcnn",
            enforce_detection=True
        )

        # DeepFace returns a list of faces. We grab the primary face.
        face_data = results[0]

        # Retainaface = returns confidence as a float (eg: 0.998).
        # Convert to 0-100 scale.
        raw_confidence = face_data.get("face_confidence", 0.0)
        confidence_score = round(raw_confidence * 100, 2)

        return {
            "confidence": confidence_score,
            "faceEmbedding": face_data["embedding"]
        }

    except ValueError: 
        # DeepFace raises a ValueError when enforce_detection fails to find a face
        raise HTTPException(status_code=400, detail="Face not found or cloud not be detected clearly.")
    except Exception as e: 
        print(f"Extraction Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal ML worker error")