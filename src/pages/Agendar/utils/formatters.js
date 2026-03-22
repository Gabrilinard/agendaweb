export const formatarDataBrasil = (data) => {
  if (!data) return '';
  if (data instanceof Date) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  if (typeof data === 'string') {
    let raw = data.trim();
    if (raw.includes('T')) raw = raw.split('T')[0];
    if (raw.includes(' ')) raw = raw.split(' ')[0];

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return raw;

    const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
      const [, dia, mes, ano] = brMatch;
      return `${ano}-${mes}-${dia}`;
    }
  }

  const dataLocal = new Date(data);
  if (isNaN(dataLocal.getTime())) return String(data);

  const ano = dataLocal.getFullYear();
  const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
  const dia = String(dataLocal.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export const formatarDataExibicao = (dataString) => {
  if (!dataString) return '';
  if (dataString instanceof Date) {
    const dia = String(dataString.getDate()).padStart(2, '0');
    const mes = String(dataString.getMonth() + 1).padStart(2, '0');
    const ano = dataString.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
  if (typeof dataString === 'string') {
    let dataParaFormatar = dataString;
    if (dataString.includes('T')) {
      dataParaFormatar = dataString.split('T')[0];
    }
    if (dataParaFormatar.includes('-')) {
      const partes = dataParaFormatar.split('-');
      if (partes.length >= 3) {
        const [ano, mes, dia] = partes;
        return `${dia}/${mes}/${ano}`;
      }
    }
    try {
      const data = new Date(dataString);
      if (!isNaN(data.getTime())) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
      }
    } catch {
      return dataString;
    }
  }
  return dataString;
};

export const formatarHorarioBrasil = (horario) => {
  if (!horario) return '';
  
  if (typeof horario !== 'string') {
    horario = String(horario);
  }
  
  const matchAMPM = horario.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (matchAMPM) {
    let horas = parseInt(matchAMPM[1], 10);
    const minutos = matchAMPM[2];
    const periodo = matchAMPM[4].toUpperCase();
    if (periodo === 'PM' && horas !== 12) {
      horas += 12;
    } else if (periodo === 'AM' && horas === 12) {
      horas = 0;
    }
    return `${String(horas).padStart(2, '0')}:${minutos}`;
  }
  
  const matchComSegundos = horario.match(/^(\d{1,2}):(\d{2}):(\d{2})/);
  if (matchComSegundos) {
    const horas = matchComSegundos[1];
    const minutos = matchComSegundos[2];
    return `${String(parseInt(horas, 10)).padStart(2, '0')}:${minutos}`;
  }
  
  const matchHHMM = horario.match(/^(\d{1,2}):(\d{2})/);
  if (matchHHMM) {
    const horas = String(parseInt(matchHHMM[1], 10)).padStart(2, '0');
    const minutos = matchHHMM[2];
    return `${horas}:${minutos}`;
  }
  
  return horario;
};
