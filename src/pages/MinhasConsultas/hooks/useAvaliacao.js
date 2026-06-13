import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { parseDia } from '../../../utils/formatters';
import { createAvaliacao, getAvaliacaoByReserva } from '../api';

export const useAvaliacao = () => {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();

  const [avaliandoId, setAvaliandoId] = useState(null);
  const [notaAvaliacao, setNotaAvaliacao] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');
  const [avaliacoesFeitas, setAvaliacoesFeitas] = useState(new Set());
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  const verificarAvaliacoes = async (lista) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const passadas = lista.filter(c =>
      c.status === 'confirmado' && parseDia(c.dia) < today && c.profissional_id
    );
    const results = await Promise.all(passadas.map(async c => {
      try {
        const { data } = await getAvaliacaoByReserva(c.id);
        return data.avaliado ? c.id : null;
      } catch { return null; }
    }));
    setAvaliacoesFeitas(new Set(results.filter(Boolean)));
  };

  const handleEnviarAvaliacao = async (c) => {
    if (!notaAvaliacao) { showError('Selecione uma nota.'); return; }
    setEnviandoAvaliacao(true);
    try {
      await createAvaliacao({
        reserva_id: c.id,
        usuario_id: user.id,
        profissional_id: c.profissional_id,
        nota: notaAvaliacao,
        comentario: comentarioAvaliacao,
      });
      success('Avaliação enviada!');
      setAvaliacoesFeitas(prev => new Set([...prev, c.id]));
      setAvaliandoId(null);
      setNotaAvaliacao(0);
      setComentarioAvaliacao('');
    } catch (e) {
      showError(e.response?.data?.error || 'Erro ao enviar avaliação.');
    } finally { setEnviandoAvaliacao(false); }
  };

  return {
    avaliandoId,
    setAvaliandoId,
    notaAvaliacao,
    setNotaAvaliacao,
    comentarioAvaliacao,
    setComentarioAvaliacao,
    avaliacoesFeitas,
    enviandoAvaliacao,
    verificarAvaliacoes,
    handleEnviarAvaliacao,
  };
};
