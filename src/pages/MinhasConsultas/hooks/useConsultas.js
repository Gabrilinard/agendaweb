import { useCallback, useState } from 'react';
import { getReservas, solicitarDados } from '../api';
import { parseDia } from '../../../utils/formatters';

const useConsultas = (user) => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarConsultas = useCallback(async (onEnriched) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const isProfissional = user.tipoUsuario === 'profissional';
      const params = isProfissional ? { profissional_id: user.id } : { usuario_id: user.id };
      const { data } = await getReservas(params);

      const enriched = await Promise.all((data || []).map(async (c) => {
        const otherId = isProfissional ? c.usuario_id : c.profissional_id;
        if (!otherId) return c;
        try {
          const { data: p } = await solicitarDados(otherId);
          return {
            ...c,
            nomeOutro: `${p.nome} ${p.sobrenome}`,
            especialidade: p.tipoProfissional || p.especialidadeMedica || p.profissaoCustomizada || 'Especialista',
            tipoProfissionalRaw: p.tipoProfissional || p.especialidadeMedica || p.profissaoCustomizada || '',
            valorConsulta: p.valorConsulta,
          };
        } catch { return c; }
      }));

      setConsultas(enriched);
      if (onEnriched) onEnriched(enriched);
    } catch { /* handled by caller */ }
    finally { setLoading(false); }
  }, [user]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ativas = new Set(['pendente', 'confirmado', 'aguardando_confirmacao_paciente']);
  const proximas = consultas.filter(c => ativas.has(c.status) && parseDia(c.dia) >= today);
  const concluidas = consultas.filter(c => ativas.has(c.status) && parseDia(c.dia) < today);
  const canceladas = consultas.filter(c => c.status === 'negado' || c.status === 'ausente');

  return { consultas, setConsultas, loading, buscarConsultas, proximas, concluidas, canceladas, today };
};

export default useConsultas;
