import axios from 'axios';
import { Button, Table, TableWrapper, Td, Th } from '../style';

const VerUrgencias = ({
  show,
  reservas,
  formatarDataExibicao,
  formatarHorarioBrasil,
  success,
  showError,
  buscarReservas,
  onEditarReserva,
  removerReserva
}) => {
  if (!show) return null;

  return (
    <TableWrapper>
      <h3 style={{ padding: '0 20px', color: '#d32f2f' }}>Solicitações de Urgência</h3>
      <Table>
        <thead>
          <tr>
            <Th>Nome</Th>
            <Th>Telefone</Th>
            <Th>Data</Th>
            <Th>Horário</Th>
            <Th>Descrição</Th>
            <Th>Arquivo</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {reservas
            .filter((reserva) => reserva.is_urgente)
            .map((reserva) => (
              <tr key={reserva.id}>
                <Td>
                  {reserva.nome} {reserva.sobrenome}
                </Td>
                <Td>{reserva.telefone}</Td>
                <Td>{formatarDataExibicao(reserva.dia)}</Td>
                <Td>{formatarHorarioBrasil(reserva.horario)}</Td>
                <Td>{reserva.descricao_urgencia}</Td>
                <Td>
                  {reserva.arquivo_urgencia ? (
                    <a href={`http://localhost:3000${reserva.arquivo_urgencia}`} target="_blank" rel="noopener noreferrer">
                      Ver Arquivo
                    </a>
                  ) : (
                    'Sem arquivo'
                  )}
                </Td>
                <Td>
                  <Button
                    onClick={() => {
                      axios
                        .patch(`http://localhost:3000/reservas/${reserva.id}`, { is_urgente: false, status: 'confirmado' })
                        .then(() => {
                          success('Urgência atendida e convertida em consulta confirmada!');
                          buscarReservas();
                        })
                        .catch(() => showError('Erro ao processar urgência.'));
                    }}
                    style={{ background: 'green', color: 'white' }}
                  >
                    Aceitar
                  </Button>
                  <Button onClick={() => onEditarReserva(reserva)} style={{ background: 'blue', color: 'white' }}>
                    Editar
                  </Button>
                  <Button onClick={() => removerReserva(reserva.id)} style={{ background: 'red', color: 'white' }}>
                    Remover
                  </Button>
                </Td>
              </tr>
            ))}
          {reservas.filter((reserva) => reserva.is_urgente).length === 0 && (
            <tr>
              <Td colSpan="7" style={{ textAlign: 'center' }}>
                Nenhuma solicitação de urgência encontrada.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default VerUrgencias;

