from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import json
from typing import List, Dict, Any
import redis
import hashlib
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime, timedelta

app = FastAPI(title="Roadmap Generator Service", description="Service for generating personalized learning roadmaps")

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

class LearningResource(BaseModel):
    title: str
    type: str  # video, article, docs, tutorial, etc.
    url: str
    time_minutes: int

class BuildProject(BaseModel):
    title: str
    description: str
    tech_stack: List[str]
    estimated_hours: int
    resources: List[LearningResource]
    prerequisites: List[int]  # Week numbers

class LearnActivity(BaseModel):
    title: str
    type: str
    url: str
    time_minutes: int

class WeekPlan(BaseModel):
    week: int
    title: str
    focus: List[str]
    build: BuildProject
    learn: List[LearnActivity]
    xp: int

class RoadmapResponse(BaseModel):
    weeks: List[WeekPlan]
    total_xp: int
    estimated_completion_date: str  # ISO date string

class GenerateRoadmapRequest(BaseModel):
    skill_gap_id: str
    user_preferences: Dict[str, Any] = {}

@app.post("/generate-roadmap", response_model=RoadmapResponse)
async def generate_roadmap(request: GenerateRoadmapRequest):
    """
    Generate a personalized learning roadmap based on skill gaps
    """
    if not request.skill_gap_id:
        raise HTTPException(status_code=400, detail="Skill gap ID is required")

    # Get skill gap data from database
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT missing_skills, similarity_score, time_to_ready_months FROM skill_gaps WHERE id = %s
                """,
                (request.skill_gap_id,)
            )
            skill_gap_result = cursor.fetchone()
            if not skill_gap_result:
                raise HTTPException(status_code=404, detail="Skill gap not found")

            missing_skills_data = skill_gap_result['missing_skills']
            similarity_score = skill_gap_result['similarity_score']
            time_to_ready = skill_gap_result['time_to_ready_months']
    finally:
        conn.close()

    # Convert missing_skills from JSONB to list
    if isinstance(missing_skills_data, str):
        skill_gaps = json.loads(missing_skills_data)
    else:
        skill_gaps = missing_skills_data

    # Create a cache key based on the input
    cache_key = hashlib.md5(
        json.dumps({
            'skill_gap_id': request.skill_gap_id,
            'user_preferences': request.user_preferences
        }).encode()
    ).hexdigest()

    # Check cache first
    if redis_client:
        cached_result = redis_client.get(f"roadmap:{cache_key}")
        if cached_result:
            return RoadmapResponse.parse_raw(cached_result)

    # Generate roadmap
    roadmap = generate_personalized_roadmap(skill_gaps, request.user_preferences)

    # Cache the result for 24 hours
    if redis_client:
        redis_client.setex(f"roadmap:{cache_key}", 86400, roadmap.json())

    # Store roadmap in database
    store_roadmap(request.skill_gap_id, roadmap)

    return roadmap

def generate_personalized_roadmap(skill_gaps: List[Dict[str, Any]], user_preferences: Dict[str, Any]) -> RoadmapResponse:
    """
    Generate a personalized learning roadmap based on skill gaps
    """
    # Sort skill gaps by gap size (largest gap first) and importance
    sorted_gaps = sorted(
        skill_gaps,
        key=lambda x: (x.get('gap', 0), x.get('target_level', 0)),
        reverse=True
    )

    weeks = []
    current_week = 1

    # Determine number of weeks based on total gaps and user preferences
    weeks_count = min(len(sorted_gaps) + 2, 12)  # Cap at 12 weeks, minimum 2 weeks buffer
    weeks_per_skill = max(1, weeks_count // len(sorted_gaps)) if sorted_gaps else 1

    # Generate weeks for each skill gap
    for i, gap in enumerate(sorted_gaps):
        skill_name = gap.get('skill_name', 'Unknown Skill')
        gap_size = gap.get('gap', 50)
        importance = gap.get('target_level', 50)

        # Determine weeks to allocate for this skill
        skill_weeks = max(1, int((gap_size / 100) * weeks_per_skill * 2))  # Scale by gap size

        for week_offset in range(skill_weeks):
            if current_week > weeks_count:
                break

            week_plan = generate_week_plan(
                week_number=current_week,
                skill_name=skill_name,
                gap_size=gap_size,
                importance=importance,
                is_first_week=(week_offset == 0),
                is_last_week=(week_offset == skill_weeks - 1),
                user_preferences=user_preferences
            )
            weeks.append(week_plan)
            current_week += 1

    # If we have remaining weeks, add review and practice weeks
    while current_week <= weeks_count:
        week_plan = generate_week_plan(
            week_number=current_week,
            skill_name="Review & Practice",
            gap_size=0,
            importance=0,
            is_first_week=False,
            is_last_week=(current_week == weeks_count),
            user_preferences=user_preferences
        )
        weeks.append(week_plan)
        current_week += 1

    # Calculate total XP
    total_xp = sum(week.xp for week in weeks)

    # Estimate completion date (assuming 10 hours per week)
    estimated_weeks = weeks_count
    estimated_hours = estimated_weeks * 10
    # In a real app, this would calculate based on user's available time
    estimated_completion = datetime.now() + timedelta(weeks=estimated_weeks)

    return RoadmapResponse(
        weeks=weeks,
        total_xp=total_xp,
        estimated_completion_date=estimated_completion.isoformat()
    )

def generate_week_plan(week_number: int, skill_name: str, gap_size: int, importance: int,
                      is_first_week: bool, is_last_week: bool, user_preferences: Dict[str, Any]) -> WeekPlan:
    """
    Generate a single week plan
    """
    # Determine focus areas
    focus = [skill_name]
    if gap_size > 70:
        focus.append("Fundamentals")
    elif gap_size > 40:
        focus.append("Intermediate Concepts")
    else:
        focus.append("Advanced Topics")

    # Determine build project
    if is_first_week:
        build_title = f"Introduction to {skill_name}"
        build_description = f"Learn the basics of {skill_name} and set up your development environment"
        tech_stack = [skill_name, "Basics"]
        estimated_hours = 5
    elif is_last_week:
        build_title = f"Capstone Project: {skill_name} Application"
        build_description = f"Build a comprehensive project demonstrating your {skill_name} skills"
        tech_stack = [skill_name, "Advanced", "Integration"]
        estimated_hours = 15
    else:
        build_title = f"Practical {skill_name} Project"
        build_description = f"Apply {skill_name} concepts to build a practical application"
        tech_stack = [skill_name, "Practical"]
        estimated_hours = 10

    # Determine learning resources
    learn_resources = generate_learning_resources(skill_name, gap_size, importance)

    # Calculate XP for this week (based on gap size and hours)
    xp = int((gap_size / 100) * 100 + (estimated_hours * 10))  # Base XP + hourly XP
    xp = max(100, min(800, xp))  # Clamp between 100-800 XP per week

    return WeekPlan(
        week=week_number,
        title=f"Week {week_number}: {skill_name}",
        focus=focus,
        build=BuildProject(
            title=build_title,
            description=build_description,
            tech_stack=tech_stack,
            estimated_hours=estimated_hours,
            resources=learn_resources,
            prerequisites=[week_number - 1] if week_number > 1 else []
        ),
        learn=learn_resources,
        xp=xp
    )

def generate_learning_resources(skill_name: str, gap_size: int, importance: int) -> List[LearnActivity]:
    """
    Generate learning resources for a skill
    """
    resources = []

    # Default resources based on skill type
    skill_resources = {
        'Python': [
            LearningResource(title="Python Official Tutorial", type="docs", url="https://docs.python.org/3/tutorial/", time_minutes=60),
            LearningResource(title="Automate the Boring Stuff with Python", type="video", url="https://youtu.be/tKTZoB2Vjuk", time_minutes=600),
            LearningResource(title="Python for Data Science Handbook", type="docs", url="https://jakevdp.github.io/PythonDataScienceHandbook/", time_minutes=480)
        ],
        'SQL': [
            LearningResource(title="SQLZoo Tutorial", type="tutorial", url="https://sqlzoo.net/", time_minutes=90),
            LearningResource(title="SQLBolt", type="tutorial", url="https://sqlbolt.com/", time_minutes=60),
            LearningResource(title="Mode SQL Tutorial", type="tutorial", url="https://mode.com/sql-tutorial/", time_minutes=60)
        ],
        'AWS': [
            LearningResource(title="AWS Cloud Practitioner Essentials", type="video", url="https://www.youtube.com/watch?v=1v9gs3gkFQA", time_minutes=360),
            LearningResource(title="AWS Documentation", type="docs", url="https://aws.amazon.com/documentation/", time_minutes=120),
            LearningResource(title="AWS Well-Architected Framework", type="docs", url="https://aws.amazon.com/architecture/well-architected/", time_minutes=60)
        ],
        'Machine Learning': [
            LearningResource(title="Machine Learning Coursera", type="video", url="https://www.coursera.org/learn/machine-learning", time_minutes=3600),
            LearningResource(title="Hands-On Machine Learning with Scikit-Learn", type="docs", url="https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/", time_minutes=480),
            LearningResource(title="Deep Learning Specialization", type="video", url="https://www.coursera.org/specializations/deep-learning", time_minutes=3000)
        ],
        'Data Engineering': [
            LearningResource(title="Data Engineering Zoomcamp", type="video", url="httpswww.youtube.com/watch?v=UvSah1pD4qo", time_minutes=3600),
            LearningResource(title="Designing Data-Intensive Applications", type="docs", url="https://dataintensive.net/", time_minutes=480),
            LearningResource(title="Apache Kafka Documentation", type="docs", url="https://kafka.apache.org/documentation/", time_minutes=120)
        ],
        'DevOps': [
            LearningResource(title="DevOps Fundamentals", type="video", url="https://www.youtube.com/watch?v=_46-O6RGoS8", time_minutes=240),
            LearningResource(title="The DevOps Handbook", type="docs", url="https://itrevolution.com/book/the-devops-handbook/", time_minutes=480),
            LearningResource(title="Docker Documentation", type="docs", url="https://docs.docker.com/get-started/", time_minutes=120)
        ]
    }

    # Get resources for this skill, or use generic ones
    resources = skill_resources.get(skill_name, [
        LearningResource(title=f"{skill_name} Official Documentation", type="docs", url=f"https://www.google.com/search?q={skill_name}+documentation", time_minutes=60),
        LearningResource(title=f"{skill_name} Tutorial for Beginners", type="video", url=f"https://www.youtube.com/results?search_query={skill_name}+tutorial+for+beginners", time_minutes=120),
        LearningResource(title=f"{skill_name} Best Practices", type="article", url=f"https://www.google.com/search?q={skill_name}+best+practices", time_minutes=30)
    ])

    # Adjust number of resources based on gap size and importance
    if gap_size > 70 or importance > 70:
        # Show all resources for high priority/high gap skills
        pass
    elif gap_size > 40 or importance > 40:
        # Show medium number of resources
        resources = resources[:3] if len(resources) > 3 else resources
    else:
        # Show fewer resources for low priority/low gap skills
        resources = resources[:2] if len(resources) > 2 else resources

    return resources

def store_roadmap(skill_gap_id: str, roadmap: RoadmapResponse):
    """
    Store roadmap in database
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Convert weeks to JSONB format
            weeks_json = []
            for week in roadmap.weeks:
                weeks_json.append({
                    "week": week.week,
                    "title": week.title,
                    "focus": week.focus,
                    "build": week.build.dict(),
                    "learn": [learn.dict() for learn in week.learn],
                    "xp": week.xp
                })

            cursor.execute(
                """
                INSERT INTO learning_roadmaps (user_id, jd_id, weeks, total_xp, estimated_completion_date)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    1,  # TODO: Get actual user ID from auth context
                    skill_gap_id,  # Using skill gap ID as reference to jd_id
                    json.dumps(weeks_json),
                    roadmap.total_xp,
                    roadmap.estimated_completion_date
                )
            )
            conn.commit()
    except Exception as e:
        print(f"Error storing roadmap: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8004, reload=True)