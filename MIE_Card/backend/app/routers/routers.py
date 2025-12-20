# app/routers/routers.py

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List, Optional
import shutil
import os
from datetime import datetime
import uuid

router = APIRouter(prefix="/api", tags=["Media Upload"])

UPLOAD_DIR = "uploads"
PHOTOS_DIR = os.path.join(UPLOAD_DIR, "photos")
BACKGROUNDS_DIR = os.path.join(UPLOAD_DIR, "backgrounds")
MUSIC_DIR = os.path.join(UPLOAD_DIR, "music")
VIDEOS_DIR = os.path.join(UPLOAD_DIR, "videos")

# Create all directories
for directory in [PHOTOS_DIR, BACKGROUNDS_DIR, MUSIC_DIR, VIDEOS_DIR]:
    os.makedirs(directory, exist_ok=True)


def save_file(file: UploadFile, directory: str) -> dict:
    """Helper function to save uploaded files"""
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(directory, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return file info
        return {
            "original_name": file.filename,
            "saved_name": unique_filename,
            "path": file_path,
            "url": f"/uploads/{os.path.basename(directory)}/{unique_filename}",
            "size": os.path.getsize(file_path),
            "uploaded_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")


# 1️⃣ Upload two photos
@router.post("/upload/photos")
async def upload_photos(files: List[UploadFile] = File(...)):
    """Upload exactly two photos for the card"""
    if len(files) != 2:
        raise HTTPException(
            status_code=400, 
            detail="Exactly two photos are required."
        )
    
    # Validate file types
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    for file in files:
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Allowed: JPEG, PNG, GIF"
            )
    
    uploaded_files = []
    for file in files:
        file_info = save_file(file, PHOTOS_DIR)
        uploaded_files.append(file_info)
    
    return {
        "success": True,
        "message": "Photos uploaded successfully!",
        "files": uploaded_files
    }


# 2️⃣ Upload background image
@router.post("/upload/background-image")
async def upload_background_image(file: UploadFile = File(...)):
    """Upload a background image"""
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: JPEG, PNG, GIF"
        )
    
    file_info = save_file(file, BACKGROUNDS_DIR)
    
    return {
        "success": True,
        "message": "Background image uploaded successfully!",
        "file": file_info
    }


# 3️⃣ Upload background music
@router.post("/upload/background-music")
async def upload_background_music(file: UploadFile = File(...)):
    """Upload background music file"""
    allowed_types = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: MP3, WAV, OGG"
        )
    
    file_info = save_file(file, MUSIC_DIR)
    
    return {
        "success": True,
        "message": "Background music uploaded successfully!",
        "file": file_info
    }


# 4️⃣ Upload background video
@router.post("/upload/background-video")
async def upload_background_video(file: UploadFile = File(...)):
    """Upload a background video"""
    allowed_types = ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: MP4, MPEG, MOV, WEBM"
        )
    
    file_info = save_file(file, VIDEOS_DIR)
    
    return {
        "success": True,
        "message": "Background video uploaded successfully!",
        "file": file_info
    }


# 4️⃣ Submit description - UPDATED WITH NEW FIELDS
@router.post("/description")
async def add_description(
    venue: str = Form(...),
    location_address: str = Form(None),  # NEW: Physical address
    location_maps_url: str = Form(None),  # NEW: Google Maps URL
    date_and_time: str = Form(...),
    summary: str = Form(...),
    message: str = Form(None),  # Gap box message (optional)
    arrow_direction: Optional[str] = Form(None)
):
    """Add event description with venue, address, maps URL, date/time, summary, message, and arrow"""
    return {
        "success": True,
        "message": "Description saved successfully!",
        "data": {
            "venue": venue,
            "location_address": location_address,  # NEW
            "location_maps_url": location_maps_url,  # NEW
            "date_and_time": date_and_time,
            "summary": summary,
            "message": message,
            "arrow_direction": arrow_direction,
            "created_at": datetime.now().isoformat()
        }
    }


# 5️⃣ Upload background video
@router.post("/upload/background-video")
async def upload_background_video(file: UploadFile = File(...)):
    """Upload a background video"""
    allowed_types = ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: MP4, MPEG, MOV, WEBM"
        )
    
    file_info = save_file(file, VIDEOS_DIR)
    
    return {
        "success": True,
        "message": "Background video uploaded successfully!",
        "file": file_info
    }


# 🔍 Get all uploaded files
@router.get("/files")
async def get_all_files():
    """Get list of all uploaded files"""
    files = {
        "photos": os.listdir(PHOTOS_DIR),
        "backgrounds": os.listdir(BACKGROUNDS_DIR),
        "music": os.listdir(MUSIC_DIR),
        "videos": os.listdir(VIDEOS_DIR)
    }
    return {
        "success": True,
        "files": files
    }


# 🗑️ Delete file endpoint (optional)
@router.delete("/files/{file_type}/{filename}")
async def delete_file(file_type: str, filename: str):
    """Delete a specific file"""
    type_dirs = {
        "photos": PHOTOS_DIR,
        "backgrounds": BACKGROUNDS_DIR,
        "music": MUSIC_DIR,
        "videos": VIDEOS_DIR
    }
    
    if file_type not in type_dirs:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    file_path = os.path.join(type_dirs[file_type], filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {
            "success": True,
            "message": f"File {filename} deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")