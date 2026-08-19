import React from 'react'
import { Box, Button, Center, Stack, Text, Spacer, useColorModeValue } from '@chakra-ui/react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../authStore'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ResumeUpload from './pages/ResumeUpload'
import JobDescriptionInput from './pages/JobDescriptionInput'
import SkillGapResults from './pages/SkillGapResults'
import RoadmapView from './pages/RoadmapView'
import ProjectBuilder from './pages/ProjectBuilder'
import Verification from './pages/Verification'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function App() {
  const { user } = useAuthStore()
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box minH="100vh" bg={bgColor} color={textColor} position="relative" overflowX="hidden">
      {/* Animated background shapes */}
      <Box position="absolute" top="-20%" left="-20%" width="140%" height="140%" opacity={0.1}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.3" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.2" />
              <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.2" />
            </linearGradient>
          </defs>
          <g>
            <ellipse cx="50" cy="50" rx="40" ry="30" fill="url(#grad1)" />
            <ellipse cx="30" cy="80" rx="20" ry="15" fill="url(#grad2)" />
            <ellipse cx="80" cy="20" rx="25" ry="20" fill="url(#grad1)" opacity="0.7" />
          </g>
        </svg>
      </Box>

      {/* Main content */}
      <Center h="100%" w="100%" py={4} px={4}>
        <Stack maxW="7xl" w="full" spacing={6}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                user ? <Dashboard /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/resume-upload"
              element={
                user ? <ResumeUpload /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/jd-input"
              element={
                user ? <JobDescriptionInput /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/skill-gap-results"
              element={
                user ? <SkillGapResults /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/roadmap"
              element={
                user ? <RoadmapView /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/project-builder"
              element={
                user ? <ProjectBuilder /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/verification"
              element={
                user ? <Verification /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/profile"
              element={
                user ? <Profile /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/admin"
              element={
                user && user.isAdmin ? (
                  <Admin />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            {/* Redirect to home for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Stack>
      </Center>
    </Box>
  )
}

export default App