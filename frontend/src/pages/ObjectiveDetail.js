// src/pages/ObjectiveDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import apiClient from '../api';

// Importações do Material-UI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';

const ObjectiveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [objective, setObjective] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const fetchObjective = useCallback(async () => {
    try {
      const response = await apiClient.get(`/objectives/${id}/`);
      setObjective(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchObjective();
  }, [fetchObjective]);

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/objectives/${id}/`);
      navigate('/');
    } catch (err) {
      setError(`Falha ao apagar objetivo: ${err.message}`);
      setOpenDeleteDialog(false);
    }
  };

  // --- CORREÇÃO: LÓGICA DO SLIDER ---

  // 1. Função para o feedback visual imediato enquanto arrasta
  const handleSliderDrag = (krId, newValue) => {
    // Cria uma cópia profunda do objetivo para não modificar o estado diretamente
    const updatedObjective = JSON.parse(JSON.stringify(objective));
    
    const krIndex = updatedObjective.key_results.findIndex(kr => kr.id === krId);
    if (krIndex === -1) return;

    // Atualiza o valor do KR específico
    updatedObjective.key_results[krIndex].current_value = newValue;
    
    // Recalcula o progresso do KR específico
    const kr = updatedObjective.key_results[krIndex];
    const progressFraction = (kr.current_value - kr.start_value) / (kr.target_value - kr.start_value);
    kr.progress = Math.round(Math.max(0, Math.min(progressFraction * 100, 100)));

    // Recalcula o progresso geral do objetivo
    const totalProgress = updatedObjective.key_results.reduce((sum, current) => sum + current.progress, 0);
    updatedObjective.progress = Math.round(totalProgress / updatedObjective.key_results.length);

    // Atualiza o estado local, fazendo o slider e os textos se moverem
    setObjective(updatedObjective);
  };

  // 2. Função para salvar o dado no backend quando o usuário solta o slider
  const handleSliderChangeCommitted = async (krId, finalValue) => {
    try {
      await apiClient.patch(`/keyresults/${krId}/`, {
        current_value: finalValue,
      });
      // Opcional: pode-se chamar fetchObjective() aqui para re-sincronizar com o servidor,
      // mas a atualização otimista já deixou a UI no estado correto.
    } catch (err) {
      console.error("Falha ao atualizar o resultado-chave:", err);
      // Em caso de erro, podemos reverter para o estado anterior
      fetchObjective(); 
    }
  };

  // ... o resto do componente continua igual ...

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">Erro: {error}</Typography>;
  }

  if (!objective) {
    return <Typography>Objetivo não encontrado.</Typography>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} underline="hover" color="inherit" to="/">
            Dashboard
          </Link>
          <Typography color="text.primary">{objective.title}</Typography>
        </Breadcrumbs>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setOpenDeleteDialog(true)}
        >
          Apagar
        </Button>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        {objective.title}
      </Typography>
      <Typography variant="h5" component="h2" sx={{ color: 'primary.main', mb: 2 }}>
        Progresso Geral: {objective.progress}%
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {objective.description}
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Resultados-Chave
      </Typography>
      
      {objective.key_results.map((kr) => (
        <Card key={kr.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{kr.title}</Typography>
              <Typography variant="h6" color="text.secondary">{kr.progress}%</Typography>
            </Box>
            {/* --- SLIDER CORRIGIDO --- */}
            <Slider
              aria-label="Progresso do Resultado-Chave"
              value={kr.current_value}
              min={kr.start_value}
              max={kr.target_value}
              // onChange agora atualiza a UI em tempo real
              onChange={(event, newValue) => handleSliderDrag(kr.id, newValue)}
              // onChangeCommitted salva o dado quando o usuário solta
              onChangeCommitted={(event, finalValue) => handleSliderChangeCommitted(kr.id, finalValue)}
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      ))}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Apagar Objetivo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação é permanente e não pode ser desfeita. Você tem certeza que quer apagar este objetivo e todos os seus resultados-chave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error">
            Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ObjectiveDetail;