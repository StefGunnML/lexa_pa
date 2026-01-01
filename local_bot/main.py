import sys
import threading
import queue
import numpy as np
import pyaudio
from PyQt6.QtWidgets import QApplication, QWidget, QLabel, QVBoxLayout
from PyQt6.QtCore import Qt, pyqtSignal, QThread
from faster_whisper import WhisperModel
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
WHISPER_MODEL = os.getenv("WHISPER_MODEL_PATH", "base")
API_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")

import torch
import collections

class TranscriptionThread(QThread):
    new_text = pyqtSignal(str)
    new_advice = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
        
        # Silero VAD setup
        self.vad_model, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad',
                                              model='silero_vad',
                                              force_reload=False)
        (self.get_speech_timestamps, _, _, _, _) = utils
        
        # Circular buffer for 100ms pre-roll (1600 samples at 16kHz)
        self.pre_roll = collections.deque(maxlen=1600)
        self.audio_queue = queue.Queue()
        self.is_running = True

    def run(self):
        p = pyaudio.PyAudio()
        stream = p.open(format=pyaudio.paInt16,
                        channels=1,
                        rate=16000,
                        input=True,
                        frames_per_buffer=512) # Small buffer for low latency

        print("Listening with VAD and 100ms pre-roll...")
        audio_buffer = []
        is_speaking = False

        while self.is_running:
            data = stream.read(512)
            audio_chunk = np.frombuffer(data, np.int16).astype(np.float32) / 32768.0
            
            # Add to pre-roll
            self.pre_roll.extend(audio_chunk)
            
            # Check for speech using Silero VAD
            speech_timestamps = self.get_speech_timestamps(torch.from_numpy(audio_chunk), self.vad_model, sampling_rate=16000)
            
            if speech_timestamps:
                if not is_speaking:
                    # Start of speech: include pre-roll
                    audio_buffer.extend(list(self.pre_roll))
                    is_speaking = True
                audio_buffer.extend(audio_chunk)
            elif is_speaking:
                # End of speech: process buffer
                is_speaking = False
                if len(audio_buffer) > 16000: # Min 1s of audio
                    segments, _ = self.model.transcribe(np.array(audio_buffer), beam_size=5)
                    for segment in segments:
                        text = segment.text.strip()
                        if text:
                            self.new_text.emit(text)
                            self.get_positioning_advice(text)
                audio_buffer = []

    def get_positioning_advice(self, text):
        """
        Listen to SSE stream for character-by-character updates.
        Handles [CONFLICT] signal for playbook violations.
        """
        try:
            with httpx.stream("POST", f"{API_URL}/meeting/positioning", json={"text": text}, timeout=None) as response:
                current_advice = ""
                is_conflict = False
                for line in response.iter_lines():
                    if line.startswith("data: "):
                        token = line[6:].strip()
                        if token == "[DONE]":
                            break
                        if token == "[CONFLICT]":
                            is_conflict = True
                            continue
                        current_advice += " " + token
                        self.new_advice.emit(json.dumps({"text": current_advice.strip(), "is_conflict": is_conflict}))
        except Exception as e:
            print(f"Error getting streaming advice: {e}")

class OverlayWindow(QWidget):
    # ... existing code ...

    def update_advice(self, data_json):
        data = json.loads(data_json)
        text = data["text"]
        is_conflict = data["is_conflict"]
        
        self.advice_label.setText(text)
        if is_conflict:
            self.advice_label.setStyleSheet("color: #ff0000; font-weight: bold; font-size: 16px; background-color: rgba(0, 0, 0, 180); padding: 5px; border-radius: 5px; border: 2px solid red;")
        else:
            self.advice_label.setStyleSheet("color: #00ff00; font-weight: bold; font-size: 16px; background-color: rgba(0, 0, 0, 180); padding: 5px; border-radius: 5px;")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    overlay = OverlayWindow()
    overlay.show()

    thread = TranscriptionThread()
    thread.new_text.connect(overlay.update_transcript)
    thread.new_advice.connect(overlay.update_advice)
    thread.start()

    sys.exit(app.exec())

