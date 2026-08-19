# Skill Gap Simulator

A comprehensive platform for identifying skill gaps between resumes and job descriptions, generating personalized learning roadmaps, and verifying skills through project-based assessments.

## Overview

The Skill Gap Simulator helps users:
1. Upload their resume and paste a job description
2. Analyze skill gaps with percentage-based proficiency levels
3. Generate personalized weekly learning roadmaps
4. Build projects and verify skills through GitHub integration
5. Track progress toward job readiness

## Architecture

The platform uses a macro-service (microservice-lite) architecture:

- **Frontend**: React 18 + TypeScript + Vite (to be implemented)
- **Backend Services**:
  - API Gateway: Node.js/Express (authentication, routing)
  - Resume Parser: Python/FastAPI (PDF/DOCX parsing, skill extraction)
  - JD Parser: Python/FastAPI (job description parsing, skill extraction)
  - Skill Gap Calculator: Python/FastAPI (similarity analysis, gap calculation)
  - Roadmap Generator: Python/FastAPI (personalized learning plans)
  - GitHub Integration: Python/FastAPI (repository analysis, skill verification)
  - Code Evaluation: Python/FastAPI (sandboxed code execution)
  - WebSocket Service: Python/FastAPI (real-time updates)

- **Database**: PostgreSQL 15 + pgvector (primary data storage)
- **Caching**: Redis (session storage, query caching)
- **AI/ML**: spaCy + Sentence-Transformers (NLP, embeddings)

## Services

1. **API Gateway** (port 8000): Authentication, request routing, rate limiting
2. **Resume Parser** (port 8001): Extracts skills from resumes (PDF/DOCX)
3. **JD Parser** (port 8002): Extracts skills from job descriptions
4. **Skill Gap Calculator** (port 8003): Computes skill gaps and similarity scores
5. **Roadmap Generator** (port 8004): Creates personalized learning roadmaps
6. **GitHub Integration** (port 8005): Analyzes repositories for skill verification
7. **Code Evaluation** (port 8006): Executes and evaluates code in sandboxed environments
8. **WebSocket Service** (port 8007): Provides real-time updates to clients

## Setup

### Prerequisites

- Docker and Docker Compose
- GitHub API token (for repository analysis)
- JWT secret key (for authentication)

### Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# PostgresSQL Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=skillgap
POSTGRES_USER=skillgap_user
POSTGRES_PASSWORD=skillgap_pass

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# GitHub API
GITHUB_TOKEN=your_github_token_here

# JWT Settings
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Services Ports
API_GATEWAY_PORT=8000
RESUME_PARSER_PORT=8001
JD_PARSER_PORT=8002
SKILL_GAP_PORT=8003
ROADMAP_GENERATOR_PORT=8004
GITHUB_INTEGRATION_PORT=8005
CODE_EVALUATION_PORT=8006
WEBSOCKET_PORT=8007
```

### Installation and Running

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the required values
3. Start the services:

```bash
docker-compose up --build
```

The services will be available at:
- API Gateway: http://localhost:8000
- Resume Parser: http://localhost:8001
- JD Parser: http://localhost:8002
- Skill Gap Calculator: http://localhost:8003
- Roadmap Generator: http://localhost:8004
- GitHub Integration: http://localhost:8005
- Code Evaluation: http://localhost:8006
- WebSocket Service: http://localhost:8007

### Health Check

Check if all services are healthy:

```bash
docker-compose ps
```

Or check individual service health endpoints:
- API Gateway: http://localhost:8000/health
- Resume Parser: http://localhost:8001/health
- etc.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Resume Parser
- POST `/parse-resume` - Upload and parse resume (PDF/DOCX)
- GET `/resume/{id}` - Get parsed resume by ID

### JD Parser
- POST `/parse-jd` - Parse job description text
- GET `/jd/{id}` - Get parsed job description by ID

### Skill Gap Calculator
- POST `/calculate-gap` - Calculate skill gap between resume and JD
- GET `/gap/{id}` - Get skill gap calculation by ID

### Roadmap Generator
- POST `/generate-roadmap` - Generate personalized learning roadmap
- GET `/roadmap/{id}` - Get generated roadmap by ID

### GitHub Integration
- POST `/analyze` - Analyze GitHub repository for skill verification
- POST `/verify` - Verify skill based on GitHub repository
- GET `/analysis/{repo_id}` - Get repository analysis results

### Code Evaluation
- POST `/evaluate` - Evaluate code submission
- GET `/evaluation/{id}` - Get evaluation results by ID

### WebSocket
- WS `/ws/{user_id}` - Connect for real-time updates

## Database Schema

### Core Tables
- `users`: User accounts and authentication
- `resumes`: Parsed resume data
- `job_descriptions`: Parsed job description data
- `skills`: Master skills list
- `user_skills`: User skill proficiencies
- `skill_gaps`: Calculated skill gaps between resumes and JDs
- `learning_roadmaps`: Generated learning roadmaps
- `github_repos`: GitHub repository analysis results
- `code_evaluations`: Code evaluation results

## Features

### Skill Analysis
- Resume and job description parsing using spaCy NER
- Skill extraction and proficiency inference
- Embedding-based similarity calculation using Sentence-Transformers
- Gap analysis with time-to-readiness estimation

### Personalized Learning
- Weekly roadmap generation based on skill gaps
- Build projects and learn activities for each week
- Prerequisite tracking and XP rewards
- Resource recommendations (videos, articles, docs)

### Skill Verification
- GitHub repository analysis (stars, forks, activity, languages)
- Static analysis for code quality
- Project-based skill verification
- Automated feedback and improvement suggestions

### Real-time Updates
- WebSocket connections for live skill gap updates
- Roadmap progress notifications
- Verification result broadcasting
- Achievement and badge alerts

## Development

### Backend Services
Each backend service is in its own directory with:
- `main.py`: FastAPI application entry point
- `requirements.txt`: Python dependencies
- `Dockerfile`: Container configuration
- `.env.example`: Environment variable template

### API Gateway
The API gateway is a Node.js/Express service with:
- `server.js`: Entry point
- `src/`: Source code organized by concern
- `package.json`: Node.js dependencies
- `Dockerfile`: Container configuration

### Testing
Run tests for individual services:
```bash
# For Python services
cd backend-service-name
pip install -r requirements.txt
pytest

# For Node.js service
cd backend-api-gateway
npm install
npm test
```

## Production Deployment

For production deployment:
1. Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
2. Use managed Redis (AWS ElastiCache, Google Cloud Memorystore, etc.)
3. Deploy services to container orchestration platform (AWS ECS, Google Cloud Run, Kubernetes)
4. Set up load balancing and auto-scaling
5. Configure monitoring and logging (Prometheus, Grafana, ELK stack)
6. Implement CI/CD pipeline with automated testing

## Future Enhancements

- Mobile application (React Native)
- Skill taxonomy expansion and community curation
- Learning resource marketplace with user submissions
- Team accounts for corporate upskilling
- Interview preparation module
- Adaptive learning roadmaps that adjust based on performance
- Peer review system for project feedback
- Integration with learning platforms (LTI compliance)
- AI career coach with conversational interface

## License

MIT License

## Contact

For questions and support, please open an issue in the repository.