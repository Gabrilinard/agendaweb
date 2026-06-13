import client from '../../../api/client';

export { agendarService } from '../services/api';

export const getAvaliacoesByProfissional = (profissional_id) =>
  client.get('/avaliacoes', { params: { profissional_id } });
export const getMediaByProfissional = (profissional_id) =>
  client.get(`/avaliacoes/media/${profissional_id}`);
