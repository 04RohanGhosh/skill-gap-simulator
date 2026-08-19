import React from 'react';
import { Box, VStack, Heading, Text, Button, ButtonGroup, Spacer, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <Box minH="vh" bg="gradient-to-br from-blue-50 to-purple-50" py={12} px={4}>
      <VStack spacing={8} align="center" maxW="container-xl" mx="auto">
        {/* Header */}
        <VStack spacing={4} align="center" textAlign="center">
          <Heading size="2xl" className="gradient-text">
            Skill Gap Simulator
          </Heading>
          <Text size="lg" color="gray-600" maxW="2xl">
            Identify your skill gaps, get personalized learning roadmaps, and prove your expertise through project-based verification.
          </Text>
        </VStack>

        {/* Hero Image/Illustration */}
        <Box>
          {/* In a real app, this would be an illustration or animation */}
          <Box
            className="glass"
            w="96"
            h="96"
            rounded="2xl"
            borderWidth="1px"
            borderColor="white/30"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box w="80" h="80" borderRadius="full" bg="gradient-to-br from-blue-400 via-pink-500 to-red-500"
                 display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontSize="2xl" fontWeight="bold">SG</Text>
            </Box>
          </Box>
        </Box>

        {/* Features */}
        <VStack spacing={6} align="stretch" w="full" maxW="4xl">
          <Heading size="lg" align="left">
            How It Works
          </Heading>
          <VStack spacing={4}>
            <Box className="glass" p={6} rounded="lg" display="flex" alignItems="start">
              <Box flexShrink={0} w={12} h={12} bg="blue-100" rounded="md" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="sm" fontWeight="bold" color="blue-600">1</Text>
              </Box>
              <Box ml={4} w="full">
                <Heading size="sm">Upload Resume & Job Description</Heading>
                <Text size="xs" color="gray-500">
                  Share your current experience and your target role. Our AI analyzes both to identify skill gaps.
                </Text>
              </Box>
            </Box>

            <Box className="glass" p={6} rounded="lg" display="flex" alignItems="start">
              <Box flexShrink={0} w={12} h={12} bg="pink-100" rounded="md" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="sm" fontWeight="bold" color="pink-600">2</Text>
              </Box>
              <Box ml={4} w="full">
                <Heading size="sm">Get Personalized Roadmap</Heading>
                <Text size="xs" color="gray-500">
                  Receive a week-by-week learning plan with hands-on projects and curated resources.
                </Text>
              </Box>
            </Box>

            <Box className="glass" p={6} rounded="lg" display="flex" alignItems="start">
              <Box flexShrink={0} w={12} h={12} bg="green-100" rounded="md" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="sm" fontWeight="bold" color="green-600">3</Text>
              </Box>
              <Box ml={4} w="full">
                <Heading size="sm">Build & Verify Skills</Heading>
                <Text size="xs" color="gray-500">
                  Complete projects, connect your GitHub, and get automated skill verification.
                </Text>
              </Box>
            </Box>
          </VStack>
        </VStack>

        {/* Call to Action */}
        <VStack spacing={6} align="center">
          <Heading size="xl">
            Ready to close your skill gaps?
          </Heading>
          <ButtonGroup spacing={4}>
            <Button
              colorScheme="blue"
              size="lg"
              px={8}
              as={Link}
              to="/login"
              leftIcon={<Box w={4} h={4} borderRadius="full" bg="white" />}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              px={8}
              as={Link}
              to="/register"
              rightIcon={<Box w={4} h={4} borderRadius="full" borderWidth="1px" borderColor="currentColor" />}
            >
              Create Account
            </Button>
          </ButtonGroup>
          <Text size="xs" color="gray-500">
            Already have an account? <span className="text-blue-600 cursor-pointer">Sign in</span>
          </Text>
        </VStack>

        {/* Footer */}
        <Box mt={12} pt={8} borderTop="1px solid" borderColor="gray-200" w="full" textAlign="center">
          <Text size="xs" color="gray-400">
            © {new Date().getFullYear()} Skill Gap Simulator. All rights reserved.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default LandingPage;