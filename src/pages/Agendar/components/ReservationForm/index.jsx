import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatarHorarioBrasil } from '../../utils/formatters';

const calendarCSS = `
  .agendar-cal .react-datepicker {
    border: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    font-family: 'Figtree', sans-serif !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  .agendar-cal .react-datepicker__month-container {
    width: 100% !important;
    float: none !important;
  }
  .agendar-cal .react-datepicker__header {
    background: transparent !important;
    border-bottom: none !important;
    padding: 0 0 12px !important;
  }
  .agendar-cal .react-datepicker__current-month {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #1a1a1a !important;
  }
  .agendar-cal .react-datepicker__navigation {
    top: 0 !important;
  }
  .agendar-cal .react-datepicker__navigation-icon::before {
    border-color: #555 !important;
    border-width: 2px 2px 0 0 !important;
    width: 7px !important;
    height: 7px !important;
  }
  .agendar-cal .react-datepicker__day-names {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
    margin: 0 !important;
    border-bottom: 1px solid #F0EFE9 !important;
    padding-bottom: 8px !important;
  }
  .agendar-cal .react-datepicker__day-name {
    font-size: 11px !important;
    color: #999 !important;
    font-weight: 600 !important;
    text-align: center !important;
    width: auto !important;
    margin: 0 !important;
    text-transform: uppercase !important;
  }
  .agendar-cal .react-datepicker__month {
    margin: 0 !important;
  }
  .agendar-cal .react-datepicker__week {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
  }
  .agendar-cal .react-datepicker__day {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: auto !important;
    height: 52px !important;
    margin: 2px 0 !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    color: #333 !important;
    line-height: 1 !important;
  }
  .agendar-cal .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
    background-color: #F5F5F0 !important;
  }
  .agendar-cal .react-datepicker__day--today {
    border: 1.5px solid #333 !important;
    font-weight: 700 !important;
    background: transparent !important;
    color: #1a1a1a !important;
  }
  .agendar-cal .react-datepicker__day--selected,
  .agendar-cal .react-datepicker__day--selected:hover {
    background-color: #1a1a1a !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
  }
  .agendar-cal .react-datepicker__day--disabled {
    color: #ccc !important;
  }
  .agendar-cal .react-datepicker__day--outside-month {
    color: #e0e0e0 !important;
  }
  .agendar-cal .react-datepicker__day--keyboard-selected {
    background: transparent !important;
    color: #333 !important;
  }
`;

const ReservationForm = ({
  nomeProfissional,
  dataSelecionada,
  setDataSelecionada,
  horario,
  setHorario,
  horariosDisponiveis,
  isDateAvailable,
  adicionarDiaReserva,
  enviarReservas,
  reservasTemporarias,
  datasSelecionadas,
  onEmergencyClick,
}) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      fontFamily: 'Figtree, sans-serif',
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{calendarCSS}</style>

      {/* Header */}
      <div style={{
        padding: '24px 28px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px' }}>
            Agendar consulta
          </h2>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
            Escolha uma data e horário disponível
          </p>
        </div>
        <button
          onClick={onEmergencyClick}
          style={{
            background: '#E8611A', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '8px', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0,
            fontFamily: 'Figtree, sans-serif',
          }}
        >
          ⚡ Não pode esperar?
        </button>
      </div>

      {/* Calendário */}
      <div style={{ padding: '0 28px' }}>
        <div className="agendar-cal" style={{ width: '100%' }}>
          <DatePicker
            selected={dataSelecionada}
            onChange={(date) => setDataSelecionada(date)}
            minDate={new Date()}
            filterDate={isDateAvailable}
            dateFormat="dd/MM/yyyy"
            locale="pt-BR"
            inline
          />
        </div>
      </div>

      {/* Horários */}
      <div style={{ padding: '20px 28px 0' }}>
        <p style={{
          fontSize: '13px', fontWeight: '600', color: '#888',
          textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px',
        }}>
          Selecione uma data
        </p>

        {!dataSelecionada ? (
          <div style={{
            background: '#F5F5F0', borderRadius: '10px', padding: '20px',
            textAlign: 'center', color: '#888', fontSize: '14px',
          }}>
            Escolha uma data no calendário acima para ver os horários disponíveis.
          </div>
        ) : horariosDisponiveis.length === 0 ? (
          <div style={{
            background: '#FFF1F0', borderRadius: '10px', padding: '16px',
            textAlign: 'center', color: '#c0392b', fontSize: '14px',
          }}>
            Não há horários disponíveis para esta data.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {horariosDisponiveis.map((h, i) => {
              const fmt = formatarHorarioBrasil(h);
              const selected = horario === fmt;
              return (
                <button
                  key={i}
                  onClick={() => setHorario(fmt)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '500', cursor: 'pointer', border: '1.5px solid',
                    borderColor: selected ? '#1a1a1a' : '#E0DFD9',
                    background: selected ? '#1a1a1a' : 'white',
                    color: selected ? 'white' : '#333',
                    fontFamily: 'Figtree, sans-serif',
                  }}
                >
                  {fmt}
                </button>
              );
            })}
          </div>
        )}

        {/* Consultas selecionadas */}
        {datasSelecionadas && datasSelecionadas.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            {datasSelecionadas.map((data, index) => {
              const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
              return (
                <div key={index} style={{
                  background: '#F7F7F4', borderRadius: '8px', padding: '12px 14px', marginBottom: '8px',
                }}>
                  <p style={{ fontWeight: '600', fontSize: '13px', margin: '0 0 6px', color: '#1a1a1a' }}>
                    {dataFormatada}
                  </p>
                  {reservasTemporarias
                    .filter(r => r.dia === data)
                    .map((r, idx) => (
                      <span key={idx} style={{
                        background: '#D1FAE5', color: '#065F46', borderRadius: '6px',
                        padding: '2px 10px', fontSize: '13px', marginRight: '6px', fontWeight: '500',
                      }}>
                        {formatarHorarioBrasil(r.horario)}
                      </span>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #F0EFE9',
        margin: '20px 0 0',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: '#999', fontSize: '13px' }}>
          Selecione data e horário para continuar
        </span>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={adicionarDiaReserva}
            style={{
              padding: '9px 16px', borderRadius: '8px', fontSize: '13px',
              fontWeight: '500', cursor: 'pointer', background: 'white',
              border: '1.5px solid #E0DFD9', color: '#555',
              fontFamily: 'Figtree, sans-serif',
            }}
          >
            + Adicionar dia
          </button>
          <button
            onClick={enviarReservas}
            style={{
              padding: '9px 18px', borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer', background: '#1C5C40',
              border: 'none', color: 'white',
              fontFamily: 'Figtree, sans-serif',
            }}
          >
            Solicitar e preencher formulário →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
