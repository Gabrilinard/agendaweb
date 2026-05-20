import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { agendarService } from '../services/api';

export const useReservas = (user, profissionalId) => {
  const { success, error: showError } = useNotification();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReservas = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);

      const response = profissionalId
        ? await agendarService.getReservasUsuarioProfissional(user.id, profissionalId)
        : await agendarService.getReservasUsuario(user.id);

      setReservas(response.data);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profissionalId]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const cancelarReserva = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        await agendarService.updateReservaStatus(id, 'cancelado');
        success('Reserva cancelada com sucesso!');
        fetchReservas();
      } catch (err) {
        console.error('Erro ao cancelar reserva:', err);
        showError('Erro ao cancelar reserva.');
      }
    }
  };

  return { reservas, fetchReservas, cancelarReserva, loading };
};
