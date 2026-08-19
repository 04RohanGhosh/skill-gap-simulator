import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { PoseidonProvider } from '@chakra-ui/anime'
import './index.css'

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
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  radii: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
  },
  shadows: {
    outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
  },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PoseidonProvider>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </PoseidonProvider>
  </React.StrictMode>,
)