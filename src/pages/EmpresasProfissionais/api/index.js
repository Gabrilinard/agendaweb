import client from '../../../api/client';

export const getProfissionaisByCategoria = (categoria) => client.get(`/profissionais/${categoria}`);
