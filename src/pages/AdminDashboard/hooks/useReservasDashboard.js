import { useCallback, useEffect, useState } from 'react';
import { getReservas } from '../api';
import { parseDia } from '../../../utils/formatters';

const useReservasDashboard = (user) => {
  const [reservas, setReservas] = useState([]);
  const [reservasPorData, setReservasPorData] = useState({});

  const buscarReservas = useCallback(async () => {
    if (!user?.id) return;
    const isProfissional = user.tipoUsuario === 'profissional';
    const params = isProfissional ? { profissional_id: user.id } : {};
    try {
      const { data } = await getReservas(params);
      setReservas(data);
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      const porData = data.reduce((acc, r) => {
        if (!r.dia) return acc;
        const dr = parseDia(r.dia);
        if (!dr) return acc;
        dr.setHours(0, 0, 0, 0);
        if (dr >= hoje) {
          const key = `${dr.getFullYear()}-${String(dr.getMonth() + 1).padStart(2, '0')}-${String(dr.getDate()).padStart(2, '0')}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(r);
        }
        return acc;
      }, {});
      Object.values(porData).forEach(arr => arr.sort((a, b) => (a.horario || '').localeCompare(b.horario || '')));
      setReservasPorData(porData);
    } catch (e) { console.error(e); }
  }, [user]);

  useEffect(() => { buscarReservas(); }, [buscarReservas]);

  return { reservas, setReservas, reservasPorData, buscarReservas };
};

export default useReservasDashboard;
