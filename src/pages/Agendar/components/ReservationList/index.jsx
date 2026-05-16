import React from 'react';
import { ptBR } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import {
  ContainerEdicao,
  DatePickerWrapper,
  Input,
  Label,
  Button,
} from '../../style';
import { formatarDataExibicao, formatarHorarioBrasil } from '../../utils/formatters';

const STATUS_CONFIG = {
  confirmado:                    { label: 'Confirmado',            bg: '#D1FAE5', color: '#065F46' },
  negado:                        { label: 'Negado',                bg: '#FEE2E2', color: '#991B1B' },
  aguardando_confirmacao_paciente: { label: 'Alteração solicitada', bg: '#DBEAFE', color: '#1D4ED8' },
};

const getStatus = (status) =>
  STATUS_CONFIG[status] || { label: 'Aguardando', bg: '#FEF3C7', color: '#92400E' };

const ReservationItem = ({ reserva, actions }) => {
  const {
    handleEditar,
    handleSalvarEdicao,
    confirmarAlteracao,
    desistirReserva,
    reservaEditando,
    novaData,
    setNovaData,
    novoHorario,
    setNovoHorario,
  } = actions;

  const isEditing = reservaEditando?.id === reserva.id;
  const status = getStatus(reserva.status);

  const handleHorarioChange = (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 2) setNovoHorario(valor);
    else if (valor.length <= 4) setNovoHorario(valor.slice(0, 2) + ':' + valor.slice(2));
    else setNovoHorario(valor.slice(0, 2) + ':' + valor.slice(2, 4));
  };

  const handleHorarioBlur = (e) => {
    let valor = e.target.value;
    if (!valor) return;
    if (valor.includes(' ')) {
      const [horaMinuto, periodo] = valor.split(' ');
      const [hora, minuto] = horaMinuto.split(':');
      let h = parseInt(hora, 10);
      if (periodo?.toUpperCase() === 'PM' && h !== 12) h += 12;
      if (periodo?.toUpperCase() === 'AM' && h === 12) h = 0;
      valor = `${String(h).padStart(2, '0')}:${minuto || '00'}`;
    }
    try {
      const fmt = formatarHorarioBrasil(valor);
      if (fmt?.match(/^\d{2}:\d{2}$/)) {
        const [h, m] = fmt.split(':');
        if (+h >= 0 && +h <= 23 && +m >= 0 && +m <= 59) setNovoHorario(fmt);
      }
    } catch {}
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderRadius: '10px',
      border: '1px solid #F0EFE9', background: 'white',
      flexWrap: 'wrap', gap: '10px', fontFamily: 'Figtree, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', color: '#888' }}>📅</span>
        <span style={{ fontSize: '14px', color: '#1a1a1a' }}>
          <strong>{formatarDataExibicao(reserva.dia)}</strong>
          {' às '}
          {formatarHorarioBrasil(reserva.horario)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{
          background: status.bg, color: status.color,
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '12px', fontWeight: '600',
        }}>
          {status.label}
        </span>

        {reserva.status === 'aguardando_confirmacao_paciente' && (
          <>
            <button
              onClick={() => confirmarAlteracao(reserva)}
              style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: '#D1FAE5', color: '#065F46', border: 'none' }}
            >
              Confirmar
            </button>
            <button
              onClick={() => desistirReserva(reserva)}
              style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: '#FEE2E2', color: '#991B1B', border: 'none' }}
            >
              Recusar
            </button>
          </>
        )}

        {reserva.status !== 'confirmado' && (
          <>
            <button
              onClick={() => handleEditar(reserva)}
              style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: '#F7F7F4', color: '#555', border: '1px solid #E0DFD9' }}
            >
              Editar
            </button>
            <button
              onClick={() => desistirReserva(reserva)}
              style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: '#FEF2F2', color: '#dc3545', border: '1px solid #FECACA' }}
            >
              Cancelar
            </button>
          </>
        )}

        {reserva.status === 'negado' && reserva.motivoNegacao && (
          <span style={{ fontSize: '12px', color: '#888' }}>
            Motivo: {reserva.motivoNegacao}
          </span>
        )}
      </div>

      {isEditing && novaData && (
        <ContainerEdicao style={{ width: '100%', marginTop: '10px' }}>
          <Label>Data:</Label>
          <DatePickerWrapper>
            <DatePicker
              selected={novaData}
              onChange={(date) => date && setNovaData(date)}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              showPopperArrow={false}
              required
            />
          </DatePickerWrapper>
          <Label>Horário:</Label>
          <Input
            type="text"
            placeholder="HH:MM (ex: 14:30)"
            value={novoHorario || ''}
            onChange={handleHorarioChange}
            onBlur={handleHorarioBlur}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <Button onClick={handleSalvarEdicao} style={{ backgroundColor: '#4CAF50', color: 'white' }}>
              Salvar
            </Button>
            <Button onClick={() => actions.setReservaEditando(null)} style={{ backgroundColor: '#f44336', color: 'white' }}>
              Cancelar
            </Button>
          </div>
        </ContainerEdicao>
      )}
    </div>
  );
};

const PAGE_SIZE = 5;

const ReservationList = ({ reservas, actions, nomeProfissional }) => {
  const [visiveis, setVisiveis] = React.useState(PAGE_SIZE);
  const primeiroNome = nomeProfissional ? nomeProfissional.split(' ')[0] : '';

  if (!reservas || reservas.length === 0) return null;

  const reservasOrdenadas = [...reservas].sort((a, b) => {
    const d = a.dia.localeCompare(b.dia);
    return d !== 0 ? d : a.horario.localeCompare(b.horario);
  });

  const exibidas = reservasOrdenadas.slice(0, visiveis);
  const temMais = visiveis < reservasOrdenadas.length;

  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      padding: '24px 28px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      fontFamily: 'Figtree, sans-serif',
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 16px' }}>
        Suas consultas{primeiroNome ? ` com ${primeiroNome}` : ''}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {exibidas.map(reserva => (
          <ReservationItem key={reserva.id} reserva={reserva} actions={actions} />
        ))}
      </div>
      {temMais && (
        <button
          onClick={() => setVisiveis(v => v + PAGE_SIZE)}
          style={{
            marginTop: '14px', width: '100%', padding: '10px',
            background: 'none', border: '1.5px solid #E0DFD9',
            borderRadius: '8px', fontSize: '13px', fontWeight: '500',
            color: '#555', cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
          }}
        >
          Ver mais ({reservasOrdenadas.length - visiveis} restantes)
        </button>
      )}
    </div>
  );
};

export default ReservationList;
