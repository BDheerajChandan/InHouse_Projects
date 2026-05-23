import json
import logging
import re
from typing import Any, Dict, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

async def call_llm(prompt: str, llm_provider: str = None, system_prompt: str = None, temperature: float = 0.7) -> str:
    """Unified LLM caller supporting OpenAI, Claude, Gemini, Groq."""
    provider = llm_provider or settings.DEFAULT_LLM
    logger.info(f"Calling LLM provider: {provider}")

    try:
        if provider == "openai":
            return await _call_openai(prompt, system_prompt, temperature)
        elif provider == "claude":
            return await _call_claude(prompt, system_prompt, temperature)
        elif provider == "gemini":
            return await _call_gemini(prompt, system_prompt, temperature)
        elif provider == "groq":
            return await _call_groq(prompt, system_prompt, temperature)
        else:
            return await _call_openai(prompt, system_prompt, temperature)
    except Exception as e:
        logger.error(f"LLM call failed for {provider}: {e}")
        # Fallback
        try:
            return await _call_openai(prompt, system_prompt, temperature)
        except:
            return "{}"

async def _call_openai(prompt: str, system_prompt: str = None, temperature: float = 0.7) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=temperature,
        response_format={"type": "json_object"} if "JSON" in prompt else None,
    )
    return response.choices[0].message.content

async def _call_claude(prompt: str, system_prompt: str = None, temperature: float = 0.7) -> str:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    kwargs = {
        "model": settings.CLAUDE_MODEL,
        "max_tokens": 4096,
        "temperature": temperature,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system_prompt:
        kwargs["system"] = system_prompt
    response = await client.messages.create(**kwargs)
    return response.content[0].text

async def _call_gemini(prompt: str, system_prompt: str = None, temperature: float = 0.7) -> str:
    import google.generativeai as genai
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
    response = await model.generate_content_async(full_prompt)
    return response.text

async def _call_groq(prompt: str, system_prompt: str = None, temperature: float = 0.7) -> str:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=temperature,
    )
    return response.choices[0].message.content

def parse_json_response(text: str) -> Dict[str, Any]:
    """Safely parse JSON from LLM response."""
    try:
        # Try direct parse
        return json.loads(text)
    except:
        pass
    try:
        # Extract JSON block
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except:
        pass
    logger.warning("Could not parse JSON response, returning empty dict")
    return {}