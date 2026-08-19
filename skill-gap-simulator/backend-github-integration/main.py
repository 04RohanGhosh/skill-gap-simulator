from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
import base64
from typing import List, Dict, Any
import requests
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib

app = FastAPI(title="GitHub Integration Service", description="Service for integrating with GitHub to verify skills")

# GitHub API configuration
GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")  # Should be set in environment variables

# PostgreSQL connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "skillgap"),
        user=os.getenv("POSTGRES_USER", "skillgap_user"),
        password=os.getenv("POSTGRES_PASSWORD", "skillgap_pass")
    )

class RepoAnalysisResponse(BaseModel):
    repo_id: str
    name: str
    description: str | None
    language: str | None
    stars: int
    forks: int
    open_issues: int
    size: int
    created_at: str
    updated_at: str
    pushed_at: str
    license: str | None
    topics: List[str]
    verification_score: int
    status: str  # "analyzing", "completed", "failed"

class RepoAnalysisRequest(BaseModel):
    repo_url: str
    user_id: str

class VerificationRequest(BaseModel):
    repo_id: str
    skill_id: str
    user_id: str

class VerificationResponse(BaseModel):
    verification_id: str
    repo_id: str
    skill_id: str
    score: int
    feedback: str
    next_steps: List[str]
    skill_verification: Dict[str, Any]

@app.post("/analyze", response_model=RepoAnalysisResponse)
async def analyze_repo(request: RepoAnalysisRequest):
    """
    Analyze a GitHub repository to verify skills
    """
    # Extract owner and repo name from URL
    try:
        # Handle various GitHub URL formats
        url = request.repo_url.strip()
        if url.endswith(".git"):
            url = url[:-4]

        parts = url.rstrip("/").split("/")
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL")

        owner = parts[-2]
        repo_name = parts[-1]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse GitHub URL: {str(e)}")

    # Check if we have this repo already analyzed in database
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT * FROM github_repos WHERE repo_url = %s AND user_id = %s
                """,
                (request.repo_url, request.user_id)
            )
            existing_repo = cursor.fetchone()

            # If we have a recent analysis (less than 24 hours old), return it
            if existing_repo and existing_repo['analyzed_at']:
                analyzed_at = existing_repo['analyzed_at']
                if isinstance(analyzed_at, str):
                    analyzed_at = datetime.fromisoformat(analyzed_at.replace('Z', '+00:00'))
                if (datetime.now() - analyzed_at).total_seconds() < 24 * 3600:  # 24 hours
                    return RepoAnalysisResponse(
                        repo_id=existing_repo['repo_url'],
                        name=existing_repo['repo_name'] or "",
                        description=existing_repo['description'],
                        language=existing_repo['language'],
                        stars=existing_repo['stars'] or 0,
                        forks=existing_repo['forks'] or 0,
                        open_issues=existing_repo['open_issues'] or 0,
                        size=existing_repo['size'] or 0,
                        created_at=existing_repo['created_at'].isoformat() if existing_repo['created_at'] else "",
                        updated_at=existing_repo['updated_at'].isoformat() if existing_repo['updated_at'] else "",
                        pushed_at=existing_repo['pushed_at'].isoformat() if existing_repo['pushed_at'] else "",
                        license=existing_repo['license'],
                        topics=existing_repo['topics'] or [],
                        verification_score=existing_repo['verification_score'] or 0,
                        status=existing_repo['status'] or "completed"
                    )
    finally:
        conn.close()

    # If we don't have a recent analysis, fetch from GitHub API
    try:
        # Fetch repository information
        repo_data = await fetch_github_repo(owner, repo_name)

        # Fetch additional metrics
        languages_data = await fetch_github_languages(owner, repo_name)
        contributors_data = await fetch_github_contributors(owner, repo_name)
        commits_data = await fetch_github_commits(owner, repo_name)

        # Calculate verification score
        verification_score = calculate_verification_score(
            repo_data, languages_data, contributors_data, commits_data
        )

        # Determine status
        status = "completed" if verification_score >= 60 else "failed"

        # Store or update repo analysis in database
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Check if repo already exists
                cursor.execute(
                    """
                    SELECT id FROM github_repos WHERE repo_url = %s AND user_id = %s
                    """,
                    (request.repo_url, request.user_id)
                )
                existing = cursor.fetchone()

                if existing:
                    # Update existing record
                    cursor.execute(
                        """
                        UPDATE github_repos
                        SET repo_name = %s,
                            description = %s,
                            language = %s,
                            stars = %s,
                            forks = %s,
                            open_issues = %s,
                            size = %s,
                            created_at = %s,
                            updated_at = %s,
                            pushed_at = %s,
                            license = %s,
                            topics = %s,
                            verification_score = %s,
                            status = %s,
                            analyzed_at = NOW()
                        WHERE repo_url = %s AND user_id = %s
                        """,
                        (
                            repo_data.get("name", ""),
                            repo_data.get("description"),
                            repo_data.get("language"),
                            repo_data.get("stargazers_count", 0),
                            repo_data.get("forks_count", 0),
                            repo_data.get("open_issues_count", 0),
                            repo_data.get("size", 0),
                            repo_data.get("created_at", ""),
                            repo_data.get("updated_at", ""),
                            repo_data.get("pushed_at", ""),
                            repo_data.get("license", {}).get("name") if repo_data.get("license") else None,
                            repo_data.get("topics", []),
                            verification_score,
                            status,
                            request.repo_url,
                            request.user_id
                        )
                    )
                else:
                    # Insert new record
                    cursor.execute(
                        """
                        INSERT INTO github_repos (
                            user_id, repo_url, repo_name, description, language,
                            stars, forks, open_issues, size, created_at, updated_at,
                            pushed_at, license, topics, verification_score, status, analyzed_at
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                        """,
                        (
                            request.user_id,
                            request.repo_url,
                            repo_data.get("name", ""),
                            repo_data.get("description"),
                            repo_data.get("language"),
                            repo_data.get("stargazers_count", 0),
                            repo_data.get("forks_count", 0),
                            repo_data.get("open_issues_count", 0),
                            repo_data.get("size", 0),
                            repo_data.get("created_at", ""),
                            repo_data.get("updated_at", ""),
                            repo_data.get("pushed_at", ""),
                            repo_data.get("license", {}).get("name") if repo_data.get("license") else None,
                            repo_data.get("topics", []),
                            verification_score,
                            status
                        )
                    )
                conn.commit()
        finally:
            conn.close()

        return RepoAnalysisResponse(
            repo_id=request.repo_url,
            name=repo_data.get("name", ""),
            description=repo_data.get("description"),
            language=repo_data.get("language"),
            stars=repo_data.get("stargazers_count", 0),
            forks=repo_data.get("forks_count", 0),
            open_issues=repo_data.get("open_issues_count", 0),
            size=repo_data.get("size", 0),
            created_at=repo_data.get("created_at", ""),
            updated_at=repo_data.get("updated_at", ""),
            pushed_at=repo_data.get("pushed_at", ""),
            license=repo_data.get("license", {}).get("name") if repo_data.get("license") else None,
            topics=repo_data.get("topics", []),
            verification_score=verification_score,
            status=status
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"GitHub API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/verify", response_model=VerificationResponse)
async def verify_skill(request: VerificationRequest):
    """
    Verify a skill based on GitHub repository analysis
    """
    # In a real implementation, this would:
    # 1. Check if the repo has already been analyzed
    # 2. If not, analyze it
    # 3. Match the repo analysis to the skill requirements
    # 4. Return verification results

    # For now, return mock verification data
    # In a real implementation, we would fetch the repo analysis from database
    # and match it to the skill requirements

    return VerificationResponse(
        verification_id=f"verify_{request.repo_id}_{request.skill_id}_{int(datetime.now().timestamp())}",
        repo_id=request.repo_id,
        skill_id=request.skill_id,
        score=85,
        feedback="Great project! Add more unit tests for edge cases to improve score.",
        next_steps=[
            "Add more comprehensive test cases",
            "Improve documentation with examples",
            "Address minor code style issues"
        ],
        skill_verification={
            "skill_id": request.skill_id,
            "skill_name": "RAG Systems",
            "current_level": 32,
            "new_level": 55,
            "xp_awarded": 400
        }
    )

async def fetch_github_repo(owner: str, repo_name: str) -> Dict[str, Any]:
    """
    Fetch repository information from GitHub API
    """
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo_name}"
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch repository")

    return response.json()

async def fetch_github_languages(owner: str, repo_name: str) -> Dict[str, Any]:
    """
    Fetch language statistics from GitHub API
    """
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo_name}/languages"
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {}  # Return empty dict if languages endpoint fails

    return response.json()

async def fetch_github_contributors(owner: str, repo_name: str) -> List[Dict[str, Any]]:
    """
    Fetch contributors from GitHub API
    """
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo_name}/contributors"
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return []  # Return empty list if contributors endpoint fails

    return response.json()

async def fetch_github_commits(owner: str, repo_name: str) -> List[Dict[str, Any]]:
    """
    Fetch recent commits from GitHub API
    """
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo_name}/commits"
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    # Get commits from last 30 days
    since_date = (datetime.now() - timedelta(days=30)).isoformat()
    params = {"since": since_date}

    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        return []  # Return empty list if commits endpoint fails

    return response.json()

def calculate_verification_score(repo_data: Dict[str, Any],
                                languages_data: Dict[str, Any],
                                contributors_data: List[Dict[str, Any]],
                                commits_data: List[Dict[str, Any]]) -> int:
    """
    Calculate verification score based on multiple factors
    """
    score = 0

    # 1. Repository popularity (0-25 points)
    stars = repo_data.get("stargazers_count", 0)
    forks = repo_data.get("forks_count", 0)
    # Normalize stars and forks (logarithmic scale)
    import math
    stars_score = min(15, int(math.log(max(1, stars + 1)) * 5))  # 0-15 points
    forks_score = min(10, int(math.log(max(1, forks + 1)) * 3.3))  # 0-10 points
    score += stars_score + forks_score

    # 2. Recent activity (0-20 points)
    if commits_data:
        # Score based on number of recent commits
        commit_count = len(commits_data)
        commit_score = min(20, int(commit_count / 3))  # 0-20 points (20 commits = max)
        score += commit_score

    # 3. Community engagement (0-15 points)
    if contributors_data:
        contributor_count = len(contributors_data)
        contributor_score = min(15, int(contributor_count / 2))  # 0-15 points (30 contributors = max)
        score += contributor_score

    # 4. Documentation and setup (0-20 points)
    has_readme = bool(repo_data.get("description"))
    has_license = bool(repo_data.get("license"))
    docs_score = 0
    if has_readme:
        docs_score += 10
    if has_license:
        docs_score += 10
    score += docs_score

    # 5. Code quality indicators (0-20 points)
    # Check for common configuration files that indicate good practices
    # This would require fetching repository contents, simplified here
    quality_indicators = 0
    # In a real implementation, we would check for:
    # - .github/workflows/ (CI/CD)
    # - Dockerfile
    # - requirements.txt or package.json
    # - .gitignore
    # - TESTING.md or similar
    # For now, we'll simulate based on repo size and language
    if repo_data.get("size", 0) > 100:  # Non-trivial size
        quality_indicators += 10
    if languages_data and len(languages_data) > 1:  # Multiple languages
        quality_indicators += 10

    score += quality_indicators

    # Ensure score is within 0-100 range
    return max(0, min(100, score))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)