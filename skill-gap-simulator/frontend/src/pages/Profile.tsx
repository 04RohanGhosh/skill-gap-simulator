import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Spacer, SimpleGrid, Card, CardBody, CardFooter, Badge, Divider, ScrollArea, Image, useDisclosure, Menu, MenuButton, MenuList, MenuItem, Avatar, AvatarImage, AvatarFallback } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import { Link, useNavigate } from 'react-router-dom';
import { List, CheckCircle, XCircle, Loader2, Clock, Sparkles, Trophy, Code, Brain, Sparkles, Share2, Users, Calendar, TrendingUp, Edit, Search, Bell, Moon, Sun, FileText, Github, ShieldCheck, Camera, Brush, Palette, Tool, Upload, Download, RefreshCw, Settings, LogOut } from '@heroicons/react/24/outline';

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useDisclosure();
  const [tab, setTab] = useState<'overview' | 'skills' | 'projects' | 'settings'>('overview');
  const [editedUser, setEditedUser] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    }
  }, [user]);

  const handleSaveProfile = () => {
    // In a real app, this would send updated data to backend
    setUser(editedUser);
    setIsEditing(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  const handleLogout = () => {
    // In a real app, this would call the auth logout API
    // For now, we'll just clear the zustand store
    setUser(null);
    navigate('/login');
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
          Profile Settings
        </Text>
      </Box>

      <ScrollArea h="80vh">
        <VStack spacing={6} maxW="7xl" mx="auto" py={8}>
          {/* Header */}
          <VStack spacing={4} align="center" textAlign="center">
            <Box className="glass" p={6} rounded="2xl" display="inline-block">
              <Box w={16} h={16} bg="gradient-to-br from-blue-400 via-pink-500 to-red-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="2xl" fontWeight="bold">👤</Text>
              </Box>
            </Box>
            <Heading size="2xl">User Profile</Heading>
            <Text size="sm" color="gray-600" maxW="md">
              Manage your account and preferences
            </Text>
          </VStack>

          {/* Tabs */}
          <Tabs>
            <TabList>
              <Tab
                onClick={() => setTab('overview')}
                isActive={tab === 'overview'}
              >
                Overview
              </Tab>
              <Tab
                onClick={() => setTab('skills')}
                isActive={tab === 'skills'}
              >
                Skills
              </Tab>
              <Tab
                onClick={() => setTab('projects')}
                isActive={tab === 'projects'}
              >
                Projects
              </Tab>
              <Tab
                onClick={() => setTab('settings')}
                isActive={tab === 'settings'}
              >
                Settings
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {tab === 'overview' && (
                  <VStack spacing={6}>
                    {/* Profile Info Card */}
                    <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                      <CardBody p={6}>
                        <HStack spacing={4} align="start" className="mb-4">
                          <Box flexShrink={0} w={14} h={14} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                            <Image
                              alt="User avatar"
                              src={editedUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                              rounded="full"
                              w={14}
                              h={14}
                              objectFit="cover"
                            />
                          </Box>
                          <VStack align="start">
                            <Heading size="lg" className="mb-2">
                              {editedUser?.name || 'User Name'}
                            </Heading>
                            <Text size="sm" color="gray-600" className="mb-1">
                              {editedUser?.email || 'user@example.com'}
                            </Text>
                            <Text size="xs" color="gray-500" className="mb-2">
                              Member since {new Date(editedUser?.created_at || Date.now()).toLocaleDateString()}
                            </Text>
                            {!isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                leftIcon={<Edit className="mr-2 h-4 w-4" />}
                              >
                                Edit Profile
                              </Button>
                            )}
                          </VStack>
                        </HStack>
                        {isEditing && (
                          <VStack spacing={4} mt={4}>
                            <FormControl isInvalid={!!editedUser?.name?.length < 2}>
                              <FormLabel>Full Name</FormLabel>
                              <Input
                                placeholder="Enter your full name"
                                value={editedUser?.name || ''}
                                onChange={(e) => {
                                  setEditedUser(prev => ({ ...prev, name: e.target.value }));
                                }}
                                isRequired
                                disabled={false}
                              >
                                <Text size="xs" color="red-500">
                                  Name must be at least 2 characters
                                </Text>
                              </Input>
                            </FormControl>
                            <FormControl mt={4} isInvalid={!!editedUser?.email?.length < 5}>
                              <FormLabel>Email Address</FormLabel>
                              <Input
                                type="email"
                                placeholder="Enter your email address"
                                value={editedUser?.email || ''}
                                onChange={(e) => {
                                  setEditedUser(prev => ({ ...prev, email: e.target.value }));
                                }}
                                isRequired
                                disabled={false}
                              >
                                <Text size="xs" color="red-500">
                                  Please enter a valid email
                                </Text>
                              </Input>
                            </FormControl>
                            <FormControl mt={4}>
                              <FormLabel>Avatar URL</FormLabel>
                              <Input
                                placeholder="Enter avatar URL (optional)"
                                value={editedUser?.avatar_url || ''}
                                onChange={(e) => {
                                  setEditedUser(prev => ({ ...prev, avatar_url: e.target.value || null }));
                                }}
                              >
                                <Text size="xs" color="gray-500">
                                  Leave blank for default avatar
                                </Text>
                              </Input>
                            </FormControl>
                            <HStack spacing={4} justify="end" mt={6}>
                              <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                                leftIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
                              >
                                Cancel
                              </Button>
                              <Button
                                colorScheme="blue"
                                onClick={handleSaveProfile}
                                leftIcon={<CheckCircle className="mr-2 h-4 w-4" />}
                              >
                                Save Changes
                              </Button>
                            </HStack>
                          </VStack>
                        )}
                      </CardBody>
                    </Card>

                    {/* Stats Cards */}
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4} mt={6}>
                      {/* Total XP */}
                      <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                        <CardBody p={6}>
                          <HStack spacing={4} align="start" mb={3}>
                            <Box flexShrink={0} w={10} h={10} bg="yellow-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                              <Sparkles className="text-yellow-600 w-5 h-5" />
                            </Box>
                            <VStack align="start">
                              <Text fontWeight="medium" color="gray-600">Total XP</Text>
                              <Heading size="lg" color="yellow-600">
                                2,450
                              </Heading>
                              <Text size="xs" color="gray-500">
                                Earned from completed weeks and projects
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        {/* Skills Verified */}
                        <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                          <CardBody p={6}>
                            <HStack spacing={4} align="start" mb={3}>
                              <Box flexShrink={0} w={10} h={10} bg="green-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                <CheckCircle className="text-green-600 w-5 h-5" />
                              </Box>
                              <VStack align="start">
                                <Text fontWeight="medium" color="gray-600">Skills Verified</Text>
                                <Heading size="lg" color="green-600">
                                  3
                                </Heading>
                                <Text size="xs">Verified through project completion</Text>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Projects Completed */}
                          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                            <CardBody p={6}>
                              <HStack spacing={4} align="start" mb={3}>
                                <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  <Code className="text-blue-600 w-5 h-5" />
                                </Box>
                                <VStack align="start">
                                  <Text fontWeight="medium" color="gray-600">Projects Completed</Text>
                                  <Heading size="lg" color="blue-600">
                                    5
                                  </Heading>
                                  <Text size="xs" color="gray-500">
                                    Successfully completed and verified
                                  </Text>
                                </VStack>
                              </CardBody>
                            </Card>
                          </SimpleGrid>
                        </Card>

                        {/* Activity Timeline */}
                        <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                          <CardBody p={6}>
                            <Heading size="lg">Recent Activity</Heading>
                            <Divider my={4} />
                            <VStack spacing={3}>
                              <Box className="flex items-start space-x-3">
                                <Box flexShrink={0} w={8} h={8} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  <CheckCircle className="text-blue-600 w-4 h-4" />
                                </Box>
                                <VStack align="start">
                                  <Text size="sm" fontWeight="medium">Completed Week 3: Introduction to LLMs & LangChain</Text>
                                  <Text size="xs" color="gray-500" className="mt-1">
                                    2 days ago
                                  </Text>
                                </VBox>
                              </Box>
                              <Box className="flex items-start space-x-3">
                                <Box flexShrink={0} w={8} h={8} bg="green-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  <Trophy className="text-green-600 w-4 h-4" />
                                </Box>
                                <VStack align="start">
                                  <Text size="sm" fontWeight="medium">Verified Skill: RAG Systems</Text>
                                  <Text size="xs" color="gray-500" className="mt-1">
                                    3 days ago
                                  </Text>
                                </VBox>
                              </Box>
                              <Box className="flex items-start space-x-3">
                                <Box flexShrink={0} w={8} h={8} bg="purple-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  <Upload className="text-purple-600 w-4 h-4" />
                                </Box>
                                <VStack align="start">
                                  <Text size="sm" fontWeight="medium">Started Project: Document Q&A System</Text>
                                  <Text size="xs" color="gray-500" className="mt-1">
                                    5 days ago
                                  </Text>
                                </VBox>
                              </Box>
                              <Box className="flex items-start space-x-3">
                                <Box flexShrink={0} w={8} h={8} bg="gray-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  <Clock className="text-gray-600 w-4 h-4" />
                                </Box>
                                <VStack align="start">
                                  <Text size="sm" fontWeight="medium">Updated Profile Information</Text>
                                  <Text size="xs" color="gray-500" className="mt-1">
                                    1 week ago
                                  </Text>
                                </VBox>
                              </Box>
                            </VStack>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>
                    <TabPanel>
                    {tab === 'skills' && (
                      <VStack spacing={6}>
                        <Heading size="lg">Your Skills</Heading>
                        <Text size="sm" color="gray-600" mb={4}>
                          Overview of your current skill proficiencies
                        </Text>
                        <Divider my={4} />

                        {/* Skills Overview Chart */}
                        <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                          <CardBody p={6}>
                            <Heading size="lg">Skill Proficiency Overview</Heading>
                            <Divide my={4} />
                            {/* In a real app, this would show a radar or bar chart of skills */}
                            <Box className="space-y-4">
                              {[
                                { name: 'Python', current: 72, target: 90, category: 'Programming' },
                                { name: 'SQL', current: 64, target: 85, category: 'Data' },
                                { name: 'LLMs', current: 55, target: 100, category: 'AI/ML' },
                                { name: 'LangChain', current: 40, target: 100, category: 'AI/ML' },
                                { name: 'RAG', current: 55, target: 100, category: 'AI/ML' },
                                { name: 'Cloud Architecture', current: 45, target: 100, category: 'Cloud' },
                                { name: 'System Design', current: 30, target: 100, category: 'System' },
                                { name: 'Machine Learning Fundamentals', current: 50, target: 100, category: 'AI/ML' },
                                { name: 'Data Engineering', current: 48, target: 100, category: 'Data' },
                                { name: 'DevOps Practices', current: 35, target: 100, category: 'DevOps' },
                              ].map((skill, index) => (
                                <Box key={index} className="flex items-start space-x-4 py-3 bg-gray-50 rounded-lg">
                                  <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                    {skill.category === 'Programming' && (
                                      <Code className="text-blue-600 w-5 h-5" />
                                    )}
                                    {skill.category === 'Data' && (
                                      <Database className="text-blue-600 w-5 h-5" />
                                    )}
                                    {skill.category === 'AI/ML' && (
                                      <Brain className="text-blue-600 w-5 h-5" />
                                    )}
                                    {skill.category === 'Cloud' && (
                                      <Cloud className="text-blue-600 w-5 h-5" />
                                    )}
                                    {skill.category === 'System' && (
                                      <Tool className="text-blue-600 w-5 h-5" />
                                    )}
                                    {skill.category === 'DevOps' && (
                                      <Settings className="text-blue-600 w-5 h-5" />
                                    )}
                                  </Box>
                                  <VStack align="start">
                                    <Heading size="sm" className="mb-1">
                                      {skill.name}
                                    </Heading>
                                    <Text size="xs" color="gray-500">
                                      {skill.category}
                                    </Text>
                                  </VBox>
                                  <VStack align="end" space={2}>
                                    <Box w={20} h={4} bg="gray-200" rounded="full" overflow="hidden">
                                      <Box
                                        w={`${(skill.current / skill.target) * 100}%`}
                                        h="4"
                                        bg="gradient-to-r from-blue-500 to-blue-300"
                                        rounded="full"
                                      />
                                    </Box>
                                    <Text size="xs" fontWeight="medium" textAlign="right">
                                      {skill.current}%
                                    </Text>
                                  </VBox>
                                </Box>
                              )}
                            </Box>
                          </CardBody>
                        </Card>

                        {/* Skill Development Plan */}
                        <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                          <CardBody p={6}>
                            <Heading size="lg">Recommended Skill Development</Heading>
                            <Text size="sm" color="gray-600" mb={4}>
                              Focus areas based on your goals and current level
                            </Text>
                            <Divider my={4} />
                            <VStack spacing={3}>
                              {[
                                {
                                  skill: 'LLMs',
                                  current: 55,
                                  target: 80,
                                  recommendation: 'Complete the LangChain course and build 2 LLM-powered applications',
                                  weeks: 4
                                },
                                {
                                  skill: 'System Design',
                                  current: 30,
                                  target: 70,
                                  recommendation: 'Study the System Design Primer and design 3 scalable architectures',
                                  weeks: 6
                                },
                                {
                                  skill: 'DevOps Practices',
                                  current: 35,
                                  target: 75,
                                  recommendation: 'Set up CI/CD pipelines for 3 projects and learn infrastructure as code',
                                  weeks: 5
                                }
                              ].map((plan, index) => (
                                <Box key={index} className="flex items-start space-x-4 py-3 bg-gray-50 rounded-lg">
                                  <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                    <Badge colorScheme="blue" textXs fontWeight="medium">
                                      {plan.weeks} weeks
                                    </Badge>
                                  </Box>
                                  <VStack align="start">
                                    <Heading size="sm" className="mb-1">
                                      {plan.skill}
                                    </Heading>
                                    <Text size="xs" color="gray-500">
                                      Current: {plan.current}% → Target: {plan.target}%
                                    </Text>
                                  </VBox>
                                  <VStack align="start" className="mt-2">
                                    <Text size="sm" color="gray-600">
                                      {plan.recommendation}
                                    </Text>
                                  </VBox>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>
                    <TabPanel>
                    {tab === 'projects' && (
                      <VStack spacing={6}>
                        <Heading size="lg">Your Projects</Heading>
                        <Text size="sm" color="gray-600" mb={4}>
                          Overview of your project history and achievements
                        </Text>
                        <Divider my={4} />

                        {/* Projects Stats */}
                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4} mb={6}>
                          {/* Total Projects */}
                          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                            <CardBody p={6}>
                              <HStack spacing={4} align="start" mb={3}>
                                <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  <FileText className="text-blue-600 w-5 h-5" />
                                </Box>
                                <VStack align="start">
                                  <Text fontWeight="medium" color="gray-600">Total Projects</Text>
                                  <Heading size="lg" color="blue-600">
                                    8
                                  </Heading>
                                  <Text size="xs" color="gray-500">
                                    Successfully completed
                                  </Text>
                                </VStack>
                              </CardBody>
                            </Card>

                            {/* Verified Projects */}
                            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                              <CardBody p={6}>
                                <HStack spacing={4} align="start" mb={3}>
                                  <Box flexShrink={0} w={10} h={10} bg="green-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                    <CheckCircle className="text-green-600 w-5 h-5" />
                                  </Box>
                                  <VStack align="start">
                                    <Text fontWeight="medium" color="gray-600">Verified Projects</Text>
                                    <Heading size="lg" color="green-600">
                                      5
                                    </Heading>
                                    <Text size="xs" color="gray-500">
                                      Passed skill verification
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {/* Avg. Score */}
                              <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                <CardBody p={6}>
                                  <HStack spacing={4} align="start" mb={3}>
                                    <Box flexShrink={0} w={10} h={10} bg="yellow-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                      <Sparkles className="text-yellow-600 w-5 h-5" />
                                    </Box>
                                    <VStack align="start">
                                      <Text fontWeight="medium" color="gray-600">Average Score</Text>
                                      <Heading size="lg" color="yellow-600">
                                        87/100
                                      </Heading>
                                      <Text size="xs" color="gray-500">
                                        Across all verifications
                                      </Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              </SimpleGrid>

                              {/* Projects Timeline */}
                              <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                <CardBody p={6}>
                                  <Heading size="lg">Project Timeline</Heading>
                                  <Divide my={4} />
                                  <VStack spacing={3}>
                                    {[
                                      {
                                        month: 'Jan',
                                        projects: [
                                          { name: 'Data Analysis Toolkit', score: 82, verified: true },
                                          { name: 'Interactive Dashboard', score: 78, verified: false }
                                        ]
                                      },
                                      {
                                        month: 'Feb',
                                        projects: [
                                          { name: 'Simple Chatbot', score: 91, verified: true }
                                        ]
                                      },
                                      {
                                        month: 'Mar',
                                        projects: [
                                          { name: 'Document Q&A System', score: 85, verified: true },
                                          { name: 'CI/CD Pipeline', score: 88, verified: true }
                                        ]
                                      },
                                      {
                                        month: 'Apr',
                                        projects: [
                                          { name: 'Scalable Web Application', score: 90, verified: true }
                                        ]
                                      }
                                    ].map((monthData, index) => (
                                      <Box key={index} className="mb-4">
                                        <HStack spacing={3} align="start" className="mb-2">
                                          <Text fontWeight="medium">{monthData.month}</Text>
                                          <Text size="xs" color="gray-500">
                                            {monthData.projects.length} projects
                                          </Text>
                                        </HStack>
                                        <Divider my={2} />
                                        <VStack spacing={2}>
                                          {monthData.projects.map((project, pIndex) => (
                                            <Box key={pIndex} className="flex items-start space-x-3 py-2 bg-gray-50 rounded-lg">
                                              <Box flexShrink={0} w={8} h={8} bg={project.verified ? 'green-100' : 'yellow-100'} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                                {project.verified ? (
                                                  <CheckCircle className="text-green-600 w-4 h-4" />
                                                ) : (
                                                  <Timer className="text-yellow-600 w-4 h-4" />
                                                )}
                                              </Box>
                                              <VStack align="start">
                                                <Text size="sm" fontWeight="medium">{project.name}</Text>
                                                <Text size="xs" color="gray-600">
                                                  Score: {project.score}/100
                                                </Text>
                                              </VBox>
                                            </Box>
                                          ))}
                                        </VStack>
                                      </Box>
                                    ))}
                                  </VStack>
                                </CardBody>
                              </Card>
                            </VStack>
                        </TabPanel>
                        <TabPanel>
                        {tab === 'settings' && (
                          <VStack spacing={6}>
                            <Heading size="lg">Account Settings</Heading>
                            <Text size="sm" color="gray-600" mb={4}>
                              Manage your account preferences and security
                            </Text>
                            <Divider my={4} />

                            {/* Notification Preferences */}
                            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                              <CardBody p={6}>
                                <Heading size="lg">Notification Preferences</Heading>
                                <Divide my={4} />
                                <VStack spacing={4}>
                                  <Box className="flex items-start space-x-3">
                                    <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                      <Bell className="text-blue-600 w-5 h-5" />
                                    </Box>
                                    <VStack align="start">
                                      <Heading size="sm" className="mb-1">Email Notifications</Heading>
                                      <Text size="xs" color="gray-600">
                                        Receive updates about your progress
                                      </Text>
                                    </VStack>
                                  </Box>
                                  <Box className="flex items-end space-x-3">
                                    <Switch
                                      isChecked={true}
                                      onChange={() => {}}
                                      colorScheme="blue"
                                    />
                                  </Box>
                                </VStack>
                                <Divider my={3} />
                                <VStack spacing={4}>
                                  <Box className="flex items-start space-x-3">
                                    <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                      <Moon className="text-blue-600 w-5 h-5" />
                                    </Box>
                                    <VStack align="start">
                                      <Heading size="sm" className="mb-1">Weekly Progress Digest</Heading>
                                      <Text size="xs" color="gray-600">
                                        Get a summary of your activity every Monday
                                      </Text>
                                    </VBox>
                                  </Box>
                                  <Box className="flex items-end space-x-3">
                                    <Switch
                                      isChecked={false}
                                      onChange={() => {}}
                                      colorScheme="blue"
                                    />
                                  </Box>
                                </VStack>
                                <Divider my={3} />
                                <VStack spacing={4}>
                                  <Box className="flex items-start space-x-3">
                                    <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                      <Upload className="text-blue-600 w-5 h-5" />
                                    </Box>
                                    <VStack align="start">
                                      <Heading size="sm" className="mb-1">Project Submission Alerts</Heading>
                                      <Text size="xs" color="gray-600">
                                        Notify when verification is complete
                                      </Text>
                                    </VBox>
                                  </Box>
                                  <Box className="flex items-end space-x-3">
                                    <Switch
                                      isChecked={true}
                                      onChange={() => {}}
                                      colorScheme="blue"
                                    />
                                  </Box>
                                </VStack>
                              </CardBody>
                            </Card>

                            {/* Data & Privacy */}
                            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                              <CardBody p={6}>
                                <Heading size="lg">Data & Privacy</Heading>
                                <Divide my={4} />
                                <VStack spacing={4}>
                                  <Box className="flex items-start space-x-3">
                                    <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                      <ShieldCheck className="text-blue-600 w-5 h-5" />
                                    </Box>
                                    <VStack align="start">
                                      <Heading size="sm" className="mb-1">Data Export</Heading>
                                      <Text size="xs" color="gray-600">
                                        Download a copy of your data
                                      </Text>
                                    </VBox>
                                  </Box>
                                  <Box className="flex items-end space-x-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {}}
                                      leftIcon={<Download className="mr-2 h-4 w-4" />}
                                    >
                                      Export Data
                                    </Button>
                                  </Box>
                                </VStack>
                                <Divider my={3} />
                                <VBox className="flex items-start space-x-3">
                                  <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                    <UserPlus className="text-blue-600 w-5 h-5" />
                                  </Box>
                                  <VBox align="start">
                                    <Heading size="sm" className="mb-1">Account Deletion</Heading>
                                    <Text size="xs" color="gray-600">
                                      Permanently delete your account and all data
                                    </Text>
                                  </VBox>
                                </Box>
                                <Box className="flex items-end space-x-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => {}}
                                    leftIcon={<DeleteForEver className="mr-2 h-4 w-4" />}
                                  >
                                    Delete Account
                                  </Button>
                                </Box>
                              </VBox>
                            </CardBody>
                          </Card>

                            {/* Connected Services */}
                            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                              <CardBody p={6}>
                                <Heading size="lg">Connected Services</Heading>
                                <Divide my={4} />
                                <VBox className="flex items-start space-x-3">
                                  <Box flexShrink=0 w=10 h=10 bg=blue-100 rounded=lg display=flex alignItems=center justifyContent=center>
                                    <Github className=text-blue-600 w-5 h-5 />
                                  </Box>
                                  <VBox align=start>
                                    <Heading size=sm className=mb-1>GitHub</Heading>
                                    <Text size=xs color=gray-600>
                                      Connected to skillgap-simulator
                                    </Text>
                                  </VBox>
                                </Box>
                                <Box className=flex items-end space-x-3>
                                  <Button variant=outline size=sm onClick={() => {}} leftIcon={<RefreshCw className=mr-2 h-4 w-4 />}>
                                    Reconnect
                                  </Button>
                                </Box>
                              </VBox>
                            </CardBody>
                          </VBox>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </VStack>
                </ScrollArea>
              </Box>
            </Box>
          </VStack>
        </ScrollArea>
      </Box>
    </div>
  );
};

export default Profile;