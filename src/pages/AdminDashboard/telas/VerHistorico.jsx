import { Input, Table, TableWrapper, Td, Th } from '../style';

const VerHistorico = ({
  show,
  reservas,
  searchHistory,
  setSearchHistory,
  formatarDataExibicao,
  formatarHorarioBrasil
}) => {
  if (!show) return null;

  return (
    <TableWrapper>
      <div style={{ marginBottom: '20px', padding: '0 20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Histórico de Consultas</h3>
        <Input
          type="text"
          placeholder="Pesquisar por nome, email ou telefone..."
          value={searchHistory}
          onChange={(e) => setSearchHistory(e.target.value)}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Nome</Th>
            <Th>Email</Th>
            <Th>Telefone</Th>
            <Th>Dia</Th>
            <Th>Horário</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {reservas
            .filter((reserva) => {
              if (!reserva.dia) return false;

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

              if (dataReserva >= hoje) return false;

              if (searchHistory) {
                const query = searchHistory.toLowerCase();
                const nomeCompleto = `${reserva.nome || ''} ${reserva.sobrenome || ''}`.toLowerCase();
                return (
                  nomeCompleto.includes(query) ||
                  (reserva.email && reserva.email.toLowerCase().includes(query)) ||
                  (reserva.telefone && reserva.telefone.includes(query))
                );
              }
              return true;
            })
            .sort((a, b) => {
              const toDate = (value) => {
                if (!value) return new Date(0);
                const raw = String(value).includes('T') ? String(value).split('T')[0] : String(value);
                const parts = raw.split('-');
                if (parts.length >= 3) {
                  const [ano, mes, dia] = parts;
                  return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                }
                return new Date(raw);
              };

              return toDate(b.dia) - toDate(a.dia);
            })
            .map((reserva) => (
              <tr key={reserva.id}>
                <Td>
                  {reserva.nome} {reserva.sobrenome}
                </Td>
                <Td>{reserva.email}</Td>
                <Td>{reserva.telefone}</Td>
                <Td>{formatarDataExibicao(reserva.dia)}</Td>
                <Td>{formatarHorarioBrasil(reserva.horario)}</Td>
                <Td>{reserva.status}</Td>
              </tr>
            ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default VerHistorico;

