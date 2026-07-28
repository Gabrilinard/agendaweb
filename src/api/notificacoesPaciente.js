import client from './client';

export const getNotificacoesPaciente = (usuarioId) =>
  client.get(`/notificacoes-paciente/${usuarioId}`);

export const marcarNotificacoesPacienteLidas = (usuarioId) =>
  client.post(`/notificacoes-paciente/${usuarioId}/lidas`);
