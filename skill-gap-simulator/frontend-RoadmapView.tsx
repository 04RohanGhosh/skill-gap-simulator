import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Spacer, SimpleGrid, Card, CardBody, CardFooter, Badge, Divider, ScrollArea, Tabs, TabList, Tab, TabPanels, TabPanel, useDisclosure, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { List, CheckCircle, XCircle, Loader2, Clock, Sparkles, Trophy, Code, Brain, Sparkles, Share2, Users, Calendar, TrendingUp, Edit, Search, Bell, Moon, Sun } from '@heroicons/react/24/outline';
import { Menu as MenuPrimitive } from '@radix-ui/react-menu';

const RoadmapView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const skillGapData = location.state as any || null;
  const { user } = useAuthStore.getState();
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar' | 'list'>('timeline');
  const [isModalOpen, setIsModalOpen] = useDisclosure();
  const [viewMode, setViewMode] = useState<'light' | 'dark'>('dark'); // For demo

  useEffect(() => {
    // Simulate generating roadmap from skill gap data
    const loadRoadmapData = async () => {
      if (!skillGapData) return;

      setIsGenerating(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock roadmap data based on skill gap data
        const mockRoadmapData = {
          weeks: [
            {
              week: 1,
              title: 'Foundations: Python & SQL Mastery',
              focus: ['Python', 'SQL'],
              build: {
                title: 'Data Analysis Toolkit',
                description: 'Create a command-line tool that analyzes CSV files and generates statistical reports',
                techStack: ['Python', 'Pandas', 'NumPy'],
                estimatedHours: 8,
                resources: [
                  { title: 'Python Official Tutorial', type: 'docs', url: 'https://docs.python.org/3/tutorial/', time: 60 },
                  { title: 'Pandas Documentation', type: 'docs', url: 'https://pandas.pydata.org/docs/', time: 45 },
                  { title: 'SQL Zoo Tutorial', type: 'tutorial', url: 'https://sqlzoo.net/', time: 90 },
                ],
                prerequisites: [],
              },
              learn: [
                { title: 'Python Basics', type: 'video', url: 'https://youtu.be/rfscVS0vtbw', time: 30 },
                { title: 'SQL Fundamentals', type: 'article', url: 'https://www.w3schools.com/sql/', time: 45 },
              ],
              xp: 300,
            },
            {
              week: 2,
              title: 'Data Manipulation & Visualization',
              focus: ['Python', 'Data Engineering'],
              build: {
                title: 'Interactive Dashboard',
                description: 'Build a web dashboard that visualizes data from APIs',
                techStack: ['Python', 'Flask', 'Chart.js', 'HTML/CSS'],
                estimatedHours: 10,
                resources: [
                  { title: 'Flask Tutorial', type: 'docs', url: 'https://flask.palletsprojects.com/', time: 60 },
                  { title: 'Chart.js Guide', type: 'tutorial', url: 'https://www.chartjs.org/docs/latest/', time: 45 },
                ],
                prerequisites: [1],
              },
              learn: [
                { title: 'Web Development with Flask', type: 'video', url: 'https://youtu.be/tp8dvIawD7Y', time: 40 },
                { title: 'Data Visualization Principles', type: 'article', url: 'https://www.data-to-viz.com/', time: 30 },
              ],
              xp: 350,
            },
            {
              week: 3,
              title: 'Introduction to LLMs & LangChain',
              focus: ['LLMs', 'LangChain'],
              build: {
                title: 'Simple Chatbot',
                description: 'Create a chatbot that uses OpenAI API to answer questions',
                techStack: ['Python', 'OpenAI API', 'LangChain'],
                estimatedHours: 12,
                resources: [
                  { title: 'LangChain Documentation', type: 'docs', url: 'https://python.langchain.com/docs/', time: 60 },
                  { title: 'OpenAI API Guide', type: 'docs', url: 'https://platform.openai.com/docs/api-reference', time: 30 },
                ],
                prerequisites: [1, 2],
              },
              learn: [
                { title: 'Introduction to Large Language Models', type: 'video', url: 'https://youtu.be/zjkBMFhNj_g', time: 50 },
                { title: 'LangChain Tutorial for Beginners', type: 'tutorial', url: 'https://www.pinecone.io/learn/langchain/', time: 40 },
              ],
              xp: 400,
              isCurrent: true,
            },
            {
              week: 4,
              title: 'Building RAG Systems',
              focus: ['RAG', 'LLMs'],
              build: {
                title: 'Document Q&A System',
                description: 'Build a Retrieval-Augmented Generation system for PDF documents',
                techStack: ['Python', 'LangChain', 'FAISS', ' Streamlit'],
                estimatedHours: 15,
                resources: [
                  { title: 'Retrieval-Augmented Generation Paper', type: 'paper', url: 'https://arxiv.org/abs/2005.11401', time: 60 },
                  { title: 'Hands-on RAG Tutorial', type: 'tutorial', url: 'https://www.assemblyai.com/blog/retrieval-augmented-generation/', time: 90 },
                ],
                prerequisites: [3],
              },
              learn: [
                { title: 'Understanding Vector Databases', type: 'video', url: 'https://youtu.be/uPIEmMtMn9U', time: 40 },
                { title: 'FAISS Similarity Search Tutorial', type: 'tutorial', url: 'https://github.com/facebookresearch/faiss/wiki/Tutorial-in-python', time: 50 },
              ],
              xp: 450,
            },
            {
              week: 5,
              title: 'Cloud Deployment & DevOps',
              focus: ['Cloud', 'DevOps Practices'],
              build: {
                title: 'CI/CD Pipeline',
                description: 'Set up automated testing and deployment for your projects',
                techStack: ['AWS', 'Docker', 'GitHub Actions', 'Terraform'],
                estimatedHours: 12,
                resources: [
                  { title: 'AWS Developer Guide', type: 'docs', url: 'https://aws.amazon.com/developer/', time: 60 },
                  { title: 'GitHub Actions Documentation', type: 'docs', url: 'https://docs.github.com/en/actions', time: 45 },
                ],
                prerequisites: [4],
              },
              learn: [
                { title: 'Introduction to Cloud Computing', type: 'video', url: 'https://youtu.be/-y21gZGXfsQ', time: 40 },
                { title: 'Docker vs Virtual Machines', type: 'article', url: 'https://www.docker.com/resources/what-container/', time: 30 },
              ],
              xp: 400,
            },
            {
              week: 6,
              title: 'System Design & Architecture',
              focus: ['System Design', 'Machine Learning Fundamentals'],
              build: {
                title: 'Scalable Web Application',
                description: 'Design and implement a scalable web application architecture',
                techStack: ['System Design Principles', 'UML', 'API Design'],
                estimatedHours: 18,
                resources: [
                  { title: 'System Design Primer', type: 'github', url: 'https://github.com/donnemartin/system-design-primer', time: 90 },
                  { title: 'API Design Best Practices', type: 'article', url: 'https://stackoverflow.com/blog/2020/03/02/best-practices-for-rest-api-design/', time: 45 },
                ],
                prerequisites: [5],
              },
              learn: [
                { title: 'Introduction to System Design', type: 'video', url: 'https://youtu.be/Zhkx6EBDALY', time: 50 },
                { title: 'Microservices Architecture Patterns', type: 'article', url: 'https://microservices.io/patterns/index.html', time: 40 },
              ],
              xp: 500,
            },
            // Additional weeks would continue...
          ],
          totalXp: 3500,
          estimatedCompletionDate: new Date(Date.now() + skillGapData.timeToReady * 30 * 24 * 60 * 60 * 1000),
        };

        setRoadmapData(mockRoadmapData);
        setIsGenerating(false);
      } catch (error) {
        console.error('Failed to load roadmap data:', error);
        setIsGenerating(false);
      }
    };

    loadRoadmapData();
  }, [skillGapData]);

  if (isGenerating) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">Generating Your Roadmap...</Heading>
          <Box w="8" h="8" borderRadius="full" bg="pink-500" animation="pulse 1.5s ease-in-out infinite" />
        </VBox>
      </Box>
    );
  }

  if (!roadmapData) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">No Roadmap Available</Heading>
          <ButtonGroup spacing={4}>
            <Button colorScheme="blue" onClick={() => navigate('/skill-gap-results')}>
              Go Back
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </ButtonGroup>
        </VBox>
      </Box>
    );
  }

  const currentWeek = roadmapData.weeks.find((w: any) => w.isCurrent) || roadmapData.weeks[0];
  const completedWeeks = roadmapData.weeks.filter((w: any) => w.completed).length;
  const totalWeeks = roadmapData.weeks.length;
  const progressPercentage = (completedWeeks / totalWeeks) * 100;

  const handleToggleComplete = (weekId: number) => {
    // In a real app, this would update the backend
    setRoadmapData(prev => {
      if (!prev) return prev;
      const updatedWeeks = prev.weeks.map((week: any) => {
        if (week.week === weekId) {
          return { ...week, completed: !week.completed };
        }
        return week;
      });
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const handleStartWeek = (week: any) => {
    // Mark this week as current and reset others
    setRoadmapData(prev => {
      if (!prev) return prev;
      const updatedWeeks = prev.weeks.map((w: any) => ({
        ...w,
        isCurrent: w.week === week.week,
      }));
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const handleViewModeChange = () => {
    setViewMode(viewMode === 'light' ? 'dark' : 'light');
  };

  return (
    <Box minH="vh" bg={`gradient-to-br from-${viewMode === 'light' ? 'gray-50' : 'gray-900`} to-${viewMode === 'light' ? 'blue-50' : 'blue-900`}> py={12} px={4}>
      <Box className="flex items-center justify-between px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          leftIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
          colorScheme={viewMode === 'light' ? 'gray' : 'white'}
        >
          Back to Dashboard
        </Box>
        <HStack spacing={4} align="center">
          <Text size="sm" fontWeight="medium" color={viewMode === 'light' ? 'gray-600' : 'gray-300'}>
            Week {currentWeek.week} of {totalWeeks}
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewModeChange}
            leftIcon={viewMode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            colorScheme={viewMode === 'light' ? 'gray' : 'white'}
          >
            {viewMode === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </HStack>
      </Box>

      <ScrollArea h="75vh">
        <VStack spacing={6} maxW="7xl" mx="auto" py={8}>
          {/* Header */}
          <VStack spacing={4} align="center" textAlign="center">
            <Box className="glass" p={6} rounded="2xl" display="inline-block">
              <Box w={16} h={16} bg="gradient-to-br from-blue-400 via-pink-500 to-red-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="2xl" fontWeight="bold">🗺️</Text>
              </Box>
            </Box>
            <Heading size="2xl">Your Personalized Learning Roadmap</Heading>
            <Text size="sm" color={viewMode === 'light' ? 'gray-600' : 'gray-300'} maxW="md">
              {totalWeeks}-week plan to close your skill gap and reach your target role
            </Text>
          </VStack>

          {/* Progress Overview */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <HStack spacing={4} align="start" mb={4}>
                <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                  <TrendingUp className="text-blue-600 w-5 h-5" />
                </Box>
                <VStack align="start">
                  <Heading size="lg">Overall Progress</Heading>
                  <Text size="sm" color="gray-600">
                    {completedWeeks}/{totalWeeks} weeks completed
                  </Text>
                </VStack>
              </HStack>
              <Divider my={4} />
              <VStack spacing={3}>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Completion Percentage</Text>
                  <Heading size="lg" fontWeight="bold" color="blue-600">
                    {progressPercentage.toFixed(0)}%
                  </Heading>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Current XP</Text>
                  <Heading size="lg" fontWeight="bold" color="yellow-600">
                    {completedWeeks * 350} / {roadmapData.totalXp}
                  </Heading>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Estimated Completion</Text>
                  <Heading size="lg" fontWeight="bold" color="green-600">
                    {new Date(roadmapData.estimatedCompletionDate).toLocaleDateString()}
                  </Heading>
                </HStack>
              </VStack>
            </CardBody>
            <CardFooter px={6} py={4} borderTop="1px solid" borderColor="gray-100">
              <ButtonGroup spacing={3}>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => navigate('/projects')}
                  leftIcon={<Code className="mr-2 h-4 w-4" />}
                >
                  Start a Project
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/skill-gap-results')}
                  leftIcon={<List className="mr-2 h-4 w-4" />}
                >
                  View Skill Gap
                </Button>
              </ButtonGroup>
            </CardFooter>
          </Card>

          {/* Tabs for different views */}
          <Tabs>
            <TabList>
              <Tab
                onClick={() => setActiveTab('timeline')}
                isActive={activeTab === 'timeline'}
              >
                Timeline View
              </Tab>
              <Tab
                onClick={() => setActiveTab('calendar')}
                isActive={activeTab === 'calendar'}
              >
                Calendar View
              </Tab>
              <Tab
                onClick={() => setActiveTab('list')}
                isActive={activeTab === 'list'}
              >
                List View
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {activeTab === 'timeline' && (
                  <VStack spacing={4}>
                    <Heading size="lg">Weekly Timeline</Heading>
                    <Divider my={4} />
                    <VStack spacing={4}>
                      {roadmapData.weeks.map((week: any) => (
                        <Box key={week.week} className="relative">
                          <Card
                            bg="white"
                            borderWidth="1px"
                            borderColor="gray-200"
                            shadow="sm"
                            rounded="lg"
                            overflow="hidden"
                            className={week.completed ? 'border-l-4 border-green-500' : week.isCurrent ? 'border-l-4 border-blue-500' : ''}
                          >
                            <CardBody p={4}>
                              <HStack spacing={3} align="start" className="mb-2">
                                <Box flexShrink={0} w={8} h={8} bg={week.completed ? 'green-100' : week.isCurrent ? 'blue-100' : 'gray-100'} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  {week.completed ? (
                                    <CheckCircle className="text-green-600 w-4 h-4" />
                                  ) : week.isCurrent ? (
                                    <Timer className="text-blue-600 w-4 h-4" />
                                  ) : (
                                    <List className="text-gray-600 w-4 h-4" />
                                  )}
                                </Box>
                                <VStack align="start">
                                  <Heading size="sm" className="mb-1">
                                    Week {week.week}: {week.title}
                                  </Heading>
                                  <Text size="xs" color="gray-500" className="mb-1">
                                    Focus: {week.focus.join(', ')}
                                  </Text>
                                  {week.isCurrent && (
                                    <Badge colorScheme="blue" size="xs">
                                      Current Week
                                    </Badge>
                                  )}
                                  {week.completed && (
                                    <Badge colorScheme="green" size="xs">
                                      Completed
                                    </Badge>
                                  )}
                                </VStack>
                              </HStack>
                              <Divider my={3} />
                              <VStack spacing={2}>
                                <HStack justify="between">
                                  <Text size="xs" fontWeight="medium">Build Project</Text>
                                  <Text size="xs" fontWeight="semibold" color="green-600">
                                    {week.build.title}
                                  </Text>
                                </HStack>
                                <HStack justify="between">
                                  <Text size="xs" fontWeight="medium">Estimated Time</Text>
                                  <Text size="xs" fontWeight="semibold" color="blue-600">
                                    {week.build.estimatedHours} hours
                                  </Text>
                                </HStack>
                              </VStack>
                              <Divider my={3} />
                              <HStack justify="end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartWeek(week)}
                                  leftIcon={week.completed ? <Replay className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                                >
                                  {week.completed ? 'Repeat' : 'Start Week'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleComplete(week.week)}
                                  leftIcon={week.completed ? <XCircle className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                                >
                                  {week.completed ? 'Undo' : 'Mark Complete'}
                                </Button>
                                <Menu
                                  placement="bottom-start"
                                  arrowSize={5}
                                  borderWidth="1px"
                                  borderColor="gray-200"
                                  bg="white"
                                  radius="lg"
                                  shadow="md"
                                >
                                  <MenuButton
                                    asChild
                                    leftIcon={<MoreHorizontal className="h-4 w-4" />}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <MenuPrimitive.Trigger>
                                      More
                                    </MenuPrimitive.Trigger>
                                  </MenuButton>
                                  <MenuItems>
                                    <MenuItem onClick={() => handleStartWeek(week)}>
                                      Start This Week
                                    </MenuItem>
                                    <MenuItem onClick={() => handleToggleComplete(week.week)}>
                                      {week.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate(`/project/${week.week}`)}>
                                      View Project Details
                                    </MenuItem>
                                  </MenuItems>
                                </Menu>
                              </HStack>
                            </CardBody>
                          </Card>
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>
                )}
                <TabPanel>
                  {activeTab === 'calendar' && (
                    <VStack spacing={4}>
                      <Heading size="lg">Calendar View</Heading>
                      <Text size="sm" color="gray-600" mb={4}>
                        View your roadmap as a monthly calendar
                      </Text>
                      <Divider my={4} />
                      <Box className="relative">
                        <!-- Calendar grid would go here -->
                        <Box className="grid grid-cols-7 gap-2 text-center pt-6">
                          {/* Weekday headers */}
                          <Box>Sun</Box>
                          <Box>Mon</Box>
                          <Box>Tue</Box>
                          <Box>Wed</Box>
                          <Box>Thu</Box>
                          <Box>Fri</Box>
                          <Box>Sat</Box>
                          {/* Calendar days - simplified for demo */}
                          {Array.from({ length: 42 }, (_, i) => {
                            const day = i + 1;
                            const isToday = day === 15; // Example: today is 15th
                            const hasEvent = [10, 15, 22, 29].includes(day);
                            return (
                              <Box
                                key={day}
                                className={`h-12 border rounded-lg cursor-pointer transition-colors duration-200 ${
                                  isToday
                                    ? 'ring-2 ring-blue-500'
                                    : hasEvent
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <Text size="xs" fontWeight="medium" className="block">{day}</Text>
                                {hasEvent && (
                                  <Text size="xs" block mt={1} fontWeight="semibold" color="blue-600">
                                    Event
                                  </Text>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                        <Box className="absolute bottom-4 left-4 right-4 text-center">
                          <Text size="xs" color="gray-500">
                            {hasEvent ? 'Events on selected date:' : 'No events on selected date'}
                          </Text>
                        </Box>
                      </Box>
                    </VStack>
                  )}
                  <TabPanel>
                  {activeTab === 'list' && (
                    <VStack spacing={4}>
                      <Heading size="lg">List View</Heading>
                      <Text size="sm" color="gray-600" mb={4}>
                        Complete list of all weeks and activities
                      </Text>
                      <Divider my={4} />
                      <VStack spacing={4}>
                        {roadmapData.weeks.map((week: any) => (
                          <Card
                            key={week.week}
                            bg="white"
                            borderWidth="1px"
                            borderColor="gray-200"
                            shadow="sm"
                            rounded="lg"
                            overflow="hidden"
                            className={week.completed ? 'border-l-4 border-green-500' : week.isCurrent ? 'border-l-4 border-blue-500' : ''}
                          >
                            <CardBody p={6}>
                              <HStack spacing={3} align="start" className="mb-4">
                                <Box flexShrink={0} w={10} h={10} bg={week.completed ? 'green-100' : week.isCurrent ? 'blue-100' : 'gray-100'} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  {week.completed ? (
                                    <CheckCircle className="text-green-600 w-5 h-5" />
                                  ) : week.isCurrent ? (
                                    <Timer className="text-blue-600 w-5 h-5" />
                                  ) : (
                                    <List className="text-gray-600 w-5 h-5" />
                                  )}
                                </Box>
                                <VStack align="start">
                                  <Heading size="lg" className="mb-2">
                                    Week {week.week}: {week.title}
                                  </Heading>
                                  <Text size="sm" color="gray-600" className="mb-1">
                                    Focus: {week.focus.join(', ')}
                                  </Text>
                                  {week.isCurrent && (
                                    <Badge colorScheme="blue" size="xs">
                                      Current Week
                                    </Badge>
                                  )}
                                  {week.completed && (
                                    <Badge colorScheme="green" size="xs">
                                      Completed
                                    </Badge>
                                  )}
                                </VStack>
                              </HStack>
                              <Divider my={4} />
                              <VStack spacing={3}>
                                <HStack justify="between">
                                  <Text size="md" fontWeight="semibold">Build Project</Text>
                                  <Text size="md" fontWeight="semibold" color="green-600">
                                    {week.build.title}
                                  </Text>
                                </HStack>
                                <VStack spacing={2}>
                                  <Text size="xs" color="gray-600">
                                    {week.build.description}
                                  </Text>
                                </VStack>
                                <HStack justify="between">
                                  <Text size="xs" fontWeight="medium">Tech Stack</Text>
                                  <Text size="xs" color="gray-600">
                                    {week.build.techStack.join(', ')}
                                  </Text>
                                </HStack>
                                <HStack justify="between">
                                  <Text size="xs" fontWeight="medium">Estimated Time</Text>
                                  <Text size="xs" fontWeight="semibold" color="blue-600">
                                    {week.build.estimatedHours} hours
                                  </Text>
                                </HStack>
                              </Divider>
                              <VStack spacing={3}>
                                <HStack justify="between">
                                  <Text size="md" fontWeight="semibold">Learning Resources</Text>
                                </HStack>
                                <VStack spacing={2}>
                                  {week.learn.map((resource: any, index: number) => (
                                    <Box key={index} className="flex items-start space-x-3">
                                      <Box flexShrink={0} w={2} h={2} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                        <Text size="xs">{resource.type === 'video' ? '▶' : resource.type === 'article' ? '📄' : resource.type === 'docs' ? '📚' : '🔗'}</Text>
                                      </Box>
                                      <VStack align="start">
                                        <Text size="sm" fontWeight="medium">{resource.title}</Text>
                                        <Text size="xs" color="gray-600">
                                          ({resource.time} min)
                                        </Text>
                                      </VStack>
                                    </Box>
                                  ))}
                                </VStack>
                              </Divider>
                              <HStack justify="end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartWeek(week)}
                                  leftIcon={week.completed ? <Replay className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                                >
                                  {week.completed ? 'Repeat' : 'Start Week'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleComplete(week.week)}
                                  leftIcon={week.completed ? <XCircle className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                                >
                                  {week.completed ? 'Undo' : 'Mark Complete'}
                                </Button>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>

              {/* Action Buttons */}
              <VStack spacing={4} mt={8}>
                <ButtonGroup spacing={4}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={isGenerating}
                    leftIcon={<Spinner size="sm" color="white" />%3E
                  >
                    Regenerate Roadmap
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    w="full"
                    onClick={() => navigate('/skill-gap-results')}
                    leftIcon={<List className="mr-2 h-4 w-4" />}
                  >
                    View Skill Gap Analysis
                  </Button>
                </ButtonGroup>
                <Button
                  variant="outline"
                  mt={4}
                  w="full"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  leftIcon={<Home className="mr-2 h-4 w-4" />}
                >
                  Back to Dashboard
                </Button>
              </VStack>
            </VStack>
          </ScrollArea>
        </Box>
      </Box>
    );
};

export default RoadmapView;