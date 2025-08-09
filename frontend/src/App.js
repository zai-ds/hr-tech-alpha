// src/App.js
import React, { useState, useEffect } from 'react'; // Adicione useState
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { setupInterceptors } from './api';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import Dashboard from './pages/Dashboard';
import LoginButton from './components/LoginButton';

import ObjectiveDetail from './pages/ObjectiveDetail';

function App() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  // Novo estado para controlar se a nossa API está pronta
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Primeiro, configuramos o interceptor
      setupInterceptors(getAccessTokenSilently);
      // SÓ DEPOIS, marcamos a API como pronta
      setIsApiReady(true);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          // Passamos o estado 'isApiReady' como uma propriedade para o Dashboard
          isAuthenticated ? <Dashboard isApiReady={isApiReady} /> : <HomePage />
        } />
        <Route path="/objective/:id" element={
        isAuthenticated ? <ObjectiveDetail /> : <HomePage />
      } />
      </Routes>
    </BrowserRouter>
  );
}

const HomePage = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <h1>Bem-vindo à Plataforma de Metas</h1>
    <LoginButton />
  </Box>
);

export default App;