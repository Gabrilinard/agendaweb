import { useCallback, useEffect, useState } from 'react';
import { getReservas } from '../api/reservas';

const useReservas = (params) => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!params || Object.values(params).every(v => !v)) return;
    try {
      setLoading(true);
      const { data } = await getReservas(params);
      setReservas(data || []);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { reservas, setReservas, loading, error, refetch: fetch };
};

export default useReservas;
