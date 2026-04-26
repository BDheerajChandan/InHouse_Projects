#  led.py

from fastapi import APIRouter
from app.core.serial_connection import send_command

router = APIRouter(prefix="/led", tags=["LED"])


@router.get("/on")
def led_on():
    if send_command("ON"):
        return {"status": "LED ON"}
    print("LED ON")
    return {"error": "Arduino not connected"}


@router.get("/off")
def led_off():
    if send_command("OFF"):
        return {"status": "LED OFF"}
    print("LED OFF")
    return {"error": "Arduino not connected"}