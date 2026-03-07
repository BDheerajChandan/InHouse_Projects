# routers/graph_router.py

from fastapi import APIRouter
from pydantic import BaseModel
from graphbuilder import build_graph

router = APIRouter()

class GraphRequest(BaseModel):
    nodes: list[str]   # frontend node sequence
    prompt: str

@router.post("/run_graph")
def run_graph(req: GraphRequest):
    # Build graph using frontend-selected nodes
    app_obj, _ = build_graph(user_sequence=req.nodes)

    state = {
        "input": req.prompt,
        "selected_nodes": req.nodes,
        "output": "",
        "final_output": ""
    }

    result = app_obj.invoke(state)
    return {"output": result["final_output"]}