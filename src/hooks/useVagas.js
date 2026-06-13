import { useCallback, useEffect, useState } from 'react';
import { getVagasPendentes } from '../api/vagas';

const useVagas = (usuarioId) => {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!usuarioId) return;
    setLoading(true);
    try {
      const { data } = await getVagasPendentes(usuarioId);
      setVagas(data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { vagas, setVagas, loading, refetch: fetch };
};

export default useVagas;
