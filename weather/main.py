import requests
import time
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()   # loads .env file

# -----------------------------
# CONFIGURATION
# -----------------------------
LATITUDE = os.getenv("LATITUDE")
LONGITUDE = os.getenv("LONGITUDE")
forecast_hours = 5
update_time=1

# -----------------------------
# FUNCTIONS
# -----------------------------
def get_current_time_str():
    """Return current local time in YYYY-MM-DDTHH:MM format"""
    now = datetime.now()
    return now.strftime("%Y-%m-%dT%H:%M")

def get_location_free(lat, lon):
    """Reverse geocoding using BigDataCloud (no API key)"""
    print("[DEBUG] Calling BigDataCloud API for location...")
    url = (
        f"https://api.bigdatacloud.net/data/reverse-geocode-client"
        f"?latitude={lat}&longitude={lon}&localityLanguage=en"
    )
    try:
        response = requests.get(url)
        print(f"[DEBUG] Location API status code: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        print(f"[DEBUG] Raw location data: {data}")

        city = data.get("city") or data.get("locality") or "Unknown"
        state = data.get("principalSubdivision") or "Unknown"
        country = data.get("countryName") or "Unknown"
        location_str = f"{city}, {state}, {country}"
        print(f"[DEBUG] Parsed location: {location_str}")
        return location_str
    except Exception as e:
        print(f"[DEBUG] Error fetching location: {e}")
        return "Unknown Location"

def get_weather():
    """Fetch weather from Open-Meteo API"""
    print("[DEBUG] Calling Open-Meteo API for weather...")
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={LATITUDE}&longitude={LONGITUDE}"
        "&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
        "&current_weather=true"
    )

    try:
        response = requests.get(url)
        print(f"[DEBUG] Weather API status code: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        print(f"[DEBUG] Raw weather data keys: {list(data.keys())}")

        # Current weather
        current = data.get("current_weather", {})
        temp = current.get("temperature")
        wind = current.get("windspeed")
        print(f"[DEBUG] Current weather data: temp={temp}, wind={wind}")

        # Current time
        current_time = get_current_time_str()

        # Get location string
        location_str = get_location_free(LATITUDE, LONGITUDE)

        # Print current weather
        print("\n📍 Location:", location_str)
        print("⏰ Current Time:", current_time)
        print(f"🌡️ Current Temp: {temp}°C")
        print(f"💨 Wind Speed: {wind} m/s")

        # Hourly forecast
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        hums = hourly.get("relative_humidity_2m", [])

        print(f"[DEBUG] Number of hourly entries: {len(times)}")

        # Find the index of current time or nearest next
        index = 0
        for i, t in enumerate(times):
            if t >= current_time:
                index = i
                break
        print(f"[DEBUG] Starting index for forecast: {index}")

        # Print next forecast_hours hours forecast
        print(f"\n⏰ Next {forecast_hours} hours forecast:")
        for i in range(index, index + forecast_hours):
            if i < len(times):
                print(f"{times[i]} → Temp: {temps[i]}°C, Humidity: {hums[i]}%")
            else:
                print(f"[DEBUG] No data for index {i}")

    except Exception as e:
        print(f"[DEBUG] Error fetching weather: {e}")

# -----------------------------
# MAIN LOOP
# -----------------------------
if __name__ == "__main__":
    while True:
        print("\n========================")
        print("[DEBUG] Starting weather update cycle...")
        get_weather()
        print("[DEBUG] Sleeping for 1 minute...\n")
        time.sleep(60*update_time)  # update_time min delay