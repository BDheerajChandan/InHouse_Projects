import requests
from dotenv import load_dotenv
import os

load_dotenv()   # loads .env file

LATITUDE = os.getenv("LATITUDE")
LONGITUDE = os.getenv("LONGITUDE")

def get_location_free(lat, lon):
    url = (
        f"https://api.bigdatacloud.net/data/reverse-geocode-client"
        f"?latitude={lat}&longitude={lon}&localityLanguage=en"
    )
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print(data.keys())
        city = data.get("city") or data.get("locality") or "Unknown"
        state = data.get("principalSubdivision") or "Unknown"
        country = data.get("countryName") or "Unknown"
        locality = data.get('locality') or "Unknown"
        postcode = data.get('postcode') or "Unknown"
        return f"{locality}-CODE: {postcode},{city}, {state}, {country}"
    except Exception as e:
        return f"Error fetching location: {e}"

if __name__ == "__main__":
    location = get_location_free(LATITUDE, LONGITUDE)
    print("📍 Location:", location)
