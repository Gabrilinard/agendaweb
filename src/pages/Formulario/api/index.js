import client from '../../../api/client';

export const createFormulario = (data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  return client.post('/formularios', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
};
export const createReserva = (data) => client.post('/reservas', data);
