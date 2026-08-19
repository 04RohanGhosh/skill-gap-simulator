import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Spacer, Divider, Icon, useToast } from '@chakra-ui/react';
import { useAuthStore } from './authStore';
import resumeAPI from './apiService';
import { Upload, CheckCircle, XCircle, Loader2 } from '@heroicons/react/24/outline';

const ResumeUpload = () => {
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const toast = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or DOCX file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'File size must be less than 10MB',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // In a real implementation, you would handle progress updates
      // For now, we simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await resumeAPI.uploadResume(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      const { data } = response;
      setResumeId(data.resume_id);

      toast({
        title: 'Resume uploaded successfully',
        description: 'Your resume has been processed and saved',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Clear file input
      e.target.value = '';

      // Auto-proceed to next step after a short delay
      setTimeout(() => {
        setIsUploading(false);
      }, 1500);
    } catch (error: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadError(error.response?.data?.message || 'Upload failed');

      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'An error occurred during upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    return (
      <Box textAlign="center" py={8}>
        <Heading size="xl">Please log in to upload your resume</Heading>
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
          onClick={() => window.location.href = '/dashboard'}
          leftIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
        >
          Back to Dashboard
        </Button>
        <Text size="sm" fontWeight="medium" color="gray-600">
          Upload Resume
        </Text>
      </Box>

      <Box maxW="2xl" mx="auto" py={8}>
        <VStack spacing={6} align="center">
          {/* Header */}
          <VStack align="center" spacing={4}>
            <Box className="glass" p={6} rounded="2xl" display="inline-block">
              <Box w={16} h={16} bg="gradient-to-br from-blue-400 via-pink-500 to-red-500" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontSize="2xl" fontWeight="bold">📄</Text>
              </Box>
            </Box>
            <Heading size="2xl">Upload Your Resume</Heading>
            <Text size="sm" color="gray-600" maxW="md">
              We'll analyze your resume to identify your current skill levels
            </Text>
          </VStack>

          {/* Upload Area */}
          <Box>
            <Divider my={4} />
            <VStack spacing={4}>
              <Text fontWeight="medium" color="gray-600">
                Drag & drop your resume here, or click to select file
              </Text>
              <Text size="xs" color="gray-500">
                PDF or DOCX format, max 10MB
              </Text>

              <Box
                className="flex flex-col items-center justify-between p-6 rounded-lg border-2 border-dashed"
                bg={isUploading ? 'blue-50' : 'gray-50'}
                _hover={{ bg: 'gray-100' }}
              >
                <Input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx"
                  onChange={handleUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Box className="flex flex-col items-center text-center">
                  {isUploading ? (
                    <>
                      <Loader2 size={4} className="mb-2" />
                      <Text size="sm" color="gray-600">
                        Uploading... {uploadProgress}%
                      </Text>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-blue-500 mb-2" />
                      <Text fontWeight="medium" color="gray-600">
                        Drag & drop your resume here
                      </Text>
                      <Text size="xs" color="gray-500">
                        or click to select file
                      </Text>
                    </>
                  )}
                </Box>
              </Box>

              {uploadError && (
                <Box bg="red-50" border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mt={2}>
                  <Text fontWeight="medium">{uploadError}</Text>
                </Box>
              )}

              {resumeId && (
                <Button
                  colorScheme="green"
                  size="md"
                  mt={6}
                  onClick={() => window.location.href = `/jd-input?resumeId=${resumeId}`}
                  leftIcon={<ArrowRight className="mr-2 h-4 w-4" />}
                >
                  Continue to Job Description
                </Button>
              )}

              {!isUploading && !resumeId && (
                <Button
                  variant="outline"
                  colorScheme="blue"
                  size="md"
                  mt={6}
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Skip for now
                </Button>
              )}
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ResumeUpload;