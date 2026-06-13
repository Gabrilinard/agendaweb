import { useState } from 'react';
import { updateInformacoes } from '../api';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const parseDias = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return raw.split(',').map(d => d.trim()).filter(Boolean); }
};

const parseHorarios = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return {}; }
};

const useInformacoes = (user, { success, warning, showError }) => {
  const [editingUserId, setEditingUserId] = useState(null);
  const [editTipoProfissional, setEditTipoProfissional] = useState('');
  const [editNumeroConselho, setEditNumeroConselho] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editPublicoAtendido, setEditPublicoAtendido] = useState('');
  const [editModalidade, setEditModalidade] = useState('');
  const [editValorConsulta, setEditValorConsulta] = useState('');
  const [editDiasAtendimento, setEditDiasAtendimento] = useState([]);
  const [editHorariosAtendimento, setEditHorariosAtendimento] = useState({});

  const carregarDados = (data, userId, screen) => {
    setEditingUserId(userId);
    if (screen === 'informacoes') {
      setEditTipoProfissional(data.tipoProfissional || '');
      setEditNumeroConselho(data.numeroConselho || '');
      setEditDescricao(data.descricao || '');
      setEditPublicoAtendido(data.publicoAtendido || '');
      setEditModalidade(data.modalidade || '');
      setEditValorConsulta(data.valorConsulta || '');
    }
    const dias = parseDias(data.diasAtendimento);
    setEditDiasAtendimento(Array.isArray(dias) ? dias : []);
    const hors = parseHorarios(data.horariosAtendimento);
    setEditHorariosAtendimento(typeof hors === 'object' && hors ? hors : {});
  };

  const handleEditDiaChange = (e) => {
    const dia = e.target.value;
    if (dia === 'Todos os dias') {
      const all = DIAS_SEMANA.every(d => editDiasAtendimento.includes(d));
      if (all) { setEditDiasAtendimento([]); setEditHorariosAtendimento({}); }
      else {
        setEditDiasAtendimento([...DIAS_SEMANA]);
        const h = {}; DIAS_SEMANA.forEach(d => { h[d] = editHorariosAtendimento[d] || ['08:00']; });
        setEditHorariosAtendimento(h);
      }
    } else {
      if (editDiasAtendimento.includes(dia)) {
        setEditDiasAtendimento(editDiasAtendimento.filter(d => d !== dia));
        const h = { ...editHorariosAtendimento }; delete h[dia]; setEditHorariosAtendimento(h);
      } else {
        setEditDiasAtendimento([...editDiasAtendimento, dia]);
        setEditHorariosAtendimento({ ...editHorariosAtendimento, [dia]: ['08:00'] });
      }
    }
  };

  const handleEditAddHorario = (dia) =>
    setEditHorariosAtendimento(p => ({ ...p, [dia]: [...(p[dia] || []), ''] }));

  const handleEditRemoveHorario = (dia, i) =>
    setEditHorariosAtendimento(p => { const h = [...p[dia]]; h.splice(i, 1); return { ...p, [dia]: h }; });

  const handleEditHorarioChange = (dia, i, v) =>
    setEditHorariosAtendimento(p => { const h = [...p[dia]]; h[i] = v; return { ...p, [dia]: h }; });

  const handleEditarInformacoes = async () => {
    if (!editingUserId) { warning('Erro ao identificar usuário.'); return; }
    try {
      await updateInformacoes(editingUserId, {
        descricao: editDescricao, publicoAtendido: editPublicoAtendido,
        modalidade: editModalidade, valorConsulta: editValorConsulta,
        diasAtendimento: editDiasAtendimento, horariosAtendimento: editHorariosAtendimento,
      });
      success('Informações salvas!');
    } catch { showError('Erro ao salvar.'); }
  };

  const handleSalvarHorarios = async ({ diasAtendimento, horariosAtendimento }) => {
    if (!user?.id) { warning('Erro ao identificar usuário.'); return; }
    try {
      await updateInformacoes(user.id, { diasAtendimento, horariosAtendimento });
      setEditDiasAtendimento(diasAtendimento);
      setEditHorariosAtendimento(horariosAtendimento);
      success('Horários salvos! Os pacientes já podem ver os novos horários.');
    } catch { showError('Erro ao salvar horários.'); }
  };

  return {
    editTipoProfissional, editNumeroConselho,
    editDescricao, setEditDescricao,
    editPublicoAtendido, setEditPublicoAtendido,
    editModalidade, setEditModalidade,
    editValorConsulta, setEditValorConsulta,
    editDiasAtendimento, editHorariosAtendimento,
    diasSemana: DIAS_SEMANA,
    carregarDados, handleEditDiaChange, handleEditAddHorario,
    handleEditRemoveHorario, handleEditHorarioChange,
    handleEditarInformacoes, handleSalvarHorarios,
  };
};

export default useInformacoes;
