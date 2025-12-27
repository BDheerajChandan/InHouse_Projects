
# ============================================
# FILE: app/main.py (UPDATED)
# ============================================
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

from app.core.database import db, get_db
from app.crud.poll_crud import PollCRUD
from app.schemas.poll_schemas import (
    PollCreate,
    PollResponse,
    ResponseSubmit,
    PollDetailsResponse
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("🚀 Starting application...")
    db.connect()
    db.create_tables()
    yield
    print("👋 Shutting down application...")
    db.disconnect()


app = FastAPI(
    title="Dynamic Poll API",
    description="API for creating custom polls with multiple questions",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "http://localhost:8001",
                   "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Dynamic Poll API is running!",
        "version": "2.0.0",
        "endpoints": {
            "create_poll": "POST /api/polls",
            "get_poll": "GET /api/polls/{poll_id}",
            "submit_response": "POST /api/polls/{poll_id}/respond",
            "get_results": "GET /api/polls/{poll_id}/results"
        }
    }


@app.post("/api/polls", response_model=PollResponse, status_code=201)
async def create_poll(poll_data: PollCreate, database: db = Depends(get_db)):
    """Create a new poll with custom questions"""
    try:
        poll_crud = PollCRUD(database)
        poll_id = poll_crud.create_poll(poll_data)
        poll = poll_crud.get_poll(poll_id)
        
        if not poll:
            raise HTTPException(status_code=500, detail="Failed to create poll")
        
        return PollResponse(
            poll_id=poll['poll_id'],
            creator_name=poll['creator_name'],
            poll_title=poll['poll_title'],
            questions=poll['questions'],
            created_at=poll['created_at']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating poll: {str(e)}")


@app.get("/api/polls/{poll_id}", response_model=PollResponse)
async def get_poll(poll_id: str, database: db = Depends(get_db)):
    """Get poll information (for voting)"""
    poll_crud = PollCRUD(database)
    poll = poll_crud.get_poll(poll_id)
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    return PollResponse(
        poll_id=poll['poll_id'],
        creator_name=poll['creator_name'],
        poll_title=poll['poll_title'],
        questions=poll['questions'],
        created_at=poll['created_at']
    )


@app.post("/api/polls/{poll_id}/respond", status_code=201)
async def submit_response(
    poll_id: str, 
    response_data: ResponseSubmit, 
    database: db = Depends(get_db)
):
    """Submit a response to a poll"""
    poll_crud = PollCRUD(database)
    
    # Check if poll exists
    poll = poll_crud.get_poll(poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if voter already responded
    if poll_crud.check_voter_exists(poll_id, response_data.voter_name):
        raise HTTPException(status_code=400, detail="You have already responded to this poll")
    
    # Submit response
    try:
        success = poll_crud.submit_response(poll_id, response_data)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to submit response")
        
        return {
            "message": "Response submitted successfully",
            "voter": response_data.voter_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting response: {str(e)}")


@app.get("/api/polls/{poll_id}/results", response_model=PollDetailsResponse)
async def get_poll_results(poll_id: str, database: db = Depends(get_db)):
    """Get poll results with all responses"""
    poll_crud = PollCRUD(database)
    
    poll_details = poll_crud.get_poll_details(poll_id)
    
    if not poll_details:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    return PollDetailsResponse(**poll_details)


@app.delete("/api/polls/{poll_id}")
async def delete_poll(poll_id: str, database: db = Depends(get_db)):
    """Delete a poll"""
    poll_crud = PollCRUD(database)
    
    success = poll_crud.delete_poll(poll_id)
    if not success:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    return {"message": "Poll deleted successfully"}

@app.delete("/api/polls/{poll_id}/responses/reset")
async def reset_poll_responses(poll_id: str, database: db = Depends(get_db)):
    """Delete all responses and reset vote counts"""
    poll_crud = PollCRUD(database)

    success = poll_crud.delete_all_responses(poll_id)

    if not success:
        raise HTTPException(status_code=404, detail="Poll not found or failed to reset")

    return {"message": "All responses deleted and votes reset"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected" if db.conn and not db.conn.closed else "disconnected"
    }

if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
