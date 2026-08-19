import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'zustand';
import { useAuthStore } from './stores/authStore';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/react';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ResumeUpload from './pages/ResumeUpload';
import JobDescriptionInput from './pages/JobDescriptionInput';
import SkillGapResults from './pages/SkillGapResults';
import RoadmapView from './pages/RoadmapView';
import ProjectBuilder from './pages/ProjectBuilder';
import Verification from './pages/Verification';
import Profile from './pages/Profile';

const theme = extendTheme({
  colors: {
    brand: {
      100: '#f0f9ff',
      200: '#e0f2fe',
      300: '#bae6fd',
      400: '#7dd3fc',
      500: '#38bdf8',
      600: '#0ea5e9',
      700: '#0284c7',
      800: '#0369a1',
      900: '#0c4a6e',
    },
  },
});

function App() {
  const { user, isLoading } = useAuthStore.getState();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode="system" />
      <Provider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
              path="/job-description"
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
              path="/projects"
              element={
                user ? <ProjectBuilder /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/verification/:repoId"
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
              path="*"
              element={
                user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ChakraProvider>
  );
}

export default App;