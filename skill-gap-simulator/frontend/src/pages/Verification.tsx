import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Spacer, SimpleGrid, Card, CardBody, CardFooter, Badge, Divider, ScrollArea, Image, useDisclosure, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useAuthStore } from '../authStore';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { List, CheckCircle, XCircle, Loader2, Clock, Sparkles, Trophy, Code, Brain, Sparkles, Share2, Users, Calendar, TrendingUp, Edit, Search, Bell, Moon, Sun, FileText, Github, ShieldCheck, Camera, Brush, Palette, Tool, Upload, Download, RefreshCw, ArrowLeft, ArrowRight, Play, Replay, Timer, MoreHorizontal, Save, DeleteForEver, UserPlus, AlertTriangle, AlertCircle, Mail, Api } from '@heroicons/react/24/outline';

const Verification = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore.getState();
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useDisclosure();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'in_progress' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    // Simulate fetching verification data or starting verification process
    const loadVerificationData = async () => {
      if (!repoId) return;

      setIsVerifying(true);
      setVerificationStatus('in_progress');

      try {
        // Simulate API delay for verification process
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock verification results (would come from backend in real app)
        const mockVerificationData = {
          repoId,
          score: 85,
          status: 'completed' as const,
          breakdown: {
            stars: { score: 8, max: 10, feedback: 'Good project visibility with 42 stars' },
            frequency: { score: 18, max: 20, feedback: 'Regular commits over the past month' },
            staticAnalysis: { score: 22, max: 25, feedback: 'Minor code style issues found' },
            tests: { score: 25, max: 30, feedback: 'Good test coverage for core functionality' },
            documentation: { score: 12, max: 15, feedback: 'README could be more detailed' },
          },
          feedback: 'Great project! Add more unit tests for edge cases to improve score.',
          nextSteps: [
            'Add more comprehensive test cases',
            'Improve documentation with examples',
            'Address minor code style issues',
          ],
          skillVerification: {
            skillId: 'rag-skill',
            skillName: 'RAG Systems',
            currentLevel: 32,
            newLevel: 55,
            xpAwarded: 400,
          },
        };

        setVerificationData(mockVerificationData);
        setIsVerifying(false);
        setVerificationStatus('completed');

        // Auto-navigate to dashboard after showing results for a few seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } catch (err: any) {
        console.error('Verification failed:', err);
        setVerificationData({
          repoId,
          error: err.message || 'Verification failed. Please try again.',
        });
        setIsVerifying(false);
        setVerificationStatus('failed');

        // Show error for a moment then go back
        setTimeout(() => {
          navigate('/projects');
        }, 3000);
      }
    };

    loadVerificationData();
  }, [repoId]);

  if (isVerifying) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">Verifying Your Project...</Heading>
          <Box w="8" h="8" borderRadius="full" bg="blue-500" animation="pulse 1.5s ease-in-out infinite" />
          <Text size="sm" color="gray-600" mt={4}>
            Analyzing your GitHub repository...
          </Text>
        </VBox>
      </Box>
    );
  }

  if (!verificationData) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">Verification Not Found</Heading>
          <Text size="sm" color="gray-600" mt={4}>
            The verification for this repository could not be found.
          </Text>
          <ButtonGroup spacing={4} mt={6}>
            <Button colorScheme="blue" onClick={() => navigate('/projects')}>
              Browse Projects
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </ButtonGroup>
        </VBox>
      </Box>
    );
  }

  if (verificationData.error) {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">Verification Failed</Heading>
          <Text size="sm" color="red-600" mt={4}>
            {verificationData.error}
          </Text>
          <ButtonGroup spacing={4} mt={6}>
            <Button
              variant="outline"
              onClick={() => navigate(`/project/${verificationData.repoId}`)}
              leftIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
            >
              Try Again
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate('/projects')}
              leftIcon={<RefreshCw className="mr-2 h-4 w-4" />}
            >
              Browse Projects
            </Button>
          </ButtonGroup>
        </VBox>
      </Box>
    );
  }

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
          Verification Results
        </Text>
      </Box>

      <ScrollArea h="80vh">
        <VStack spacing={6} maxW="lg" mx="auto" py={8}>
          {/* Header */}
          <VStack spacing={4} align="center" textAlign="center">
            <Box className="glass" p={6} rounded="2xl" display="inline-block">
              <Box w={16} h={16} bg="gradient-to-br from-blue-400 via-pink-500 to-red-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="2xl" fontWeight="bold">🏆</Text>
              </Box>
            </Box>
            <Heading size="2xl">Verification Complete</Heading>
            <Text size="sm" color="gray-600" maxW="md">
              Your project has been analyzed and scored
            </Text>
          </VStack>

          {/* Score Card */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <HStack spacing={4} align="start" mb={4}>
                <Box flexShrink={0} w={12} h={12} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                  <Trophy className="text-blue-600 w-6 h-6" />
                </Box>
                <VStack align="start">
                  <Text size="sm" fontWeight="medium" color="gray-600">Verification Score</Text>
                  <Heading size="3xl" fontWeight="extrabold"
                    color={verificationData.score >= 80 ? 'green-600' :
                           verificationData.score >= 60 ? 'yellow-600' : 'red-600'}
                  >
                    {verificationData.score}/100
                  </Heading>
                  <Text size="xs" color="gray-500">
                    {verificationData.score >= 80 ? 'Excellent' :
                     verificationData.score >= 60 ? 'Good' :
                     'Needs Improvement'}
                  </Text>
                </VStack>
              </HStack>
              <Divider my={4} />
              <VStack spacing={3}>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Skill Verified</Text>
                  <Heading size="lg" fontWeight="semibold"
                    color={verificationData.skillVerification.newLevel > verificationData.skillVerification.currentLevel ? 'green-600' : 'gray-600'}
                  >
                    {verificationData.skillVerification.skillName}
                  </Heading>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">Level Increase</Text>
                  <Heading size="lg" fontWeight="semibold"
                    color={verificationData.skillVerification.newLevel > verificationData.skillVerification.currentLevel ? 'green-600' : 'gray-600'}
                  >
                    {verificationData.skillVerification.currentLevel} → {verificationData.skillVerification.newLevel}
                  </Heading>
                </HStack>
                <HStack justify="between">
                  <Text size="sm" fontWeight="medium">XP Earned</Text>
                  <Heading size="lg" fontWeight="semibold" color="yellow-600">
                    +{verificationData.skillVerification.xpAwarded}
                  </Heading>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Score Breakdown */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <Heading size="lg">Score Breakdown</Heading>
              <Divider my={4} />
              <VStack spacing={3}>
                {Object.entries(verificationData.breakdown).map(([key, value]: [string, any]) => (
                  <Box key={key} className="flex items-start space-x-4 py-3 bg-gray-50 rounded-lg">
                    <VStack align="start">
                      <Heading size="sm">{key.charAt(0).toUpperCase() + key.slice(1)}</Heading>
                      <Text size="xs" color="gray-500">
                        {value.feedback}
                      </Text>
                    </VStack>
                    <VStack align="end" space={2}>
                      <HStack justify="end" spacing={2}>
                        <Text fontWeight="medium" color="gray-600">
                          Score: {value.score}/{value.max}
                        </Text>
                      </HStack>
                      <Box w={20} h={4} bg="gray-200" rounded="full" overflow="hidden">
                        <Box
                          w={`${(value.score / value.max) * 100}%`}
                          h="4"
                          bg="gradient-to-r from-blue-500 to-blue-300"
                          rounded="full"
                        />
                      </Box>
                      <Text size="xs" fontWeight="medium" textAlign="right">
                        {Math.round((value.score / value.max) * 100)}%
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Feedback and Next Steps */}
          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Heading size="lg">Feedback</Heading>
                <Text size="sm" color="gray-600">
                  {verificationData.feedback}
                </Text>
                <Divider my={4} />
                <Heading size="lg">Next Steps</Heading>
                <VStack spacing={2}>
                  {verificationData.nextSteps.map((step: string, index: number) => (
                    <Box key={index} className="flex items-start space-x-3">
                      <Box flexShrink={0} w={2} h={2} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                        <Play className="text-blue-600" />
                      </Box>
                      <VStack align="start">
                        <Text size="sm">{step}</Text>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VBox>
      </ScrollArea>
    </Box>
  );
};

export default Verification;