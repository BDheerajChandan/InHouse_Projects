import sounddevice as sd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.widgets import Button
import queue
import threading
import speech_recognition as sr
import warnings
import sys
import datetime
import os
import platform
import subprocess
from scipy.io.wavfile import write

warnings.filterwarnings("ignore")

# Audio parameters
fs = 44100
block_duration = 0.1
block_size = int(fs * block_duration)

# Display buffer
window_duration = 60
buffer_size = int(fs * window_duration)

# Y-axis range
ymin = -15
ymax = 15

# Global variables
q = queue.Queue()
recognized_text = ""
recognizer = sr.Recognizer()
audio_buffer = np.zeros(buffer_size)

recording_enabled = False
recorded_audio = []

stream = None
ani = None
streaming = False

def audio_callback(indata, frames, time_info, status):
    if status:
        print(status)
    q.put(indata.copy())

def recognize_speech(audio_data):
    global recognized_text
    try:
        audio = sr.AudioData(audio_data.tobytes(), fs, 2)
        text = recognizer.recognize_google(audio)
        recognized_text = text
    except sr.UnknownValueError:
        pass
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")

# Plot setup
fig, ax = plt.subplots()
plt.subplots_adjust(bottom=0.35)

x = np.linspace(-window_duration, 0, buffer_size)
line, = ax.plot(x, np.zeros(buffer_size))
ax.set_ylim(ymin, ymax)
ax.set_xlim(-window_duration, 0)
ax.set_title("Live audio amplitude - Recognized: ")
ax.set_xlabel("Time (seconds)")
ax.set_ylabel("Amplitude")

def update(frame):
    global recognized_text, audio_buffer, recorded_audio

    if not streaming:
        return line,

    try:
        while True:
            audio_block = q.get_nowait()
            audio_mono = audio_block[:, 0]

            audio_buffer = np.roll(audio_buffer, -len(audio_mono))
            audio_buffer[-len(audio_mono):] = audio_mono * ymax

            amplitude = np.max(np.abs(audio_mono))
            if amplitude > 0.02:
                threading.Thread(target=recognize_speech, args=(audio_block,), daemon=True).start()
            else:
                recognized_text = ""

            if recording_enabled:
                recorded_audio.append(audio_block.copy())
    except queue.Empty:
        pass

    line.set_ydata(audio_buffer)
    ax.set_title(f"Live audio amplitude - Recognized: {recognized_text}")
    return line,

def start(event):
    global stream, ani, streaming
    if streaming:
        return
    print("Starting audio stream and animation...")
    streaming = True
    stream = sd.InputStream(channels=1, samplerate=fs, callback=audio_callback, blocksize=block_size)
    stream.start()
    ani.event_source.start()

def stop(event):
    global stream, streaming
    if not streaming:
        return
    print("Stopping audio stream and animation...")
    streaming = False
    if stream:
        stream.stop()
        stream.close()
        stream = None
    ani.event_source.stop()

def terminate(event):
    print("Terminating program...")
    stop(event)
    plt.close(fig)
    sys.exit(0)

def toggle_record(event):
    global recording_enabled, recorded_audio
    recording_enabled = not recording_enabled
    if recording_enabled:
        print("Recording started.")
        recorded_audio = []
        btn_record.label.set_text("Recording...")
    else:
        print("Recording stopped.")
        btn_record.label.set_text("Record")

def download_audio(event):
    global recorded_audio
    if not recorded_audio:
        print("No audio recorded to download.")
        return

    # Concatenate and normalize
    audio_concat = np.concatenate(recorded_audio)
    audio_normalized = np.int16(audio_concat * 32767)

    folder_name = "recordings"
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
        print(f"Created folder: {folder_name}")

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    wav_path = f"{folder_name}/recording_{timestamp}.wav"

    try:
        write(wav_path, fs, audio_normalized)
        print(f"WAV audio saved as: {wav_path}")

        # # Optional: Auto-play the file
        # if platform.system() == "Windows":
        #     os.startfile(wav_path)
        # elif platform.system() == "Darwin":  # macOS
        #     subprocess.call(["open", wav_path])
        # else:  # Linux
        #     subprocess.call(["xdg-open", wav_path])

    except Exception as e:
        print(f"Failed to save or play WAV: {e}")

# --- Buttons ---
ax_start = plt.axes([0.05, 0.2, 0.18, 0.06])
btn_start = Button(ax_start, 'Start')
btn_start.on_clicked(start)

ax_stop = plt.axes([0.28, 0.2, 0.18, 0.06])
btn_stop = Button(ax_stop, 'Stop')
btn_stop.on_clicked(stop)

ax_terminate = plt.axes([0.51, 0.2, 0.18, 0.06])
btn_terminate = Button(ax_terminate, 'Terminate')
btn_terminate.on_clicked(terminate)

ax_record = plt.axes([0.74, 0.2, 0.2, 0.06])
btn_record = Button(ax_record, 'Record')
btn_record.on_clicked(toggle_record)

ax_download = plt.axes([0.35, 0.1, 0.3, 0.06])
btn_download = Button(ax_download, 'Download')
btn_download.on_clicked(download_audio)

# Animation
ani = FuncAnimation(fig, update, interval=int(block_duration * 1000))
ani.event_source.stop()

def main():
    plt.show()

if __name__ == "__main__":
    main()
