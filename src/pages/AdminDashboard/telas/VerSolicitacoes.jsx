import { Button, Table, TableWrapper, Td, Th } from '../style';

const VerSolicitacoes = ({
  show,
  reservas,
  formatarDataExibicao,
  formatarHorarioBrasil,
  selecionarReservaParaFormulario,
  reservaSelecionada,
  formularioSelecionado,
  carregandoFormulario,
  erroFormulario,
  onFecharFormulario,
  toggleStatus,
  mostrarMotivo,
  setMostrarMotivo,
  motivo,
  setMotivo,
  negarReserva,
  onEditarReserva,
  removerReserva
}) => {
  if (!show) return null;

  return (
    <>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Email</Th>
              <Th>Telefone</Th>
              <Th>Dia</Th>
              <Th>Horário</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {reservas
              .filter((reserva) => {
                if (!reserva.dia) return false;
                if (reserva.is_urgente) return false;

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

                return dataReserva >= hoje;
              })
              .map((reserva) => (
                <tr
                  key={reserva.id}
                  onClick={() => selecionarReservaParaFormulario(reserva)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: reservaSelecionada?.id === reserva.id ? 'rgba(0,0,0,0.05)' : 'transparent'
                  }}
                >
                  <Td>
                    {reserva.nome} {reserva.sobrenome}
                  </Td>
                  <Td>{reserva.email}</Td>
                  <Td>{reserva.telefone}</Td>
                  <Td>{formatarDataExibicao(reserva.dia)}</Td>
                  <Td>{formatarHorarioBrasil(reserva.horario)}</Td>
                  <Td>{reserva.status}</Td>
                  <Td>
                    {reserva.status === 'confirmado' ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(reserva);
                        }}
                        style={{ background: 'orange', color: 'white' }}
                      >
                        Tirar Confirmação
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(reserva);
                        }}
                        style={{ background: 'green', color: 'white' }}
                      >
                        Confirmar
                      </Button>
                    )}

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMostrarMotivo(reserva.id);
                      }}
                      style={{ backgroundColor: 'red', color: 'white' }}
                    >
                      Negar
                    </Button>

                    {mostrarMotivo === reserva.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ marginTop: '8px' }}
                      >
                        <input
                          type="text"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          placeholder="Digite o motivo da negação"
                          style={{
                            padding: '8px',
                            width: '300px',
                            margin: '10px 0',
                            display: 'block'
                          }}
                        />
                        <div style={{ marginTop: '10px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              negarReserva(reserva);
                            }}
                            style={{
                              backgroundColor: 'green',
                              color: 'white',
                              marginRight: '10px'
                            }}
                          >
                            Confirmar Negação
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMostrarMotivo(null);
                            }}
                            style={{
                              backgroundColor: 'gray',
                              color: 'white'
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditarReserva(reserva);
                      }}
                      style={{ background: 'blue', color: 'white' }}
                    >
                      Editar
                    </Button>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        removerReserva(reserva.id);
                      }}
                      style={{ background: 'red', color: 'white' }}
                    >
                      Remover
                    </Button>
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </TableWrapper>

      {reservaSelecionada && (
        <div
          style={{
            marginTop: '16px',
            backgroundColor: '#f7f7f7',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <strong>Formulário</strong>
              <div style={{ fontSize: '14px', color: '#555' }}>
                {reservaSelecionada.nome} {reservaSelecionada.sobrenome} — {formatarDataExibicao(reservaSelecionada.dia)} às{' '}
                {formatarHorarioBrasil(reservaSelecionada.horario)}
              </div>
            </div>
            <Button onClick={onFecharFormulario} style={{ backgroundColor: '#6c757d', color: 'white' }}>
              Fechar
            </Button>
          </div>

          {carregandoFormulario && <div style={{ marginTop: '12px' }}>Carregando...</div>}
          {!carregandoFormulario && erroFormulario && <div style={{ marginTop: '12px', color: '#b71c1c' }}>{erroFormulario}</div>}
          {!carregandoFormulario && !erroFormulario && formularioSelecionado && (
            <pre
              style={{
                marginTop: '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
                maxHeight: '420px',
                overflow: 'auto'
              }}
            >
              {JSON.stringify(formularioSelecionado.conteudo, null, 2)}
            </pre>
          )}
        </div>
      )}
    </>
  );
};

export default VerSolicitacoes;

