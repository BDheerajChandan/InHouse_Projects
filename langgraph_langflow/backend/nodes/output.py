# nodes/output.py

def output_node(state: dict):
    
    # Ensure final output is never blank
    state["final_output"] = state.get("output") or state.get("input", "")
    
    return state