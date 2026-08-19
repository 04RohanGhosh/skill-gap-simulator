import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Redirect to login or handle token refresh
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: {
    name: string;
    email: string;
    password: string
  }) => api.post('/auth/register', userData),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh-token'),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (userData: {
    name?: string;
    email?: string;
    avatar_url?: string
  }) => api.put('/auth/profile', userData),
};

// Resume API endpoints
export const resumeAPI = {
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getResumes: () => api.get('/resume'),

  getResumeById: (id: string) => api.get(`/resume/${id}`),

  deleteResume: (id: string) => api.delete(`/resume/${id}`),
};

// Job Description API endpoints
export const jdAPI = {
  parseJobDescription: (text: string) =>
    api.post('/jd/parse', { text }),

  getJobDescriptions: () => api.get('/jd'),

  getJobDescriptionById: (id: string) => api.get(`/jd/${id}`),

  deleteJobDescription: (id: string) => api.delete(`/jd/${id}`),
};

// Skill Gap API endpoints
export const skillGapAPI = {
  calculateGap: (resumeId: string, jdId: string) =>
    api.post('/skills/gap', { resume_id: resumeId, jd_id: jdId }),

  getSkillGap: (id: string) => api.get(`/skills/gap/${id}`),

  getSkillGaps: () => api.get('/skills/gap'),
};

// Roadmap API endpoints
export const roadmapAPI = {
  generateRoadmap: (gapId: string, preferences: any = {}) =>
    api.post('/roadmap/generate', { gap_id: gapId, ...preferences }),

  getRoadmap: (id: string) => api.get(`/roadmap/${id}`),

  getRoadmaps: () => api.get('/roadmap'),
};

// Project Builder API endpoints
export const projectAPI = {
  getProjectSpecs: () => api.get('/projects/specs'),

  getProjectSpecById: (id: string) => api.get(`/projects/specs/${id}`),
};

// GitHub Integration API endpoints
export const githubAPI = {
  connectGithub: () => api.get('/github/connect'),

  getUserRepos: () => api.get('/github/repos'),

  analyzeRepo: (repoUrl: string) =>
    api.post('/github/analyze', { repo_url: repoUrl }),

  getRepoAnalysis: (repoId: string) => api.get(`/github/analysis/${repoId}`),

  getRepoVerifications: () => api.get('/github/verifications'),
};

// Verification API endpoints
export const verificationAPI = {
  submitVerification: (repoId: string, skillId: string) =>
    api.post('/verification/submit', { repo_id: repoId, skill_id: skillId }),

  getVerificationResult: (verificationId: string) =>
    api.get(`/verification/${verificationId}`),

  getVerifications: () => api.get('/verification'),
};

// Admin API endpoints
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),

  getUserById: (id: string) => api.get(`/admin/users/${id}`),

  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),

  toggleUserStatus: (id: string) =>
    api.patch(`/admin/users/${id}/status`),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  getSkills: () => api.get('/admin/skills'),

  addSkill: (skillData: {
    name: string;
    category: string;
    description: string;
    level: string
  }) => api.post('/admin/skills', skillData),

  updateSkill: (id: string, skillData: any) =>
    api.put(`/admin/skills/${id}`, skillData),

  deleteSkill: (id: string) => api.delete(`/admin/skills/${id}`),

  getSystemStats: () => api.get('/admin/stats'),
};

// Export the api instance for direct use when needed
export default api;