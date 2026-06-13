import { useEffect, useState } from 'react';
import { getProfissionaisByCategoria } from '../api/profissionais';

const useProfissionais = (categoria) => {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoria) return;
    setLoading(true);
    getProfissionaisByCategoria(categoria)
      .then(({ data }) => { setProfissionais(data || []); setError(null); })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [categoria]);

  return { profissionais, loading, error };
};

export default useProfissionais;
