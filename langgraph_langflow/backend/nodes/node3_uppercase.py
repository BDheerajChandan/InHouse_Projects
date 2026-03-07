# nodes/node_uppercase.py

def node3_uppercase(state: dict):
    
    # Take previous output if exists
    text = state.get("output") or state.get("input", "")
    state["output"] = text.upper()
    
    return state

NODE_FUNC = node3_uppercase