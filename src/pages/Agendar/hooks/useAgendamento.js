import { useEffect, useRef, useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { parseDia } from '../../../utils/formatters';
import { agendarService } from '../services/api';
import { formatarDataBrasil, formatarHorarioBrasil } from '../utils/formatters';

export const useAgendamento = (user, profissionalInfo, reservasProfissional, nomeProfissional, emailNotification, sugestaoInicial) => {
  const { success, error: showError, warning } = useNotification();
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const sugerida = sugestaoInicial?.dia ? parseDia(sugestaoInicial.dia) : null;
    return sugerida && !isNaN(sugerida.getTime()) ? sugerida : new Date();
  });
  const [horario, setHorario] = useState(sugestaoInicial?.horario || '');
  const [horarioFinal, setHorarioFinal] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState(sugestaoInicial?.modalidade || '');

  const { setSolicitCount } = emailNotification;

  const normalizarDiaSemana = (dia) => {
    if (!dia) return '';
    return String(dia)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/-?feira/g, '')
      .replace(/\s+/g, '')
      .trim();
  };

  const normalizarDataISO = (data) => {
    if (!data) return '';

    if (data instanceof Date) {
      return formatarDataBrasil(data);
    }

    let raw = String(data).trim();
    if (raw.includes('T')) raw = raw.split('T')[0];
    if (raw.includes(' ')) raw = raw.split(' ')[0];

    if (raw.includes('/')) {
      const partes = raw.split('/');
      if (partes.length === 3) {
        const [dia, mes, ano] = partes;
        if (dia && mes && ano) {
          return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        }
      }
    }

    return raw;
  };

  const getValorModalidade = (key) => {
    if (!profissionalInfo || !key) return '';
    if (key === 'presencial') return profissionalInfo.valorPresencial || profissionalInfo.valorConsulta || '';
    if (key === 'online') return profissionalInfo.valorOnline || profissionalInfo.valorConsulta || '';
    if (key === 'domiciliar') return profissionalInfo.valorDomiciliar || profissionalInfo.valorConsulta || '';
    return '';
  };

  const calcularHorarioFinal = (horario) => {
    if (!horario) return '';
    const [hora, minuto] = horario.split(':').map(Number);
    const novaHora = (hora + 1) % 24;
    return `${novaHora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (horario) {
      setHorarioFinal(calcularHorarioFinal(horario));
    }
  }, [horario]);

  const isHorarioPassado = (hFormatado, data) => {
    const agora = new Date();
    if (formatarDataBrasil(data) !== formatarDataBrasil(agora)) return false;
    const [h, m] = hFormatado.split(':').map(Number);
    const horarioDate = new Date(agora);
    horarioDate.setHours(h || 0, m || 0, 0, 0);
    return horarioDate.getTime() <= agora.getTime();
  };

  const getHorariosDoDiaFormatados = (date) => {
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemana = diasSemana[date.getDay()];

    let horariosDoDia = [];
    if (profissionalInfo?.horariosAtendimento) {
      if (typeof profissionalInfo.horariosAtendimento === 'object' && !Array.isArray(profissionalInfo.horariosAtendimento)) {
        const horariosAtendimento = profissionalInfo.horariosAtendimento;
        const chaveExata = Object.keys(horariosAtendimento).find((k) => (
          normalizarDiaSemana(k) === normalizarDiaSemana(diaSemana)
        ));
        horariosDoDia = (chaveExata ? horariosAtendimento[chaveExata] : horariosAtendimento[diaSemana]) || [];
      }
    }

    return (Array.isArray(horariosDoDia) ? horariosDoDia : [])
      .map((h) => formatarHorarioBrasil(h))
      .filter(Boolean)
      .filter((hFormatado) => !isHorarioPassado(hFormatado, date));
  };

  useEffect(() => {
    if (profissionalInfo && dataSelecionada) {
      const horariosDoDiaFormatados = getHorariosDoDiaFormatados(dataSelecionada);
      const dataFormatada = formatarDataBrasil(dataSelecionada);

      const horariosLivres = horariosDoDiaFormatados.filter((hFormatado) => {
        const ocupado = (Array.isArray(reservasProfissional) ? reservasProfissional : []).some((reserva) => {
          const dataReserva = normalizarDataISO(reserva?.dia);
          const horarioReserva = formatarHorarioBrasil(reserva?.horario);
          return dataReserva === dataFormatada &&
            horarioReserva === hFormatado &&
            reserva?.status !== 'cancelado' &&
            reserva?.status !== 'recusado';
        });
        return !ocupado;
      });

      setHorariosDisponiveis(horariosLivres);

      if (horario && !horariosLivres.includes(horario)) {
          setHorario('');
      }
    }
  }, [dataSelecionada, profissionalInfo, reservasProfissional]);

  const diaNaAgendaDoProfissional = (date) => {
    if (!profissionalInfo || !profissionalInfo.diasAtendimento) return true;

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemana = diasSemana[date.getDay()];

    return Array.isArray(profissionalInfo.diasAtendimento)
      ? profissionalInfo.diasAtendimento.includes('Todos os dias') ||
        profissionalInfo.diasAtendimento.some((d) => normalizarDiaSemana(d) === normalizarDiaSemana(diaSemana))
      : true;
  };

  const isDateAvailable = (date) => {
    if (!diaNaAgendaDoProfissional(date)) return false;

    // Se for hoje e todos os horários de hoje já passaram, o dia deixa de ser selecionável.
    const hoje = new Date();
    if (formatarDataBrasil(date) === formatarDataBrasil(hoje)) {
      return getHorariosDoDiaFormatados(date).length > 0;
    }

    return true;
  };

  const encontrarProximaDataDisponivel = (apartirDe) => {
    for (let i = 1; i <= 60; i++) {
      const candidata = new Date(apartirDe);
      candidata.setDate(candidata.getDate() + i);
      if (diaNaAgendaDoProfissional(candidata) && getHorariosDoDiaFormatados(candidata).length > 0) {
        return candidata;
      }
    }
    return null;
  };

  const ajusteInicialFeito = useRef(false);

  useEffect(() => {
    if (ajusteInicialFeito.current) return;
    if (sugestaoInicial?.dia) { ajusteInicialFeito.current = true; return; }
    if (!profissionalInfo) return;

    ajusteInicialFeito.current = true;

    const dataAtualTemHorario = isDateAvailable(dataSelecionada) && getHorariosDoDiaFormatados(dataSelecionada).length > 0;
    if (dataAtualTemHorario) return;

    const proximaData = encontrarProximaDataDisponivel(dataSelecionada);
    if (proximaData) setDataSelecionada(proximaData);
  }, [profissionalInfo]);

  const agendarConsulta = async (onSuccess) => {
    if (!user) return;
  
    if (!dataSelecionada || !horario) {
      showError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    if (!modalidadeSelecionada) {
      showError('Por favor, escolha a modalidade da consulta.');
      return;
    }

    const dataFormatada = formatarDataBrasil(dataSelecionada);

    try {
      const response = await agendarService.createReserva({
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        telefone: user.telefone,
        dia: dataFormatada,
        horario,
        horarioFinal,
        qntd_pessoa: 1,
        usuario_id: user.id,
        nomeProfissional: nomeProfissional || null,
        profissional_id: profissionalInfo?.id || null,
        modalidade: modalidadeSelecionada,
        valor: getValorModalidade(modalidadeSelecionada),
      });
  
      setDataSelecionada(new Date());
      setHorario('');
  
      setSolicitCount((prevCount) => prevCount + 1);
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Erro ao fazer consulta:', error);
      showError('Erro ao tentar fazer a consulta. Tente novamente.');
    }
  };

  const enviarReservasEmLote = async (options = {}) => {
    const onSuccess = typeof options === 'function' ? options : options?.onSuccess;

    if (!user) {
      warning('Você precisa estar logado para fazer uma consulta.');
      return;
    }

    if (!modalidadeSelecionada) {
      warning('Por favor, escolha a modalidade da consulta.');
      return;
    }

    if (!dataSelecionada || !horario) {
      showError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const dataFormatada = formatarDataBrasil(dataSelecionada);

    try {
      const response = await agendarService.createReserva({
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        telefone: user.telefone,
        dia: dataFormatada,
        horario,
        horarioFinal: calcularHorarioFinal(horario),
        qntd_pessoa: 1,
        usuario_id: user.id,
        nomeProfissional: nomeProfissional || null,
        profissional_id: profissionalInfo?.id || null,
        modalidade: modalidadeSelecionada,
        valor: getValorModalidade(modalidadeSelecionada),
      });

      setDataSelecionada(new Date());
      setHorario('');

      setSolicitCount((prevCount) => prevCount + 1);
      success('Solicitação Enviada!');

      if (onSuccess) {
        onSuccess({ reservaIds: [response?.data?.id].filter(Boolean) });
      }
    } catch (error) {
      console.error('Erro ao enviar reservas:', error);
      showError('Erro ao tentar enviar as consultas. Tente novamente.');
    }
  };

  return {
    dataSelecionada,
    setDataSelecionada,
    horario,
    setHorario,
    horariosDisponiveis,
    modalidadeSelecionada,
    setModalidadeSelecionada,
    getValorModalidade,
    isDateAvailable,
    agendarConsulta,
    enviarReservasEmLote,
  };
};
