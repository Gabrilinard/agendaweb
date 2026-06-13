import client from '../../../api/client';

export const agendarService = {
  getProfissionais: () => client.get('/profissionais'),

  getProfissionalById: (id) => client.get(`/usuarios/solicitarDados/${id}`),

  getReservasProfissional: (profissionalId) =>
    client.get('/reservas', { params: { profissional_id: profissionalId } }),

  getReservasUsuario: (userId) =>
    client.get(`/reservas/${userId}`),

  getReservasUsuarioProfissional: (userId, profissionalId) =>
    client.get('/reservas', { params: { usuario_id: userId, profissional_id: profissionalId } }),

  createReserva: (data) => client.post('/reservas', data),

  createEmergencia: (formData) => client.post('/reservas', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  updateReservaStatus: (id, status) =>
    client.patch(`/reservas/${id}`, { status }),

  solicitarFalta: (id, data) =>
    client.put(`/reservas/solicitar/${id}`, data),

  editReserva: (id, data) =>
    client.patch(`/reservas/editar/${id}`, data),

  deleteReserva: (id) =>
    client.delete(`/reservas/${id}`),
};
