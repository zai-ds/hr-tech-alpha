// src/components/CreateObjectiveModal.js
import React, { useState } from 'react';
import apiClient from '../api';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CreateObjectiveModal = ({ open, handleClose, onObjectiveCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keyResults, setKeyResults] = useState([
    { title: '', start_value: 0, target_value: 100 }
  ]);

  const handleKeyResultChange = (index, event) => {
    const values = [...keyResults];
    values[index][event.target.name] = event.target.value;
    setKeyResults(values);
  };

  const handleAddKeyResult = () => {
    setKeyResults([...keyResults, { title: '', start_value: 0, target_value: 100 }]);
  };

  const handleRemoveKeyResult = (index) => {
    const values = [...keyResults];
    values.splice(index, 1);
    setKeyResults(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        // Preparamos os dados dos KRs, convertendo os valores para números.
        const keyResultsData = keyResults.map(kr => ({
            title: kr.title,
            start_value: 0, // O valor inicial é sempre 0
            target_value: parseInt(kr.target_value, 10)
        }));

        // Preparamos o payload completo
        const payload = {
            title,
            description,
            key_results: keyResultsData
        };

        // UMA ÚNICA CHAMADA À API!
        await apiClient.post('/objectives/', payload);

        // Se a chamada for bem-sucedida, tudo foi criado.
        onObjectiveCreated();
        handleClose();

    } catch (error) {
        console.error("Erro ao criar objetivo:", error);
        // Aqui podemos adicionar uma mensagem de erro para o usuário
    }
};

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-objective-modal-title"
    >
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="create-objective-modal-title" variant="h6" component="h2">
          Criar Novo Objetivo
        </Typography>

        <TextField
          margin="normal"
          required
          fullWidth
          label="Título do Objetivo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Descrição (Opcional)"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
          Resultados-Chave
        </Typography>

        {keyResults.map((kr, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TextField
              name="title"
              required
              label={`Resultado-Chave #${index + 1}`}
              value={kr.title}
              onChange={(e) => handleKeyResultChange(index, e)}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              name="target_value"
              required
              label="Valor Alvo"
              type="number"
              value={kr.target_value}
              onChange={(e) => handleKeyResultChange(index, e)}
              sx={{ width: '120px' }}
            />
            <IconButton onClick={() => handleRemoveKeyResult(index)}>
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddKeyResult}
          sx={{ mt: 1 }}
        >
          Adicionar Resultado-Chave
        </Button>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Criar Objetivo</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateObjectiveModal;