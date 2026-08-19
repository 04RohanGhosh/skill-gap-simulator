from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
import os
import tempfile
import traceback
from typing import Dict, Any, List
import spacy
import PyPDF2
import docx2txt
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib

app = FastAPI(title="Resume Parser Service", description="Service for parsing resumes and extracting skills")

# Load spaCy model (in production, you'd load this once at startup)
try:
    nlp = spacy.load("en_core_web_md")
except IOError:
    # Fallback if model not available
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

class SkillResponse(BaseModel):
    skill_id: str
    skill_name: str
    proficiency: int
    evidence: str

class ParseResumeResponse(BaseModel):
    resume_id: str
    filename: str
    parsed_skills: List[SkillResponse]
    raw_text_length: int
    processing_time_ms: float

@app.post("/parse-resume", response_model=ParseResumeResponse)
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse a resume file (PDF or DOCX) and extract skills
    """
    start_time = os.times().elapsed

    # Validate file type
    allowed_extensions = {'.pdf', '.docx', '.doc'}
    file_extension = os.path.splitext(file.filename)[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
        )

    # Validate file size (10MB limit)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 10MB"
        )

    # Reset file position for reading
    await file.seek(0)

    # Extract text based on file type
    raw_text = ""
    try:
        if file_extension == '.pdf':
            # Extract text from PDF
            pdf_reader = PyPDF2.PdfReader(file.file)
            for page in pdf_reader.pages:
                raw_text += page.extract_text() + "\n"
        elif file_extension in ['.docx', '.doc']:
            # Extract text from DOCX
            raw_text = docx2txt.process(file.file)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error extracting text from file: {str(e)}"
        )

    if not raw_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No text could be extracted from the file"
        )

    # Process text with spaCy for skill extraction
    doc = nlp(raw_text)

    # Extract skills using NER and rule-based approach
    skills = extract_skills(doc, raw_text)

    processing_time = (os.times().elapsed - start_time) * 1000  # Convert to milliseconds

    # Store resume in database and get resume ID
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Insert resume record
            cursor.execute(
                """
                INSERT INTO resumes (user_id, filename, raw_text, parsed_data)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (
                    1,  # TODO: Get actual user ID from auth context
                    file.filename,
                    raw_text,
                    {"skills": [skill.dict() for skill in skills]}
                )
            )
            resume_id = cursor.fetchone()['id']
            conn.commit()
    finally:
        conn.close()

    # Generate a resume ID for response (in addition to database ID)
    resume_response_id = hashlib.md5((file.filename + str(start_time)).encode()).hexdigest()[:8]

    return ParseResumeResponse(
        resume_id=resume_response_id,
        filename=file.filename,
        parsed_skills=skills,
        raw_text_length=len(raw_text),
        processing_time_ms=round(processing_time, 2)
    )

def extract_skills(doc, raw_text: str) -> List[SkillResponse]:
    """
    Extract skills from processed spaCy document
    """
    skills = []

    # Common technical skills to look for
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

    # Extract skills using NER and pattern matching
    found_skills = set()

    # Check for exact matches in the text
    text_lower = raw_text.lower()
    for skill, category in all_skills:
        if skill.lower() in text_lower:
            # Avoid duplicates
            if skill not in found_skills:
                found_skills.add(skill)
                # Estimate proficiency based on context (simplified)
                proficiency = estimate_proficiency(skill, raw_text)
                skills.append(SkillResponse(
                    skill_id=hashlib.md5(skill.encode()).hexdigest()[:8],
                    skill_name=skill,
                    proficiency=proficiency,
                    evidence=f"Found in resume text (category: {category})"
                ))

    # Also extract using NER for multi-word phrases
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT"]:  # Adjust based on your NER model
            entity_text = ent.text.strip()
            # Check if entity matches any known skills
            for skill, category in all_skills:
                if skill.lower() in entity_text.lower() or entity_text.lower() in skill.lower():
                    if skill not in found_skills:
                        found_skills.add(skill)
                        proficiency = estimate_proficiency(skill, raw_text)
                        skills.append(SkillResponse(
                            skill_id=hashlib.md5(skill.encode()).hexdigest()[:8],
                            skill_name=skill,
                            proficiency=proficiency,
                            evidence=f"Extracted from named entity: {entity_text}"
                        ))

    # If no skills found, return some default skills for demonstration
    if not skills:
        default_skills = [
            ('Python', 'Programming Languages', 75),
            ('SQL', 'Databases', 60),
            ('Communication', 'Other Skills', 80)
        ]
        for skill, category, proficiency in default_skills:
            skills.append(SkillResponse(
                skill_id=hashlib.md5(skill.encode()).hexdigest()[:8],
                skill_name=skill,
                proficiency=proficiency,
                evidence=f"Default skill assignment for demonstration (category: {category})"
            ))

    return skills

def estimate_proficiency(skill: str, raw_text: str) -> int:
    """
    Estimate proficiency level based on context in resume
    """
    text_lower = raw_text.lower()
    skill_lower = skill.lower()

    # Count occurrences of the skill
    occurrences = text_lower.count(skill_lower)

    # Look for proficiency indicators
    expert_indicators = ['expert', 'advanced', 'proficient', 'experienced', 'skilled']
    beginner_indicators = ['beginner', 'basic', 'familiar', 'introduction', 'learning']

    # Check for expert indicators near the skill
    skill_positions = [i for i in range(len(text_lower)) if text_lower.startswith(skill_lower, i)]
    expert_score = 0
    beginner_score = 0

    for pos in skill_positions:
        # Check context before and after the skill mention
        start = max(0, pos - 100)
        end = min(len(text_lower), pos + len(skill) + 100)
        context = text_lower[start:end]

        for indicator in expert_indicators:
            if indicator in context:
                expert_score += 1

        for indicator in beginner_indicators:
            if indicator in context:
                beginner_score += 1

    # Base proficiency on occurrence count
    base_proficiency = min(50 + (occurrences * 10), 90)  # Cap at 90%

    # Adjust based on context
    if expert_score > beginner_score:
        base_proficiency = min(base_proficiency + 10, 95)
    elif beginner_score > expert_score:
        base_proficiency = max(base_proficiency - 15, 25)

    # Ensure proficiency is within valid range
    return max(10, min(95, base_proficiency))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)