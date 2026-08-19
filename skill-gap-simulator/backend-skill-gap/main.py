from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
from typing import List, Dict, Any
import redis
import hashlib
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = FastAPI(title="Skill Gap Calculation Service", description="Service for calculating skill gaps between resumes and job descriptions")

# Initialize Redis connection (for caching)
try:
    redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)
    # Test connection
    redis_client.ping()
except:
    redis_client = None
    print("Warning: Redis not available, caching disabled")

# PostgreSQL connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "skillgap"),
        user=os.getenv("POSTGRES_USER", "skillgap_user"),
        password=os.getenv("POSTGRES_PASSWORD", "skillgap_pass")
    )

class SkillLevel(BaseModel):
    skill_name: str
    current_level: int  # 0-100
    target_level: int   # 0-100
    gap: int            # 0-100

class SkillGapResponse(BaseModel):
    skill_gaps: List[SkillLevel]
    similarity_score: float  # 0-1
    time_to_ready_months: int
    skills_matched: int
    total_skills: int

class CalculateGapRequest(BaseModel):
    resume_id: str
    jd_id: str

@app.post("/calculate-gap", response_model=SkillGapResponse)
async def calculate_skill_gap(request: CalculateGapRequest):
    """
    Calculate skill gap between resume skills and job description skills
    """
    if not request.resume_id:
        raise HTTPException(status_code=400, detail="Resume ID is required")

    if not request.jd_id:
        raise HTTPException(status_code=400, detail="Job description ID is required")

    # Create a cache key based on the input
    cache_key = hashlib.md5(
        json.dumps({
            'resume_id': request.resume_id,
            'jd_id': request.jd_id
        }).encode()
    ).hexdigest()

    # Check cache first
    if redis_client:
        cached_result = redis_client.get(f"skill_gap:{cache_key}")
        if cached_result:
            return SkillGapResponse.parse_raw(cached_result)

    # Get resume and JD data from database
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Get resume data
            cursor.execute(
                """
                SELECT parsed_data FROM resumes WHERE id = %s
                """,
                (request.resume_id,)
            )
            resume_result = cursor.fetchone()
            if not resume_result:
                raise HTTPException(status_code=404, detail="Resume not found")

            resume_data = resume_result['parsed_data']

            # Get JD data
            cursor.execute(
                """
                SELECT parsed_data FROM job_descriptions WHERE id = %s
                """,
                (request.jd_id,)
            )
            jd_result = cursor.fetchone()
            if not jd_result:
                raise HTTPException(status_code=404, detail="Job description not found")

            jd_data = jd_result['parsed_data']
    finally:
        conn.close()

    # Extract skills from resume and JD data
    resume_skills = extract_skills_from_data(resume_data)
    jd_skills = extract_skills_from_data(jd_data)

    if not resume_skills:
        raise HTTPException(status_code=400, detail="No skills found in resume")

    if not jd_skills:
        raise HTTPException(status_code=400, detail="No skills found in job description")

    # Calculate skill gap
    skill_gaps, similarity_score = calculate_gap(resume_skills, jd_skills)

    # Calculate time to ready based on gap analysis
    time_to_ready = calculate_time_to_ready(skill_gaps)

    # Count matched skills
    skills_matched = len([gap for gap in skill_gaps if gap.gap <= 10])  # Consider matched if gap <= 10%
    total_skills = len(skill_gaps)

    response = SkillGapResponse(
        skill_gaps=skill_gaps,
        similarity_score=similarity_score,
        time_to_ready_months=time_to_ready,
        skills_matched=skills_matched,
        total_skills=total_skills
    )

    # Cache the result for 1 hour
    if redis_client:
        redis_client.setex(f"skill_gap:{cache_key}", 3600, response.json())

    # Store skill gap in database
    store_skill_gap(request.resume_id, request.jd_id, skill_gaps, similarity_score, time_to_ready)

    return response

def extract_skills_from_data(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract skills from parsed data
    """
    if not data or 'skills' not in data:
        return []

    skills = []
    for skill in data['skills']:
        skills.append({
            'skill_name': skill['skill_name'],
            'proficiency': skill.get('proficiency', 0),
            'importance': skill.get('importance', 0)
        })

    return skills

def calculate_gap(resume_skills: List[Dict[str, Any]], jd_skills: List[Dict[str, Any]]) -> tuple[List[SkillLevel], float]:
    """
    Calculate skill gap between resume and JD skills
    """
    # Create skill vectors for comparison
    resume_skill_dict = {skill['skill_name'].lower(): skill for skill in resume_skills}
    jd_skill_dict = {skill['skill_name'].lower(): skill for skill in jd_skills}

    # Get all unique skills from both sets
    all_skills = set(list(resume_skill_dict.keys()) + list(jd_skill_dict.keys()))

    skill_gaps = []

    # For each skill, calculate the gap
    for skill_name in all_skills:
        resume_level = resume_skill_dict.get(skill_name, {}).get('proficiency', 0)
        jd_level = jd_skill_dict.get(skill_name, {}).get('importance', 0)

        gap = max(0, jd_level - resume_level)  # Gap is how much JD requires beyond resume level

        skill_gaps.append(SkillLevel(
            skill_name=skill_name.title(),  # Capitalize for display
            current_level=min(100, resume_level),
            target_level=min(100, jd_level),
            gap=min(100, gap)
        ))

    # Calculate similarity score using cosine similarity of skill vectors
    # Create vectors for comparison
    resume_vector = [resume_skill_dict.get(skill, {}).get('proficiency', 0) for skill in all_skills]
    jd_vector = [jd_skill_dict.get(skill, {}).get('importance', 0) for skill in all_skills]

    # Calculate cosine similarity
    if len(resume_vector) > 0 and len(jd_vector) > 0:
        similarity = cosine_similarity([resume_vector], [jd_vector])[0][0]
    else:
        similarity = 0.0

    return skill_gaps, similarity

def calculate_time_to_ready(skill_gaps: List[SkillLevel]) -> int:
    """
    Estimate time to readiness in months based on skill gaps
    """
    if not skill_gaps:
        return 0

    # Calculate weighted average gap
    total_weighted_gap = 0
    total_weight = 0

    for gap in skill_gaps:
        # Weight by target level (more important skills have higher weight)
        weight = gap.target_level
        total_weighted_gap += gap.gap * weight
        total_weight += weight

    if total_weight == 0:
        average_gap = 0
    else:
        average_gap = total_weighted_gap / total_weight

    # Convert gap to months (simplified formula)
    # Assume: 0-20 gap = 1-3 months, 20-40 gap = 3-6 months, 40-60 gap = 6-9 months, 60-80 gap = 9-12 months, 80+ gap = 12+ months
    if average_gap <= 20:
        months = 1 + (average_gap / 20) * 2  # 1-3 months
    elif average_gap <= 40:
        months = 3 + ((average_gap - 20) / 20) * 3  # 3-6 months
    elif average_gap <= 60:
        months = 6 + ((average_gap - 40) / 20) * 3  # 6-9 months
    elif average_gap <= 80:
        months = 9 + ((average_gap - 60) / 20) * 3  # 9-12 months
    else:
        months = 12 + ((average_gap - 80) / 20) * 6  # 12+ months

    return max(1, int(round(months)))

def store_skill_gap(resume_id: str, jd_id: str, skill_gaps: List[SkillLevel], similarity_score: float, time_to_ready: int):
    """
    Store skill gap in database
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Convert skill gaps to JSONB format
            missing_skills = []
            for gap in skill_gaps:
                if gap.gap > 0:  # Only include skills with gaps
                    missing_skills.append({
                        "skill_name": gap.skill_name,
                        "current_level": gap.current_level,
                        "target_level": gap.target_level,
                        "gap": gap.gap
                    })

            cursor.execute(
                """
                INSERT INTO skill_gaps (user_id, jd_id, missing_skills, similarity_score, time_to_ready_months)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    1,  # TODO: Get actual user ID from auth context
                    jd_id,  # Using JD ID as foreign key
                    json.dumps(missing_skills),
                    similarity_score,
                    time_to_ready
                )
            )
            conn.commit()
    except Exception as e:
        print(f"Error storing skill gap: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)