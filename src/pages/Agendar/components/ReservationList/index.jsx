import React from 'react';
import { CalendarDays } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import {
  ContainerEdicao,
  DatePickerWrapper,
  Select,
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
    horariosDisponiveis,
  } = actions;

  const isEditing = reservaEditando?.id === reserva.id;
  const status = getStatus(reserva.status);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/minhas-consultas')}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderRadius: '10px',
        border: '1px solid #F0EFE9', background: 'white',
        flexWrap: 'wrap', gap: '10px', fontFamily: 'Figtree, sans-serif',
        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#FAFAF7'; e.currentTarget.style.borderColor = '#DDD8D0'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#F0EFE9'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CalendarDays size={18} color="#888" />
        <span style={{ fontSize: '14px', color: '#1a1a1a' }}>
          <strong>{formatarDataExibicao(reserva.dia)}</strong>
          {' às '}
          {formatarHorarioBrasil(reserva.horario)}
        </span>
      </div>

      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{
          background: status.bg, color: status.color,
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '12px', fontWeight: '600',
        }}>
          {status.label}
        </span>

        {Number(reserva.is_urgente) === 1 && (
          <span style={{
            background: '#FFF0E6', color: '#C2410C',
            borderRadius: '20px', padding: '4px 12px',
            fontSize: '12px', fontWeight: '600',
          }}>
            ⚡ Urgente
          </span>
        )}

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
        <ContainerEdicao onClick={e => e.stopPropagation()} style={{ width: '100%', marginTop: '10px' }}>
          <Label>Data:</Label>
          <DatePickerWrapper>
            <DatePicker
              selected={novaData}
              onChange={(date) => date && setNovaData(date)}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              showPopperArrow={false}
              required
            />
          </DatePickerWrapper>
          <Label>Horário:</Label>
          <Select
            value={novoHorario || ''}
            onChange={(e) => setNovoHorario(e.target.value)}
            disabled={!horariosDisponiveis || horariosDisponiveis.length === 0}
          >
            {!horariosDisponiveis || horariosDisponiveis.length === 0 ? (
              <option value="">Nenhum horário disponível neste dia</option>
            ) : (
              <>
                <option value="">Selecione um horário</option>
                {horariosDisponiveis.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </>
            )}
          </Select>
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
