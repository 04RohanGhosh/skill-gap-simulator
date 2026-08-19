import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Spacer, SimpleGrid, Card, CardBody, CardFooter, Badge, Divider, ScrollArea, Table, Tbody, Td, Th, Thead, Tr, useDisclosure, Menu, MenuButton, MenuList, MenuItem, Input, Select, Switch } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import { Link, useNavigate } from 'react-router-dom';
import { List, CheckCircle, XCircle, Loader2, Clock, Sparkles, Trophy, Code, Brain, Sparkles, Share2, Users, Calendar, TrendingUp, Edit, Search, Bell, Moon, Sun, FileText, Github, ShieldCheck, Camera, Brush, Palette, Tool, Upload, Download, RefreshCw, Settings, LogOut, UserPlus, Trash2, AlertCircle, AlertTriangle } from '@heroicons/react/24/outline';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useDisclosure();
  const [tab, setTab] = useState<'users' | 'skills' | 'projects' | 'settings'>('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock users data
        const mockUsers = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            status: 'active',
            lastLogin: '2026-08-15',
            createdAt: '2026-01-15',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'user',
            status: 'active',
            lastLogin: '2026-08-16',
            createdAt: '2026-02-20',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
          },
          {
            id: 3,
            name: 'Bob Wilson',
            email: 'bob@example.com',
            role: 'user',
            status: 'inactive',
            lastLogin: '2026-07-30',
            createdAt: '2026-03-10',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
          },
          {
            id: 4,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'moderator',
            status: 'active',
            lastLogin: '2026-08-17',
            createdAt: '2026-04-05',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
          }
        ];

        setUsers(mockUsers);
        setFilteredUsers(mockUsers);

        // Mock skills data
        const mockSkills = [
          { id: 1, name: 'Python', category: 'Programming', description: 'Python programming language proficiency', level: 'beginner' },
          { id: 2, name: 'Machine Learning', category: 'AI/ML', description: 'Machine learning algorithms and applications', level: 'intermediate' },
          { id: 3, name: 'LangChain', category: 'AI/ML', description: 'LangChain framework for LLM applications', level: 'intermediate' },
          { id: 4, name: 'RAG', category: 'AI/ML', description: 'Retrieval-Augmented Generation systems', level: 'advanced' },
          { id: 5, name: 'Cloud Architecture', category: 'Cloud', description: 'Designing scalable cloud systems', level: 'intermediate' },
          { id: 6, name: 'SQL', category: 'Data', description: 'SQL database querying and management', level: 'beginner' }
        ];

        setSkills(mockSkills);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!users.length) return;

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleDeleteUser = (userId) => {
    // In a real app, this would call the delete API
    alert(`User ${userId} deleted`);
    setUsers(prev => prev.filter(user => user.id !== userId));
    setFilteredUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleToggleUserStatus = (userId) => {
    // In a real app, this would call the API to toggle status
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
      )
    );
    setFilteredUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
      )
    );
  };

  const handleChangeRole = (userId, newRole) => {
    // In a real app, this would call the API to change role
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    setFilteredUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box minH="vh" bg="gray-50" py={12} px={4}>
        <VStack align="center" spacing={8}>
          <Heading size="2xl">Access Denied</Heading>
          <Text size="sm" color="gray-600" mt={4}>
            You don't have permission to access the admin panel.
          </Text>
          <Button colorScheme="blue" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
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
          Admin Panel
        </Text>
      </Box>

      <ScrollArea h="80vh">
        <VStack spacing={6} maxW="7xl" mx="auto" py={8}>
          {/* Header */}
          <VStack spacing={4} align="center" textAlign="center">
            <Box className="glass" p={6} rounded="2xl" display="inline-block">
              <Box w={16} h={16} bg="gradient-to-br from-red-400 via-orange-500 to-yellow-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="2xl" fontWeight="bold">⚙️</Text>
              </Box>
            </Box>
            <Heading size="2xl">Admin Dashboard</Heading>
            <Text size="sm" color="gray-600" maxW="md">
              Manage users, skills, and system settings
            </Text>
          </VStack>

          {/* Tabs */}
          <Tabs>
            <TabList>
              <Tab
                onClick={() => setTab('users')}
                isActive={tab === 'users'}
              >
                Users
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
                {tab === 'users' && (
                  <VStack spacing={6}>
                    {/* Users Header */}
                    <HStack justify="between" align="center" mb={4}>
                      <Heading size="lg">User Management</Heading>
                      <HStack spacing={3}>
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          leftIcon={<Search className="mr-2 h-4 w-4" />}
                          w={40}
                        />
                        <Button
                          colorScheme="blue"
                          onClick={() => {}}
                          leftIcon={<UserPlus className="mr-2 h-4 w-4" />}
                        >
                          Add User
                        </Button>
                      </HStack>
                    </HStack>

                    {/* Loading State */}
                    {loading && (
                      <Box textAlign="center" py={8}>
                        <Loader2 size={3} />
                        <Text size="sm" color="gray-600" mt={2}>
                          Loading users...
                        </Text>
                      </Box>
                    )}

                    {/* Users Table */}
                    {!loading && (
                      <Table variant="simple" whiteSpace="normal">
                        <Thead>
                          <Tr>
                            <Th>Avatar</Th>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>Status</Th>
                            <Th>Last Login</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <Tr key={user.id} className="hover:bg-gray-50">
                                <Td>
                                  <Image
                                    alt={`${user.name}'s avatar`}
                                    src={user.avatar}
                                    w={8}
                                    h={8}
                                    rounded="full"
                                  />
                                </Td>
                                <Td>{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td>
                                  <Badge
                                    variant="subtle"
                                    colorScheme={user.role === 'admin' ? 'red' : user.role === 'moderator' ? 'yellow' : 'blue'}
                                  >
                                    {user.role}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge
                                    variant="subtle"
                                    colorScheme={user.status === 'active' ? 'green' : 'red'}
                                  >
                                    {user.status}
                                  </Badge>
                                </Td>
                                <Td>{user.lastLogin}</Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <ButtonGroup>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleChangeRole(user.id, 'admin')}
                                        isLoading={false}
                                      >
                                        Admin
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleChangeRole(user.id, 'moderator')}
                                        isLoading={false}
                                      >
                                        Mod
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleChangeRole(user.id, 'user')}
                                        isLoading={false}
                                      >
                                        User
                                      </Button>
                                    </ButtonGroup>
                                    <ButtonGroup spacing={2} ml={2}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleUserStatus(user.id)}
                                        colorScheme={user.status === 'active' ? 'red' : 'green'}
                                      >
                                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() => handleDeleteUser(user.id)}
                                        leftIcon={<Trash2 className="mr-2 h-4 w-4" />}
                                      >
                                        Delete
                                      </Button>
                                    </ButtonGroup>
                                  </HStack>
                                </Td>
                              </Tr)
                            ))
                          : (
                            <Tr>
                              <Td colSpan="7" textAlign="center" py={4}>
                                No users found matching your search.
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    )}

                    {/* Users Stats */}
                    {!loading && filteredUsers.length > 0 && (
                      <SimpleGrid columns={{ base: 1, sm: 3, lg: 4 }} gap={4} mt={6}>
                        <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                          <CardBody p={6}>
                            <HStack spacing={4} align="start" mb={3}>
                              <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                <Users className="text-blue-600 w-5 h-5" />
                              </Box>
                              <VStack align="start">
                                <Text fontWeight="medium" color="gray-600">Total Users</Text>
                                <Heading size="lg" color="blue-600">
                                  {users.length}
                                </Heading>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                            <CardBody p={6}>
                              <HStack spacing={4} align="start" mb={3}>
                                <Box flexShrink={0} w={10} h={10} bg="green-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                  <CheckCircle className="text-green-600 w-5 h-5" />
                                </Box>
                                <VStack align="start">
                                  <Text fontWeight="medium" color="gray-600">Active Users</Text>
                                  <Heading size="lg" color="green-600">
                                    {users.filter(u => u.status === 'active').length}
                                  </Heading>
                                </VStack>
                              </CardBody>
                            </Card>

                            <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                              <CardBody p={6}>
                                <HStack spacing={4} align="start" mb={3}>
                                  <Box flexShrink={0} w={10} h={10} bg="yellow-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                    <AlertTriangle className="text-yellow-600 w-5 h-5" />
                                  </Box>
                                  <VStack align="start">
                                    <Text fontWeight="medium" color="gray-600">Inactive Users</Text>
                                    <Heading size="lg" color="yellow-600">
                                      {users.filter(u => u.status === 'inactive').length}
                                    </Heading>
                                  </VStack>
                                </CardBody>
                              </Card>

                              <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                <CardBody p={6}>
                                  <HStack spacing={4} align="start" mb={3}>
                                    <Box flexShrink={0} w={10} h={10} bg="red-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                      <AlertCircle className="text-red-600 w-5 h-5" />
                                    </Box>
                                    <VStack align="start">
                                      <Text fontWeight="medium" color="gray-600">Admin Users</Text>
                                      <Heading size="lg" color="red-600">
                                        {users.filter(u => u.role === 'admin').length}
                                      </Heading>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              </SimpleGrid>
                            )}
                          </VStack>
                        )}

                        <TabPanel>
                        {tab === 'skills' && (
                          <VStack spacing={6}>
                            {/* Skills Header */}
                            <HStack justify="between" align="center" mb={4}>
                              <Heading size="lg">Skill Management</Heading>
                              <Button
                                colorScheme="blue"
                                onClick={() => {}}
                                leftIcon={<List className="mr-2 h-4 w-4" />}
                              >
                                Add Skill
                              </Button>
                            </HStack>

                            {/* Loading State */}
                            {loading && (
                              <Box textAlign="center" py={8}>
                                <Loader2 size={3} />
                                <Text size="sm" color="gray-600" mt={2}>
                                  Loading skills...
                                </Text>
                              </Box>
                            )}

                            {/* Skills Table */}
                            {!loading && (
                              <Table variant="simple" whiteSpace="normal">
                                <Thead>
                                  <Tr>
                                    <Th>Skill Name</Th>
                                    <Th>Category</Th>
                                    <Th>Description</Th>
                                    <Th>Level</Th>
                                    <Th>Actions</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {skills.length > 0 ? (
                                    skills.map((skill) => (
                                      <Tr key={skill.id} className="hover:bg-gray-50">
                                        <Td>{skill.name}</Td>
                                        <Td>
                                          <Badge
                                            variant="subtle"
                                            colorScheme={skill.category === 'Programming' ? 'blue' :
                                                        skill.category === 'AI/ML' ? 'purple' :
                                                        skill.category === 'Cloud' ? 'cyan' :
                                                        skill.category === 'Data' ? 'green' :
                                                        skill.category === 'DevOps' ? 'orange' : 'gray'}
                                          >
                                            {skill.category}
                                          </Badge>
                                        </Td>
                                        <Td>{skill.description}</Td>
                                        <Td>
                                          <Badge
                                            variant="subtle"
                                            colorScheme={skill.level === 'beginner' ? 'green' :
                                                        skill.level === 'intermediate' ? 'yellow' :
                                                        skill.level === 'advanced' ? 'orange' : 'red'}
                                          >
                                            {skill.level}
                                          </Badge>
                                        </Td>
                                        <Td>
                                          <ButtonGroup spacing={2}>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {}}
                                              leftIcon={<Edit className="mr-2 h-4 w-4" />}
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              colorScheme="red"
                                              onClick={() => {}}
                                              leftIcon={<Trash2 className="mr-2 h-4 w-4" />}
                                            >
                                              Delete
                                            </Button>
                                          </ButtonGroup>
                                        </Td>
                                      </Tr>
                                    ))
                                  : (
                                    <Tr>
                                      <Td colSpan="5" textAlign="center" py={4}>
                                        No skills found.
                                      </Td>
                                    </Tr>
                                  )}
                                </Tbody>
                              </Table>
                            )}

                            {/* Skills Categories */}
                            {!loading && skills.length > 0 && (
                              <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                <CardBody p={6}>
                                  <Heading size="lg">Skills by Category</Heading>
                                  <Divide my={4} />
                                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
                                    {[...new Set(skills.map(s => s.category))].map((category) => (
                                      <Box key={category}>
                                        <Text fontWeight="medium" color="gray-600" mb={2}>
                                          {category}
                                        </Text>
                                        <VStack spacing={2}>
                                          {skills
                                            .filter(s => s.category === category)
                                            .map((skill) => (
                                              <Box key={skill.id} className="flex items-start space-x-2">
                                                <CheckCircle className={skill.level === 'advanced' ? 'text-green-600' : skill.level === 'intermediate' ? 'text-yellow-600' : 'text-gray-400'} />
                                                <Text size="sm">{skill.name}</Text>
                                              </Box>
                                            ))}
                                        </VStack>
                                      </Box>
                                    ))}
                                  </SimpleGrid>
                                </CardBody>
                              </Card>
                            )}
                          </VStack>
                        )}

                        <TabPanel>
                        {tab === 'projects' && (
                          <VStack spacing={6}>
                            {/* Projects Header */}
                            <HStack justify="between" align="center" mb={4}>
                              <Heading size="lg">Project Management</Heading>
                              <Button
                                colorScheme="blue"
                                onClick={() => {}}
                                leftIcon={<Upload className="mr-2 h-4 w-4" />}
                              >
                                Add Project
                              </Button>
                            </HStack>

                            {/* Loading State */}
                            {loading && (
                              <Box textAlign="center" py={8}>
                                <Loader2 size={3} />
                                <Text size="sm" color="gray-600" mt={2}>
                                  Loading projects...
                                </Text>
                              </Box>
                            )}

                            {/* Projects Table */}
                            {!loading && (
                              <Table variant="simple" whiteSpace="normal">
                                <Thead>
                                  <Tr>
                                    <Th>Project Name</Th>
                                    <Th>Associated Skill</Th>
                                    <Th>Difficulty</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {/* Mock projects data */}
                                  {[
                                    { id: 1, name: 'RAG Document Processor', skill: 'RAG', difficulty: 'Advanced', status: 'Active' },
                                    { id: 2, name: 'LangChain Chatbot Builder', skill: 'LangChain', difficulty: 'Intermediate', status: 'Active' },
                                    { id: 3, name: 'Python Data Analysis Toolkit', skill: 'Python', difficulty: 'Beginner', status: 'Active' },
                                    { id: 4, name: 'Cloud Infrastructure as Code', skill: 'Cloud Architecture', difficulty: 'Intermediate', status: 'Maintenance' },
                                    { id: 5, name: 'Machine Learning Pipeline', skill: 'Machine Learning', difficulty: 'Advanced', status: 'Active' }
                                  ].map((project) => (
                                    <Tr key={project.id} className="hover:bg-gray-50">
                                      <Td>{project.name}</Td>
                                      <Td>
                                        <Badge
                                          variant="subtle"
                                          colorScheme={project.skill === 'RAG' ? 'purple' :
                                                      project.skill === 'LangChain' ? 'indigo' :
                                                      project.skill === 'Python' ? 'blue' :
                                                      project.skill === 'Cloud Architecture' ? 'cyan' :
                                                      project.skill === 'Machine Learning' ? 'pink' : 'gray'}
                                        >
                                          {project.skill}
                                        </Badge>
                                      </Td>
                                      <Td>
                                        <Badge
                                          variant="subtle"
                                          colorScheme={project.difficulty === 'Beginner' ? 'green' :
                                                      project.difficulty === 'Intermediate' ? 'yellow' :
                                                      project.difficulty === 'Advanced' ? 'red' : 'gray'}
                                        >
                                          {project.difficulty}
                                        </Badge>
                                      </Td>
                                      <Td>
                                        <Badge
                                          variant="subtle"
                                          colorScheme={project.status === 'Active' ? 'green' :
                                                      project.status === 'Maintenance' ? 'yellow' :
                                                      project.status === 'Archived' ? 'gray' : 'red'}
                                        >
                                          {project.status}
                                        </Badge>
                                      </Td>
                                      <Td>
                                        <ButtonGroup spacing={2}>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {}}
                                            leftIcon={<Edit className="mr-2 h-4 w-4" />}
                                          >
                                            Edit
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => {}}
                                            leftIcon={<Trash2 className="mr-2 h-4 w-4" />}
                                          >
                                            Delete
                                          </Button>
                                        </ButtonGroup>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            )}

                            {/* Projects Stats */}
                            {!loading && (
                              <SimpleGrid columns={{ base: 1, sm: 3, lg: 4 }} gap={4} mt={6}>
                                <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                  <CardBody p={6}>
                                    <HStack spacing={4} align="start" mb={3}>
                                      <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                        <Upload className="text-blue-600 w-5 h-5" />
                                      </Box>
                                      <VStack align="start">
                                        <Text fontWeight="medium" color="gray-600">Total Projects</Text>
                                        <Heading size="lg" color="blue-600">
                                          15
                                        </Heading>
                                      </VStack>
                                    </CardBody>
                                  </Card>

                                  <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                    <CardBody p={6}>
                                      <HStack spacing={4} align="start" mb={3}>
                                        <Box flexShrink={0} w={10} h={10} bg="green-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                          <CheckCircle className="text-green-600 w-5 h-5" />
                                        </Box>
                                        <VStack align="start">
                                          <Text fontWeight="medium" color="gray-600">Active Projects</Text>
                                          <Heading size="lg" color="green-600">
                                            12
                                          </Heading>
                                        </VStack>
                                      </CardBody>
                                    </Card>

                                    <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                      <CardBody p={6}>
                                        <HStack spacing={4} align="start" mb={3}>
                                          <Box flexShrink={0} w={10} h={10} bg="yellow-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                            <AlertTriangle className="text-yellow-600 w-5 h-5" />
                                          </Box>
                                          <VStack align="start">
                                            <Text fontWeight="medium" color="gray-600">Under Maintenance</Text>
                                            <Heading size="lg" color="yellow-600">
                                              2
                                            </Heading>
                                          </VStack>
                                        </CardBody>
                                      </Card>

                                      <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                        <CardBody p={6}>
                                          <HStack spacing={4} align="start" mb={3}>
                                            <Box flexShrink={0} w={10} h={10} bg="red-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                                              <AlertCircle className="text-red-600 w-5 h-5" />
                                            </Box>
                                            <VStack align="start">
                                              <Text fontWeight="medium" color="gray-600">Archived Projects</Text>
                                              <Heading size="lg" color="red-600">
                                                1
                                              </Heading>
                                            </VStack>
                                          </CardBody>
                                        </Card>
                                      </SimpleGrid>
                                    )}
                                  </VStack>
                                )}

                                <TabPanel>
                                {tab === 'settings' && (
                                  <VStack spacing={6}>
                                    {/* Settings Header */}
                                    <Heading size="lg">System Settings</Heading>
                                    <Text size="sm" color="gray-600" mb={4}>
                                      Configure system-wide settings and preferences
                                    </Text>
                                    <Divider my={4} />

                                    {/* General Settings */}
                                    <Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
                                      <CardBody p={6}>
                                        <Heading size="lg">General Settings</Heading>
                                        <Divide my={4} />
                                        <VStack spacing={4}>
                                          <Box className="flex items-start space-x-3">
                                            <Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
											  <Calendar className="text-blue-600 w-5 h-5" />
											</Box>
											<VStack align="start">
											  <Heading size="sm" className="mb-1">Default Time to Ready Estimate</Heading>
											  <Text size="xs" color="gray-600">
												Default months estimated for skill gap closure
											  </Text>
											</VStack>
										  </Box>
										  <Box className="flex items-end space-x-3">
											<Input
											  type="number"
											  placeholder="Enter default months"
											  defaultValue="4"
											  onChange={(e) => {}}
											  w={20}
											/>
										  </Box>
										</VStack>
										<Divider my={3} />
										<VStack spacing={4}>
										  <Box className="flex items-start space-x-3">
											<Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
											  <Users className="text-blue-600 w-5 h-5" />
											</Box>
											<VStack align="start">
											  <Heading size="sm" className="mb-1">Max Concurrent Users</Heading>
											  <Text size="xs" color="gray-600">
												Maximum number of concurrent users allowed
											  </Text>
											</VStack>
										  </Box>
										  <Box className="flex items-end space-x-3">
											<Input
											  type="number"
											  placeholder="Enter max users"
											  defaultValue="1000"
											  onChange={(e) => {}}
											  w={20}
											/>
										  </Box>
										</VStack>
										<Divider my={3} />
										<VStack spacing={4}>
										  <Box className="flex items-start space-x-3">
											<Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
											  <ShieldCheck className="text-blue-600 w-5 h-5" />
											</Box>
											<VStack align="start">
											  <Heading size="sm" className="mb-1">Enable Two-Factor Authentication</Heading>
											  <Text size="xs" color="gray-600">
												Require 2FA for all user accounts
											  </Text>
											</VStack>
										  </Box>
										  <Box className="flex items-end space-x-3">
											<Switch
											  isChecked={false}
											  onChange={() => {}}
											  colorScheme="blue"
											/>
										  </Box>
										</VStack>
									  </CardBody>
									</Card>

									 {/* Email Settings */}
									<Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
									  <CardBody p={6}>
										<Heading size="lg">Email Settings</Heading>
										<Divide my={4} />
										<VStack spacing={4}>
										  <Box className="flex items-start space-x-3">
											<Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
											  <Mail className="text-blue-600 w-5 h-5" />
											</Box>
											<VStack align="start">
											  <Heading size="sm" className="mb-1">From Email Address</Heading>
											  <Text size="xs" color="gray-600">
												Email address used for system notifications
											  </Text>
											</VStack>
										  </Box>
										  <Box className="flex items-end space-x-3">
											<Input
											  placeholder="Enter from email"
											  defaultValue="noreply@skillgapsimulator.com"
											  onChange={(e) => {}}
											/>
										  </Box>
										</VStack>
										<Divider my={3} />
										<VStack spacing={4}>
										  <Box className="flex items-start space-x-3">
											<Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
											  <Bell className="text-blue-600 w-5 h-5" />
											</Box>
											<VStack align="start">
											  <Heading size="sm" className="mb-1">Notification Frequency</Heading>
											  <Text size="xs" color="gray-600">
												How often to send progress updates
											  </Text>
											</VBox>
										  </Box>
										  <Box className="flex items-end space-x-3">
											<Select
											  defaultValue="weekly"
											  onChange={(e) => {}}
											>
											  <option value="daily">Daily</option>
											  <option value="weekly">Weekly</option>
											  <option value="monthly">Monthly</option>
											  <option value="never">Never</option>
											</Select>
										  </Box>
										</VStack>
									  </CardBody>
									</Card>

									 {/* API Settings */}
									<Card bg="white" borderWidth="1px" borderColor="gray-200" shadow="sm" rounded="lg" overflow="hidden">
									  <CardBody p={6}>
										<Heading size="lg">API Settings</Heading>
										<Divide my={4} />
										<VStack spacing={4}>
										  <Box className="flex items-start space-x-3">
											<Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
											  <Api className="text-blue-600 w-5 h-5" />
											</Box>
											<VStack align="start">
											  <Heading size="sm" className="mb-1">Rate Limit (requests/minute)</Heading>
											  <Text size="xs" color="gray-600">
												Maximum API requests per minute per user
											  </Text>
											</VStack>
										  </Box>
										  <Box className="flex items-end space-x-3">
											<Input
											  type="number"
											  placeholder="Enter rate limit"
											  defaultValue="60"
											  onChange={(e) => {}}
											  w={20}
											/>
										  </Box>
										</VStack>
										<Divider my={3} />
										<VStack spacing={4}>
										  <Box className="flex items-start space-x-3">
											<Box flexShrink={0} w={10} h={10} bg="blue-100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
											  <Clock className="text-blue-600 w-5 h-5" />
											</Box>
											<VStack align="start">
											  <Heading size="sm" className="mb-1">Session Timeout</Heading>
											  <Text size="xs" color="gray-600">
												Minutes of inactivity before session expires
											  </Text>
											</VStack>
										  </Box>
										  <Box className="flex items-end space-x-3">
											<Input
											  type="number"
											  placeholder="Enter timeout minutes"
											  defaultValue="30"
											  onChange={(e) => {}}
											  w={20}
											/>
										  </Box>
										</VStack>
									  </CardBody>
									</Card>

									 {/* Save Settings Button */}
									<Box mt={8}>
									  <Button
										colorScheme="blue"
										size="lg"
										onClick={() => {
										  // In a real app, this would save settings to backend
										  alert('Settings saved successfully!');
										}
										leftIcon={<Save className="mr-2 h-4 w-4" />}
									  >
										Save All Settings
									  </Button>
									</Box>
								  </VBox>
								)}

							</TabPanels>
						  </Tabs>
						</VStack>
					</ScrollArea>
				</Box>
			</Box>
		  </VStack>
		</ScrollArea>
	  </Box>
	);
  };

  export default Admin;