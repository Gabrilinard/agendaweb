import client from '../../../api/client';

export const getProfissionais = () => client.get('/profissionais');
export const getReservas = (params) => client.get('/reservas', { params });
export const solicitarDados = (id) => client.get(`/usuarios/solicitarDados/${id}`);
