export const parseDia = (dia) => {
  if (!dia) return null;
  const str = String(dia).split('T')[0];
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

export const formatarDataBrasil = (data) => {
  if (!data) return '';
  if (data instanceof Date) {
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(data);
  if (str.includes('T')) return str.split('T')[0];
  if (str.includes('/')) {
    const [d, m, y] = str.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return str;
};

export const formatarDataExibicao = (dataString) => {
  if (!dataString) return '';
  const d = parseDia(dataString instanceof Date ? formatarDataBrasil(dataString) : dataString);
  if (!d || isNaN(d.getTime())) return String(dataString);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const formatarDataCompleta = (dataString) => {
  if (!dataString) return '';
  const d = parseDia(dataString instanceof Date ? formatarDataBrasil(dataString) : String(dataString).split('T')[0]);
  if (!d || isNaN(d.getTime())) return String(dataString);
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return `${dias[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const formatarHorarioBrasil = (horario) => {
  if (!horario) return '';
  const h = String(horario);
  const m1 = h.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
  if (m1) {
    let hr = parseInt(m1[1], 10);
    const per = m1[3].toUpperCase();
    if (per === 'PM' && hr !== 12) hr += 12;
    else if (per === 'AM' && hr === 12) hr = 0;
    return `${String(hr).padStart(2, '0')}:${m1[2]}`;
  }
  const m2 = h.match(/^(\d{1,2}):(\d{2})/);
  if (m2) return `${String(parseInt(m2[1], 10)).padStart(2, '0')}:${m2[2]}`;
  return h;
};

export const calcHorarioFinal = (horario) => {
  if (!horario) return '';
  const [hh, mm] = horario.split(':').map(Number);
  const fim = new Date(0, 0, 0, hh + 1, mm);
  return `${String(fim.getHours()).padStart(2, '0')}:${String(fim.getMinutes()).padStart(2, '0')}`;
};
