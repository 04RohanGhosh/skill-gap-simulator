from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
import json
import subprocess
import tempfile
import shutil
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = FastAPI(title="Code Evaluation Service", description="Service for evaluating code submissions in sandboxed environments")

# PostgreSQL connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "skillgap"),
        user=os.getenv("POSTGRES_USER", "skillgap_user"),
        password=os.getenv("POSTGRES_PASSWORD", "skillgap_pass")
    )

class CodeEvaluationRequest(BaseModel):
    source_code: str
    language: str
    test_cases: List[Dict[str, Any]]
    user_id: str
    skill_id: str | None = None

class CodeEvaluationResponse(BaseModel):
    evaluation_id: str
    user_id: str
    skill_id: str | None
    language: str
    status: str  # "running", "completed", "failed"
    score: int
    feedback: str
    results: List[Dict[str, Any]]
    execution_time: float
    memory_used: int

@app.post("/evaluate", response_model=CodeEvaluationResponse)
async def evaluate_code(request: CodeEvaluationRequest):
    """
    Evaluate code in a sandboxed environment
    """
    # In a real implementation, this would use Judge0 or Docker containers
    # For now, we'll simulate evaluation

    evaluation_id = f"eval_{request.user_id}_{request.skill_id}_{int(datetime.now().timestamp())}"

    # Simulate code evaluation
    results = []
    total_score = 0

    for i, test_case in enumerate(request.test_cases):
        # Simulate test execution
        passed = True  # Simplified - in reality would execute code
        score = test_case.get("points", 10) if passed else 0
        total_score += score

        results.append({
            "test_case_id": i,
            "passed": passed,
            "score": score,
            "output": "Test output" if passed else "Error: Test failed",
            "error": None if passed else "AssertionError: Expected 5, got 3"
        })

    # Calculate percentage score
    max_possible = sum(tc.get("points", 10) for tc in request.test_cases)
    percentage_score = int((total_score / max_possible) * 100) if max_possible > 0 else 0

    # Store evaluation in database
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                INSERT INTO code_evaluations (
                    user_id, skill_id, source_code, language, result, score, feedback, evaluated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
                """,
                (
                    request.user_id,
                    request.skill_id,
                    request.source_code,
                    request.language,
                    json.dumps({
                        "results": results,
                        "total_score": total_score,
                        "max_possible": max_possible,
                        "percentage_score": percentage_score
                    }),
                    percentage_score,
                    f"Code evaluation completed. Score: {percentage_score}%"
                )
            )
            conn.commit()
    except Exception as e:
        print(f"Error storing code evaluation: {e}")
    finally:
        conn.close()

    feedback = f"Great job! Your code scored {percentage_score}%. "
    if percentage_score >= 80:
        feedback += "Excellent work!"
    elif percentage_score >= 60:
        feedback += "Good job, but there's room for improvement."
    else:
        feedback += "Keep practicing - you'll get better!"

    return CodeEvaluationResponse(
        evaluation_id=evaluation_id,
        user_id=request.user_id,
        skill_id=request.skill_id,
        language=request.language,
        status="completed",
        score=percentage_score,
        feedback=feedback,
        results=results,
        execution_time=0.5,  # Simulated
        memory_used=10240   # Simulated (10MB)
    )

@app.get("/evaluation/{evaluation_id}")
async def get_evaluation(evaluation_id: str):
    """
    Get evaluation results by ID
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT * FROM code_evaluations WHERE id = %s
                """,
                (evaluation_id,)
            )
            evaluation = cursor.fetchone()

            if not evaluation:
                raise HTTPException(status_code=404, detail="Evaluation not found")

            return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch evaluation: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8006, reload=True)