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
  let nums = valor.replace(/\D/g, '');
  if (!nums) return '';
  switch (tipo) {
    case 'medico':       nums = nums.slice(0,6); return `CRM ${nums}`;
    case 'dentista':     nums = nums.slice(0,6); return `CRO ${nums}`;
    case 'nutricionista':nums = nums.slice(0,5); return `CRN ${nums}`;
    case 'fisioterapeuta':nums = nums.slice(0,6); return `CREFITO ${nums}`;
    case 'fonoaudiologo':nums = nums.slice(0,5); return `CRFa ${nums}`;
    case 'psicologo': {
      const reg = nums.slice(0, Math.min(2, nums.length));
      const num = nums.slice(2, Math.min(8, nums.length));
      return num ? `CRP ${reg}/${num}` : `CRP ${reg}`;
    }
    default: return nums.slice(0,10);
  }
};

export const validarNumeroConselho = (valor, tipo) => {
  if (!valor?.trim()) return false;
  const n = valor.replace(/\D/g, '');
  switch (tipo) {
    case 'medico':       return /^CRM\s?\d{4,6}$/i.test(valor.trim()) && n.length >= 4 && n.length <= 6;
    case 'dentista':     return /^CRO\s?\d{4,6}$/i.test(valor.trim()) && n.length >= 4 && n.length <= 6;
    case 'nutricionista':return /^CRN\s?\d{4,5}$/i.test(valor.trim()) && n.length >= 4 && n.length <= 5;
    case 'fisioterapeuta':return /^CREFITO\s?\d{4,6}$/i.test(valor.trim()) && n.length >= 4 && n.length <= 6;
    case 'fonoaudiologo':return /^CRFa\s?\d{4,5}$/i.test(valor.trim()) && n.length >= 4 && n.length <= 5;
    case 'psicologo':    return /^CRP\s?\d{1,2}\/\d{4,6}$/i.test(valor.trim());
    default:             return n.length >= 3 && n.length <= 10;
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
