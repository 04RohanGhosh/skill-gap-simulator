import React, { useEffect, useState } from 'react';
import { Box, VStack, Heading, Text, Button, Card, CardBody, CardFooter, Badge, Spacer, SimpleGrid, Stack, Divider, Image, Tooltip, useDisclosure } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Code, ShieldCheck, Calendar, Timer, Edit, LogOut } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuthStore.getState();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useDisclosure();

  useEffect(() => {
    // Simulate fetching dashboard data
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock skill gap data
        const mockSkillGapData = {
          timeToReady: 5,
          skillsMatched: 8,
          totalSkills: 12,
          missingSkills: [
            { name: 'LLMs', current: 41, target: 100, gap: 59 },
            { name: 'LangChain', current: 18, target: 100, gap: 82 },
            { name: 'RAG', current: 32, target: 100, gap: 68 },
            { name: 'Cloud Architecture', current: 25, target: 100, gap: 75 },
            { name: 'System Design', current: 12, target: 100, gap: 88 },
          ],
          skillRadarData: [
            { name: 'Python', python: 72, sql: 64, llms: 41, langchain: 18, rag: 32, cloud: 25, 'system-design': 12 },
            { name: 'Target', python: 90, sql: 85, llms: 90, langchain: 85, rag: 85, cloud: 85, 'system-design': 80 },
          ],
        };

        // Mock roadmap progress
        const mockRoadmapProgress = {
          currentWeek: 3,
          totalWeeks: 12,
          completedWeeks: 2,
          xpEarned: 1250,
          level: 5,
          streaks: {
            current: 3,
            longest: 7,
          },
          badges: [
            { id: 1, name: 'First Steps', icon: '🏆', description: 'Completed your first week' },
            { id: 2, name: 'GitHub Contributor', icon: '💻', description: 'Connected your first GitHub repository' },
          ],
        };

        setSkillGapData(mockSkillGapData);
        setRoadmapProgress(mockRoadmapProgress);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">Loading Dashboard...</Heading>
          <Box w="8" h="8" borderRadius="full" bg="blue-500" animation="pulse 1.5s ease-in-out infinite" />
        </VStack>
      </Box>
    );
  }

  if (!skillGapData) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">No Data Available</Heading>
          <Button colorScheme="blue" onClick={() => navigate('/resume-upload')}>
            Start Your Assessment
          </Button>
        </VBox>
      </Box>
    );
  }

  const handleLogout = () => {
    // In a real app, this would call the auth logout API
    // For now, we'll just clear the zustand store
    useAuthStore.getState().setUser(null);
    navigate('/login');
  };

  return (
    <Box minH="vh" bg="gradient-to-br from-gray-50 to-blue-50" py={12} px={4}>
      <VStack spacing={6}>
        {/* Header */}
        <Box className="flex items-center justify-between px-4">
          <HStack spacing={4} align="center">
            <Avatar src={user?.avatar_url} name={user?.name} size={8} />
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">{user?.name}</Text>
              <Text size="xs" color="gray-500">
                {user?.email}
              </Text>
            </VStack>
          </HStack>
          <ButtonGroup spacing={2}>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
              Settings
            </Button>
            <Button colorScheme="red" size="sm" icon={LogOut} onClick={handleLogout}>
              Sign Out
            </Button>
          </ButtonGroup>
        </Box>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6} w="full" maxW="7xl" mx="auto" px={4}>
          {/* Skill Gap Overview Card */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <HStack spacing={4} align="start" mb={4}>
                <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                  <TrendingUp className="text-blue-600 w-5 h-5" />
                </Box>
                <VStack align="start">
                  <Heading size="lg">Skill Gap Analysis</Heading>
                  <Text size="sm" color="gray-600">
                    You're {skillGapData.timeToReady} months away from your target role
                  </Text>
                </VStack>
              </HStack>
              <Divider my={4} />
              <VStack spacing={3}>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Skills Matched</Text>
                  <Text size="sm" fontWeight="bold" color="green-600">
                    {skillGapData.skillsMatched}/{skillGapData.totalSkills}
                  </Text>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Time to Ready</Text>
                  <Text size="sm" fontWeight="bold" color="blue-600">
                    {skillGapData.timeToReady} months
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
            <CardFooter px={6} py={4} borderTop="1px solid" borderColor="gray-100">
              <Button
                colorScheme="blue"
                size="sm"
                w="full"
                onClick={() => navigate('/skill-gap-results')}
                leftIcon={<Edit className="mr-2" />}
              >
                View Detailed Analysis
              </Button>
            </CardFooter>
          </Card>

          {/* Roadmap Progress Card */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <HStack spacing={4} align="start" mb={4}>
                <Box flexShrink={0} w={10} h={10} bg="pink-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                  <Users className="text-pink-600 w-5 h-5" />
                </Box>
                <VStack align="start">
                  <Heading size="lg">Learning Roadmap</Heading>
                  <Text size="sm" color="gray-600">
                    {roadmapProgress?.completedWeeks}/{roadmapProgress?.totalWeeks} weeks completed
                  </Text>
                </VStack>
              </HStack>
              <Divider my={4} />
              <VStack spacing={3}>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Current Week</Text>
                  <Text size="sm" fontWeight="bold" color="pink-600">
                    Week {roadmapProgress?.currentWeek}
                  </Text>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">XP Earned</Text>
                  <Text size="sm" fontWeight="bold" color="yellow-600">
                    {roadmapProgress?.xpEarned}
                  </Text>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Current Streak</Text>
                  <Text size="sm" fontWeight="bold" color="green-600">
                    {roadmapProgress?.streaks?.current} days
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
            <CardFooter px={6} py={4} borderTop="1px solid" borderColor="gray-100">
              <Button
                colorScheme="pink"
                size="sm"
                w="full"
                onClick={() => navigate('/roadmap')}
                leftIcon={<Calendar className="mr-2" />}
              >
                View Roadmap
              </Button>
            </CardFooter>
          </Card>

          {/* Projects & Verification Card */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <HStack spacing={4} align="start" mb={4}>
                <Box flexShrink={0} w={10} h={10} bg="green-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                  <Code className="text-green-600 w-5 h-5" />
                </Box>
                <VStack align="start">
                  <Heading size="lg">Projects & Verification</Heading>
                  <Text size="sm" color="gray-600">
                    Prove your skills through hands-on projects
                  </Text>
                </VStack>
              </HStack>
              <Divider my={4} />
              <VStack spacing={3}>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Skills Verified</Text>
                  <Text size="sm" fontWeight="bold" color="green-600">
                    2
                  </Text>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Projects Completed</Text>
                  <Text size="sm" fontWeight="bold" color="green-600">
                    3
                  </Text>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Average Score</Text>
                  <Text size="sm" fontWeight="bold" color="green-600">
                    85/100
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
            <CardFooter px={6} py={4} borderTop="1px solid" borderColor="gray-100">
              <Button
                colorScheme="green"
                size="sm"
                w="full"
                onClick={() => navigate('/projects')}
                leftIcon={<ShieldCheck className="mr-2" />}
              >
                Browse Projects
              </Button>
            </CardFooter>
          </Card>

          {/* Skill Radar Chart */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden" colSpan={{ base: 2, lg: 1 }} rowSpan={{ base: 2, lg: 1 }}>
            <CardBody p={6}>
              <Heading size="lg" mb={4}>Skill Proficiency Comparison</Heading>
              {skillGapData.skillRadarData && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillGapData.skillRadarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                    <Legend verticalAlign="top" height={36} />
                    {skillGapData.skillRadarData.map((item: any, index: number) => (
                      <Bar
                        key={`bar-${index}-${item.name}`}
                        dataKey={item.name}
                        stroke={index === 0 ? '#38bdf8' : '#f97316'}
                        fill={index === 0 ? 'url(#grad1)' : 'url(#grad2)'}
                      >
                        {!index && (
                          <defs>
                            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                            </linearGradient>
                            <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
                            </linearGradient>
                          </defs>
                        )}
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions Card */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <Heading size="lg">Quick Actions</Heading>
              <Divider my={4} />
              <VStack spacing={4}>
                <Button
                  leftIcon={<Timer className="mr-2 h-4 w-4" />}
                  leftIcon={<Timer className="mr-2 h-4 w-4" />}
                  onClick={() => navigate('/roadmap')}
                  colorScheme="blue"
                  variant="soft"
                  w="full"
                  justifyContent="start"
                  px={4}
                  py={3}
                >
                  Continue Learning Roadmap
                </Button>
                <Button
                  leftIcon={<Code className="mr-2 h-4 w-4" />}
                  leftIcon={<Code className="mr-2 h-4 w-4" />}
                  onClick={() => navigate('/projects')}
                  colorScheme="green"
                  variant="soft"
                  w="full"
                  justifyContent="start"
                  px={4}
                  py={3}
                >
                  Start a New Project
                </Button>
                <Button
                  leftIcon={<Users className="mr-2 h-4 w-4" />}
                  leftIcon={<Users className="mr-2 h-4 w-4" />}
                  onClick={() => navigate('/profile')}
                  colorScheme="purple"
                  variant="soft"
                  w="full"
                  justifyContent="start"
                  px={4}
                  py={3}
                >
                  Edit Profile
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Dashboard;