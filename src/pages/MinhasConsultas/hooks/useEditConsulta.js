import { useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { parseDia } from '../../../utils/formatters';
import { editReserva } from '../api';

export const useEditConsulta = ({ onSaved }) => {
  const { success, error: showError } = useNotification();

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);
  const [novaData, setNovaData] = useState(new Date());
  const [novoHorario, setNovoHorario] = useState('');

  const handleEditar = (c) => {
    setConsultaEditando(c);
    setNovaData(parseDia(c.dia) || new Date());
    setNovoHorario(c.horario || '');
    setEditDrawerOpen(true);
  };

  const handleSalvar = async () => {
    if (!novaData || !/^([01]?\d|2[0-3]):([0-5]\d)$/.test(novoHorario)) {
      showError('Data ou horário inválido.'); return;
    }
    const y  = novaData.getFullYear();
    const m  = String(novaData.getMonth() + 1).padStart(2, '0');
    const d  = String(novaData.getDate()).padStart(2, '0');
    const [hh, mm] = novoHorario.split(':').map(Number);
    const hFinal = new Date(0, 0, 0, hh + 1, mm).toTimeString().slice(0, 5);
    try {
      await editReserva(consultaEditando.id, {
        dia: `${y}-${m}-${d}`,
        horario: novoHorario,
        horarioFinal: hFinal,
        qntd_pessoa: consultaEditando.qntd_pessoa || 1,
        status: 'pendente',
      });
      success('Edição enviada! Aguardando confirmação.');
      setEditDrawerOpen(false);
      onSaved?.();
    } catch { showError('Erro ao editar.'); }
  };

  return {
    editDrawerOpen,
    setEditDrawerOpen,
    novaData,
    setNovaData,
    novoHorario,
    setNovoHorario,
    handleEditar,
    handleSalvar,
  };
};
