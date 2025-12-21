# ============================================
# FILE: app/crud/poll_crud.py (COMPLETELY NEW)
# ============================================
from typing import List, Optional, Dict, Any
from app.core.database import Database
from app.schemas.poll_schemas import PollCreate, ResponseSubmit
from datetime import datetime  # ADD THIS LINE
import uuid
import json


class PollCRUD:
    def __init__(self, db: Database):
        self.db = db
    
    def create_poll(self, poll_data: PollCreate) -> str:
        """Create a new poll and return poll_id"""
        poll_id = str(uuid.uuid4())[:8]
        
        # Convert questions to JSON format
        questions_json = []
        for q in poll_data.questions:
            questions_json.append({
                "question_text": q.question_text,
                "choices": [{"choice_text": c.choice_text, "votes": 0} for c in q.choices]
            })
        
        query = """
        INSERT INTO polls (poll_id, creator_name, poll_title, questions, responses)
        VALUES (%s, %s, %s, %s::jsonb, '[]'::jsonb)
        RETURNING poll_id;
        """
        
        try:
            cursor = self.db.execute_query(
                query,
                (poll_id, poll_data.creator_name, poll_data.poll_title, json.dumps(questions_json))
            )
            result = cursor.fetchone()
            return result['poll_id']
        except Exception as e:
            print(f"Error creating poll: {e}")
            raise
    
    def get_poll(self, poll_id: str) -> Optional[Dict]:
        """Get poll by ID"""
        query = "SELECT * FROM polls WHERE poll_id = %s;"
        
        try:
            cursor = self.db.execute_query(query, (poll_id,))
            return cursor.fetchone()
        except Exception as e:
            print(f"Error fetching poll: {e}")
            return None
    
    def submit_response(self, poll_id: str, response_data: ResponseSubmit) -> bool:
        """Submit a response and update vote counts"""
        
        # First, check if user already responded
        if self.check_voter_exists(poll_id, response_data.voter_name):
            return False
        
        # Get current poll data
        poll = self.get_poll(poll_id)
        if not poll:
            raise Exception("Poll not found")
        
        questions = poll['questions']
        responses = poll['responses']
        
        # Update vote counts in questions
        for q_idx, c_idx in response_data.answers.items():
            if q_idx < len(questions) and c_idx < len(questions[q_idx]['choices']):
                questions[q_idx]['choices'][c_idx]['votes'] += 1
        
        # Add new response to responses array
        new_response = {
            "voter_name": response_data.voter_name.lower(),
            "answers": response_data.answers,
            "timestamp": datetime.now().isoformat()
        }
        responses.append(new_response)
        
        # Update database
        query = """
        UPDATE polls 
        SET questions = %s::jsonb,
            responses = %s::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE poll_id = %s
        RETURNING id;
        """
        
        try:
            cursor = self.db.execute_query(
                query,
                (json.dumps(questions), json.dumps(responses), poll_id)
            )
            result = cursor.fetchone()
            return result is not None
        except Exception as e:
            print(f"Error submitting response: {e}")
            raise
    
    def check_voter_exists(self, poll_id: str, voter_name: str) -> bool:
        """Check if voter already responded"""
        query = """
        SELECT 1 FROM polls 
        WHERE poll_id = %s 
        AND responses @> %s::jsonb;
        """
        
        check_json = json.dumps([{"voter_name": voter_name.lower()}])
        
        try:
            cursor = self.db.execute_query(query, (poll_id, check_json))
            result = cursor.fetchone()
            return result is not None
        except Exception as e:
            print(f"Error checking voter: {e}")
            return False
    
    def get_poll_details(self, poll_id: str) -> Optional[Dict]:
        """Get complete poll details with responses"""
        poll = self.get_poll(poll_id)
        
        if not poll:
            return None
        
        return {
            "poll_id": poll['poll_id'],
            "creator_name": poll['creator_name'],
            "poll_title": poll['poll_title'],
            "questions": poll['questions'],
            "responses": poll['responses'],
            "total_responses": len(poll['responses']),
            "created_at": poll['created_at']
        }
    
    def delete_poll(self, poll_id: str) -> bool:
        """Delete a poll"""
        query = "DELETE FROM polls WHERE poll_id = %s RETURNING poll_id;"
        
        try:
            cursor = self.db.execute_query(query, (poll_id,))
            result = cursor.fetchone()
            return result is not None
        except Exception as e:
            print(f"Error deleting poll: {e}")
            return False
    def delete_all_responses(self, poll_id: str) -> bool:
        """
        Delete all responses and reset vote counts.
        """
        try:
            # Check if poll exists
            poll = self.get_poll(poll_id)
            if not poll:
                return False

            # Reset responses to empty list
            clear_responses_query = """
            UPDATE polls 
            SET responses = '[]'::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE poll_id = %s;
            """

            # Reset vote counts
            questions = poll["questions"]
            for q in questions:
                for c in q["choices"]:
                    c["votes"] = 0

            reset_votes_query = """
            UPDATE polls 
            SET questions = %s::jsonb
            WHERE poll_id = %s;
            """

            self.db.execute_query(clear_responses_query, (poll_id,))
            self.db.execute_query(reset_votes_query, (json.dumps(questions), poll_id))
            return True

        except Exception as e:
            print(f"Error deleting responses: {e}")
            return False
