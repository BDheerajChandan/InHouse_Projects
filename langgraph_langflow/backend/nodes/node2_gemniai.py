# nodes/node2_gemniai.py
import os
from dotenv import load_dotenv
from google.genai import Client

load_dotenv()
client = Client(api_key=os.getenv("GEMINI_API_KEY"))

def node2_gemniai(state: dict):
    # Read previous output if exists
    prompt = state.get("output") or state.get("input", "")
    
    # Correct Gemini API call
    response = client.models.generate_content(
        model="gemini-2.5-flash",  # correct model name
        contents=prompt
    )
    
    state["output"] = response.text
    return state

NODE_FUNC = node2_gemniai