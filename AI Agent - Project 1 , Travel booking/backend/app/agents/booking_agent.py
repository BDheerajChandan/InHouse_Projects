# # agents/booking_agent.py
# """
# agents/booking_agent.py
# =======================
# LLM-powered AI Booking Agent — NO re module used anywhere.

# Flow:
#   User message
#     ├─► Greeting/chitchat detector  →  warm human reply (no LLM cost)
#     └─► LLM call (OpenAI / Gemini)
#           └─► JSON { "tool": "...", "arguments": {...} }
#                 └─► dispatch_tool()  →  PostgreSQL  →  response

# Supports:
#   • Multi-vehicle booking: "Book train and flight from X to Y"
#   • Update by route (no ID): "Update train from X to Y on D1 to D2"
#   • Update by ID: "Update booking #3 date to 27 April"
#   • Show history with filters
#   • Delete booking
#   • Friendly human responses for greetings

# OpenAI proxy fix (openai==1.30.1 + httpx>0.26.0):
#   Mode 1: SDK + explicit httpx.Client (blocks proxy injection)
#   Mode 2: Raw httpx POST fallback (bypasses SDK entirely)
# """
# from __future__ import annotations

# import json
# from datetime import datetime, date
# from app.core.config import settings
# from app.agents.tools import dispatch_tool

# # ─────────────────────────────────────────────────────────────────
# #  Dynamic system prompt — built from .env at startup
# # ─────────────────────────────────────────────────────────────────
# _VEHICLES    = " | ".join(settings.VEHICLE_TABLES)
# _HISTORY_TBL = settings.TABLE_NAME
# _TODAY       = date.today().strftime("%Y-%m-%d")

# SYSTEM_PROMPT = f"""
# You are an AI Travel Booking Agent connected to a PostgreSQL database.
# Today's date: {_TODAY}
# Available vehicle types: {_VEHICLES}
# Combined history table: {_HISTORY_TBL}

# ================================================================
# TOOLS YOU MUST USE
# ================================================================

# 1. create_booking
#    USE WHEN: user wants to BOOK / RESERVE / BUY any ticket(s)
#    SUPPORTS: single vehicle OR multiple vehicles in one request
#    ARGUMENTS:
#      vehicles    : list[string]  — e.g. ["train"] or ["train","flight"]
#      source      : string        — departure city/station
#      destination : string        — arrival city/station
#      date        : string|null   — YYYY-MM-DD (or null if not mentioned)

# 2. get_travel_history
#    USE WHEN: user wants to SEE / SHOW / LIST / DISPLAY bookings
#    ARGUMENTS:
#      vehicle    : string|null  — filter by vehicle type (or null for all)
#      start_date : string|null  — YYYY-MM-DD from date (or null)
#      end_date   : string|null  — YYYY-MM-DD to date (or null)

# 3. update_booking_by_id
#    USE WHEN: user mentions a specific booking NUMBER/ID
#    ARGUMENTS:
#      booking_id : integer  — the numeric booking ID
#      vehicle    : string   — vehicle type
#      field      : string   — "from" | "to" | "travel_date" | "status"
#      value      : string   — new value

# 4. update_booking_by_query
#    USE WHEN: user wants to UPDATE/CHANGE/RESCHEDULE without giving a booking ID
#    EXAMPLES:
#      "Update train from VSKP to BBSR on 25th March to 27th March"
#      "Reschedule my Mumbai flight to next Monday"
#      "Change the date of bus from Hyd to Blr from 1st April to 5th April"
#    ARGUMENTS:
#      vehicle         : string       — vehicle type
#      field           : string       — what to change: "from"|"to"|"travel_date"|"status"
#      value           : string       — new value for that field
#      source          : string|null  — current from_loc filter (or null)
#      destination     : string|null  — current to_loc filter (or null)
#      current_date    : string|null  — current travel_date filter YYYY-MM-DD (or null)

# 5. delete_booking
#    USE WHEN: user wants to CANCEL / DELETE / REMOVE a booking by ID
#    ARGUMENTS:
#      booking_id : integer      — numeric booking ID
#      vehicle    : string|null  — vehicle type (or null)

# ================================================================
# STRICT RESPONSE FORMAT — RETURN ONLY THIS JSON, NOTHING ELSE:
# ================================================================
# {{
#   "tool": "<tool_name>",
#   "arguments": {{ ... }}
# }}

# ================================================================
# CITY ABBREVIATIONS — AUTO EXPAND BEFORE USING
# ================================================================
# bbsr / bbs           → Bhubaneswar
# vskp / vizag         → Visakhapatnam
# hyd                  → Hyderabad
# blr / bengaluru      → Bangalore
# maa / mas / chennai  → Chennai
# del / ndls / delhi   → New Delhi
# bom / cst / mumbai   → Mumbai
# kol / ccl / kolkata  → Kolkata
# pune / pnq           → Pune
# cbe                  → Coimbatore
# tvc                  → Thiruvananthapuram

# ================================================================
# DATE RULES
# ================================================================
# Always output dates as YYYY-MM-DD strings:
#   "25th March 2026"  → "2026-03-25"
#   "27th April 2026"  → "2026-04-27"
#   "tomorrow"         → one day after {_TODAY}
#   "next Monday"      → next Monday from {_TODAY}
# If no date is mentioned, use null.

# ================================================================
# DECISION RULES
# ================================================================
# - "book train and flight..."  → create_booking with vehicles: ["train","flight"]
# - "book train..."             → create_booking with vehicles: ["train"]
# - "show/list/display..."      → get_travel_history
# - "update/change/reschedule" + ID present  → update_booking_by_id
# - "update/change/reschedule" + no ID       → update_booking_by_query
# - "cancel/delete/remove..."   → delete_booking
# - NEVER generate raw SQL in arguments
# - Return ONLY the JSON object. No explanation. No preamble.
# """


# # ─────────────────────────────────────────────────────────────────
# #  Greeting / chitchat detection — pure string matching, no re
# # ─────────────────────────────────────────────────────────────────

# _GREETING_KEYWORDS = {
#     "hi", "hello", "hey", "howdy", "hiya", "yo", "namaste", "greetings",
#     "good morning", "good afternoon", "good evening", "good night", "good day",
#     "how are you", "how r u", "are you there",
#     "thanks", "thank you", "thank u", "thx", "ty", "cheers",
#     "bye", "goodbye", "see you", "cya", "later",
#     "ok", "okay", "cool", "nice", "great", "awesome", "wow",
#     "who are you", "what are you", "what can you do",
#     "help me", "help",
#     "what's up", "whats up", "sup",
# }


# def _is_greeting(text: str) -> bool:
#     """
#     Detect greetings using simple string matching — no regex.
#     Returns True only for messages that contain ONLY a greeting
#     (not mixed with a travel request).
#     """
#     normalised = text.strip().rstrip("!?.").strip()
#     result = normalised in _GREETING_KEYWORDS
#     print(f"[Agent] 🔎 Greeting check: {normalised!r} → {result}")
#     return result
 
 
# def _human_response(text: str) -> dict:
#     """Return a warm, time-aware, human-like reply for greetings."""
#     hour       = datetime.now().hour
#     lower_text = text.strip()
 
#     if   hour < 12: time_greet = "Good morning"
#     elif hour < 17: time_greet = "Good afternoon"
#     else:           time_greet = "Good evening"
 
#     provider = "OpenAI GPT" if settings.LLM_PROVIDER == "openai" else "Google Gemini"
 
#     print(f"[Agent] 💬 Generating human reply for: {lower_text!r}")
 
#     if "good morning" in lower_text:
#         reply = (
#             f"Good morning! 🌅 What a great time to plan a trip! "
#             f"I'm your AI Travel Booking Agent — ready to book trains 🚆, buses 🚌, "
#             f"flights ✈️, cars 🚗 and bikes 🏍️. What can I arrange for you today?"
#         )
#     elif "good afternoon" in lower_text:
#         reply = (
#             f"Good afternoon! ☀️ Hope your day is going well! "
#             f"Ready to book your next journey? Just tell me where you'd like to go!"
#         )
#     elif "good evening" in lower_text:
#         reply = (
#             f"Good evening! 🌆 Perfect time to plan tomorrow's travel. "
#             f"I can book tickets, show your history, or update any booking. What do you need?"
#         )
#     elif "good night" in lower_text:
#         reply = (
#             f"Good night! 🌙 Need a quick booking before you rest? "
#             f"I'm here whenever you need me. Sweet dreams! ✨"
#         )
#     elif "how are you" in lower_text or "how r u" in lower_text:
#         reply = (
#             f"{time_greet}! 😊 I'm doing perfectly well, thank you for asking! "
#             f"Always ready to help with your travel bookings. "
#             f"Shall we plan your next trip?"
#         )
#     elif "who are you" in lower_text or "what are you" in lower_text:
#         reply = (
#             f"{time_greet}! 🤖 I'm your **AI Travel Booking Agent**, powered by {provider}.\n\n"
#             f"Here's what I can do for you:\n"
#             f"🎫 **Book tickets** — trains, buses, flights, cars, bikes\n"
#             f"📋 **View history** — all bookings with date filters\n"
#             f"✏️ **Update bookings** — by ID or by route\n"
#             f"🗑️ **Cancel bookings** — by booking ID\n\n"
#             f"Just speak naturally — I'll understand!\n"
#             f"Example: *\"Book a train from BBSR to VSKP on 25th March 2026\"*"
#         )
#     elif "what can you do" in lower_text or "help me" in lower_text or lower_text == "help":
#         reply = (
#             f"{time_greet}! 👋 Here's everything I can do:\n\n"
#             f"🎫 **Book** — *\"Book a train from BBSR to VSKP on 25 March\"*\n"
#             f"✈️ **Multi-book** — *\"Book train and flight from VSKP to BBSR on 25 March\"*\n"
#             f"📋 **View history** — *\"Show all my flight bookings\"*\n"
#             f"🔍 **Filter history** — *\"Show train bookings between Jan 1 and Jun 30\"*\n"
#             f"✏️ **Update by route** — *\"Update train from VSKP to BBSR on 25 March to 27 March\"*\n"
#             f"✏️ **Update by ID** — *\"Update booking #3 date to 27 April\"*\n"
#             f"🗑️ **Cancel** — *\"Cancel booking #5\"*\n\n"
#             f"I understand natural language — just tell me what you need!"
#         )
#     elif any(w in lower_text for w in ("thanks", "thank you", "thank u", "thx", "ty", "cheers")):
#         reply = (
#             f"You're very welcome! 😊 "
#             f"Happy to help anytime. Safe travels! ✈️"
#         )
#     elif any(w in lower_text for w in ("bye", "goodbye", "see you", "cya", "later")):
#         reply = (
#             f"Goodbye! 👋 Safe travels and have an amazing journey! "
#             f"Come back anytime you need to book a trip. ✈️🚆🚗"
#         )
#     elif any(w in lower_text for w in ("hi", "hello", "hey", "howdy", "hiya", "yo", "namaste", "greetings")):
#         reply = (
#             f"{time_greet}! 👋 Welcome to your AI Travel Booking Agent!\n\n"
#             f"I can book 🚆 trains, 🚌 buses, ✈️ flights, 🚗 cars, and 🏍️ bikes.\n"
#             f"Try: *\"Book a train from BBSR to VSKP on 25th March 2026\"*"
#         )
#     elif any(w in lower_text for w in ("ok", "okay", "cool", "nice", "great", "awesome", "wow")):
#         reply = (
#             f"Great! 😄 Let me know whenever you're ready to book "
#             f"or manage your travel!"
#         )
#     else:
#         reply = (
#             f"{time_greet}! 👋 I'm your AI Travel Booking Agent. "
#             f"I handle bookings for trains, buses, flights, cars and bikes. "
#             f"What can I help you with today?"
#         )
 
#     print(f"[Agent] 💬 Reply: {reply[:100]}...")
#     return {
#         "success":     True,
#         "message":     reply,
#         "tool_called": "chitchat",
#         "arguments":   {"input": text},
#     }
 
 
# # ─────────────────────────────────────────────────────────────────
# #  JSON extractor — no regex
# # ─────────────────────────────────────────────────────────────────
 
# def _extract_json(text: str) -> dict:
#     """
#     Extract the first complete JSON object from LLM output.
#     Uses brace-counting instead of regex.
#     Handles markdown fences and leading/trailing text.
#     """
#     print(f"[Agent] 🔍 Parsing LLM output ({len(text)} chars): {text[:120]!r}")
 
#     # Strip markdown fences manually (no regex)
#     cleaned = text.strip()
#     for fence in ("```json", "```JSON", "```"):
#         cleaned = cleaned.replace(fence, "")
#     cleaned = cleaned.strip().strip("`").strip()
 
#     # Find opening brace
#     start = cleaned.find("{")
#     if start == -1:
#         raise ValueError(
#             f"No '{{' found in LLM output.\n"
#             f"Full output: {cleaned[:500]}"
#         )
 
#     # Walk to find matching closing brace
#     depth = 0
#     end   = -1
#     for i, ch in enumerate(cleaned[start:], start=start):
#         if   ch == "{": depth += 1
#         elif ch == "}":
#             depth -= 1
#             if depth == 0:
#                 end = i + 1
#                 break
 
#     if end == -1:
#         raise ValueError(
#             f"Unmatched braces in LLM output.\n"
#             f"Full output: {cleaned[:500]}"
#         )
 
#     json_str = cleaned[start:end]
#     print(f"[Agent] ✅ Extracted JSON: {json_str}")
#     return json.loads(json_str)
 
 
# # ─────────────────────────────────────────────────────────────────
# #  LLM callers
# # ─────────────────────────────────────────────────────────────────
 
# def _call_openai(user_message: str) -> str:
#     """
#     Call OpenAI Chat Completions API.
 
#     Proxy-safe:
#       Mode 1 → SDK + explicit httpx.Client (prevents 'proxies' TypeError)
#       Mode 2 → Raw httpx POST (full SDK bypass fallback)
#     """
#     api_key  = settings.OPENAI_API_KEY
#     model    = settings.OPENAI_MODEL
#     messages = [
#         {"role": "system", "content": SYSTEM_PROMPT},
#         {"role": "user",   "content": user_message},
#     ]
 
#     print(f"[LLM] 🤖 OpenAI | model={model}")
 
#     # Mode 1 ── SDK with explicit clean httpx.Client ───────────────
#     try:
#         import httpx
#         from openai import OpenAI
 
#         print("[LLM] 📡 Mode 1: SDK with explicit httpx.Client ...")
#         http = httpx.Client(
#             timeout=httpx.Timeout(connect=5.0, read=30.0, write=8.0, pool=5.0),
#             follow_redirects=True,
#         )
#         client = OpenAI(api_key=api_key, http_client=http)
#         resp   = client.chat.completions.create(
#             model           = model,
#             messages        = messages,
#             temperature     = 0,
#             max_tokens      = 150,   # JSON tool call is never > 150 tokens
#             response_format = {"type": "json_object"},
#         )
#         content = resp.choices[0].message.content
#         print(f"[LLM] ✅ Mode 1 success | tokens={resp.usage.total_tokens}")
#         return content
 
#     except TypeError as te:
#         if "proxies" in str(te) or "unexpected keyword" in str(te):
#             print(f"[LLM] ⚠️  SDK TypeError ({te}) → switching to Mode 2")
#         else:
#             print(f"[LLM] ❌ Unexpected TypeError: {te}")
#             raise
#     except Exception as exc:
#         print(f"[LLM] ❌ Mode 1 error: {type(exc).__name__}: {exc}")
#         raise
 
#     # Mode 2 ── Raw httpx POST (SDK bypassed) ─────────────────────
#     import httpx
 
#     print("[LLM] 📡 Mode 2: Raw httpx POST → api.openai.com ...")
#     payload = {
#         "model":           model,
#         "temperature":     0,
#         "max_tokens":      150,
#         "response_format": {"type": "json_object"},
#         "messages":        messages,
#     }
#     with httpx.Client(timeout=35.0) as cl:
#         r = cl.post(
#             "https://api.openai.com/v1/chat/completions",
#             headers={
#                 "Authorization": f"Bearer {api_key}",
#                 "Content-Type":  "application/json",
#             },
#             json=payload,
#         )
#         print(f"[LLM] 📶 HTTP {r.status_code}")
#         r.raise_for_status()
#         content = r.json()["choices"][0]["message"]["content"]
#         print(f"[LLM] ✅ Mode 2 success ({len(content)} chars)")
#         return content
 
 
# def _call_gemini(user_message: str) -> str:
#     """Call Google Gemini with JSON output enforced."""
#     import google.generativeai as genai
 
#     print(f"[LLM] 🤖 Gemini | model={settings.GEMINI_MODEL}")
#     genai.configure(api_key=settings.GEMINI_API_KEY)
 
#     model = genai.GenerativeModel(
#         model_name         = settings.GEMINI_MODEL,
#         system_instruction = SYSTEM_PROMPT,
#         generation_config  = {
#             "response_mime_type": "application/json",
#             "temperature":        0,
#         },
#     )
#     resp    = model.generate_content(user_message)
#     content = resp.text
#     print(f"[LLM] ✅ Gemini success ({len(content)} chars)")
#     return content
 
 
# # ─────────────────────────────────────────────────────────────────
# #  Main entry point
# # ─────────────────────────────────────────────────────────────────
 
# def run_agent(user_message: str) -> dict:
#     """
#     Full agent pipeline:
#       0. Greeting detection → instant warm reply (no LLM API call)
#       1. Call LLM (OpenAI or Gemini)
#       2. Extract JSON { tool, arguments }
#       3. Dispatch to tool → execute PostgreSQL operations
#       4. Return result dict to router
#     """
#     print(f"\n{'='*60}")
#     print(f"[Agent] 📨 Message  : {user_message!r}")
#     print(f"[Agent] ⚙️  Provider : {settings.LLM_PROVIDER.upper()}")
#     print(f"[Agent] 🗄️  DB       : {settings.DB_NAME} | Table: {settings.TABLE_NAME}")
#     print(f"{'='*60}")
 
#     # Step 0 — Greeting shortcut ───────────────────────────────────
#     if _is_greeting(user_message):
#         result = _human_response(user_message)
#         print(f"[Agent] 💬 Greeting handled instantly (no LLM call)")
#         return result
 
#     # Step 1 — LLM call ────────────────────────────────────────────
#     provider = settings.LLM_PROVIDER.strip()
#     try:
#         print(f"[Agent] 🚀 Sending to {provider.upper()} ...")
#         if   provider == "openai": raw = _call_openai(user_message)
#         elif provider == "gemini": raw = _call_gemini(user_message)
#         else:
#             raise ValueError(
#                 f"Unknown LLM_PROVIDER='{provider}'. "
#                 f"Set 'openai' or 'gemini' in .env"
#             )
#         print(f"[Agent] 📤 Raw LLM output:\n{raw[:500]}")
 
#     except Exception as exc:
#         err = str(exc)
#         print(f"[Agent] ❌ LLM call failed: {err}")
#         return {
#             "success":      False,
#             "message":      f"⚠️ LLM error ({provider}): {err}",
#             "raw_response": err,
#         }
 
#     # Step 2 — Parse JSON ──────────────────────────────────────────
#     try:
#         parsed = _extract_json(raw)
#     except Exception as exc:
#         print(f"[Agent] ❌ JSON parse error: {exc}")
#         return {
#             "success":      False,
#             "message":      f"⚠️ Could not parse LLM response: {exc}",
#             "raw_response": raw,
#         }
 
#     tool_name = parsed.get("tool")
#     arguments = parsed.get("arguments", {})
 
#     print(f"[Agent] 🛠️  Tool     : {tool_name}")
#     print(f"[Agent] 📋 Arguments: {json.dumps(arguments, indent=2, ensure_ascii=False)}")
 
#     # Step 3 — Dispatch ────────────────────────────────────────────
#     print(f"[Agent] ⚡ Dispatching → {tool_name} ...")
#     result = dispatch_tool(tool_name, arguments)
 
#     ok  = result.get("success", False)
#     msg = result.get("message", "")[:120]
#     print(f"[Agent] {'✅' if ok else '❌'} Result: success={ok} | {msg}")
#     print(f"{'='*60}\n")
 
#     result["tool_called"] = tool_name
#     result["arguments"]   = arguments
#     return result

"""
agents/booking_agent.py
=======================
LLM-powered AI Booking Agent.

Key fixes in this version:
  1. ALWAYS expand city abbreviations in ALL fields (source, destination,
     value, current filters) — both in booking AND in update queries
  2. Multi-booking with different routes/dates per vehicle
  3. Compact system prompt (< 300 tokens for fast response)
  4. No re module — pure string matching for greetings
  5. Proxy-safe OpenAI caller (Mode 1: SDK, Mode 2: raw httpx)
"""
from __future__ import annotations

import json
from datetime import datetime, date
from app.core.config import settings
from app.agents.tools import dispatch_tool

# ─────────────────────────────────────────────────────────────────
#  City abbreviation table  (used by LLM prompt + Python expander)
# ─────────────────────────────────────────────────────────────────
CITY_MAP: dict[str, str] = {
    # Bhubaneswar
    "bbsr": "Bhubaneswar", "bbs": "Bhubaneswar", "bhubaneswar": "Bhubaneswar",
    # Visakhapatnam
    "vskp": "Visakhapatnam", "vizag": "Visakhapatnam", "visakhapatnam": "Visakhapatnam",
    # Hyderabad
    "hyd": "Hyderabad", "hyderabad": "Hyderabad",
    # Bangalore
    "blr": "Bangalore", "bengaluru": "Bangalore", "bangalore": "Bangalore",
    # Chennai
    "maa": "Chennai", "mas": "Chennai", "chennai": "Chennai",
    # Delhi
    "del": "New Delhi", "ndls": "New Delhi", "delhi": "New Delhi", "new delhi": "New Delhi",
    # Mumbai
    "bom": "Mumbai", "cst": "Mumbai", "mumbai": "Mumbai", "bombay": "Mumbai",
    # Kolkata
    "kol": "Kolkata", "ccl": "Kolkata", "kolkata": "Kolkata", "calcutta": "Kolkata",
    # Howrah
    "hwh": "Howrah", "howrah": "Howrah",
    # Pune
    "pune": "Pune", "pnq": "Pune",
    # Coimbatore
    "cbe": "Coimbatore", "coimbatore": "Coimbatore",
    # Thiruvananthapuram
    "tvc": "Thiruvananthapuram", "trivandrum": "Thiruvananthapuram",
    # Ahmedabad
    "adi": "Ahmedabad", "ahmedabad": "Ahmedabad",
    # Jaipur
    "jp": "Jaipur", "jaipur": "Jaipur",
    # Kochi
    "cok": "Kochi", "kochi": "Kochi", "cochin": "Kochi",
    # Guwahati
    "gwl": "Guwahati", "guwahati": "Guwahati",
    # Patna
    "pnbe": "Patna", "patna": "Patna",
    # Bhopal
    "bpl": "Bhopal", "bhopal": "Bhopal",
    # Nagpur
    "ngp": "Nagpur", "nagpur": "Nagpur",
    # Lucknow
    "lko": "Lucknow", "lucknow": "Lucknow",
    # Chandigarh
    "cdg": "Chandigarh", "chandigarh": "Chandigarh",
}

def _expand_city(name: str | None) -> str | None:
    """Expand any city abbreviation to full name. Case-insensitive."""
    if not name:
        return None
    key = name.strip().lower()
    expanded = CITY_MAP.get(key, name.strip().title())
    if expanded != name.strip().title():
        print(f"[Agent] 🗺️  City expanded: '{name}' → '{expanded}'")
    return expanded


# ─────────────────────────────────────────────────────────────────
#  Dynamic system prompt  (compact — < 300 tokens)
# ─────────────────────────────────────────────────────────────────
_VEHICLES    = " | ".join(settings.VEHICLE_TABLES)
_HISTORY_TBL = settings.TABLE_NAME
_TODAY       = date.today().strftime("%Y-%m-%d")

# Build city abbreviation list for prompt
_CITY_ABBR = (
    "bbsr/bbs→Bhubaneswar, vskp/vizag→Visakhapatnam, hwh→Howrah, "
    "hyd→Hyderabad, blr→Bangalore, maa→Chennai, del→New Delhi, "
    "bom→Mumbai, kol→Kolkata, pune→Pune, cbe→Coimbatore, tvc→Thiruvananthapuram"
)

SYSTEM_PROMPT = f"""You are an AI Travel Booking Agent. Today: {_TODAY}. Vehicles: {_VEHICLES}.
Return ONLY valid JSON: {{"tool":"<name>","arguments":{{...}}}}

TOOLS:
1. create_booking: vehicles(list), source, destination, date(YYYY-MM-DD|null)
   Same route multi: vehicles:["bus","car"], source, destination, date
   Different route/date: use create_multi_booking instead

2. create_multi_booking: bookings(list of {{vehicle,source,destination,date}})
   Use when: different vehicles have DIFFERENT routes OR DIFFERENT dates
   Example: bus A→B on D1, car B→A on D2

3. get_travel_history: vehicle(str|null), start_date(YYYY-MM-DD|null), end_date(YYYY-MM-DD|null)

4. update_booking_by_id: booking_id(int), vehicle, field(from|to|travel_date|status), value
   Use when: user gives an explicit booking #ID

5. update_booking_by_query: vehicle, source(str|null), destination(str|null), current_date(YYYY-MM-DD|null), updates(list)
   Use when: NO booking ID — identify by route/date, then update one OR MORE fields
   updates is a list of {{field, value}} pairs
   fields: "from"|"to"|"travel_date"|"status"
   Example query: "change bus from HWH to BBSR on 27 March — new date 29 March, change from to VSKP"
   → vehicle:"bus", source:"Howrah", destination:"Bhubaneswar", current_date:"2026-03-27",
     updates:[{{"field":"travel_date","value":"2026-03-29"}},{{"field":"from","value":"Visakhapatnam"}}]

6. delete_booking: booking_id(int), vehicle(str|null)

PARSING RULES FOR update_booking_by_query:
- "source" / "destination" / "current_date" = FILTERS to FIND the existing booking
- "updates" = list of CHANGES to apply
- "change HWH location as VSKP" → update field "from" value "Visakhapatnam"
- "change date to 29 March" → update field "travel_date" value "2026-03-29"
- One message can contain MULTIPLE updates → put all in "updates" list

CITY EXPAND — ALWAYS use full names in ALL fields:
{_CITY_ABBR}

DATE RULES: YYYY-MM-DD. "27th March 2026"→"2026-03-27". "3rd April"→"2026-04-03". "today"→{_TODAY}

STRICT:
- Return ONLY JSON. No text, no markdown.
- ALWAYS expand city abbreviations everywhere
- Same route + multi vehicle → create_booking vehicles list
- Different routes/dates → create_multi_booking bookings list
- No booking ID → update_booking_by_query
- update_booking_by_query CAN update multiple fields via updates list
- Never generate raw SQL
"""


# ─────────────────────────────────────────────────────────────────
#  Greeting detection — no regex
# ─────────────────────────────────────────────────────────────────
_GREETINGS = {
    "hi","hello","hey","howdy","hiya","yo","namaste","greetings",
    "good morning","good afternoon","good evening","good night","good day",
    "how are you","how r u","are you there",
    "thanks","thank you","thank u","thx","ty","cheers",
    "bye","goodbye","see you","cya","later",
    "ok","okay","cool","nice","great","awesome","wow",
    "who are you","what are you","what can you do",
    "help me","help","what's up","whats up","sup",
}

def _is_greeting(text: str) -> bool:
    normalised = text.strip().lower().rstrip("!?.").strip()
    result = normalised in _GREETINGS
    print(f"[Agent] 🔎 Greeting check: {normalised!r} → {result}")
    return result


def _human_response(text: str) -> dict:
    hour   = datetime.now().hour
    lower  = text.strip().lower()
    tg     = "Good morning" if hour < 12 else ("Good afternoon" if hour < 17 else "Good evening")
    prov   = "OpenAI GPT" if settings.LLM_PROVIDER == "openai" else "Google Gemini"

    print(f"[Agent] 💬 Chitchat reply for: {lower!r}")

    if   "good morning"   in lower: r = f"Good morning! 🌅 Ready to plan your next trip? I can book trains 🚆, buses 🚌, flights ✈️, cars 🚗, bikes 🏍️!"
    elif "good afternoon" in lower: r = f"Good afternoon! ☀️ Where are you travelling today? Just tell me and I'll book it instantly!"
    elif "good evening"   in lower: r = f"Good evening! 🌆 Planning a journey? I'm here to help with bookings, history, and updates!"
    elif "good night"     in lower: r = f"Good night! 🌙 Need a quick booking before you rest? I'm here!"
    elif "how are you"    in lower: r = f"{tg}! 😊 I'm doing great, always ready to help with your travel! Shall we book a trip?"
    elif "who are you"    in lower or "what are you" in lower:
        r = (f"{tg}! 🤖 I'm your **AI Travel Booking Agent**, powered by {prov}.\n\n"
             f"I can:\n🎫 Book tickets (train/bus/flight/car/bike)\n"
             f"📋 Show travel history\n✏️ Update/reschedule bookings\n🗑️ Cancel bookings\n\n"
             f"Try: *\"Book a bus from HWH to BBSR on 27 March 2026\"*")
    elif "what can you do" in lower or "help" in lower:
        r = (f"{tg}! 👋 Here's what I can do:\n\n"
             f"🎫 *\"Book a train from BBSR to VSKP on 25 March\"*\n"
             f"🔀 *\"Book bus from HWH to BBSR on 27 March and return car on 3 April\"*\n"
             f"📋 *\"Show all my bookings\"*\n"
             f"✏️ *\"Change bus from HWH to BBSR on 27 March date to 29 March\"*\n"
             f"🗑️ *\"Cancel booking #3\"*\n\n"
             f"I understand natural language — just talk to me!")
    elif any(w in lower for w in ("thanks","thank you","thx","ty","cheers")):
        r = "You're very welcome! 😊 Safe travels! ✈️"
    elif any(w in lower for w in ("bye","goodbye","see you","cya","later")):
        r = "Goodbye! 👋 Safe travels and come back anytime! ✈️🚆"
    elif any(w in lower for w in ("hi","hello","hey","howdy","hiya","yo","namaste","greetings")):
        r = (f"{tg}! 👋 Welcome! I'm your AI Travel Booking Agent.\n\n"
             f"I book 🚆 trains, 🚌 buses, ✈️ flights, 🚗 cars, 🏍️ bikes.\n"
             f"Try: *\"Book bus from HWH to BBSR on 27 March 2026\"*")
    elif any(w in lower for w in ("ok","okay","cool","nice","great","awesome","wow")):
        r = "Great! 😄 Ready whenever you are to book your next trip!"
    else:
        r = f"{tg}! 👋 I'm your AI Travel Booking Agent. What trip can I help with today?"

    print(f"[Agent] 💬 Reply: {r[:80]}...")
    return {"success": True, "message": r, "tool_called": "chitchat", "arguments": {"input": text}}


# ─────────────────────────────────────────────────────────────────
#  JSON extractor — brace counting, no regex
# ─────────────────────────────────────────────────────────────────
def _extract_json(text: str) -> dict:
    print(f"[Agent] 🔍 Extracting JSON ({len(text)} chars): {text[:100]!r}")
    cleaned = text.strip()
    for fence in ("```json", "```JSON", "```"):
        cleaned = cleaned.replace(fence, "")
    cleaned = cleaned.strip().strip("`").strip()

    start = cleaned.find("{")
    if start == -1:
        raise ValueError(f"No JSON found in: {cleaned[:300]}")

    depth = 0
    end   = -1
    for i, ch in enumerate(cleaned[start:], start=start):
        if   ch == "{": depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    if end == -1:
        raise ValueError(f"Unmatched braces in: {cleaned[:300]}")

    json_str = cleaned[start:end]
    print(f"[Agent] ✅ JSON: {json_str[:200]}")
    return json.loads(json_str)


# ─────────────────────────────────────────────────────────────────
#  Post-process: expand cities in all argument fields
#  This is the safety net — even if LLM didn't expand abbreviations
# ─────────────────────────────────────────────────────────────────
def _expand_cities_in_args(tool_name: str, arguments: dict) -> dict:
    """
    Safety net: expand city abbreviations in ALL argument fields after LLM response.
    Handles: source, destination, value, updates list, bookings list.
    """
    args = dict(arguments)

    # Direct city fields
    for field in ("source", "destination"):
        if field in args and isinstance(args[field], str):
            orig = args[field]
            args[field] = _expand_city(orig)
            if args[field] != orig:
                print(f"[Agent] 🗺️  Expanded '{field}': '{orig}' → '{args[field]}'")

    # Single update 'value' field (for update_booking_by_id)
    if "value" in args and isinstance(args["value"], str):
        orig = args["value"]
        args["value"] = _expand_city(orig)
        if args["value"] != orig:
            print(f"[Agent] 🗺️  Expanded 'value': '{orig}' → '{args['value']}'")

    # updates list: [{field, value}, ...] — expand city values
    if "updates" in args and isinstance(args["updates"], list):
        expanded_updates = []
        for u in args["updates"]:
            nu = dict(u)
            # Only expand city values for from/to fields
            if nu.get("field") in ("from", "to", "from_loc", "to_loc", "source", "destination"):
                orig = nu.get("value", "")
                nu["value"] = _expand_city(orig) or orig
                if nu["value"] != orig:
                    print(f"[Agent] 🗺️  Expanded update value: '{orig}' → '{nu['value']}'")
            expanded_updates.append(nu)
        args["updates"] = expanded_updates

    # bookings list for create_multi_booking
    if "bookings" in args and isinstance(args["bookings"], list):
        expanded_bookings = []
        for b in args["bookings"]:
            nb = dict(b)
            nb["source"]      = _expand_city(nb.get("source", "")) or nb.get("source", "")
            nb["destination"] = _expand_city(nb.get("destination", "")) or nb.get("destination", "")
            expanded_bookings.append(nb)
        args["bookings"] = expanded_bookings

    return args


# ─────────────────────────────────────────────────────────────────
#  LLM callers
# ─────────────────────────────────────────────────────────────────
def _call_openai(user_message: str) -> str:
    api_key  = settings.OPENAI_API_KEY
    model    = settings.OPENAI_MODEL
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_message},
    ]
    print(f"[LLM] 🤖 OpenAI | model={model}")

    # Mode 1: SDK + explicit httpx.Client
    try:
        import httpx
        from openai import OpenAI
        print("[LLM] 📡 Mode 1: SDK ...")
        http = httpx.Client(
            timeout=httpx.Timeout(connect=5.0, read=30.0, write=8.0, pool=5.0),
            follow_redirects=True,
        )
        client = OpenAI(api_key=api_key, http_client=http)
        resp   = client.chat.completions.create(
            model           = model,
            messages        = messages,
            temperature     = 0,
            max_tokens      = 250,
            response_format = {"type": "json_object"},
        )
        content = resp.choices[0].message.content
        print(f"[LLM] ✅ SDK success | tokens={resp.usage.total_tokens}")
        return content
    except TypeError as te:
        if "proxies" in str(te) or "unexpected keyword" in str(te):
            print(f"[LLM] ⚠️  SDK TypeError ({te}) → Mode 2")
        else:
            raise
    except Exception as exc:
        print(f"[LLM] ❌ SDK error: {exc}")
        raise

    # Mode 2: Raw httpx POST
    import httpx
    print("[LLM] 📡 Mode 2: raw httpx ...")
    payload = {
        "model": model, "temperature": 0, "max_tokens": 250,
        "response_format": {"type": "json_object"},
        "messages": messages,
    }
    with httpx.Client(timeout=35.0) as cl:
        r = cl.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload,
        )
        r.raise_for_status()
        content = r.json()["choices"][0]["message"]["content"]
        print(f"[LLM] ✅ Mode 2 success ({len(content)} chars)")
        return content


def _call_gemini(user_message: str) -> str:
    import google.generativeai as genai
    print(f"[LLM] 🤖 Gemini | model={settings.GEMINI_MODEL}")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        system_instruction=SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json", "temperature": 0},
    )
    resp = model.generate_content(user_message)
    print(f"[LLM] ✅ Gemini success ({len(resp.text)} chars)")
    return resp.text


# ─────────────────────────────────────────────────────────────────
#  Main entry point
# ─────────────────────────────────────────────────────────────────
def run_agent(user_message: str) -> dict:
    """
    Pipeline:
      0. Greeting → instant reply (no LLM cost)
      1. LLM call
      2. Parse JSON
      3. Expand city abbreviations (safety net)
      4. Dispatch tool
    """
    print(f"\n{'='*60}")
    print(f"[Agent] 📨 Message  : {user_message!r}")
    print(f"[Agent] ⚙️  Provider : {settings.LLM_PROVIDER.upper()}")
    print(f"[Agent] 🗄️  DB       : {settings.DB_NAME} | Table: {settings.TABLE_NAME}")
    print(f"{'='*60}")

    # Step 0: Greeting shortcut
    if _is_greeting(user_message):
        return _human_response(user_message)

    # Step 1: LLM call
    provider = settings.LLM_PROVIDER.strip().lower()
    try:
        print(f"[Agent] 🚀 Calling {provider.upper()} ...")
        raw = _call_openai(user_message) if provider == "openai" else _call_gemini(user_message)
        print(f"[Agent] 📤 Raw output:\n{raw}")
    except Exception as exc:
        err = str(exc)
        print(f"[Agent] ❌ LLM failed: {err}")
        return {"success": False, "message": f"⚠️ LLM error ({provider}): {err}", "raw_response": err}

    # Step 2: Parse JSON
    try:
        parsed = _extract_json(raw)
    except Exception as exc:
        print(f"[Agent] ❌ JSON parse error: {exc}")
        return {"success": False, "message": f"⚠️ Could not parse LLM response: {exc}", "raw_response": raw}

    tool_name = parsed.get("tool")
    arguments = parsed.get("arguments", {})

    print(f"[Agent] 🛠️  Tool      : {tool_name}")
    print(f"[Agent] 📋 Arguments : {json.dumps(arguments, indent=2, ensure_ascii=False)}")

    # Step 3: Expand city abbreviations (safety net for what LLM missed)
    arguments = _expand_cities_in_args(tool_name, arguments)
    print(f"[Agent] 🗺️  Expanded  : {json.dumps(arguments, indent=2, ensure_ascii=False)}")

    # Step 4: Dispatch
    print(f"[Agent] ⚡ Dispatching → {tool_name} ...")
    result = dispatch_tool(tool_name, arguments)

    ok  = result.get("success", False)
    msg = result.get("message", "")[:120]
    print(f"[Agent] {'✅' if ok else '❌'} success={ok} | {msg}")
    print(f"{'='*60}\n")

    result["tool_called"] = tool_name
    result["arguments"]   = arguments
    return result