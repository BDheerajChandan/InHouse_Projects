# # agents/tools.py 
# """
# agents/tools.py
# ===============
# All tool implementations — dynamic SQL, no hardcoded table names.

# IMPORTANT: settings.TABLE_NAME and settings.VEHICLE_TABLES are already
# lowercase (enforced by config.py). We use them directly in f-strings.
# No .lower() calls needed here — config.py handles it once at startup.

# Tools:
#   create_booking           — INSERT one or multiple vehicles
#   get_travel_history       — SELECT with dynamic WHERE filters
#   update_booking_by_id     — UPDATE by explicit booking ID
#   update_booking_by_query  — UPDATE by matching route/date (no ID needed)
#   delete_booking           — DELETE by booking ID
# """
# from __future__ import annotations

# from datetime import datetime
# from app.core.config import settings
# from app.database.db import execute_query, execute_write

# # ── All table names are lowercase from config.py ─────────────────
# VALID_VEHICLES: set[str] = set(settings.VEHICLE_TABLES)   # {'train','bus','flight','car','bike'}

# FIELD_MAP: dict[str, str] = {
#     "from":         "from_loc",
#     "from_loc":     "from_loc",
#     "source":       "from_loc",
#     "departure":    "from_loc",
#     "origin":       "from_loc",
#     "to":           "to_loc",
#     "to_loc":       "to_loc",
#     "destination":  "to_loc",
#     "arrival":      "to_loc",
#     "travel_date":  "travel_date",
#     "date":         "travel_date",
#     "journey_date": "travel_date",
#     "trip_date":    "travel_date",
#     "status":       "status",
# }


# # ─────────────────────────────────────────────────────────────────
# #  Helpers
# # ─────────────────────────────────────────────────────────────────

# def _validate_vehicle(v: str) -> str:
#     val = v.strip().lower()
#     if val not in VALID_VEHICLES:
#         raise ValueError(f"Unknown vehicle '{v}'. Valid: {', '.join(sorted(VALID_VEHICLES))}")
#     print(f"[Tools] ✅ Vehicle: '{val}'")
#     return val


# def _parse_date(ds: str | None) -> str | None:
#     """Parse any common date string → YYYY-MM-DD."""
#     if not ds:
#         return None
#     cleaned = ds.strip()
#     for fmt in (
#         "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d",
#         "%d %b %Y", "%d %B %Y", "%B %d %Y", "%b %d %Y",
#         "%d-%b-%Y", "%d %b, %Y", "%d %B, %Y",
#     ):
#         try:
#             result = datetime.strptime(cleaned, fmt).strftime("%Y-%m-%d")
#             print(f"[Tools] 📅 Date '{ds}' → '{result}'")
#             return result
#         except ValueError:
#             continue
#     print(f"[Tools] ⚠️  Date as-is: '{cleaned}'")
#     return cleaned


# def _resolve_field(field: str) -> str:
#     col = FIELD_MAP.get(field.strip().lower())
#     if not col:
#         raise ValueError(f"Unknown field '{field}'. Allowed: {', '.join(FIELD_MAP)}")
#     print(f"[Tools] 🗂️  Field '{field}' → '{col}'")
#     return col


# def _serialize(rows: list[dict]) -> list[dict]:
#     """
#     Convert date/datetime → ISO string.
#     Add 'from' and 'to' aliases for from_loc / to_loc so the
#     frontend can read either column name.
#     """
#     out = []
#     for row in rows:
#         clean = {}
#         for k, v in row.items():
#             val = v.isoformat() if hasattr(v, "isoformat") else v
#             clean[k] = val
#             if k == "from_loc":
#                 clean["from"] = val   # frontend alias
#             elif k == "to_loc":
#                 clean["to"] = val     # frontend alias
#         out.append(clean)
#     return out


# def _log_sql(label: str, sql: str, params: tuple) -> None:
#     print(f"[SQL] ── {label}")
#     print(f"[SQL]    stmt   : {' '.join(sql.split())[:150]}")
#     print(f"[SQL]    params : {params}")


# # ─────────────────────────────────────────────────────────────────
# #  Tool 1 — create_booking
# # ─────────────────────────────────────────────────────────────────

# def create_booking(
#     vehicles:    list[str] | str,
#     source:      str,
#     destination: str,
#     date:        str | None = None,
# ) -> dict:
#     """
#     INSERT into each vehicle table + combined history table.
#     Supports single or multiple vehicles.
#     """
#     print(f"\n[Tools] ─── create_booking ───────────────────────────────")
#     print(f"[Tools] vehicles={vehicles!r}, from={source!r}, to={destination!r}, date={date!r}")

#     if isinstance(vehicles, str):
#         vehicle_list = [v.strip() for v in vehicles.split(",") if v.strip()]
#     else:
#         vehicle_list = [v.strip() for v in vehicles if v.strip()]

#     validated   = [_validate_vehicle(v) for v in vehicle_list]
#     travel_date = _parse_date(date)
#     src         = source.strip().title()
#     dst         = destination.strip().title()
#     # settings.TABLE_NAME is already lowercase ("travel_history")
#     history_tbl = settings.TABLE_NAME
#     print(f"[Tools] 🗄️  History table: '{history_tbl}'")

#     bookings_made = []

#     for v in validated:
#         params = (v, src, dst, travel_date)

#         # INSERT vehicle table
#         sql_v = (
#             f"INSERT INTO {v} (vehicle, from_loc, to_loc, travel_date) "
#             f"VALUES (%s, %s, %s, %s) RETURNING id"
#         )
#         _log_sql(f"INSERT → {v}", sql_v, params)
#         vid = execute_write(sql_v, params)
#         print(f"[Tools] ✅ '{v}' → id={vid}")

#         # INSERT history table
#         sql_h = (
#             f"INSERT INTO {history_tbl} (vehicle, from_loc, to_loc, travel_date) "
#             f"VALUES (%s, %s, %s, %s) RETURNING id"
#         )
#         _log_sql(f"INSERT → {history_tbl}", sql_h, params)
#         hid = execute_write(sql_h, params)
#         print(f"[Tools] ✅ '{history_tbl}' → id={hid}")

#         bookings_made.append({
#             "id":          vid,
#             "vehicle":     v,
#             "from":        src,
#             "to":          dst,
#             "from_loc":    src,
#             "to_loc":      dst,
#             "travel_date": travel_date,
#             "status":      "confirmed",
#         })

#     vehicles_str = " & ".join(f"**{v.capitalize()}**" for v in validated)
#     date_str     = f" on **{travel_date}**" if travel_date else ""
#     ids_str      = ", ".join(f"#{b['id']}" for b in bookings_made)

#     return {
#         "success":  True,
#         "message":  (
#             f"✅ {vehicles_str} ticket(s) booked!\n"
#             f"📍 **{src.upper()}** → **{dst.upper()}**{date_str}\n"
#             f"🎫 Booking ID(s): **{ids_str}**"
#         ),
#         "booking":  bookings_made[0] if len(bookings_made) == 1 else None,
#         "bookings": bookings_made,
#     }


# # ─────────────────────────────────────────────────────────────────
# #  Tool 2 — get_travel_history
# # ─────────────────────────────────────────────────────────────────

# def get_travel_history(
#     vehicle:    str | None = None,
#     start_date: str | None = None,
#     end_date:   str | None = None,
# ) -> dict:
#     """SELECT from history table with optional filters."""
#     print(f"\n[Tools] ─── get_travel_history ───────────────────────────")
#     print(f"[Tools] vehicle={vehicle!r}, start={start_date!r}, end={end_date!r}")

#     history_tbl = settings.TABLE_NAME   # already lowercase
#     print(f"[Tools] 🗄️  Querying table: '{history_tbl}'")

#     conditions: list[str] = []
#     params:     list      = []

#     if vehicle:
#         v = _validate_vehicle(vehicle)
#         conditions.append("vehicle = %s")
#         params.append(v)

#     start = _parse_date(start_date)
#     end   = _parse_date(end_date)

#     if start and end:
#         conditions.append("travel_date BETWEEN %s AND %s")
#         params.extend([start, end])
#     elif start:
#         conditions.append("travel_date >= %s")
#         params.append(start)
#     elif end:
#         conditions.append("travel_date <= %s")
#         params.append(end)

#     where   = ("WHERE " + " AND ".join(conditions)) if conditions else ""
#     sql_str = f"SELECT * FROM {history_tbl} {where} ORDER BY booked_at DESC"

#     _log_sql("SELECT", sql_str, tuple(params))
#     rows = _serialize(execute_query(sql_str, tuple(params)))
#     print(f"[Tools] 📋 {len(rows)} record(s)")

#     if not rows:
#         return {"success": True, "message": "📭 No travel records found.", "records": []}

#     return {"success": True, "message": f"📋 Found **{len(rows)}** travel record(s).", "records": rows}


# # ─────────────────────────────────────────────────────────────────
# #  Tool 3 — update_booking_by_id
# # ─────────────────────────────────────────────────────────────────

# def update_booking_by_id(
#     booking_id: int,
#     vehicle:    str,
#     field:      str,
#     value:      str,
# ) -> dict:
#     """UPDATE by explicit booking ID in vehicle + history tables."""
#     print(f"\n[Tools] ─── update_booking_by_id ─────────────────────────")
#     print(f"[Tools] id={booking_id}, vehicle={vehicle!r}, field={field!r}, value={value!r}")

#     v           = _validate_vehicle(vehicle)
#     db_col      = _resolve_field(field)
#     history_tbl = settings.TABLE_NAME
#     bid         = int(booking_id)

#     if db_col == "travel_date":
#         value = _parse_date(value) or value

#     sql_v = f"UPDATE {v} SET {db_col} = %s WHERE id = %s"
#     _log_sql(f"UPDATE {v}", sql_v, (value, bid))
#     rv = execute_write(sql_v, (value, bid))
#     print(f"[Tools] ✅ {rv} row(s) updated in '{v}'")

#     sql_h = f"UPDATE {history_tbl} SET {db_col} = %s WHERE id = %s"
#     _log_sql(f"UPDATE {history_tbl}", sql_h, (value, bid))
#     rh = execute_write(sql_h, (value, bid))
#     print(f"[Tools] ✅ {rh} row(s) updated in '{history_tbl}'")

#     if rv == 0 and rh == 0:
#         return {"success": False, "message": f"⚠️ No booking found with ID **#{booking_id}**."}

#     return {
#         "success": True,
#         "message": f"✏️ Booking **#{booking_id}** updated!\n📝 **{field}** → **{value}**",
#     }


# # ─────────────────────────────────────────────────────────────────
# #  Tool 4 — update_booking_by_query
# # ─────────────────────────────────────────────────────────────────

# def update_booking_by_query(
#     vehicle:      str,
#     field:        str,
#     value:        str,
#     source:       str | None = None,
#     destination:  str | None = None,
#     current_date: str | None = None,
# ) -> dict:
#     """
#     UPDATE by route/date match — no booking ID needed.
#     Step 1: Find matching IDs in history table.
#     Step 2: Update matched rows in vehicle + history table.
#     """
#     print(f"\n[Tools] ─── update_booking_by_query ──────────────────────")
#     print(f"[Tools] vehicle={vehicle!r}, field={field!r}, value={value!r}")
#     print(f"[Tools] source={source!r}, destination={destination!r}, current_date={current_date!r}")

#     v           = _validate_vehicle(vehicle)
#     db_col      = _resolve_field(field)
#     history_tbl = settings.TABLE_NAME
#     print(f"[Tools] 🗄️  History table: '{history_tbl}'")

#     if db_col == "travel_date":
#         value = _parse_date(value) or value

#     conditions: list[str] = ["vehicle = %s"]
#     params:     list      = [v]

#     if source:
#         src = source.strip().title()
#         conditions.append("LOWER(from_loc) = LOWER(%s)")
#         params.append(src)
#         print(f"[Tools] 🔎 from_loc = '{src}'")

#     if destination:
#         dst = destination.strip().title()
#         conditions.append("LOWER(to_loc) = LOWER(%s)")
#         params.append(dst)
#         print(f"[Tools] 🔎 to_loc = '{dst}'")

#     if current_date:
#         cd = _parse_date(current_date)
#         if cd:
#             conditions.append("travel_date = %s")
#             params.append(cd)
#             print(f"[Tools] 🔎 travel_date = '{cd}'")

#     where    = "WHERE " + " AND ".join(conditions)
#     find_sql = f"SELECT id FROM {history_tbl} {where} ORDER BY booked_at DESC"
#     _log_sql("FIND", find_sql, tuple(params))

#     matched = execute_query(find_sql, tuple(params))
#     print(f"[Tools] 🔎 Matched {len(matched)} row(s)")

#     if not matched:
#         desc = f"**{v}** booking"
#         if source and destination:
#             desc += f" from **{source.title()}** to **{destination.title()}**"
#         if current_date:
#             desc += f" on **{current_date}**"
#         return {
#             "success": False,
#             "message": (
#                 f"⚠️ No matching {desc} found.\n"
#                 f"Tip: *show travel history* to see your booking IDs."
#             ),
#         }

#     updated_ids = []
#     for row in matched:
#         bid = row["id"]
#         sql_v = f"UPDATE {v} SET {db_col} = %s WHERE id = %s"
#         _log_sql(f"UPDATE {v} id={bid}", sql_v, (value, bid))
#         execute_write(sql_v, (value, bid))

#         sql_h = f"UPDATE {history_tbl} SET {db_col} = %s WHERE id = %s"
#         _log_sql(f"UPDATE {history_tbl} id={bid}", sql_h, (value, bid))
#         execute_write(sql_h, (value, bid))
#         updated_ids.append(bid)

#     ids_str = ", ".join(f"**#{i}**" for i in updated_ids)
#     print(f"[Tools] ✅ Updated IDs: {updated_ids}")
#     return {
#         "success": True,
#         "message": (
#             f"✏️ **{len(updated_ids)}** booking(s) updated!\n"
#             f"🎫 ID(s): {ids_str}\n"
#             f"📝 **{field}** → **{value}**"
#         ),
#     }


# # ─────────────────────────────────────────────────────────────────
# #  Tool 5 — delete_booking
# # ─────────────────────────────────────────────────────────────────

# def delete_booking(booking_id: int, vehicle: str | None = None) -> dict:
#     """DELETE from history + vehicle table by booking ID."""
#     print(f"\n[Tools] ─── delete_booking ───────────────────────────────")
#     print(f"[Tools] booking_id={booking_id}, vehicle={vehicle!r}")

#     history_tbl = settings.TABLE_NAME
#     bid         = int(booking_id)

#     sql_h = f"DELETE FROM {history_tbl} WHERE id = %s"
#     _log_sql(f"DELETE {history_tbl}", sql_h, (bid,))
#     rh = execute_write(sql_h, (bid,))
#     print(f"[Tools] 🗑️  {rh} row(s) deleted from '{history_tbl}'")

#     if vehicle:
#         v     = _validate_vehicle(vehicle)
#         sql_v = f"DELETE FROM {v} WHERE id = %s"
#         _log_sql(f"DELETE {v}", sql_v, (bid,))
#         rv = execute_write(sql_v, (bid,))
#         print(f"[Tools] 🗑️  {rv} row(s) deleted from '{v}'")

#     if rh == 0:
#         return {"success": False, "message": f"⚠️ No booking found with ID **#{booking_id}**."}

#     return {"success": True, "message": f"🗑️ Booking **#{booking_id}** deleted successfully."}


# # ─────────────────────────────────────────────────────────────────
# #  Dispatcher
# # ─────────────────────────────────────────────────────────────────

# TOOL_REGISTRY: dict[str, callable] = {
#     "create_booking":          create_booking,
#     "get_travel_history":      get_travel_history,
#     "update_booking_by_id":    update_booking_by_id,
#     "update_booking_by_query": update_booking_by_query,
#     "delete_booking":          delete_booking,
# }


# def dispatch_tool(tool_name: str | None, arguments: dict) -> dict:
#     """Route tool name → function → execute."""
#     print(f"\n[Dispatch] Tool='{tool_name}' | Args={list(arguments.keys())}")

#     if not tool_name:
#         return {"success": False, "message": "⚠️ LLM did not return a tool name."}

#     func = TOOL_REGISTRY.get(tool_name)
#     if not func:
#         return {
#             "success": False,
#             "message": f"⚠️ Unknown tool '{tool_name}'. Available: {', '.join(TOOL_REGISTRY)}",
#         }
#     try:
#         print(f"[Dispatch] ⚡ Calling {tool_name}({list(arguments.keys())})")
#         result = func(**arguments)
#         print(f"[Dispatch] {'✅' if result.get('success') else '❌'} {tool_name} done")
#         return result
#     except TypeError as te:
#         print(f"[Dispatch] ❌ TypeError: {te}")
#         return {"success": False, "message": f"⚠️ Bad arguments for '{tool_name}': {te}"}
#     except Exception as exc:
#         print(f"[Dispatch] ❌ {type(exc).__name__}: {exc}")
#         return {"success": False, "message": f"⚠️ Error in '{tool_name}': {exc}"}
"""
agents/tools.py
===============
All tool implementations — dynamic SQL, no hardcoded table names.

IMPORTANT: settings.TABLE_NAME and settings.VEHICLE_TABLES are already
lowercase (enforced by config.py). We use them directly in f-strings.
No .lower() calls needed here — config.py handles it once at startup.

Tools:
  create_booking           — INSERT one or multiple vehicles
  get_travel_history       — SELECT with dynamic WHERE filters
  update_booking_by_id     — UPDATE by explicit booking ID
  update_booking_by_query  — UPDATE by matching route/date (no ID needed)
  delete_booking           — DELETE by booking ID
"""
from __future__ import annotations

from datetime import datetime
from app.core.config import settings
from app.database.db import execute_query, execute_write

# ── All table names are lowercase from config.py ─────────────────
VALID_VEHICLES: set[str] = set(settings.VEHICLE_TABLES)   # {'train','bus','flight','car','bike'}

FIELD_MAP: dict[str, str] = {
    "from":         "from_loc",
    "from_loc":     "from_loc",
    "source":       "from_loc",
    "departure":    "from_loc",
    "origin":       "from_loc",
    "to":           "to_loc",
    "to_loc":       "to_loc",
    "destination":  "to_loc",
    "arrival":      "to_loc",
    "travel_date":  "travel_date",
    "date":         "travel_date",
    "journey_date": "travel_date",
    "trip_date":    "travel_date",
    "status":       "status",
}


# ─────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────

def _validate_vehicle(v: str) -> str:
    val = v.strip().lower()
    if val not in VALID_VEHICLES:
        raise ValueError(f"Unknown vehicle '{v}'. Valid: {', '.join(sorted(VALID_VEHICLES))}")
    print(f"[Tools] ✅ Vehicle: '{val}'")
    return val


def _parse_date(ds: str | None) -> str | None:
    """Parse any common date string → YYYY-MM-DD."""
    if not ds:
        return None
    cleaned = ds.strip()
    for fmt in (
        "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d",
        "%d %b %Y", "%d %B %Y", "%B %d %Y", "%b %d %Y",
        "%d-%b-%Y", "%d %b, %Y", "%d %B, %Y",
    ):
        try:
            result = datetime.strptime(cleaned, fmt).strftime("%Y-%m-%d")
            print(f"[Tools] 📅 Date '{ds}' → '{result}'")
            return result
        except ValueError:
            continue
    print(f"[Tools] ⚠️  Date as-is: '{cleaned}'")
    return cleaned


def _resolve_field(field: str) -> str:
    col = FIELD_MAP.get(field.strip().lower())
    if not col:
        raise ValueError(f"Unknown field '{field}'. Allowed: {', '.join(FIELD_MAP)}")
    print(f"[Tools] 🗂️  Field '{field}' → '{col}'")
    return col


def _serialize(rows: list[dict]) -> list[dict]:
    """
    Convert date/datetime → ISO string.
    Add 'from' and 'to' aliases for from_loc / to_loc so the
    frontend can read either column name.
    """
    out = []
    for row in rows:
        clean = {}
        for k, v in row.items():
            val = v.isoformat() if hasattr(v, "isoformat") else v
            clean[k] = val
            if k == "from_loc":
                clean["from"] = val   # frontend alias
            elif k == "to_loc":
                clean["to"] = val     # frontend alias
        out.append(clean)
    return out


def _log_sql(label: str, sql: str, params: tuple) -> None:
    print(f"[SQL] ── {label}")
    print(f"[SQL]    stmt   : {' '.join(sql.split())[:150]}")
    print(f"[SQL]    params : {params}")


# ─────────────────────────────────────────────────────────────────
#  Tool 1 — create_booking
# ─────────────────────────────────────────────────────────────────

def create_booking(
    vehicles:    list[str] | str,
    source:      str,
    destination: str,
    date:        str | None = None,
) -> dict:
    """
    INSERT into each vehicle table + combined history table.
    Supports single or multiple vehicles.
    """
    print(f"\n[Tools] ─── create_booking ───────────────────────────────")
    print(f"[Tools] vehicles={vehicles!r}, from={source!r}, to={destination!r}, date={date!r}")

    if isinstance(vehicles, str):
        vehicle_list = [v.strip() for v in vehicles.split(",") if v.strip()]
    else:
        vehicle_list = [v.strip() for v in vehicles if v.strip()]

    validated   = [_validate_vehicle(v) for v in vehicle_list]
    travel_date = _parse_date(date)
    src         = source.strip().title()
    dst         = destination.strip().title()
    # settings.TABLE_NAME is already lowercase ("travel_history")
    history_tbl = settings.TABLE_NAME
    print(f"[Tools] 🗄️  History table: '{history_tbl}'")

    bookings_made = []

    for v in validated:
        params = (v, src, dst, travel_date)

        # INSERT vehicle table
        sql_v = (
            f"INSERT INTO {v} (vehicle, from_loc, to_loc, travel_date) "
            f"VALUES (%s, %s, %s, %s) RETURNING id"
        )
        _log_sql(f"INSERT → {v}", sql_v, params)
        vid = execute_write(sql_v, params)
        print(f"[Tools] ✅ '{v}' → id={vid}")

        # INSERT history table
        sql_h = (
            f"INSERT INTO {history_tbl} (vehicle, from_loc, to_loc, travel_date) "
            f"VALUES (%s, %s, %s, %s) RETURNING id"
        )
        _log_sql(f"INSERT → {history_tbl}", sql_h, params)
        hid = execute_write(sql_h, params)
        print(f"[Tools] ✅ '{history_tbl}' → id={hid}")

        bookings_made.append({
            "id":          vid,
            "vehicle":     v,
            "from":        src,
            "to":          dst,
            "from_loc":    src,
            "to_loc":      dst,
            "travel_date": travel_date,
            "status":      "confirmed",
        })

    vehicles_str = " & ".join(f"**{v.capitalize()}**" for v in validated)
    date_str     = f" on **{travel_date}**" if travel_date else ""
    ids_str      = ", ".join(f"#{b['id']}" for b in bookings_made)

    return {
        "success":  True,
        "message":  (
            f"✅ {vehicles_str} ticket(s) booked!\n"
            f"📍 **{src.upper()}** → **{dst.upper()}**{date_str}\n"
            f"🎫 Booking ID(s): **{ids_str}**"
        ),
        "booking":  bookings_made[0] if len(bookings_made) == 1 else None,
        "bookings": bookings_made,
    }


# ─────────────────────────────────────────────────────────────────
#  Tool 1b — create_multi_booking
#  Handles bookings with DIFFERENT routes/dates per vehicle
#  e.g. "Book bus HWH→BBSR on 27 Mar AND return car on 3 Apr"
# ─────────────────────────────────────────────────────────────────

def create_multi_booking(bookings: list[dict]) -> dict:
    """
    Create multiple bookings each with different vehicle/route/date.
    Each item in bookings list: {vehicle, source, destination, date}

    Called when user requests different routes or dates per vehicle.
    e.g. "bus from A to B on date1, return car from B to A on date2"
    """
    print(f"\n[Tools] ─── create_multi_booking ────────────────────────")
    print(f"[Tools] {len(bookings)} booking(s) to create")

    all_bookings = []
    messages     = []

    for i, b in enumerate(bookings):
        vehicle     = b.get("vehicle", "")
        source      = b.get("source", "")
        destination = b.get("destination", "")
        date        = b.get("date", None)
        print(f"[Tools] Booking {i+1}: {vehicle} | {source} → {destination} | {date}")

        result = create_booking(
            vehicles    = [vehicle],
            source      = source,
            destination = destination,
            date        = date,
        )
        if result.get("success") and result.get("bookings"):
            all_bookings.extend(result["bookings"])
            messages.append(result["message"])

    if not all_bookings:
        return {"success": False, "message": "⚠️ No bookings could be created."}

    return {
        "success":  True,
        "message":  "\n\n".join(messages),
        "booking":  all_bookings[0] if len(all_bookings) == 1 else None,
        "bookings": all_bookings,
    }


# ─────────────────────────────────────────────────────────────────
#  Tool 2 — get_travel_history
# ─────────────────────────────────────────────────────────────────

def get_travel_history(
    vehicle:    str | None = None,
    start_date: str | None = None,
    end_date:   str | None = None,
) -> dict:
    """SELECT from history table with optional filters."""
    print(f"\n[Tools] ─── get_travel_history ───────────────────────────")
    print(f"[Tools] vehicle={vehicle!r}, start={start_date!r}, end={end_date!r}")

    history_tbl = settings.TABLE_NAME   # already lowercase
    print(f"[Tools] 🗄️  Querying table: '{history_tbl}'")

    conditions: list[str] = []
    params:     list      = []

    if vehicle:
        v = _validate_vehicle(vehicle)
        conditions.append("vehicle = %s")
        params.append(v)

    start = _parse_date(start_date)
    end   = _parse_date(end_date)

    if start and end:
        conditions.append("travel_date BETWEEN %s AND %s")
        params.extend([start, end])
    elif start:
        conditions.append("travel_date >= %s")
        params.append(start)
    elif end:
        conditions.append("travel_date <= %s")
        params.append(end)

    where   = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    sql_str = f"SELECT * FROM {history_tbl} {where} ORDER BY booked_at DESC"

    _log_sql("SELECT", sql_str, tuple(params))
    rows = _serialize(execute_query(sql_str, tuple(params)))
    print(f"[Tools] 📋 {len(rows)} record(s)")

    if not rows:
        return {"success": True, "message": "📭 No travel records found.", "records": []}

    return {"success": True, "message": f"📋 Found **{len(rows)}** travel record(s).", "records": rows}


# ─────────────────────────────────────────────────────────────────
#  Tool 3 — update_booking_by_id
# ─────────────────────────────────────────────────────────────────

def update_booking_by_id(
    booking_id: int,
    vehicle:    str,
    field:      str,
    value:      str,
) -> dict:
    """UPDATE by explicit booking ID in vehicle + history tables."""
    print(f"\n[Tools] ─── update_booking_by_id ─────────────────────────")
    print(f"[Tools] id={booking_id}, vehicle={vehicle!r}, field={field!r}, value={value!r}")

    v           = _validate_vehicle(vehicle)
    db_col      = _resolve_field(field)
    history_tbl = settings.TABLE_NAME
    bid         = int(booking_id)

    if db_col == "travel_date":
        value = _parse_date(value) or value

    sql_v = f"UPDATE {v} SET {db_col} = %s WHERE id = %s"
    _log_sql(f"UPDATE {v}", sql_v, (value, bid))
    rv = execute_write(sql_v, (value, bid))
    print(f"[Tools] ✅ {rv} row(s) updated in '{v}'")

    sql_h = f"UPDATE {history_tbl} SET {db_col} = %s WHERE id = %s"
    _log_sql(f"UPDATE {history_tbl}", sql_h, (value, bid))
    rh = execute_write(sql_h, (value, bid))
    print(f"[Tools] ✅ {rh} row(s) updated in '{history_tbl}'")

    if rv == 0 and rh == 0:
        return {"success": False, "message": f"⚠️ No booking found with ID **#{booking_id}**."}

    return {
        "success": True,
        "message": f"✏️ Booking **#{booking_id}** updated!\n📝 **{field}** → **{value}**",
    }


# ─────────────────────────────────────────────────────────────────
#  Tool 4 — update_booking_by_query
# ─────────────────────────────────────────────────────────────────

def update_booking_by_query(
    vehicle:      str,
    updates:      list | None = None,
    field:        str | None = None,
    value:        str | None = None,
    source:       str | None = None,
    destination:  str | None = None,
    current_date: str | None = None,
) -> dict:
    """
    UPDATE booking(s) by route/date match — no booking ID required.

    Supports MULTIPLE field updates in one call via the 'updates' list.
    Also supports old single-field interface (field + value) for compatibility.

    'updates' format: [{"field": "travel_date", "value": "2026-03-29"},
                       {"field": "from",        "value": "Visakhapatnam"}]

    Step 1: Build WHERE clause from vehicle + source/destination/current_date filters
    Step 2: Find matching booking IDs
    Step 3: Apply ALL updates to each matched row
    """
    print(f"\n[Tools] ─── update_booking_by_query ──────────────────────")
    print(f"[Tools] vehicle={vehicle!r}")
    print(f"[Tools] source={source!r}, destination={destination!r}, current_date={current_date!r}")
    print(f"[Tools] updates={updates!r}, field={field!r}, value={value!r}")

    v           = _validate_vehicle(vehicle)
    history_tbl = settings.TABLE_NAME
    print(f"[Tools] 🗄️  Table: '{history_tbl}'")

    # Normalise updates list — support both new (updates list) and old (field+value) formats
    if updates and isinstance(updates, list) and len(updates) > 0:
        update_list = updates
    elif field and value is not None:
        update_list = [{"field": field, "value": value}]
    else:
        return {"success": False, "message": "⚠️ No update fields specified."}

    # Resolve and validate each update
    resolved_updates = []
    for u in update_list:
        f_name = u.get("field", "")
        f_val  = u.get("value", "")
        db_col = _resolve_field(f_name)
        if db_col == "travel_date":
            f_val = _parse_date(f_val) or f_val
        resolved_updates.append({"field": f_name, "db_col": db_col, "value": f_val})
        print(f"[Tools] 📝 Update: '{f_name}' ({db_col}) → '{f_val}'")

    # ── Build WHERE clause to find matching bookings ──────────────
    conditions: list[str] = ["vehicle = %s"]
    params:     list      = [v]

    if source:
        src = source.strip().title()
        conditions.append("LOWER(from_loc) = LOWER(%s)")
        params.append(src)
        print(f"[Tools] 🔎 from_loc filter: '{src}'")

    if destination:
        dst = destination.strip().title()
        conditions.append("LOWER(to_loc) = LOWER(%s)")
        params.append(dst)
        print(f"[Tools] 🔎 to_loc filter: '{dst}'")

    if current_date:
        cd = _parse_date(current_date)
        if cd:
            conditions.append("travel_date = %s")
            params.append(cd)
            print(f"[Tools] 🔎 travel_date filter: '{cd}'")

    where    = "WHERE " + " AND ".join(conditions)
    find_sql = f"SELECT id FROM {history_tbl} {where} ORDER BY booked_at DESC"
    _log_sql("FIND matching", find_sql, tuple(params))

    matched = execute_query(find_sql, tuple(params))
    print(f"[Tools] 🔎 Matched {len(matched)} row(s)")

    if not matched:
        desc = f"**{v}** booking"
        if source and destination:
            desc += f" from **{source.title()}** to **{destination.title()}**"
        if current_date:
            desc += f" on **{current_date}**"
        return {
            "success": False,
            "message": (
                f"⚠️ No matching {desc} found.\n"
                f"Tip: *show travel history* to see your booking IDs."
            ),
        }

    # ── Apply ALL updates to each matched row ──────────────────────
    updated_ids = []
    for row in matched:
        bid = row["id"]
        for u in resolved_updates:
            db_col = u["db_col"]
            f_val  = u["value"]

            # Update vehicle table
            sql_v = f"UPDATE {v} SET {db_col} = %s WHERE id = %s"
            _log_sql(f"UPDATE {v} id={bid} {db_col}", sql_v, (f_val, bid))
            execute_write(sql_v, (f_val, bid))

            # Update history table
            sql_h = f"UPDATE {history_tbl} SET {db_col} = %s WHERE id = %s"
            _log_sql(f"UPDATE {history_tbl} id={bid} {db_col}", sql_h, (f_val, bid))
            execute_write(sql_h, (f_val, bid))

        if bid not in updated_ids:
            updated_ids.append(bid)

    ids_str    = ", ".join(f"**#{i}**" for i in updated_ids)
    changes    = ", ".join(f"**{u['field']}** → **{u['value']}**" for u in resolved_updates)
    print(f"[Tools] ✅ Updated IDs: {updated_ids} | Changes: {changes}")

    return {
        "success": True,
        "message": (
            f"✏️ **{len(updated_ids)}** booking(s) updated!\n"
            f"🎫 ID(s): {ids_str}\n"
            f"📝 {changes}"
        ),
    }


# ─────────────────────────────────────────────────────────────────
#  Tool 5 — delete_booking
# ─────────────────────────────────────────────────────────────────

def delete_booking(booking_id: int, vehicle: str | None = None) -> dict:
    """DELETE from history + vehicle table by booking ID."""
    print(f"\n[Tools] ─── delete_booking ───────────────────────────────")
    print(f"[Tools] booking_id={booking_id}, vehicle={vehicle!r}")

    history_tbl = settings.TABLE_NAME
    bid         = int(booking_id)

    sql_h = f"DELETE FROM {history_tbl} WHERE id = %s"
    _log_sql(f"DELETE {history_tbl}", sql_h, (bid,))
    rh = execute_write(sql_h, (bid,))
    print(f"[Tools] 🗑️  {rh} row(s) deleted from '{history_tbl}'")

    if vehicle:
        v     = _validate_vehicle(vehicle)
        sql_v = f"DELETE FROM {v} WHERE id = %s"
        _log_sql(f"DELETE {v}", sql_v, (bid,))
        rv = execute_write(sql_v, (bid,))
        print(f"[Tools] 🗑️  {rv} row(s) deleted from '{v}'")

    if rh == 0:
        return {"success": False, "message": f"⚠️ No booking found with ID **#{booking_id}**."}

    return {"success": True, "message": f"🗑️ Booking **#{booking_id}** deleted successfully."}


# ─────────────────────────────────────────────────────────────────
#  Dispatcher
# ─────────────────────────────────────────────────────────────────

TOOL_REGISTRY: dict[str, callable] = {
    "create_booking":          create_booking,
    "create_multi_booking":    create_multi_booking,
    "get_travel_history":      get_travel_history,
    "update_booking_by_id":    update_booking_by_id,
    "update_booking_by_query": update_booking_by_query,
    "delete_booking":          delete_booking,
}


def dispatch_tool(tool_name: str | None, arguments: dict) -> dict:
    """Route tool name → function → execute."""
    print(f"\n[Dispatch] Tool='{tool_name}' | Args={list(arguments.keys())}")

    if not tool_name:
        return {"success": False, "message": "⚠️ LLM did not return a tool name."}

    func = TOOL_REGISTRY.get(tool_name)
    if not func:
        return {
            "success": False,
            "message": f"⚠️ Unknown tool '{tool_name}'. Available: {', '.join(TOOL_REGISTRY)}",
        }
    try:
        print(f"[Dispatch] ⚡ Calling {tool_name}({list(arguments.keys())})")
        result = func(**arguments)
        print(f"[Dispatch] {'✅' if result.get('success') else '❌'} {tool_name} done")
        return result
    except TypeError as te:
        print(f"[Dispatch] ❌ TypeError: {te}")
        return {"success": False, "message": f"⚠️ Bad arguments for '{tool_name}': {te}"}
    except Exception as exc:
        print(f"[Dispatch] ❌ {type(exc).__name__}: {exc}")
        return {"success": False, "message": f"⚠️ Error in '{tool_name}': {exc}"}