import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Spacer, Divider, useToast } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import jdAPI from './apiService';
import { useNavigate } from 'react-router-dom';
import { List, CheckCircle, XCircle, Loader2, Edit } from '@heroicons/react/24/outline';

const JobDescriptionInput = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [jdId, setJdId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const toast = useToast();

  // Get resumeId from URL params or state
  const resumeId = new URLSearchParams(window.location.search).get('resumeId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const jdText = formData.get('jdText') as string;

    if (!jdText.trim()) {
      setSubmitError('Please enter a job description');
      return;
    }

    if (!resumeId) {
      setSubmitError('No resume ID found');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await jdAPI.parseJobDescription(jdText);
      const { data } = response;
      setJdId(data.jd_id);

      // Auto-proceed to skill gap calculation
      setIsSubmitting(false);
      setIsAnalyzing(true);

      // In a real app, we would navigate to a loading state or directly to results
      setTimeout(() => {
        navigate(`/skill-gap?resumeId=${resumeId}&jdId=${data.jd_id}`);
      }, 1500);
    } catch (error: any) {
      setIsSubmitting(false);
      setSubmitError(error.response?.data?.message || 'Analysis failed');

      toast({
        title: 'Analysis failed',
        description: error.response?.data?.message || 'An error occurred during analysis',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    return (
      <Box textAlign="center" py={8}>
        <Heading size="xl">Please log in to continue</Heading>
        <Text color="gray-600" mt={4}>
          You need to be logged in to use this feature
        </Text>
        <Button mt={6} colorScheme="blue" onClick={() => window.location.href = '/login'}>
          Log In
        </Button>
      </Box>
    );
  }

  return (
    <Box minH="vh" bg="gradient-to-br from-gray-50 to-blue-50" py={12} px={4}>
      <Box className="flex items-center justify-between px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/resume-upload'}
          leftIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
        >
          Back to Resume Upload
        </Button>
        <Text size="sm" fontWeight="medium" color="gray-600">
          Job Description Input
        </Text>
      </Box>

      <Box maxW="2xl" mx="auto" py={8}>
        <VStack spacing={6} align="center">
          {/* Header */}
          <VStack align="center" spacing={4}>
            <Box className="glass" p={6} rounded="2xl" display="inline-block">
              <Box w={16} h={16} bg="gradient-to-br from-blue-400 via-pink-500 to-red-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="2xl" fontWeight="bold">📋</Text>
              </Box>
            </Box>
            <Heading size="2xl">Enter Job Description</Heading>
            <Text size="sm" color="gray-600" maxW="md">
              Paste the job description you're targeting to compare against your resume
            </Text>
          </VStack>

          {/* Form */}
          <Box>
            <Divider my={4} />
            <VStack spacing={4}>
              <form onSubmit={handleSubmit}>
                <Text fontWeight="medium" color="gray-600" mb={2}>
                  Job Description
                </Text>
                <Box className="relative">
                  <Textarea
                    placeholder="Paste the job description here..."
                    rows={12}
                    isRequired
                    maxWidth="100%"
                    w="full"
                    px={4}
                    py={3}
                    borderWidth="1px"
                    borderColor="gray-300"
                    rounded="lg"
                    focusBorderColor="blue-500"
                    _placeholder={{ color: 'gray-400' }}
                  />
                  {!isSubmitting && !isAnalyzing && (
                    <Box className="absolute inset-0 flex items-end pe-4 pb-2">
                      <Text size="xs" color="gray-500">
                        0 / 5000 characters
                      </Text>
                    </Box>
                  )}
                </Box>

                {submitError && (
                  <Box bg="red-50" border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mt={4}>
                    <Text fontWeight="medium">{submitError}</Text>
                  </Box>
                )}

                <HStack spacing={4} justify="end" mt={6}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/resume-upload'}
                    leftIcon={<List className="mr-2 h-4 w-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    colorScheme="blue"
                    isLoading={isSubmitting}
                    onClick={(e) => {
                      e.preventDefault();
                      // Form submission handled by onSubmit
                    }}
                    leftIcon={<CheckCircle className="mr-2 h-4 w-4" />}
                  >
                    {isSubmitting ? 'Analyzing...' : 'Analyze Job Description'}
                  </Button>
                </HStack>
              </form>
            </VStack>
          </Box>

          {/* Instructions */}
          {(!isSubmitting && !isAnalyzing) && (
            <Box mt={8} p={4} bg="blue-50" rounded="lg">
              <Heading size="sm" color="blue-600" mb={2}>
                Tips for better results
              </Heading>
              <VStack spacing={2} align="start">
                <Text size="xs" color="gray-600">
                  • Include specific technologies, tools, and methodologies
                </Text>
                <Text size="xs" color="gray-600">
                  • Mention years of experience required for each skill
                </Text>
                <Text size="xs" color="gray-600">
                  • List both hard skills (e.g., Python, AWS) and soft skills (e.g., communication, leadership)
                </Text>
                <Text size="xs" color="gray-600">
                  • Include certifications and educational requirements if specified
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default JobDescriptionInput;