import client from '../../../api/client';

export const getReservas = (params) => client.get('/reservas', { params });
export const updateReserva = (id, data) => client.patch(`/reservas/${id}`, data);
export const negarReserva = (id, data) => client.patch(`/reservas/negado/${id}`, data);
