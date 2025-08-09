// src/components/LogoutButton.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Button from '@mui/material/Button';

const LogoutButton = () => {
  // O mesmo hook também nos dá a função de logout
  const { logout } = useAuth0();

  return (
    <Button 
      variant="outlined" 
      color="secondary"
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      Sair
    </Button>
  );
};

export default LogoutButton;