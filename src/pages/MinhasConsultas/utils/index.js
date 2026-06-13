import { MUTED } from '../styles';

export const humanize = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

const SKIP_KEYS = new Set(['createdAt', 'profissional', 'tipoProfissional', 'tipoAtendimento', 'reservaIds', 'paciente']);

export const flattenConteudo = (obj, prefix = '') => {
  const entries = [];
  for (const [key, val] of Object.entries(obj || {})) {
    if (SKIP_KEYS.has(key)) continue;
    const label = prefix ? `${prefix} › ${humanize(key)}` : humanize(key);
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      entries.push(...flattenConteudo(val, humanize(key)));
    } else if (typeof val === 'boolean') {
      if (val) entries.push({ label, value: 'Sim' });
    } else if (val !== '' && val !== null && val !== undefined) {
      entries.push({ label, value: String(val) });
    }
  }
  return entries;
};

export const statusStyle = (status) => {
  switch (status) {
    case 'confirmado':                      return { bg: '#D4F0DE', color: '#1A5C3C', label: 'Confirmada' };
    case 'pendente':                        return { bg: '#FEF0CC', color: '#A05800', label: 'Aguardando confirmação' };
    case 'aguardando_confirmacao_paciente': return { bg: '#FEE2CC', color: '#C2410C', label: 'Novo horário proposto' };
    case 'negado':                          return { bg: '#FDDEDE', color: '#C53030', label: 'Cancelada' };
    case 'ausente':                         return { bg: '#FDDEDE', color: '#C53030', label: 'Não compareceu' };
    default:                                return { bg: '#EDEAE4', color: MUTED, label: status };
  }
};

export const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
