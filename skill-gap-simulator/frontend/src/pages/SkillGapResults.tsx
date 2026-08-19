import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Spacer, SimpleGrid, Card, CardBody, CardFooter, Badge, Divider, ScrollArea, useDisclosure } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TrendingUp, CheckCircle, XCircle, Loader2, Clock, List, Target, Trophy, Sparkles, RefreshCw } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import skillGapAPI from './apiService';

const SkillGapResults = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  const jdId = searchParams.get('jdId');
  const [isLoading, setIsLoading] = useState(true);
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useDisclosure();
  const [timeToReady, setTimeToReady] = useState(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch skill gap data
    const loadSkillGapData = async () => {
      if (!resumeId || !jdId) {
        setError('Missing resume or job description ID');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Simulate API delay for demonstration
        // In a real app, this would be the actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock skill gap data (would come from backend in real app)
        const mockSkillGapData = {
          timeToReady: 5,
          skillsMatched: 8,
          totalSkills: 12,
          missingSkills: [
            { name: 'LLMs', current: 41, target: 100, gap: 59, importance: 90 },
            { name: 'LangChain', current: 18, target: 100, gap: 82, importance: 70 },
            { name: 'RAG', current: 32, target: 100, gap: 68, importance: 80 },
            { name: 'Cloud Architecture', current: 25, target: 100, gap: 75, importance: 65 },
            { name: 'System Design', current: 12, target: 100, gap: 88, importance: 60 },
            { name: 'Machine Learning Fundamentals', current: 35, target: 100, gap: 65, importance: 55 },
            { name: 'Data Engineering', current: 40, target: 100, gap: 60, importance: 50 },
            { name: 'DevOps Practices', current: 30, target: 100, gap: 70, importance: 45 },
          ],
          matchedSkills: [
            { name: 'Python', current: 72, target: 90, gap: 18 },
            { name: 'SQL', current: 64, target: 85, gap: 21 },
            { name: 'Statistics', current: 58, target: 75, gap: 17 },
            { name: 'Algorithms', current: 60, target: 80, gap: 20 },
            { name: 'Software Engineering', current: 75, target: 85, gap: 10 },
            { name: 'Git & Version Control', current: 80, target: 90, gap: 10 },
          ],
          skillRadarData: [
            { name: 'Current', python: 72, sql: 64, llms: 41, langchain: 18, rag: 32, cloud: 25, 'system-design': 12, 'machine-learning': 35, 'data-engineering': 40, 'devops': 30 },
            { name: 'Target', python: 90, sql: 85, llms: 90, langchain: 85, rag: 85, cloud: 85, 'system-design': 80, 'machine-learning': 75, 'data-engineering': 70, 'devops': 65 },
          ],
          similarityScore: 0.68,
        };

        setSkillGapData(mockSkillGapData);
        setTimeToReady(mockSkillGapData.timeToReady);
      } catch (error: any) {
        console.error('Failed to load skill gap data:', error);
        setError(error.response?.data?.message || 'Failed to load skill gap data');
      } finally {
        setIsLoading(false);
      }
    };

    loadSkillGapData();
  }, [resumeId, jdId]);

  if (isLoading) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">Analyzing Your Skills...</Heading>
          <Box w="8" h="8" borderRadius="full" bg="blue-500" animation="pulse 1.5s ease-in-out infinite" />
        </VBox>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">Analysis Failed</Heading>
          <Text size="sm" color="red-600" mt={4}>
            {error}
          </Text>
          <ButtonGroup spacing={4} mt={6}>
            <Button
              colorScheme="blue"
              onClick={() => window.location.href = '/resume-upload'}
              leftIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              leftIcon={<RefreshCw className="mr-2 h-4 w-4" />}
            >
              Go to Dashboard
            </Button>
          </ButtonGroup>
        </VBox>
      </Box>
    );
  }

  if (!skillGapData) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">No Data Available</Heading>
          <ButtonGroup spacing={4}>
            <Button colorScheme="blue" onClick={() => window.location.href = '/resume-upload'}>
              Start Over
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </ButtonGroup>
        </VBox>
      </Box>
    );
  }

  const handleGenerateRoadmap = () => {
    navigate('/roadmap', { state: { skillGapData } });
  };

  const handleRefreshAnalysis = () => {
    setIsLoading(true);
    // In a real app, this would trigger a re-analysis
    setTimeout(() => {
      setIsLoading(false);
      // Would update with new data
    }, 2000);
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
          Your Skill Gap Analysis Results
        </Text>
      </Box>

      <ScrollArea h="80vh">
        <VStack spacing={6} maxW="7xl" mx="auto" py={8}>
          {/* Header */}
          <VStack spacing={4} align="center" textAlign="center">
            <Box className="glass" p={6} rounded="2xl" display="inline-block">
              <Box w={16} h={16} bg="gradient-to-br from-blue-400 via-pink-500 to-red-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="2xl" fontWeight="bold">🎯</Text>
              </Box>
            </Box>
            <Heading size="2xl">Your Skill Gap Analysis</Heading>
            <Text size="sm" color="gray-600" maxW="md">
              Based on your resume and target job description
            </Text>
          </VStack>

          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
            {/* Time to Ready */}
            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
              <CardBody p={6}>
                <HStack spacing={4} align="start" mb={3}>
                  <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Clock className="text-blue-600 w-5 h-5" />
                  </Box>
                  <VStack align="start">
                    <Text fontWeight="medium" color="gray-600">Time to Ready</Text>
                    <Heading size="lg" color="blue-600">
                      {skillGapData.timeToReady} months
                    </Heading>
                    <Text size="xs" color="gray-500">
                      Based on skill gap analysis
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Skills Matched */}
            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
              <CardBody p={6}>
                <HStack spacing={4} align="start" mb={3}>
                  <Box flexShrink={0} w={10} h={10} bg="green-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <CheckCircle className="text-green-600 w-5 h-5" />
                  </Box>
                  <VStack align="start">
                    <Text fontWeight="medium" color="gray-600">Skills Matched</Text>
                    <Heading size="lg" color="green-600">
                      {skillGapData.skillsMatched}/{skillGapData.totalSkills}
                    </Heading>
                    <Text size="xs" color="gray-500">
                      {(skillGapData.skillsMatched / skillGapData.totalSkills * 100).toFixed(0)}% match
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Similarity Score */}
            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
              <CardBody p={6}>
                <HStack spacing={4} align="start" mb={3}>
                  <Box flexShrink={0} w={10} h={10} bg="purple-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Target className="text-purple-600 w-5 h-5" />
                  </Box>
                  <VStack align="start">
                    <Text fontWeight="medium" color="gray-600">Match Score</Text>
                    <Heading size="lg" color="purple-600">
                      {(skillGapData.similarityScore * 100).toFixed(0)}%
                    </Heading>
                    <Text size="xs" color="gray-500">
                      Cosine similarity with target role
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* XP & Level */}
            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
              <CardBody p={6}>
                <HStack spacing={4} align="start" mb={3}>
                  <Box flexShrink={0} w={10} h={10} bg="yellow-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Sparkles className="text-yellow-600 w-5 h-5" />
                  </Box>
                  <VStack align="start">
                    <Text fontWeight="medium" color="gray-600">Current Level</Text>
                    <Heading size="lg" color="yellow-600">
                      3
                    </Heading>
                    <Text size="xs" color="gray-500">
                      Earn skill points to level up
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Skill Radar Chart */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <Heading size="lg">Skill Proficiency Comparison</Heading>
              <Text size="sm" color="gray-600" mb={4}>
                Current proficiency vs. target requirements
              </Text>
              {skillGapData.skillRadarData && (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={skillGapData.skillRadarData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                    <Legend verticalAlign="bottom" height={36} />
                    {/* Current skills bars */}
                    {skillGapData.skillRadarData.map((item: any, index: number) => (
                      <Bar
                        key={`current-${index}`}
                        dataKey={item.name}
                        stroke="#38bdf8"
                        fill="url(#grad1)"
                        radius={[4, 4, 0, 0]}
                      >
                        {!index && (
                          <defs>
                            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                            </linearGradient>
                          </defs>
                        )}
                      </Bar>
                    ))}
                    {/* Target skills bars */}
                    {skillGapData.skillRadarData.map((item: any, index: number) => (
                      <Bar
                        key={`target-${index}`}
                        dataKey={item.name}
                        stroke="#f97316"
                        fill="url(#grad2)"
                        radius={[0, 0, 4, 4]}
                      >
                        {index === skillGapData.skillRadarData.length - 1 && (
                          <defs>
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

          {/* Missing Skills Detail */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Heading size="lg">Skills to Develop</Heading>
                <Text size="sm" color="gray-600" mb={4}>
                  Focus on these high-impact skills to close your gap efficiently
                </Text>
                <Divider my={4} />
                <VStack spacing={3}>
                  {skillGapData.missingSkills.map((skill: any, index: number) => (
                    <Box key={index} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg" _hover={{ bg: 'blue-50' }}>
                      <HStack spacing={3} align="start" flex={1}>
                        <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                          <Badges className="text-blue-600 w-5 h-5" />
                        </Box>
                        <VStack align="start">
                          <Text fontWeight="medium">{skill.name}</Text>
                          <Text size="xs" color="gray-500">
                            Importance: {skill.importance}%
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={2}>
                        <HStack justify="end" spacing={2}>
                          <Text fontWeight="medium" color="gray-600">
                            Current: {skill.current}%
                          </Text>
                          <Text fontWeight="medium" color="red-600">
                            Target: {skill.target}%
                          </Text>
                        </HStack>
                        <Box w={20} h={4} bg="gray-200" rounded="full" overflow="hidden">
                          <Box
                            w={`${((skill.target - skill.gap) / skill.target) * 100}%`}
                            h="4"
                            bg="gradient-to-r from-blue-500 to-blue-300"
                            rounded="full"
                          />
                          <Box
                            w={`${(skill.gap / skill.target) * 100}%`}
                            h="4"
                            bg="gradient-to-r from-red-500 to-red-300"
                            rounded="full"
                            ml="auto"
                          />
                        </Box>
                        <Text size="xs" fontWeight="medium" textAlign="right">
                          Gap: {skill.gap}%
                        </Text>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
              <CardFooter px={6} py={4} borderTop="1px solid" borderColor="gray-100">
                <ButtonGroup spacing={3} w="full">
                  <Button
                    colorScheme="blue"
                    onClick={handleGenerateRoadmap}
                    leftIcon={<List className="mr-2 h-4 w-4" />}
                  >
                    Generate Learning Roadmap
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRefreshAnalysis}
                    leftIcon={<RefreshCw className="mr-2 h-4 w-4" />}
                  >
                    Refresh Analysis
                  </Button>
                </ButtonGroup>
              </CardFooter>
            </Card>
          </Card>

          {/* Call to Action */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <VStack spacing={4} align="center">
                <Heading size="lg">Ready to Close Your Skill Gap?</Heading>
                <Text size="sm" color="gray-600" maxW="md">
                  You're {skillGapData.timeToReady} months away from your target role. Start your personalized learning journey today.
                </Text>
                <ButtonGroup spacing={4} mt={6}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleGenerateRoadmap}
                    leftIcon={<Roadmap className="mr-2 h-4 w-4" />}
                  >
                    Get My Roadmap
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    leftIcon={<Home className="mr-2 h-4 w-4" />}
                  >
                    Back to Dashboard
                  </Button>
                </ButtonGroup>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </ScrollArea>
    </Box>
  );
};

export default SkillGapResults;