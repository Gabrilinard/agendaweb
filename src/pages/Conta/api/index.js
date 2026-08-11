import client from '../../../api/client';

export const updatePerfil = (id, data) => client.patch(`/usuarios/${id}/perfil`, data);
export const excluirConta = (id) => client.delete(`/usuarios/${id}`);
