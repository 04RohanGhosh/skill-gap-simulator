from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import spacy
import re
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import time

app = FastAPI(title="Job Description Parser Service", description="Service for parsing job descriptions and extracting skill requirements")

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_md")
except IOError:
    nlp = spacy.blank("en")
    print("Warning: spaCy model not found, using blank model")

# PostgreSQL connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "skillgap"),
        user=os.getenv("POSTGRES_USER", "skillgap_user"),
        password=os.getenv("POSTGRES_PASSWORD", "skillgap_pass")
    )

class SkillRequirement(BaseModel):
    skill_id: str
    skill_name: str
    importance: int  # 1-100
    evidence: str

class ParseJDResponse(BaseModel):
    jd_id: str
    raw_text_length: int
    parsed_skills: List[SkillRequirement]
    processing_time_ms: float

class ParseJDRequest(BaseModel):
    text: str

@app.post("/parse-jd", response_model=ParseJDResponse)
async def parse_job_description(request: ParseJDRequest):
    """
    Parse a job description text and extract skill requirements
    """
    start_time = time.time()

    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Job description text is empty")

    raw_text = request.text.strip()

    # Process text with spaCy
    doc = nlp(raw_text)

    # Extract skill requirements
    skills = extract_skill_requirements(doc, raw_text)

    processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds

    # Store JD in database and get JD ID
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Insert JD record
            cursor.execute(
                """
                INSERT INTO job_descriptions (user_id, raw_text, parsed_data)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (
                    1,  # TODO: Get actual user ID from auth context
                    raw_text,
                    {"skills": [skill.dict() for skill in skills]}
                )
            )
            jd_id = cursor.fetchone()['id']
            conn.commit()
    finally:
        conn.close()

    # Generate a JD ID for response (in addition to database ID)
    jd_response_id = hashlib.md5((raw_text + str(start_time)).encode()).hexdigest()[:8]

    return ParseJDResponse(
        jd_id=jd_response_id,
        raw_text_length=len(raw_text),
        parsed_skills=skills,
        processing_time_ms=round(processing_time, 2)
    )

def extract_skill_requirements(doc, raw_text: str) -> List[SkillRequirement]:
    """
    Extract skill requirements from processed spaCy document
    """
    skills = []

    # Common technical skills to look for in job descriptions
    technical_skills = {
        'Programming Languages': [
            'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Ruby', 'Go',
            'Rust', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'
        ],
        'Web Technologies': [
            'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
            'Django', 'Flask', 'Spring', 'ASP.NET'
        ],
        'Databases': [
            'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
            'Oracle', 'SQL Server', 'SQLite'
        ],
        'Cloud & DevOps': [
            'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
            'Jenkins', 'GitLab CI', 'GitHub Actions', 'Ansible'
        ],
        'Data Science & ML': [
            'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
            'Pandas', 'NumPy', 'SciPy', 'Tableau', 'Power BI', 'Natural Language Processing'
        ],
        'Other Skills': [
            'Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication',
            'Problem Solving', 'Critical Thinking'
        ]
    }

    # Flatten the skills dictionary for easier lookup
    all_skills = []
    for category, skill_list in technical_skills.items():
        all_skills.extend([(skill, category) for skill in skill_list])

    # Extract skills using pattern matching
    found_skills = set()
    text_lower = raw_text.lower()

    # Check for exact matches in the text
    for skill, category in all_skills:
        if skill.lower() in text_lower:
            # Avoid duplicates
            if skill not in found_skills:
                found_skills.add(skill)
                # Estimate importance based on context (simplified)
                importance = estimate_importance(skill, raw_text)
                skills.append(SkillRequirement(
                    skill_id=hashlib.md5(skill.encode()).hexdigest()[:8],
                    skill_name=skill,
                    importance=importance,
                    evidence=f"Found in job description text (category: {category})"
                ))

    # Also extract using NER for multi-word phrases
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "TECH"]:  # Adjust based on your NER model
            entity_text = ent.text.strip()
            # Check if entity matches any known skills
            for skill, category in all_skills:
                if skill.lower() in entity_text.lower() or entity_text.lower() in skill.lower():
                    if skill not in found_skills:
                        found_skills.add(skill)
                        importance = estimate_importance(skill, raw_text)
                        skills.append(SkillRequirement(
                            skill_id=hashlib.md5(skill.encode()).hexdigest()[:8],
                            skill_name=skill,
                            importance=importance,
                            evidence=f"Extracted from named entity: {entity_text}"
                        ))

    # If no skills found, return some default skills for demonstration
    if not skills:
        default_skills = [
            ('Python', 'Programming Languages', 90),
            ('AWS', 'Cloud & DevOps', 80),
            ('SQL', 'Databases', 70)
        ]
        for skill, category, importance in default_skills:
            skills.append(SkillRequirement(
                skill_id=hashlib.md5(skill.encode()).hexdigest()[:8],
                skill_name=skill,
                importance=importance,
                evidence=f"Default skill requirement for demonstration (category: {category})"
            ))

    return skills

def estimate_importance(skill: str, raw_text: str) -> int:
    """
    Estimate importance level based on context in job description
    """
    text_lower = raw_text.lower()
    skill_lower = skill.lower()

    # Count occurrences of the skill
    occurrences = text_lower.count(skill_lower)

    # Look for importance indicators
    high_importance_indicators = ['required', 'must have', 'essential', 'critical', 'key']
    medium_importance_indicators = ['preferred', 'desired', 'plus', 'nice to have']
    low_importance_indicators = ['familiarity with', 'experience with', 'knowledge of']

    # Check for indicators near the skill
    skill_positions = [i for i in range(len(text_lower)) if text_lower.startswith(skill_lower, i)]
    high_score = 0
    medium_score = 0
    low_score = 0

    for pos in skill_positions:
        # Check context before and after the skill mention
        start = max(0, pos - 150)
        end = min(len(text_lower), pos + len(skill) + 150)
        context = text_lower[start:end]

        for indicator in high_importance_indicators:
            if indicator in context:
                high_score += 1

        for indicator in medium_importance_indicators:
            if indicator in context:
                medium_score += 1

        for indicator in low_importance_indicators:
            if indicator in context:
                low_score += 1

    # Base importance on occurrence count
    base_importance = min(50 + (occurrences * 15), 95)  # Cap at 95%

    # Adjust based on context
    if high_score > medium_score and high_score > low_score:
        base_importance = min(base_importance + 10, 100)
    elif medium_score > high_score and medium_score > low_score:
        base_importance = base_importance  # No change
    elif low_score > high_score and low_score > medium_score:
        base_importance = max(base_importance - 15, 10)

    # Ensure importance is within valid range
    return max(1, min(100, base_importance))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)