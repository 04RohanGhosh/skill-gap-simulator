import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Spacer, SimpleGrid, Card, CardBody, CardFooter, Badge, Divider, ScrollArea, Tabs, TabList, Tab, TabPanels, TabPanel, useDisclosure, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import { Link, useNavigate } from 'react-router-dom';
import { List, CheckCircle, XCircle, Loader2, Clock, Sparkles, Trophy, Code, Brain, Sparkles, Share2, Users, Calendar, TrendingUp, Edit, Search, Bell, Moon, Sun, FileText, Github, ShieldCheck, Camera, Brush, Palette, Tool } from '@heroicons/react/24/outline';

// Mock project data - in a real app, this would come from backend
const mockProjects = [
  {
    id: 1,
    title: 'Data Analysis Toolkit',
    description: 'Create a command-line tool that analyzes CSV files and generates statistical reports',
    week: 1,
    skills: ['Python', 'SQL'],
    techStack: ['Python', 'Pandas', 'NumPy'],
    estimatedHours: 8,
    difficulty: 'Beginner',
    resources: [
      { title: 'Python Official Tutorial', type: 'docs', url: 'https://docs.python.org/3/tutorial/', time: 60 },
      { title: 'Pandas Documentation', type: 'docs', url: 'https://pandas.pydata.org/docs/', time: 45 },
      { title: 'SQL Zoo Tutorial', type: 'tutorial', url: 'https://sqlzoo.net/', time: 90 },
    ],
    deliverables: [
      'Working Python script that accepts CSV files as input',
      'Ability to calculate basic statistics (mean, median, mode, std dev)',
      'Ability to filter and sort data based on column values',
      'Output results in both console and JSON formats',
      'README with setup and usage instructions',
    ],
    evaluationCriteria: {
      functionality: 40,
      codeQuality: 20,
      documentation: 20,
      innovation: 10,
      tests: 10,
    },
    githubTemplate: 'https://github.com/skillgap-simulator/templates/data-analysis-toolkit',
    isAvailable: true,
  },
  {
    id: 2,
    title: 'Interactive Dashboard',
    description: 'Build a web dashboard that visualizes data from APIs',
    week: 2,
    skills: ['Python', 'Data Engineering'],
    techStack: ['Python', 'Flask', 'Chart.js', 'HTML/CSS'],
    estimatedHours: 10,
    difficulty: 'Intermediate',
    resources: [
      { title: 'Flask Tutorial', type: 'docs', url: 'https://flask.palletsprojects.com/', time: 60 },
      { title: 'Chart.js Guide', type: 'tutorial', url: 'https://www.chartjs.org/docs/latest/', time: 45 },
    ],
    deliverables: [
      'Working Flask application with at least two routes',
      'Integration with a public API (e.g., OpenWeather, CoinGecko)',
      'Interactive charts using Chart.js',
      'Responsive design that works on mobile and desktop',
      'Deployment instructions for local development',
    ],
    evaluationCriteria: {
      functionality: 35,
      codeQuality: 25,
      documentation: 20,
      innovation: 10,
      tests: 10,
    },
    githubTemplate: 'https://github.com/skillgap-simulator/templates/interactive-dashboard',
    isAvailable: true,
  },
  {
    id: 3,
    title: 'Simple Chatbot',
    description: 'Create a chatbot that uses OpenAI API to answer questions',
    week: 3,
    skills: ['LLMs', 'LangChain'],
    techStack: ['Python', 'OpenAI API', 'LangChain'],
    estimatedHours: 12,
    difficulty: 'Intermediate',
    resources: [
      { title: 'LangChain Documentation', type: 'docs', url: 'https://python.langchain.com/docs/', time: 60 },
      { title: 'OpenAI API Guide', type: 'docs', url: 'https://platform.openai.com/docs/api-reference', time: 30 },
    ],
    deliverables: [
      'Working chatbot that can maintain context in conversations',
      'Integration with OpenAI API (GPT-3.5 or GPT-4)',
      'Ability to handle user inputs and generate appropriate responses',
      'Simple command-line or web interface',
      'Error handling for API failures and rate limits',
    ],
    evaluationCriteria: {
      functionality: 40,
      codeQuality: 20,
      documentation: 20,
      innovation: 10,
      tests: 10,
    },
    githubTemplate: 'https://github.com/skillgap-simulator/templates/simple-chatbot',
    isAvailable: true,
    isCurrent: true,
  },
  {
    id: 4,
    title: 'Document Q&A System',
    description: 'Build a Retrieval-Augmented Generation system for PDF documents',
    week: 4,
    skills: ['RAG', 'LLMs'],
    techStack: ['Python', 'LangChain', 'FAISS', ' Streamlit'],
    estimatedHours: 15,
    difficulty: 'Advanced',
    resources: [
      { title: 'Retrieval-Augmented Generation Paper', type: 'paper', url: 'https://arxiv.org/abs/2005.11401', time: 60 },
      { title: 'Hands-on RAG Tutorial', type: 'tutorial', url: 'https://www.assemblyai.com/blog/retrieval-augmented-generation/', time: 90 },
    ],
    deliverables: [
      'Working RAG system that can process PDF documents',
      'Ability to answer questions based on document content',
      'Vector storage for efficient similarity search',
      'User interface for document upload and questioning',
      'Performance optimization for large document sets',
    ],
    evaluationCriteria: {
      functionality: 35,
      codeQuality: 25,
      documentation: 20,
      innovation: 10,
      tests: 10,
    },
    githubTemplate: 'https://github.com/skillgap-simulator/templates/document-qa-system',
    isAvailable: true,
  },
  {
    id: 5,
    title: 'CI/CD Pipeline',
    description: 'Set up automated testing and deployment for your projects',
    week: 5,
    skills: ['Cloud', 'DevOps Practices'],
    techStack: ['AWS', 'Docker', 'GitHub Actions', 'Terraform'],
    estimatedHours: 12,
    difficulty: 'Advanced',
    resources: [
      { title: 'AWS Developer Guide', type: 'docs', url: 'https://aws.amazon.com/developer/', time: 60 },
      { title: 'GitHub Actions Documentation', type: 'docs', url: 'https://docs.github.com/en/actions', time: 45 },
    ],
    deliverables: [
      'Working GitHub Actions workflow for CI/CD',
      'Automated testing on push and pull request',
      'Automated deployment to staging environment',
      'Infrastructure as code using Terraform',
      'Monitoring and logging setup',
    ],
    evaluationCriteria: {
      functionality: 30,
      codeQuality: 25,
      documentation: 25,
      innovation: 10,
      tests: 10,
    },
    githubTemplate: 'https://github.com/skillgap-simulator/templates/ci-cd-pipeline',
    isAvailable: true,
  },
  {
    id: 6,
    title: 'Scalable Web Application',
    description: 'Design and implement a scalable web application architecture',
    week: 6,
    skills: ['System Design', 'Machine Learning Fundamentals'],
    techStack: ['System Design Principles', 'UML', 'API Design'],
    estimatedHours: 18,
    difficulty: 'Expert',
    resources: [
      { title: 'System Design Primer', type: 'github', url: 'https://github.com/donnemartin/system-design-primer', time: 90 },
      { title: 'API Design Best Practices', type: 'article', url: 'https://stackoverflow.com/blog/2020/03/02/best-practices-for-rest-api-design/', time: 45 },
    ],
    deliverables: [
      'Complete system design documentation',
      'API specification for a scalable web application',
      'Diagrams showing architecture components',
      'Technology stack justification',
      'Scalability and performance considerations',
    ],
    evaluationCriteria: {
      functionality: 25,
      codeQuality: 20,
      documentation: 30,
      innovation: 15,
      tests: 10,
    },
    githubTemplate: 'https://github.com/skillgap-simulator/templates/scalable-web-app',
    isAvailable: true,
  },
];

const ProjectBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore.getState();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useDisclosure();
  const [filter, setFilter] = useState({
    difficulty: 'all',
    skills: [],
    search: '',
  });

  useEffect(() => {
    // Simulate loading project data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredProjects = mockProjects
    .filter(project => {
      // Search filter
      if (filter.search &&
          !project.title.toLowerCase().includes(filter.search.toLowerCase()) &&
          !project.description.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }

      // Difficulty filter
      if (filter.difficulty !== 'all' && project.difficulty !== filter.difficulty) {
        return false;
      }

      // Skills filter
      if (filter.skills.length > 0) {
        const hasMatchingSkill = project.skills.some(skill =>
          filter.skills.includes(skill)
        );
        if (!hasMatchingSkill) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by: current week first, then by week number
      const aIsCurrent = a.isCurrent ? 0 : 1;
      const bIsCurrent = b.isCurrent ? 0 : 1;
      if (aIsCurrent !== bIsCurrent) return aIsCurrent - bIsCurrent;
      return a.week - b.week;
    });

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleStartProject = (project: any) => {
    // In a real app, this would initialize the project tracking
    setSelectedProject(null);
    setIsModalOpen(false);
    navigate(`/project/${project.id}`);
  };

  return (
    <Box minH="vh" bg="gradient-to-br from-gray-50 to-blue-50" py={12} px={4}>
      <Box className="flex items-center justify-between px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          leftIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
        >
          Back to Dashboard
        </Button>
        <Text size="sm" fontWeight="medium" color="gray-600">
          Choose Your Next Project
        </Text>
      </Box>

      <ScrollArea h="80vh">
        <VStack spacing={6} maxW="7xl" mx="auto" py={8}>
          {/* Header */}
          <VStack spacing={4} align="center" textAlign="center">
            <Box className="glass" p={6} rounded="2xl" display="inline-block">
              <Box w={16} h={16} bg="gradient-to-br from-blue-400 via-pink-500 to-red-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="2xl" fontWeight="bold">💻</Text>
              </Box>
            </Box>
            <Heading size="2xl">Project Builder</Heading>
            <Text size="sm" color="gray-600" maxW="md">
              Select a project to start building your skills
            </Text>
          </VStack>

          {/* Filters */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <Heading size="lg">Filter Projects</Heading>
              <Divider my={4} />
              <VStack spacing={4}>
                <HStack spacing={3} align="start" className="mb-2">
                  <Text size="sm" fontWeight="medium">Search</Text>
                  <Input
                    placeholder="Search projects..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  />
                </HStack>
                <HStack spacing={3} align="start" className="mb-2">
                  <Text size="sm" fontWeight="medium">Difficulty</Text>
                  <Select
                    value={filter.difficulty}
                    onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </Select>
                </HStack>
                <HStack spacing={3} align="start" className="mb-2">
                  <Text size="sm" fontWeight="medium">Skills</Tag>
                  <Box className="flex flex-wrap gap-2">
                    {['Python', 'SQL', 'LLMs', 'LangChain', 'RAG', 'Cloud', 'System Design', 'Data Engineering', 'DevOps Practices', 'Machine Learning Fundamentals'].map(skill => (
                      <Button
                        key={skill}
                        variant="outline"
                        size="xs"
                        colorScheme={filter.skills.includes(skill) ? 'blue' : 'gray'}
                        onClick={() => {
                          const newSkills = filter.skills.includes(skill)
                            ? filter.skills.filter(s => s !== skill)
                            : [...filter.skills, skill];
                          setFilter({ ...filter, skills: newSkills });
                        }}
                      >
                        {skill}
                      </Button>
                    ))}
                  </Box>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Projects Grid */}
          <VStack spacing={4}>
            <Heading size="lg">Available Projects</Heading>
            {isLoading && (
              <Box textAlign="center" py={8}>
                <Box w="8" h="8" borderRadius="full" bg="blue-500" animation="pulse 1.5s ease-in-out infinite" />
              </Box>
            )}
            {!isLoading && filteredProjects.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text size="lg" color="gray-500">
                  No projects match your current filters
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter({ difficulty: 'all', skills: [], search: '' })}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
            {!isLoading && filteredProjects.length > 0 && (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
                {filteredProjects.map((project: any) => (
                  <Card
                    key={project.id}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray-200"
                    shadow="sm"
                    rounded="lg"
                    overflow="hidden"
                    className={project.isCurrent ? 'border-l-4 border-blue-500' : ''}
                    onClick={() => handleSelectProject(project)}
                    _hover={{
                      shadow: 'md',
                      transform: 'translateY(-2px)',
                      bg: 'gray-50'
                    }}
                  >
                    <CardBody p={6}>
                      <HStack spacing={3} align="start" className="mb-3">
                        <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                          {project.isCurrent ? (
                            <Timer className="text-blue-600 w-5 h-5" />
                          ) : (
                            <FileText className="text-blue-600 w-5 h-5" />
                          )}
                        </Box>
                        <VStack align="start">
                          <Heading size="lg" className="mb-1">
                            {project.title}
                          </Heading>
                          <Text size="sm" color="gray-600" className="mb-1">
                            Week {project.week} • {project.difficulty}
                          </Text>
                          <Text size="xs" color="gray-500" className="mb-2">
                            {project.description}
                          </Text>
                          <HStack spacing={2} className="mb-3">
                            {project.techStack.map((tech: string, index: number) => (
                              <Box
                                key={index}
                                bg="blue-50"
                                textXs
                                fontWeight="medium"
                                px={2}
                                py={1}
                                rounded
                              >
                                {tech}
                              </Box>
                            ))}
                          </HStack>
                          <HStack justify="between">
                            <Text size="xs" fontWeight="medium">Estimated Time</Text>
                            <Text size="xs" fontWeight="semibold" color="green-600">
                              {project.estimatedHours} hours
                            </Text>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
              </SimpleGrid>
            )}
          </VStack>

          {/* Project Detail Modal */}
          <Box
            isOpen={isModalOpen}
            onCloseCancel={() => setIsModalOpen(false)}
            placement="center"
            backdropBlur="3px"
            backdropFilter="blur(3px)"
          >
            {selectedProject && (
              <Box className="glass" p={6} rounded="lg" maxW="3xl" mx="auto" relative>
                <Button
                  position="absolute"
                  top={2}
                  right={2}
                  size="xs"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  icon={<X className="h-4 w-4" />}
                  colorScheme="red"
                />
                <Heading size="lg" mb={4}>
                  {selectedProject.title}
                </Heading>
                <Text size="sm" color="gray-600" mb={4}>
                  Week {selectedProject.week} • {selectedProject.difficulty} • {selectedProject.estimatedHours} hours
                </Text>
                <Divider my={4} />
                <VStack spacing={4}>
                  <HStack spacing={4} align="start" className="mb-2">
                    <Text fontWeight="medium">Description</Text>
                  </HStack>
                  <Text size="sm" color="gray-600">
                    {selectedProject.description}
                  </Text>
                  <Divider my={3} />
                  <HStack spacing={4} align="start" className="mb-2">
                    <Text fontWeight="medium">Skills Covered</Text>
                  </HStack>
                  <Box className="flex flex-wrap gap-2">
                    {selectedProject.skills.map((skill: string, index: number) => (
                      <Box
                        key={index}
                        bg="blue-50"
                        textXs
                        fontWeight="medium"
                        px={2}
                        py={1}
                        rounded
                      >
                        {skill}
                      </Box>
                    ))}
                  </Box>
                  <Divider my={3} />
                  <HStack spacing={4} align="start" className="mb-2">
                    <Text fontWeight="medium">Tech Stack</Text>
                  </HStack>
                  <Box className="flex flex-wrap gap-2">
                    {selectedProject.techStack.map((tech: string, index: number) => (
                      <Box
                        key={index}
                        bg="purple-50"
                        textXs
                        fontWeight="medium"
                        px={2}
                        py={1}
                        rounded
                      >
                        {tech}
                      </Box>
                    ))}
                  </Box>
                  <Divider my={3} />
                  <HStack spacing={4} align="start" className="mb-2">
                    <Text fontWeight="medium">Resources</Text>
                  </HStack>
                  <VStack spacing={2}>
                    {selectedProject.resources.map((resource: any, index: number) => (
                      <Box key={index} className="flex items-start space-x-3">
                        <Box flexShrink={0} w={2} h={2} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                          <Text size="xs">{resource.type === 'video' ? '▶' : resource.type === 'article' ? '📄' : resource.type === 'docs' ? '📚' : '🔗'}</Text>
                        </Box>
                        <VStack align="start">
                          <Text size="sm" fontWeight="medium">{resource.title}</Text>
                          <Text size="xs" color="gray-600">
                            ({resource.time} min)
                          </Text>
                        </VBox>
                      </Box>
                    ))}
                  </VStack>
                  <Divider my={3} />
                  <HStack spacing={4} align="start" className="mb-2">
                    <Text fontWeight="medium">Deliverables</Text>
                  </HStack>
                  <VStack spacing={2}>
                    {selectedProject.deliverables.map((deliverable: string, index: number) => (
                      <Box key={index}>
                        <CheckCircle className="text-green-600 w-4 h-4" mr={2} />
                        <Text size="sm">{deliverable}</Text>
                      </Box>
                    ))}
                  </VStack>
                  <Divider my={3} />
                  <HStack spacing={4} align="start" className="mb-2">
                    <Text fontWeight="medium">Evaluation Criteria</Text>
                  </HStack>
                  <VStack spacing={2}>
                    {Object.entries(selectedProject.evaluationCriteria).map(([key, value]: [string, number], index: number) => (
                      <Box key={index} className="flex items-start space-x-3">
                        <Box flexShrink={0} w={2} h={2} bg="gray-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                          <Text size="xs">{key}</Text>
                        </Box>
                        <VStack align="start">
                          <Text size="sm" fontWeight="medium">{value}%</Text>
                        </VBox>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
                <Divider my={6} />
                <HStack justify="end" spacing={4}>
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    leftIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => handleStartProject(selectedProject)}
                    leftIcon={<Play className="mr-2 h-4 w-4" />}
                    isLoading={false}
                  >
                    Start Project
                  </Button>
                </HStack>
              </Box>
            )}
          </VStack>
        </ScrollArea>
      </Box>
    );
};

export default ProjectBuilder;