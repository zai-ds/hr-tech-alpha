// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import LogoutButton from '../components/LogoutButton';
import CreateObjectiveModal from '../components/CreateObjectiveModal';

import { Link as RouterLink } from 'react-router-dom';

// O Dashboard agora recebe a propriedade 'isApiReady'
const Dashboard = ({ isApiReady }) => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchObjectives = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/objectives/');
      setObjectives(response.data);
      setError(null); // Limpa erros anteriores em caso de sucesso
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // AQUI ESTÁ A MUDANÇA CRUCIAL:
    // Só executamos a busca de dados se 'isApiReady' for verdadeiro.
    if (isApiReady) {
      fetchObjectives();
    }
  }, [isApiReady, fetchObjectives]); // O efeito agora depende de isApiReady

  const handleObjectiveCreated = () => {
    setIsModalOpen(false);
    fetchObjectives();
  };

  // Mostra um spinner geral enquanto a API não está pronta ou os dados estão a ser carregados
  if (!isApiReady || loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">Erro ao buscar dados: {error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Meu Dashboard de Metas
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{ mr: 2 }}
          >
            Novo Objetivo
          </Button>
          <LogoutButton />
        </Box>
      </Box>

      {objectives.length > 0 ? (
        objectives.map((objective) => (
          // Envolvemos o Card com o Link
          <RouterLink
            to={`/objective/${objective.id}`}
            key={objective.id}
            style={{ textDecoration: 'none' }} // Para remover o sublinhado do link
          >
            <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}> {/* Efeito hover para feedback visual */}
              <CardContent>
                <Typography variant="h6" color="text.primary">{objective.title}</Typography>
                <Typography color="text.secondary">{objective.description}</Typography>
                <Typography mt={1} color="text.primary">Progresso: {objective.progress}%</Typography>
              </CardContent>
            </Card>
          </RouterLink>
        ))
      ) : (
        <Typography>Ainda não tem nenhum objetivo. Crie um!</Typography>
      )}

      <CreateObjectiveModal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        onObjectiveCreated={handleObjectiveCreated}
      />
    </Box>
  );
};

export default Dashboard;