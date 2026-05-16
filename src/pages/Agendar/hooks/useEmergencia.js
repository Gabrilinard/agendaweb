import { useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { agendarService } from '../services/api';
import { formatarDataBrasil } from '../utils/formatters';

export const useEmergencia = (user, nomeProfissional) => {
  const { success, error: showError } = useNotification();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [urgenciaDescricao, setUrgenciaDescricao] = useState('');
  const [urgenciaHorario, setUrgenciaHorario] = useState('');
  const [urgenciaArquivo, setUrgenciaArquivo] = useState(null);

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!urgenciaDescricao) {
      showError('Por favor, descreva o motivo da urgência.');
      return;
    }

    if (!urgenciaHorario) {
      showError('Por favor, informe o horário desejado para urgência.');
      return;
    }

    const formData = new FormData();
    formData.append('nome', user.nome);
    formData.append('sobrenome', user.sobrenome);
    formData.append('email', user.email);
    formData.append('telefone', user.telefone);
    formData.append('dia', formatarDataBrasil(new Date()));
    formData.append('horario', urgenciaHorario); 
    formData.append('horarioFinal', '00:00');
    formData.append('qntd_pessoa', 1);
    formData.append('usuario_id', user.id);
    formData.append('nomeProfissional', nomeProfissional || null);
    formData.append('status', 'pendente');
    formData.append('is_urgente', true);
    formData.append('descricao_urgencia', urgenciaDescricao);
    
    if (urgenciaArquivo) {
      formData.append('arquivo_urgencia', urgenciaArquivo);
    }

    try {
      await agendarService.createEmergencia(formData);
      success('Solicitação de emergência enviada com sucesso!');
      setShowEmergencyModal(false);
      setUrgenciaDescricao('');
      setUrgenciaHorario('');
      setUrgenciaArquivo(null);
    } catch (error) {
      console.error('Erro ao enviar emergência:', error);
      showError('Erro ao enviar solicitação de emergência.');
    }
  };

  return {
    showEmergencyModal,
    setShowEmergencyModal,
    urgenciaDescricao,
    setUrgenciaDescricao,
    urgenciaHorario,
    setUrgenciaHorario,
    urgenciaArquivo,
    setUrgenciaArquivo,
    handleEmergencySubmit
  };
};
