# app/routers/audio.py

# Importing required packages
import os
import threading
import queue
import numpy as np
import sounddevice as sd
from scipy.io.wavfile import write
import datetime
import speech_recognition as sr

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from fastapi import UploadFile, File
import tempfile

# FastAPI router
router = APIRouter()


fs = 44100
block_duration = 0.1
block_size = int(fs * block_duration)

q = queue.Queue()
stream = None
streaming = False

recording_enabled = False
recorded_audio = []

recognizer = sr.Recognizer()

def audio_callback(indata, frames, time_info, status):
    if status:
        print("Audio callback status:", status)
    q.put(indata.copy())

# Function that handles audio + streaming
def audio_thread_worker():
    global stream, streaming, recording_enabled, recorded_audio
    stream = sd.InputStream(channels=1, samplerate=fs, callback=audio_callback, blocksize=block_size)
    stream.start()
    streaming = True
    print("Audio stream started")

    try:
        while streaming:
            try:
                block = q.get(timeout=1.0)
                if recording_enabled:
                    recorded_audio.append(block.copy())
            except queue.Empty:
                continue
    finally:
        if stream:
            stream.stop()
            stream.close()
        streaming = False
        print("Audio stream stopped")

# API endpoint for starting
@router.post("/start")
def start_stream():
    global streaming
    if streaming:
        return {"status": "already_running"}
    threading.Thread(target=audio_thread_worker, daemon=True).start()
    return {"status": "started"}

# API endpoint for stopping
@router.post("/stop")
def stop_stream():
    global streaming
    if not streaming:
        return {"status": "not_running"}
    streaming = False
    return {"status": "stopped"}

# API endpoint for recording
@router.post("/record")
def toggle_record():
    global recording_enabled, recorded_audio
    recording_enabled = not recording_enabled
    if recording_enabled:
        recorded_audio = []
    return {"recording": recording_enabled}