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

  const parseConteudoFormulario = () => {
    const conteudo = formularioSelecionado?.conteudo;

    if (!conteudo) return null;

    if (typeof conteudo === 'string') {
      const texto = conteudo.trim();
      if (!texto) return null;
      try {
        return JSON.parse(texto);
      } catch {
        return texto;
      }
    }

    return conteudo;
  };

  const formatarTituloCampo = (chave) => {
    if (!chave) return '';
    const chaveLower = String(chave).trim().toLowerCase();
    const traducoesDiretas = {
      created_at: 'Criado em',
      createdat: 'Criado em',
      created: 'Criado em',
      updated_at: 'Atualizado em',
      updatedat: 'Atualizado em',
      updated: 'Atualizado em'
    };
    if (traducoesDiretas[chaveLower]) return traducoesDiretas[chaveLower];

    const texto = String(chave)
      .replace(/_/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .trim();

    const siglas = new Set(['cpf', 'rg', 'uf', 'sus', 'crm', 'cro', 'crn', 'crefito', 'crfa', 'id', 'cep']);
    return texto
      .split(/\s+/)
      .map((palavra) => {
        const p = palavra.toLowerCase();
        if (p === 'create' && palavra.length === 6) return 'Criado';
        if (p === 'created') return 'Criado';
        if (p === 'createdat') return 'Criado em';
        if (p === 'at') return 'em';
        if (p === 'update' && palavra.length === 6) return 'Atualizado';
        if (p === 'updated') return 'Atualizado';
        if (p === 'updatedat') return 'Atualizado em';
        if (siglas.has(p)) return p.toUpperCase();
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      })
      .join(' ');
  };

  const formatarValorCampo = (valor) => {
    if (valor === null || valor === undefined || valor === '') return '—';
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
    if (typeof valor === 'number') return String(valor);

    if (typeof valor === 'string') {
      const texto = valor.trim();
      const matchData = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (matchData) return `${matchData[3]}/${matchData[2]}/${matchData[1]}`;

      const matchDataHora = texto.match(/^(\d{4})-(\d{2})-(\d{2})T/);
      if (matchDataHora) return `${matchDataHora[3]}/${matchDataHora[2]}/${matchDataHora[1]}`;

      const matchHora = texto.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (matchHora) return `${String(parseInt(matchHora[1], 10)).padStart(2, '0')}:${matchHora[2]}`;

      return texto;
    }

    return String(valor);
  };

  const renderConteudo = (valor, path = 'root') => {
    if (valor === null || valor === undefined) {
      return <div style={{ color: '#666' }}>—</div>;
    }

    if (Array.isArray(valor)) {
      if (valor.length === 0) return <div style={{ color: '#666' }}>—</div>;

      const todosPrimitivos = valor.every((v) => v === null || v === undefined || ['string', 'number', 'boolean'].includes(typeof v));
      if (todosPrimitivos) {
        return (
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            {valor.map((item, idx) => (
              <li key={`${path}.item.${idx}`}>{formatarValorCampo(item)}</li>
            ))}
          </ul>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {valor.map((item, idx) => (
            <div
              key={`${path}.obj.${idx}`}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e6e6e6',
                borderRadius: '8px',
                padding: '12px'
              }}
            >
              {renderConteudo(item, `${path}.${idx}`)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof valor === 'object') {
      const entries = Object.entries(valor);
      if (entries.length === 0) return <div style={{ color: '#666' }}>—</div>;

      const chaves = entries.map(([k]) => k).sort((a, b) => a.localeCompare(b, 'pt-BR'));

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chaves.map((k) => {
            const v = valor[k];
            const ehEstruturado = v && (typeof v === 'object' || Array.isArray(v));

            if (!ehEstruturado) {
              return (
                <div
                  key={`${path}.${k}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr',
                    gap: '10px',
                    alignItems: 'start'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#333' }}>{formatarTituloCampo(k)}</div>
                  <div style={{ color: '#333' }}>{formatarValorCampo(v)}</div>
                </div>
              );
            }

            return (
              <div key={`${path}.${k}`}>
                <div style={{ fontWeight: 800, color: '#333', marginBottom: '8px' }}>{formatarTituloCampo(k)}</div>
                <div
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                >
                  {renderConteudo(v, `${path}.${k}`)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return <div style={{ color: '#333' }}>{formatarValorCampo(valor)}</div>;
  };

  const conteudoFormatado = parseConteudoFormulario();

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
            <div
              style={{
                marginTop: '12px',
                backgroundColor: '#fff',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}
            >
              {conteudoFormatado ? (
                renderConteudo(conteudoFormatado)
              ) : (
                <div style={{ color: '#666' }}>Nenhuma informação preenchida.</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VerSolicitacoes;
