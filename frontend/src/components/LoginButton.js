// src/components/LoginButton.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Button from '@mui/material/Button';

const LoginButton = () => {
  // O hook useAuth0 nos dá acesso à função de login
  const { loginWithRedirect } = useAuth0();

  return (
    <Button 
      variant="contained" 
      color="primary" 
      onClick={() => loginWithRedirect()}
    >
      Entrar
    </Button>
  );
};

export default LoginButton;