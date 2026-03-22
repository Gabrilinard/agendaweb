import { useEffect, useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { agendarService } from '../services/api';
import { formatarDataBrasil, formatarHorarioBrasil } from '../utils/formatters';

export const useAgendamento = (user, profissionalInfo, reservasProfissional, nomeProfissional, emailNotification) => {
  const { success, error: showError, warning } = useNotification();
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horario, setHorario] = useState('');
  const [horarioFinal, setHorarioFinal] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  
  // States for temporary reservations (multiple selection)
  const [reservasTemporarias, setReservasTemporarias] = useState([]);
  const [datasSelecionadas, setDatasSelecionadas] = useState([]);

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

  useEffect(() => {
    if (profissionalInfo && dataSelecionada) {
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const diaSemana = diasSemana[dataSelecionada.getDay()];
      
      let horariosDoDia = [];
      if (profissionalInfo.horariosAtendimento) {
        if (typeof profissionalInfo.horariosAtendimento === 'object' && !Array.isArray(profissionalInfo.horariosAtendimento)) {
          const horariosAtendimento = profissionalInfo.horariosAtendimento;
          const chaveExata = Object.keys(horariosAtendimento).find((k) => (
            normalizarDiaSemana(k) === normalizarDiaSemana(diaSemana)
          ));
          horariosDoDia = (chaveExata ? horariosAtendimento[chaveExata] : horariosAtendimento[diaSemana]) || [];
        }
      }

      const dataFormatada = formatarDataBrasil(dataSelecionada);
      
      const horariosDoDiaFormatados = (Array.isArray(horariosDoDia) ? horariosDoDia : [])
        .map((h) => formatarHorarioBrasil(h))
        .filter(Boolean);

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

  const isDateAvailable = (date) => {
    if (!profissionalInfo || !profissionalInfo.diasAtendimento) return true;
    
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemana = diasSemana[date.getDay()];
    
    if (Array.isArray(profissionalInfo.diasAtendimento)) {
        if (profissionalInfo.diasAtendimento.includes('Todos os dias')) return true;
        return profissionalInfo.diasAtendimento.some((d) => (
          normalizarDiaSemana(d) === normalizarDiaSemana(diaSemana)
        ));
    }
    return true;
  };

  const agendarConsulta = async (onSuccess) => {
    if (!user) return;
  
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
        horarioFinal,
        qntd_pessoa: 1, 
        usuario_id: user.id,
        nomeProfissional: nomeProfissional || null,
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

  const adicionarDiaReserva = (reservasExistentes) => {
    if (!dataSelecionada || !horario) {
      warning('Por favor, preencha todos os campos.');
      return;
    }
    const dataFormatada = formatarDataBrasil(dataSelecionada);
    
    const jaNaLista = reservasTemporarias.some(res => 
      res.dia === dataFormatada && res.horario === horario
    );

    if (jaNaLista) {
      warning('Você já adicionou este horário à lista.');
      return;
    }

    const jaReservado = reservasExistentes.some(res => {
      let dataReserva = res.dia;
      if (typeof res.dia === 'string' && res.dia.includes('T')) {
          dataReserva = res.dia.split('T')[0];
      }
      return dataReserva === dataFormatada && 
             formatarHorarioBrasil(res.horario) === formatarHorarioBrasil(horario) && 
             res.status !== 'cancelado' && 
             res.status !== 'recusado' &&
             res.status !== 'negado';
    });

    if (jaReservado) {
      warning('Você já possui um agendamento neste horário.');
      return;
    }

    if (dataFormatada && !datasSelecionadas.includes(dataFormatada)) {
      setDatasSelecionadas([...datasSelecionadas, dataFormatada]);
    }
    
    const novaReserva = {
      dia: dataFormatada,
      horario,
      horarioFinal,
    };
    setReservasTemporarias([...reservasTemporarias, novaReserva]);

    setDataSelecionada(new Date());
    setHorario('');
  };

  const enviarReservasEmLote = async (options = {}) => {
    const onSuccess = typeof options === 'function' ? options : options?.onSuccess;

    if (!user) {
      warning('Você precisa estar logado para fazer uma consulta.');
      return;
    }

    const reservasParaEnviar = reservasTemporarias.length > 0
      ? reservasTemporarias
      : (() => {
          if (!dataSelecionada || !horario) {
            showError('Por favor, preencha todos os campos corretamente.');
            return null;
          }

          const dataFormatada = formatarDataBrasil(dataSelecionada);
          return [{
            dia: dataFormatada,
            horario,
            horarioFinal: calcularHorarioFinal(horario)
          }];
        })();

    if (!reservasParaEnviar) return;

    try {
      const idsCriados = await Promise.all(reservasParaEnviar.map(async (reserva) => {
        const response = await agendarService.createReserva({
          nome: user.nome,
          sobrenome: user.sobrenome,
          email: user.email,
          telefone: user.telefone,
          dia: reserva.dia,
          horario: reserva.horario,
          horarioFinal: reserva.horarioFinal,
          qntd_pessoa: 1,
          usuario_id: user.id,
          nomeProfissional: nomeProfissional || null,
        });

        return response?.data?.id;
      }));

      setReservasTemporarias([]);
      setDatasSelecionadas([]);
      setDataSelecionada(new Date());
      setHorario('');

      setSolicitCount((prevCount) => prevCount + 1);
      success('Solicitação Enviada!');

      if (onSuccess) {
        onSuccess({ reservaIds: idsCriados.filter(Boolean) });
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
    isDateAvailable,
    agendarConsulta,
    adicionarDiaReserva,
    enviarReservasEmLote,
    reservasTemporarias,
    datasSelecionadas
  };
};
