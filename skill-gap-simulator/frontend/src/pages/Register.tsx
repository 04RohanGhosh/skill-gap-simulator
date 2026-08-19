import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Input, InputGroup, InputLeftAddon, InputRightAddon, FormControl, FormLabel, HelpText, Alert, AlertIcon, Spinner, Checkbox } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus } from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading: authLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      await register(email, password, name);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <Heading size="2xl">Create Account</Heading>
          <Text size="sm" color="gray-500" maxW="md">
            Join thousands of developers closing their skill gaps
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
          <FormLabel>Full Name</FormLabel>
          <Input>
            <InputLeftAddon>
              <UserPlus className="h-5 w-5 text-gray-400" />
            </InputLeftAddon>
            <Input
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
              disabled={isLoading}
            />
          </Input>
          {error && <HelpText>{error}</HelpText>}
        </FormControl>

        <FormControl mt={4} isInvalid={!!error}>
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              minLength={8}
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
          <HelpText mt={2} size="xs" color="gray-500">
            Password must be at least 8 characters
          </HelpText>
        </FormControl>

        <FormControl mt={4} isInvalid={!!error}>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <InputLeftAddon>
              <Lock className="h-5 w-5 text-gray-400" />
            </InputLeftAddon>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isRequired
              minLength={8}
              disabled={isLoading}
            />
            <InputRightAddon>
              <Button
                variant="unstyled"
                size="sm"
                onClick={() => setConfirmPassword('')} // Clear for demo
                aria-label="Clear password"
                disabled={isLoading || !confirmPassword}
              >
                {!confirmPassword && <Text fontSize="xs" color="gray-400">Clear</Text>}
              </Button>
            </InputRightAddon>
          </InputGroup>
          {error && <HelpText>{error}</HelpText>}
          <HelpText mt={2} size="xs" color="gray-500">
            Passwords must match
          </HelpText>
        </FormControl>

        <FormControl mt={4}>
          <FormLabel>
            <Checkbox
              isChecked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              colorScheme="blue"
              mx={3}
            />
            I agree to the
            <span className="text-blue-600 cursor-pointer">Terms of Service</span>
            and
            <span className="text-blue-600 cursor-pointer">Privacy Policy</span>
          </FormLabel>
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
          Create Account
        </Button>
      </FormControl>

      {/* Footer */}
      <Box mt={8} textAlign="center" w="full">
        <Text size="xs" color="gray-500">
          Already have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
        </Text>
      </Box>
    </Box>
  );
};

export default Register;