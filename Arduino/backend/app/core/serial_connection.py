# serial_connection.py

import serial
import time

ARDUINO_PORT = "COM7"   # ⚠️ change if needed
BAUD_RATE = 9600

try:
    arduino = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)
    print("✅ Arduino Connected")
except Exception as e:
    print("❌ Arduino not connected:", e)
    arduino = None


def send_command(command: str):
    print("command : ",command)
    if arduino:
        arduino.write(f"{command}\n".encode())
        print("True")
        return True
    print("False")
    return False