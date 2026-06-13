import client from '../../../api/client';

export const getReservas = (params) => client.get('/reservas', { params });
export const createReserva = (data) => client.post('/reservas', data);
export const updateReserva = (id, data) => client.patch(`/reservas/${id}`, data);
export const negarReserva = (id, data) => client.patch(`/reservas/negado/${id}`, data);
export const deleteReserva = (id) => client.delete(`/reservas/${id}`);

export const solicitarDados = (id) => client.get(`/usuarios/solicitarDados/${id}`);
export const buscarPorCPF = (cpf) => client.get(`/usuarios/buscarPorCPF/${cpf}`);
export const updateLocalizacao = (id, data) => client.patch(`/usuarios/${id}/localizacao`, data);
export const updateInformacoes = (id, data) => client.patch(`/usuarios/${id}/informacoes`, data);

export const getFormularioByReserva = (reservaId) => client.get(`/formularios/reserva/${reservaId}`);

export const getCandidatos = (profissional_id, dia, excluir_usuario_id) =>
  client.get('/vagas/candidatos', { params: { profissional_id, dia, excluir_usuario_id } });
export const notificarVaga = (data) => client.post('/vagas/notificar', data);
