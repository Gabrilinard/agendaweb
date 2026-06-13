import client from '../../../api/client';

export const createFormulario = (data) => client.post('/formularios', data);
export const createReserva = (data) => client.post('/reservas', data);
