import { useState } from 'react';
import { deleteReserva, getFormularioByReserva, negarReserva, updateReserva } from '../api';
import { parseDia } from '../../../utils/formatters';

const useEditarReserva = (reservas, setReservas, buscarReservas, { success, warning, showError }) => {
  const [showReservaEdit, setShowReservaEdit] = useState(false);
  const [editReservaId, setEditReservaId] = useState(null);
  const [editReservaData, setEditReservaData] = useState(new Date());
  const [editReservaHorario, setEditReservaHorario] = useState('');

  const [motivo, setMotivo] = useState('');
  const [mostrarMotivo, setMostrarMotivo] = useState(null);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  const [formularioSelecionado, setFormularioSelecionado] = useState(null);
  const [carregandoFormulario, setCarregandoFormulario] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');
  const [searchHistory, setSearchHistory] = useState('');

  const atualizarStatus = (id, status) => {
    updateReserva(id, { status })
      .then(() => { setReservas(prev => prev.map(r => r.id === id ? { ...r, status } : r)); buscarReservas(); })
      .catch(e => console.error(e));
  };

  const toggleStatus = (reserva) => atualizarStatus(reserva.id, reserva.status === 'confirmado' ? 'pendente' : 'confirmado');

  const removerReserva = (id) => {
    if (!window.confirm('Remover esta consulta?')) return;
    deleteReserva(id)
      .then(() => { setReservas(prev => prev.filter(r => r.id !== id)); success('Consulta removida!'); buscarReservas(); })
      .catch(e => console.error(e));
  };

  const handleNegarReserva = (reserva) => {
    if (!motivo.trim()) { warning('Insira o motivo.'); return; }
    negarReserva(reserva.id, { status: 'negado', motivoNegacao: motivo })
      .then(() => {
        setReservas(prev => prev.map(r => r.id === reserva.id ? { ...r, status: 'negado', motivoNegacao: motivo } : r));
        success('Consulta negada!'); setMotivo(''); setMostrarMotivo(null);
      })
      .catch(e => console.error(e));
  };

  const abrirEdicaoReserva = (reserva) => {
    if (!reserva?.id) return;
    setEditReservaId(reserva.id);
    const d = parseDia(reserva.dia);
    setEditReservaData(d ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12) : new Date());
    setEditReservaHorario(reserva.horario);
    setShowReservaEdit(true);
  };

  const handleUpdateReserva = async (novoStatus = null) => {
    if (!editReservaId || !editReservaData || !editReservaHorario) { warning('Preencha todos os campos.'); return; }
    try {
      const d = editReservaData;
      const hFim = new Date(`1970-01-01T${editReservaHorario}:00`);
      hFim.setTime(hFim.getTime() + 3600000);
      await updateReserva(editReservaId, {
        dia: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        horario: editReservaHorario,
        horarioFinal: `${String(hFim.getHours()).padStart(2, '0')}:${String(hFim.getMinutes()).padStart(2, '0')}`,
        status: novoStatus || 'aguardando_confirmacao_paciente',
      });
      success(novoStatus === 'confirmado' ? 'Consulta confirmada!' : 'Consulta atualizada.');
      setShowReservaEdit(false); setEditReservaId(null); buscarReservas();
    } catch { showError('Erro ao atualizar.'); }
  };

  const selecionarReservaParaFormulario = async (reserva) => {
    if (!reserva?.id) return;
    setReservaSelecionada(reserva); setFormularioSelecionado(null); setErroFormulario(''); setCarregandoFormulario(true);
    try {
      const { data } = await getFormularioByReserva(reserva.id);
      setFormularioSelecionado(data);
    } catch (e) {
      setErroFormulario(e?.response?.status === 404 ? 'Nenhum formulário encontrado.' : 'Erro ao buscar formulário.');
    } finally { setCarregandoFormulario(false); }
  };

  return {
    showReservaEdit, setShowReservaEdit,
    editReservaData, setEditReservaData,
    editReservaHorario, setEditReservaHorario,
    motivo, setMotivo, mostrarMotivo, setMostrarMotivo,
    reservaSelecionada, formularioSelecionado, carregandoFormulario, erroFormulario,
    searchHistory, setSearchHistory,
    abrirEdicaoReserva, handleUpdateReserva, toggleStatus, removerReserva,
    handleNegarReserva, selecionarReservaParaFormulario,
    fecharFormulario: () => { setReservaSelecionada(null); setFormularioSelecionado(null); setErroFormulario(''); },
  };
};

export default useEditarReserva;
