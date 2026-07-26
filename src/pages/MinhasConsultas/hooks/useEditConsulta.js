import { useEffect, useState } from 'react';
import { agendarService } from '../../Agendar/services/api';
import { useNotification } from '../../../contexts/NotificationContext';
import { formatarDataBrasil, formatarHorarioBrasil, parseDia } from '../../../utils/formatters';
import { editReserva } from '../api';

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const normalizarDiaSemana = (dia) => (
  String(dia || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/-?feira/g, '')
    .replace(/\s+/g, '')
    .trim()
);

const normalizarDataISO = (data) => {
  if (!data) return '';
  let raw = String(data).trim();
  if (raw.includes('T')) raw = raw.split('T')[0];
  if (raw.includes(' ')) raw = raw.split(' ')[0];
  return raw;
};

export const useEditConsulta = ({ onSaved }) => {
  const { success, error: showError } = useNotification();

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);
  const [novaData, setNovaData] = useState(new Date());
  const [novoHorario, setNovoHorario] = useState('');

  const [horariosAtendimento, setHorariosAtendimento] = useState({});
  const [reservasProfissional, setReservasProfissional] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  const handleEditar = async (c) => {
    setConsultaEditando(c);
    setNovaData(parseDia(c.dia) || new Date());
    setNovoHorario(formatarHorarioBrasil(c.horario) || '');
    setHorariosAtendimento({});
    setReservasProfissional([]);
    setEditDrawerOpen(true);

    if (!c.profissional_id) return;

    setCarregandoHorarios(true);
    try {
      const [{ data: prof }, { data: reservas }] = await Promise.all([
        agendarService.getProfissionalById(c.profissional_id),
        agendarService.getReservasProfissional(c.profissional_id),
      ]);

      let horarios = {};
      try {
        horarios = typeof prof?.horariosAtendimento === 'string'
          ? JSON.parse(prof.horariosAtendimento)
          : prof?.horariosAtendimento || {};
      } catch { horarios = {}; }

      setHorariosAtendimento(horarios);
      setReservasProfissional(reservas || []);
    } catch {
      setHorariosAtendimento({});
      setReservasProfissional([]);
    } finally {
      setCarregandoHorarios(false);
    }
  };

  useEffect(() => {
    if (!novaData || !consultaEditando) { setHorariosDisponiveis([]); return; }

    const diaSemana = DIAS_SEMANA[novaData.getDay()];
    const chaveExata = Object.keys(horariosAtendimento).find(
      (k) => normalizarDiaSemana(k) === normalizarDiaSemana(diaSemana)
    );
    const horariosDoDia = (chaveExata ? horariosAtendimento[chaveExata] : horariosAtendimento[diaSemana]) || [];
    const dataFormatada = formatarDataBrasil(novaData);

    const formatados = (Array.isArray(horariosDoDia) ? horariosDoDia : [])
      .map((h) => formatarHorarioBrasil(h))
      .filter(Boolean);

    const livres = formatados.filter((hFormatado) => {
      const ocupado = reservasProfissional.some((r) => {
        if (r.id === consultaEditando.id && consultaEditando.status !== 'liberado') return false;
        const dataReserva = normalizarDataISO(r?.dia);
        const horarioReserva = formatarHorarioBrasil(r?.horario);
        return dataReserva === dataFormatada &&
          horarioReserva === hFormatado &&
          r?.status !== 'cancelado' &&
          r?.status !== 'recusado' &&
          r?.status !== 'negado';
      });
      return !ocupado;
    });

    setHorariosDisponiveis(livres);

    if (!carregandoHorarios && novoHorario && !livres.includes(novoHorario)) {
      setNovoHorario('');
    }
  }, [novaData, horariosAtendimento, reservasProfissional, consultaEditando, carregandoHorarios]);

  const handleSalvar = async () => {
    if (!novaData || !/^([01]?\d|2[0-3]):([0-5]\d)$/.test(novoHorario)) {
      showError('Escolha um dia e um horário disponível.'); return;
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
    horariosDisponiveis,
    carregandoHorarios,
    handleEditar,
    handleSalvar,
  };
};
