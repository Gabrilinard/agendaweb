import client from '../../../api/client';

export const getReservas = (params) => client.get('/reservas', { params });
export const updateReserva = (id, data) => client.patch(`/reservas/${id}`, data);
export const editReserva = (id, data) => client.patch(`/reservas/editar/${id}`, data);

export const solicitarDados = (id) => client.get(`/usuarios/solicitarDados/${id}`);

export const getFormularioByReserva = (reservaId) => client.get(`/formularios/reserva/${reservaId}`);

export const getVagasPendentes = (usuarioId) => client.get(`/vagas/pendentes/${usuarioId}`);
export const liberarVaga = (reservaId) => client.post(`/vagas/liberar/${reservaId}`);
export const aceitarVaga = (notificacaoId, token) => client.post(`/vagas/aceitar/${notificacaoId}`, { token });
export const recusarVaga = (notificacaoId) => client.post(`/vagas/recusar/${notificacaoId}`);

export const getAvaliacaoByReserva = (reservaId) => client.get(`/avaliacoes/reserva/${reservaId}`);
export const createAvaliacao = (data) => client.post('/avaliacoes', data);
