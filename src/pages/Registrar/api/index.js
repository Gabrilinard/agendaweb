import client from '../../../api/client';

export const register = (data) => client.post('/register', data);
