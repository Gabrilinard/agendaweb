import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import { getFormularioByReserva } from '../api';

export const useFormulario = () => {
  const navigate = useNavigate();
  const { error: showError } = useNotification();

  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

  const handleVerFormulario = async (c) => {
    setFormData(null);
    setLoadingForm(true);
    setFormDrawerOpen(true);
    try {
      const { data } = await getFormularioByReserva(c.id);
      setFormData(data);
    } catch (err) {
      setFormDrawerOpen(false);
      if (err.response?.status === 404) {
        navigate('/Formulario', {
          state: {
            reservaIds: [c.id],
            tipoProfissional: c.tipoProfissionalRaw,
            nomeProfissional: c.nomeOutro,
          }
        });
      } else {
        showError('Erro ao carregar formulário.');
      }
    } finally {
      setLoadingForm(false);
    }
  };

  return {
    formDrawerOpen,
    setFormDrawerOpen,
    formData,
    loadingForm,
    handleVerFormulario,
  };
};
