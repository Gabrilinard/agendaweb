import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import { agendarService } from '../services/api';
import { formatarDataBrasil } from '../utils/formatters';

export const useEmergencia = (user, nomeProfissional) => {
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [urgenciaDescricao, setUrgenciaDescricao] = useState('');
  const [urgenciaHorario, setUrgenciaHorario] = useState('');
  const [urgenciaArquivo, setUrgenciaArquivo] = useState(null);
  const [urgenciaModalidade, setUrgenciaModalidade] = useState('profissional_escolhe');
  const [urgenciaDia, setUrgenciaDia] = useState('');
  const [urgenciaTurno, setUrgenciaTurno] = useState([]);
  const [urgenciaDias, setUrgenciaDias] = useState([]);

  const toggleItem = (setter, list, item) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!urgenciaDescricao) {
      showError('Por favor, descreva o motivo da urgência.');
      return;
    }

    if (urgenciaModalidade === 'paciente_escolhe' && !urgenciaDia) {
      showError('Por favor, informe o dia preferencial.');
      return;
    }

    const now = new Date();
    const nowH = String(now.getHours()).padStart(2, '0');
    const nowM = String(now.getMinutes()).padStart(2, '0');

    const dia = urgenciaModalidade === 'paciente_escolhe'
      ? urgenciaDia
      : formatarDataBrasil(now);

    const horario = urgenciaModalidade === 'paciente_escolhe'
      ? (urgenciaHorario || `${nowH}:${nowM}`)
      : `${nowH}:${nowM}`;

    // Append turno/dias preferences to description for option 1
    let descricaoFinal = urgenciaDescricao;
    if (urgenciaModalidade === 'profissional_escolhe') {
      const turnoLabels = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
      const diasLabels = { seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado' };
      const turnoStr = urgenciaTurno.map(t => turnoLabels[t]).join(', ');
      const diasStr = urgenciaDias.map(d => diasLabels[d]).join(', ');
      if (turnoStr) descricaoFinal += `\n\nTurno preferencial: ${turnoStr}`;
      if (diasStr) descricaoFinal += `\nDias preferidos: ${diasStr}`;
    }

    const formData = new FormData();
    formData.append('nome', user.nome);
    formData.append('sobrenome', user.sobrenome);
    formData.append('email', user.email);
    formData.append('telefone', user.telefone);
    formData.append('dia', dia);
    formData.append('horario', horario);
    formData.append('horarioFinal', '00:00');
    formData.append('qntd_pessoa', 1);
    formData.append('usuario_id', user.id);
    formData.append('nomeProfissional', nomeProfissional || null);
    formData.append('status', 'pendente');
    formData.append('is_urgente', true);
    formData.append('descricao_urgencia', descricaoFinal);

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
      setUrgenciaModalidade('profissional_escolhe');
      setUrgenciaDia('');
      setUrgenciaTurno([]);
      setUrgenciaDias([]);
      navigate('/minhas-consultas');
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
    urgenciaModalidade,
    setUrgenciaModalidade,
    urgenciaDia,
    setUrgenciaDia,
    urgenciaTurno,
    urgenciaDias,
    toggleTurno: (item) => toggleItem(setUrgenciaTurno, urgenciaTurno, item),
    toggleDia: (item) => toggleItem(setUrgenciaDias, urgenciaDias, item),
    handleEmergencySubmit
  };
};
