import requests
import time
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()   # loads .env file

LATITUDE = os.getenv("LATITUDE")
LONGITUDE = os.getenv("LONGITUDE")


def get_current_time_str():
    """Return current time in YYYY-MM-DDTHH:MM format"""
    now = datetime.now()
    return now.strftime("%Y-%m-%dT%H:%M")

def get_weather():
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={LATITUDE}&longitude={LONGITUDE}"
        "&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
        "&current_weather=true"
    )

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        # Extract current conditions
        current = data.get("current_weather", {})
        temp = current.get("temperature")  # correct key
        wind = current.get("windspeed")    # correct key

        print("\n📍 Current Time:", get_current_time_str())
        print(f"🌡️ Current Temp: {temp}°C")
        print(f"💨 Wind Speed: {wind} m/s")

        # Hourly forecast
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        hums = hourly.get("relative_humidity_2m", [])

        # Find the index of the current time or next closest
        current_time = get_current_time_str()
        index = 0
        for i, t in enumerate(times):
            if t >= current_time:
                index = i
                break

        # Print next 5 hours from current time
        print("\n⏰ Next 5 hours forecast:")
        for i in range(index, index + 5):
            if i < len(times):
                print(f"{times[i]} → Temp: {temps[i]}°C, Humidity: {hums[i]}%")

    except Exception as e:
        print("Error fetching weather:", e)


if __name__ == "__main__":
    while True:
        get_weather()
        time.sleep(60 * 1)  # 1 min delay
