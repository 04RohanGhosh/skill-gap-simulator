-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    raw_text JSONB,
    parsed_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Descriptions table
CREATE TABLE IF NOT EXISTS job_descriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    raw_text TEXT,
    parsed_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills table (taxonomy)
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100), -- e.g., 'Programming', 'ML', 'Cloud', 'Soft Skills'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Skills table (many-to-many with proficiency)
CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100),
    source VARCHAR(50), -- 'resume', 'jd', 'inferred', 'verified'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

-- Skill Gaps table
CREATE TABLE IF NOT EXISTS skill_gaps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    jd_id INTEGER REFERENCES job_descriptions(id) ON DELETE CASCADE,
    missing_skills JSONB, -- Array of skill objects with gap details
    similarity_score DECIMAL(5,4), -- Cosine similarity score
    time_to_ready_months INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning Roadmaps table
CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    jd_id INTEGER REFERENCES job_descriptions(id) ON DELETE CASCADE,
    weeks JSONB, -- Array of week objects with build/learn activities
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GitHub Repos table
CREATE TABLE IF NOT EXISTS github_repos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    repo_url TEXT UNIQUE NOT NULL,
    repo_name VARCHAR(255),
    language VARCHAR(100),
    stars INTEGER DEFAULT 0,
    commit_frequency VARCHAR(50), -- e.g., 'active', 'moderate', 'low'
    verification_score INTEGER CHECK (verification_score >= 0 AND verification_score <= 100),
    status VARCHAR(50), -- 'connected', 'analyzing', 'verified', 'failed'
    analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Code Evaluations table
CREATE TABLE IF NOT EXISTS code_evaluations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    challenge_id VARCHAR(255),
    source_code TEXT,
    language VARCHAR(50),
    result BOOLEAN, -- pass/fail
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user_id ON skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_jd_id ON skill_gaps(jd_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_user_id ON learning_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_user_id ON github_repos(user_id);
CREATE INDEX IF NOT EXISTS idx_code_evaluations_user_id ON code_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_resumes_parsed_data ON resumes USING GIN(parsed_data);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_parsed_data ON job_descriptions USING GIN(parsed_data);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_missing_skills ON skill_gaps USING GIN(missing_skills);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_weeks ON learning_roadmaps USING GIN(weeks);
CREATE INDEX IF NOT EXISTS idx_audit_logs_details ON audit_logs USING GIN(details);