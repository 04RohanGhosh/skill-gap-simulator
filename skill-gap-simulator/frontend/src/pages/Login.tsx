import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Input, InputGroup, InputAddon, InputLeftAddon, InputRightAddon, FormControl, FormLabel, HelpText, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, ArrowRight } from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="vh" bg="gradient-to-br from-blue-50 to-purple-50" py={12} px={4}>
      <VStack spacing={8} align="center" maxW="w-md" mx="auto" py={12}>
        {/* Header */}
        <VStack spacing={4} align="center" textAlign="center">
          <Box className="glass" p={6} rounded="2xl" display="inline-block">
            <Box w={12} h={12} bg="gradient-to-br from-blue-400 via-pink-500 to-red-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontSize="xl" fontWeight="bold">SG</Text>
            </Box>
          </Box>
          <Heading size="2xl">Welcome Back</Heading>
          <Text size="sm" color="gray-500" maxW="md">
            Sign in to continue your skill development journey
          </Text>
        </VStack>

        {/* Alert */}
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Alert.title>{error}</Alert.title>
          </Alert>
        )}

        {/* Form */}
        <FormControl isInvalid={!!error}>
          <FormLabel>Email Address</FormLabel>
          <InputGroup>
            <InputLeftAddon>
              <Mail className="h-5 w-5 text-gray-400" />
            </InputLeftAddon>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              disabled={isLoading}
            />
          </InputGroup>
          {error && <HelpText>{error}</HelpText>}
        </FormControl>

        <FormControl mt={4} isInvalid={!!error}>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <InputLeftAddon>
              <Lock className="h-5 w-5 text-gray-400" />
            </InputLeftAddon>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              disabled={isLoading}
            />
            <InputRightAddon>
              <Button
                variant="unstyled"
                size="sm"
                onClick={() => setPassword('')} // Clear for demo
                aria-label="Clear password"
                disabled={isLoading || !password}
              >
                {!password && <Text fontSize="xs" color="gray-400">Clear</Text>}
              </Button>
            </InputRightAddon>
          </InputGroup>
          {error && <HelpText>{error}</HelpText>}
        </FormControl>

        <Button
          type="submit"
          w="full"
          mt={6}
          colorScheme="blue"
          size="lg"
          isLoading={isLoading || authLoading}
          leftIcon={<Spinner size="sm" color="white" />%3E
        >
          Sign In
        </Button>
      </FormControl>

      {/* Divider */}
      <Box mt={6} flex="1" display="flex" alignItems="center">
        <Divider orientation="horizontal" className="w-full" />
        <Box mx={4} textSize="xs" textColor="gray-400">
          OR
        </Box>
        <Divider orientation="horizontal" className="w-full" />
      </Box>

      {/* Social Login */}
      <VStack spacing={3}>
        <Button
          w="full"
          variant="outline"
          leftIcon={<Box flexShrink={0} w={5} h={5} bg="red-500" rounded="md" display="flex" alignItems="center" justifyContent="center">
            <Text color="white" fontSize="xs" fontWeight="bold">G</Text>
          </Box>}
          leftIcon={<Box flexShrink={0} w={5} h={5} bg="red-500" rounded="md" display="flex" alignItems="center" justifyContent="center">
            <Text color="white" fontSize="xs" fontWeight="bold">G</Text>
          </Button>}
        </Button>
        <Button
          w="full"
          variant="outline"
          leftIcon={<Box flexShrink={0} w={5} h={5} bg="blue-500" rounded="md" display="flex" alignItems="center" justifyContent="center">
            <Text color="white" fontSize="xs" fontWeight="bold">f</Text>
          </Box>}
          leftIcon={<Box flexShrink={0} w={5} h={5} bg="blue-500" rounded="md" display="flex" alignItems="center" justifyContent="center">
            <Text color="white" fontSize="xs" fontWeight="bold">f</Text>
          </Button>}
        </Button>
      </VStack>

      {/* Footer */}
      <Box mt={8} textAlign="center" w="full">
        <Text size="xs" color="gray-500">
          Don't have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/register')}>Sign up</span>
        </Text>
        <Text size="xs" block mt={2} color="gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Box>
    </Box>
  );
};

export default Login;