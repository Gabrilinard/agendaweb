import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { parseDia } from '../../../utils/formatters';
import {
    aceitarVaga,
    confirmarPresenca,
    deleteReserva,
    getReservas,
    getVagasPendentes,
    liberarVaga,
    recusarVaga,
    solicitarDados,
    updateReserva,
} from '../api';

export const useConsultas = ({ onLoaded } = {}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vagasPendentes, setVagasPendentes] = useState([]);
  const [aceitandoVaga, setAceitandoVaga] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [liberandoId, setLiberandoId] = useState(null);

  const buscarConsultas = async () => {
    if (!user?.id) return;

    let isActive = true;
    setConsultas([]);
    setLoading(true);

    try {
      const { data } = await getReservas({ usuario_id: user.id });
      if (!isActive) return;

      const enriched = await Promise.all((data || []).map(async (c) => {
        const otherId = c.profissional_id;
        if (!otherId) return c;
        try {
          const { data: p } = await solicitarDados(otherId);
          return {
            ...c,
            nomeOutro: `${p.nome} ${p.sobrenome}`,
            especialidade: p.tipoProfissional || p.especialidadeMedica || p.profissaoCustomizada || 'Especialista',
            tipoProfissionalRaw: p.tipoProfissional || p.especialidadeMedica || p.profissaoCustomizada || '',
            valorConsulta: p.valorConsulta,
          };
        } catch { return c; }
      }));

      if (!isActive) return;
      setConsultas(enriched);
      onLoaded?.(enriched);
    } catch {
      if (!isActive) return;
      showError('Erro ao carregar consultas.');
    } finally {
      if (isActive) setLoading(false);
    }

    return () => {
      isActive = false;
    };
  };

  const buscarVagasPendentes = async () => {
    if (!user?.id) return;
    try {
      const { data } = await getVagasPendentes(user.id);
      setVagasPendentes(data || []);
    } catch { }
  };
  
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(buscarVagasPendentes, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleCancelar = (id) => setConfirmingId(id);

  const handleConfirmarCancelamento = async () => {
    try {
      await deleteReserva(confirmingId);
      success('Consulta cancelada.');
      setConfirmingId(null);
      buscarConsultas();
    } catch (e) {
      showError(e?.response?.data?.error || e?.response?.data?.message || 'Erro ao cancelar.');
    }
  };

  const handleLiberarHorario = (id) => { setConfirmingId(null); setLiberandoId(id); };

  const handleConfirmarLiberacao = async () => {
    const consultaLiberada = consultas.find(c => c.id === liberandoId);
    try {
      await liberarVaga(liberandoId);
      success('Horário liberado para outro paciente! Marque uma nova consulta ou escolha outro horário para esta.');
      setLiberandoId(null);
      buscarConsultas();

      if (consultaLiberada?.profissional_id) {
        navigate('/Agendar', {
          state: {
            nome: consultaLiberada.nomeOutro,
            tipo: consultaLiberada.tipoProfissionalRaw,
            categoria: consultaLiberada.tipoProfissionalRaw,
            profissionalId: consultaLiberada.profissional_id,
            modalidadeSugerida: consultaLiberada.modalidade,
            diaSugerido: consultaLiberada.dia,
            horarioSugerido: consultaLiberada.horario,
          },
        });
      }
    } catch { showError('Erro ao liberar horário.'); }
  };

  const handleAceitarVaga = async (notif) => {
    setAceitandoVaga(notif.id);
    try {
      await aceitarVaga(notif.id, notif.token);
      success('Vaga aceita! Sua consulta foi atualizada.');
      buscarConsultas();
    } catch (e) {
      showError(e?.response?.data?.error || 'Erro ao aceitar vaga.');
    } finally {
      buscarVagasPendentes();
      setAceitandoVaga(null);
    }
  };

  const handleRecusarVaga = async (notif) => {
    try {
      await recusarVaga(notif.id);
      setVagasPendentes(prev => prev.filter(v => v.id !== notif.id));
    } catch { }
  };

  const handleAceitarRemarcacao = async (c) => {
    try {
      await updateReserva(c.id, { status: 'confirmado', dia: c.dia, horario: c.horario });
      success('Novo horário confirmado!');
      buscarConsultas();
    } catch { showError('Erro ao confirmar.'); }
  };

  const handleRecusarRemarcacao = async (c) => {
    try {
      await updateReserva(c.id, { status: 'negado' });
      success('Remarcação recusada.');
      buscarConsultas();
    } catch { showError('Erro ao recusar.'); }
  };

  const handleConfirmarPresenca = async (c) => {
    try {
      await confirmarPresenca(c.id);
      success('Presença confirmada!');
      buscarConsultas();
    } catch { showError('Erro ao confirmar presença.'); }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ocultos = new Set(['liberado', 'transferido']);
  const ativas  = new Set(['pendente', 'confirmado', 'aguardando_confirmacao_paciente']);

  const proximas   = consultas.filter(c => ativas.has(c.status) && parseDia(c.dia) >= today);
  const concluidas = consultas.filter(c => ativas.has(c.status) && parseDia(c.dia) < today);
  const canceladas = consultas.filter(c => (c.status === 'negado' || c.status === 'ausente') && !ocultos.has(c.status));

  return {
    user,
    consultas,
    loading,
    proximas,
    concluidas,
    canceladas,
    today,
    vagasPendentes,
    aceitandoVaga,
    confirmingId,
    setConfirmingId,
    liberandoId,
    setLiberandoId,
    buscarConsultas,
    buscarVagasPendentes,
    handleCancelar,
    handleConfirmarCancelamento,
    handleLiberarHorario,
    handleConfirmarLiberacao,
    handleAceitarVaga,
    handleRecusarVaga,
    handleAceitarRemarcacao,
    handleRecusarRemarcacao,
    handleConfirmarPresenca,
  };
};
