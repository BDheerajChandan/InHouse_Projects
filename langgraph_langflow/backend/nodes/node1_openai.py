# nodes/node1_openai.py
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def node1_openai(state: dict):
    # Read previous output if exists
    prompt = state.get("output") or state.get("input", "")
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
    )
    
    state["output"] = response.choices[0].message.content
    return state

NODE_FUNC = node1_openai