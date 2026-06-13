import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { parseDia } from '../../../utils/formatters';
import {
  aceitarVaga,
  getReservas,
  getVagasPendentes,
  liberarVaga,
  recusarVaga,
  solicitarDados,
  updateReserva,
} from '../api';

export const useConsultas = ({ onLoaded } = {}) => {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();

  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vagasPendentes, setVagasPendentes] = useState([]);
  const [aceitandoVaga, setAceitandoVaga] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [liberandoId, setLiberandoId] = useState(null);

  const buscarConsultas = async () => {
    try {
      setLoading(true);
      const isProfissional = user.tipoUsuario === 'profissional';
      const params = isProfissional
        ? { profissional_id: user.id }
        : { usuario_id: user.id };

      const { data } = await getReservas(params);

      const enriched = await Promise.all((data || []).map(async (c) => {
        const otherId = isProfissional ? c.usuario_id : c.profissional_id;
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

      setConsultas(enriched);
      onLoaded?.(enriched);
    } catch {
      showError('Erro ao carregar consultas.');
    } finally {
      setLoading(false);
    }
  };

  const buscarVagasPendentes = async () => {
    if (!user?.id) return;
    try {
      const { data } = await getVagasPendentes(user.id);
      setVagasPendentes(data || []);
    } catch { }
  };

  const handleCancelar = (id) => setConfirmingId(id);

  const handleConfirmarCancelamento = async () => {
    try {
      await updateReserva(confirmingId, { status: 'negado' });
      success('Consulta cancelada.');
      setConfirmingId(null);
      buscarConsultas();
    } catch { showError('Erro ao cancelar.'); }
  };

  const handleLiberarHorario = (id) => { setConfirmingId(null); setLiberandoId(id); };

  const handleConfirmarLiberacao = async () => {
    try {
      await liberarVaga(liberandoId);
      success('Horário liberado! O profissional será notificado.');
      setLiberandoId(null);
      buscarConsultas();
    } catch { showError('Erro ao liberar horário.'); }
  };

  const handleAceitarVaga = async (notif) => {
    setAceitandoVaga(notif.id);
    try {
      await aceitarVaga(notif.id, notif.token);
      success('Vaga aceita! Sua consulta foi atualizada.');
      buscarVagasPendentes();
      buscarConsultas();
    } catch { showError('Erro ao aceitar vaga.'); }
    finally { setAceitandoVaga(null); }
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
  };
};
