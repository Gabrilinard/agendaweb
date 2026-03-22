import { DaysWrapper } from '../style';

const VerConsultas = ({ show, reservas, formatarDataExibicao, formatarHorarioBrasil }) => {
  if (!show) return null;

  const todasReservasConfirmadas = reservas.filter((r) => r && r.status === 'confirmado');

  if (todasReservasConfirmadas.length === 0) {
    return (
      <DaysWrapper>
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            fontSize: '18px',
            color: '#666',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            margin: '0 auto',
            gridColumn: '1 / -1'
          }}
        >
          Nenhuma Consulta Marcada
        </div>
      </DaysWrapper>
    );
  }

  const reservasPorDataConfirmadas = todasReservasConfirmadas.reduce((acc, reserva) => {
    if (!reserva.dia) return acc;

    let dataReserva;
    if (typeof reserva.dia === 'string') {
      let dataParaFormatar = reserva.dia;
      if (reserva.dia.includes('T')) {
        dataParaFormatar = reserva.dia.split('T')[0];
      }
      const partes = dataParaFormatar.split('-');
      if (partes.length === 3) {
        const [ano, mes, dia] = partes;
        dataReserva = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else {
        dataReserva = new Date(dataParaFormatar);
      }
    } else {
      dataReserva = new Date(reserva.dia);
    }

    dataReserva.setHours(0, 0, 0, 0);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataReserva >= hoje) {
      const dataKey = dataReserva.toISOString().split('T')[0];
      if (!acc[dataKey]) {
        acc[dataKey] = [];
      }
      acc[dataKey].push(reserva);
    }

    return acc;
  }, {});

  const datasComConsultas = Object.keys(reservasPorDataConfirmadas).sort((a, b) => a.localeCompare(b));

  return (
    <DaysWrapper>
      {datasComConsultas.map((dataKey) => {
        const reservasDoDia = reservasPorDataConfirmadas[dataKey].sort((a, b) => {
          const horarioA = a.horario || '00:00';
          const horarioB = b.horario || '00:00';
          return horarioA.localeCompare(horarioB);
        });

        return (
          <div
            key={dataKey}
            style={{
              backgroundColor: '#f1f1f1',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #ddd'
            }}
          >
            <h3
              style={{
                margin: '0 0 15px 0',
                color: '#333',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              {formatarDataExibicao(dataKey)}
            </h3>
            <div style={{ marginTop: '10px' }}>
              {reservasDoDia.map((reserva) => (
                <div
                  key={reserva.id}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    borderLeft: '3px solid #4caf50'
                  }}
                >
                  <strong>{formatarHorarioBrasil(reserva.horario)}</strong> - {reserva.nome} {reserva.sobrenome}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </DaysWrapper>
  );
};

export default VerConsultas;

