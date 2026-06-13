export const converterEstadoParaSigla = (estadoNome) => {
  const map = {
    'acre':'AC','alagoas':'AL','amapá':'AP','amazonas':'AM','bahia':'BA','ceará':'CE',
    'distrito federal':'DF','espírito santo':'ES','goiás':'GO','maranhão':'MA',
    'mato grosso':'MT','mato grosso do sul':'MS','minas gerais':'MG','pará':'PA',
    'paraíba':'PB','paraná':'PR','pernambuco':'PE','piauí':'PI','rio de janeiro':'RJ',
    'rio grande do norte':'RN','rio grande do sul':'RS','rondônia':'RO','roraima':'RR',
    'santa catarina':'SC','são paulo':'SP','sergipe':'SE','tocantins':'TO',
  };
  if (!estadoNome) return null;
  const n = estadoNome.toLowerCase().trim();
  if (map[n]) return map[n];
  if (estadoNome.length === 2 && /^[A-Z]{2}$/i.test(estadoNome)) return estadoNome.toUpperCase();
  return null;
};

export const formatarCPF = (valor) => {
  const n = valor.replace(/\D/g, '');
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0,3)}.${n.slice(3)}`;
  if (n.length <= 9) return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6)}`;
  return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9,11)}`;
};

export const validarCPF = (cpf) => {
  const n = cpf.replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(n[i-1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(n[9])) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(n[i-1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(n[10]);
};

export const formatarNumeroConselho = (valor, tipo) => {
  if (!valor) return '';

  switch (tipo) {
    case 'medico': {
      // CRM/PI 425041
      const upper = valor.toUpperCase();
      if (!upper.startsWith('CRM')) return upper.slice(0, 3);
      const after = upper.slice(3).replace(/^\//, '');
      const uf = after.replace(/[^A-Z]/g, '').slice(0, 2);
      const num = after.replace(/\D/g, '').slice(0, 6);
      const hasContent = upper.length > 3;
      return `CRM${hasContent ? '/' : ''}${uf}${num ? ' ' + num : ''}`.trimEnd().slice(0, 14);
    }
    case 'dentista': {
      // CRO/SP 12345
      const upper = valor.toUpperCase();
      if (!upper.startsWith('CRO')) return upper.slice(0, 3);
      const after = upper.slice(3).replace(/^\//, '');
      const uf = after.replace(/[^A-Z]/g, '').slice(0, 2);
      const num = after.replace(/\D/g, '').slice(0, 6);
      const hasContent = upper.length > 3;
      return `CRO${hasContent ? '/' : ''}${uf}${num ? ' ' + num : ''}`.trimEnd().slice(0, 13);
    }
    case 'nutricionista': {
      // CRN-3 12345
      const upper = valor.toUpperCase();
      if (!upper.startsWith('CRN')) return upper.slice(0, 3);
      const after = upper.slice(3).replace(/^[-\s]/, '');
      const digits = after.replace(/\D/g, '');
      const regional = digits.slice(0, 1);
      const num = digits.slice(1, 6);
      return `CRN${regional ? '-' + regional : ''}${num ? ' ' + num : ''}`.trimEnd().slice(0, 11);
    }
    case 'fisioterapeuta': {
      // CREFITO-8/123456-F
      const upper = valor.toUpperCase();
      if (!upper.startsWith('CREFITO')) return upper.slice(0, 7);
      const after = upper.slice(7).replace(/^[-\s]/, '');
      const digits = after.replace(/\D/g, '');
      const regional = digits.slice(0, 1);
      const num = digits.slice(1, 7);
      const sufMatch = upper.match(/([FT])(?:\s*$|-)/);
      const suf = sufMatch ? sufMatch[1] : '';
      let result = `CREFITO${regional ? '-' + regional : ''}${num ? '/' + num : ''}`;
      if (suf && num) result += `-${suf}`;
      return result.slice(0, 18);
    }
    case 'fonoaudiologo': {
      // CRFa/SP 12345
      if (!/^CRFa/i.test(valor)) return valor.slice(0, 4);
      const after = valor.slice(4).replace(/^\//, '').toUpperCase();
      const uf = after.replace(/[^A-Z]/g, '').slice(0, 2);
      const num = after.replace(/\D/g, '').slice(0, 5);
      const hasContent = valor.length > 4;
      return `CRFa${hasContent ? '/' : ''}${uf}${num ? ' ' + num : ''}`.trimEnd().slice(0, 13);
    }
    case 'psicologo': {
      // CRP 06/12345
      const raw = valor.replace(/^CRP\s?/i, '');
      const digits = raw.replace(/\D/g, '');
      const reg = digits.slice(0, 2);
      const num = digits.slice(2, 8);
      return `CRP${reg ? ' ' + reg : ''}${num ? '/' + num : ''}`;
    }
    default: return valor.slice(0, 20);
  }
};

export const validarNumeroConselho = (valor, tipo) => {
  if (!valor?.trim()) return false;
  const v = valor.trim();
  switch (tipo) {
    case 'medico':         return /^CRM\/[A-Z]{2} \d{4,6}$/i.test(v);
    case 'dentista':       return /^CRO\/[A-Z]{2} \d{4,6}$/i.test(v);
    case 'nutricionista':  return /^CRN-[1-9] \d{4,5}$/.test(v);
    case 'fisioterapeuta': return /^CREFITO-\d{1,2}\/\d{4,6}-[FT]$/i.test(v);
    case 'fonoaudiologo':  return /^CRFa\/[A-Z]{2} \d{4,5}$/i.test(v);
    case 'psicologo':      return /^CRP \d{2}\/\d{4,6}$/.test(v);
    default:               return /^[A-Za-z0-9 /\-]{3,20}$/.test(v);
  }
};

export const formatarHorarioInput = (valor) => {
  if (!valor) return '';
  const n = String(valor).replace(/\D/g, '').slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0,2)}:${n.slice(2)}`;
};

export const normalizarHorario24h = (valor) => {
  if (!valor) return '';
  const texto = String(valor).trim();
  const mAMPM = texto.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (mAMPM) {
    let h = parseInt(mAMPM[1], 10);
    const min = parseInt(mAMPM[2], 10);
    const per = mAMPM[4].toUpperCase();
    if (isNaN(h) || isNaN(min) || min < 0 || min > 59) return '';
    if (per === 'PM' && h !== 12) h += 12;
    if (per === 'AM' && h === 12) h = 0;
    if (h < 0 || h > 23) return '';
    return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
  }
  const n = texto.replace(/\D/g, '').slice(0, 4);
  if (n.length !== 4) return texto;
  const h = parseInt(n.slice(0,2), 10);
  const min = parseInt(n.slice(2,4), 10);
  if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) return '';
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
};
