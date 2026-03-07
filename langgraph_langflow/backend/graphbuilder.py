# graphbuilder.py

import os
import importlib.util
from typing import TypedDict
from langgraph.graph import StateGraph

class GraphState(TypedDict):
    input: str
    output: str
    selected_nodes: list
    final_output: str

def get_available_nodes():
    """Scan nodes/ folder and return all available node functions"""
    nodes_dir = os.path.join(os.path.dirname(__file__), "nodes")
    nodes = {}
    node_files = [
        f for f in os.listdir(nodes_dir)
        if f.endswith(".py") and f not in ["start.py", "output.py", "__init__.py"]
    ]
    for i, file in enumerate(node_files, start=1):
        module_name = file[:-3]
        module_path = os.path.join(nodes_dir, file)
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        func = getattr(module, "NODE_FUNC")
        nodes[str(i)] = {"name": module_name, "func": func}
    return nodes

def build_graph(user_sequence=None):
    """
    Build StateGraph.
    If user_sequence is None -> interactive CLI selection
    If user_sequence is provided -> used directly (API mode)
    """
    graph = StateGraph(GraphState)

    # --- Load start node ---
    start_spec = importlib.util.spec_from_file_location(
        "start", os.path.join(os.path.dirname(__file__), "nodes", "start.py")
    )
    start_module = importlib.util.module_from_spec(start_spec)
    start_spec.loader.exec_module(start_module)
    start_node = start_module.start_node

    def wrapped_start(state):
        print("Node 1 - Processing Start node")
        state = start_node(state)
        print("Node 1 - Executed Start node")
        return state

    graph.add_node("start", wrapped_start)

    # --- Load all available nodes ---
    available_nodes = get_available_nodes()

    # --- Interactive CLI selection if no user_sequence provided ---
    if user_sequence is None:
        user_sequence = []
        while True:
            print("\nAvailable Nodes:")
            for key, node in available_nodes.items():
                print(f"{key} - {node['name']}")
            choice = input("Select node to add (number) or 'done' to finish: ").strip()
            if choice.lower() == "done":
                break
            if choice in available_nodes:
                node_name = available_nodes[choice]["name"]
                user_sequence.append(node_name)
                current_flow = ["start"] + user_sequence + ["output"]
                print("Current flow:", " -> ".join(current_flow))
            else:
                print("Invalid choice!")

    # --- Wrap selected nodes with proper numbering ---
    selected_node_funcs = {
        name: available_nodes[key]["func"]
        for key in available_nodes
        for name in [available_nodes[key]["name"]]
        if name in user_sequence
    }

    for i, node_name in enumerate(user_sequence, start=2):  # Node 1 = start
        func = selected_node_funcs[node_name]

        def make_wrapped(f, num, name):
            def wrapped(state, func=f, num=num, name=name):
                print(f"Node {num} - Processing {name} node")
                prev_text = state.get("output") or state.get("input", "")
                state["output"] = func({"input": prev_text, "output": ""}).get("output", "")
                print(f"Node {num} - Executed {name} node")
                return state
            return wrapped

        graph.add_node(node_name, make_wrapped(func, i, node_name))

    # --- Output node ---
    output_num = len(user_sequence) + 2

    output_spec = importlib.util.spec_from_file_location(
        "output", os.path.join(os.path.dirname(__file__), "nodes", "output.py")
    )
    output_module = importlib.util.module_from_spec(output_spec)
    output_spec.loader.exec_module(output_module)
    output_node = output_module.output_node

    def wrapped_output(state, num=output_num):
        print(f"Node {num} - Processing Output node")
        state["final_output"] = state.get("output") or state.get("input", "")
        print(f"Node {num} - Executed Output node")
        return state

    graph.add_node("output", wrapped_output)

    # --- Build edges ---
    prev_node = "start"
    for node_name in user_sequence:
        graph.add_edge(prev_node, node_name)
        prev_node = node_name
    graph.add_edge(prev_node, "output")

    graph.set_entry_point("start")
    graph.set_finish_point("output")

    return graph.compile(), user_sequence