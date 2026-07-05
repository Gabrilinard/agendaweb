import { getCandidatos, notificarVaga } from '../api';
import { AlertCircle, Bell, Calendar, Check, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const PagePad = styled.div`
  padding: 28px 32px;
  font-family: Figtree, sans-serif;
  @media (max-width: 768px) { padding: 20px 16px; }
`;

const SlotHeader = styled.div`
  padding: 18px 24px 16px;
  border-bottom: 1px solid #F0EFE9;
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

const CandidatoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: ${({ $urgent }) => $urgent ? '#FFF7F0' : '#F7F7F4'};
  border: 1px solid ${({ $urgent }) => $urgent ? '#FED7B0' : '#E8E8E2'};
  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };

const VerVagas = ({ reservas, formatarDataExibicao, formatarHorarioBrasil, user, success, showError, buscarReservas }) => {
  const [candidatos, setCandidatos] = useState({});   // { reservaId: [...candidatos] }
  const [loadingCandidatos, setLoadingCandidatos] = useState({});
  const [notificando, setNotificando] = useState({});  // { candidatoKey: true }
  const [notificados, setNotificados] = useState({});  // { candidatoKey: true } — já notificados nesta sessão

  const vagas = reservas.filter(r => r.status === 'liberado');

  const carregarCandidatos = async (reserva) => {
    if (candidatos[reserva.id]) return;
    setLoadingCandidatos(p => ({ ...p, [reserva.id]: true }));
    try {
      const dia = String(reserva.dia).split('T')[0];
      const { data } = await getCandidatos(reserva.profissional_id || user?.id, dia, reserva.usuario_id);
      setCandidatos(p => ({ ...p, [reserva.id]: data }));
    } catch {
      showError('Erro ao carregar candidatos.');
    } finally {
      setLoadingCandidatos(p => ({ ...p, [reserva.id]: false }));
    }
  };

  useEffect(() => {
    vagas.forEach(v => {
      if (!candidatos[v.id]) carregarCandidatos(v);
    });
  }, [vagas.map(v => v.id).join(',')]);

  const notificarCandidato = async (reserva, candidato) => {
    const key = `${reserva.id}_${candidato.usuario_id}`;
    setNotificando(p => ({ ...p, [key]: true }));
    const dia = String(reserva.dia).split('T')[0];
    try {
      await notificarVaga({
        profissional_id: reserva.profissional_id || user.id,
        reserva_liberada_id: reserva.id,
        dia,
        horario: reserva.horario,
        horarioFinal: reserva.horarioFinal,
        usuario_notificado_id: candidato.usuario_id,
        reserva_candidato_id: candidato.reserva_id,
      });
      setNotificados(p => ({ ...p, [key]: true }));
      success(`Notificação enviada para ${candidato.nome} ${candidato.sobrenome}!`);
    } catch {
      showError('Erro ao enviar notificação.');
    } finally {
      setNotificando(p => ({ ...p, [key]: false }));
    }
  };

  if (vagas.length === 0) {
    return (
      <PagePad>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Vagas liberadas</h1>
          <p style={{ color: '#888', fontSize: '14px', margin: '6px 0 0' }}>Horários liberados por pacientes para redistribuição.</p>
        </div>
        <div style={{ ...CARD, padding: '64px', textAlign: 'center', color: '#888' }}>
          <Check size={32} color="#bbb" style={{ display: 'block', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Nenhuma vaga liberada no momento</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>Quando um paciente liberar um horário, aparecerá aqui.</p>
        </div>
      </PagePad>
    );
  }

  return (
    <PagePad>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Vagas liberadas</h1>
        <p style={{ color: '#888', fontSize: '14px', margin: '6px 0 0' }}>
          {vagas.length} vaga{vagas.length !== 1 ? 's' : ''} disponível{vagas.length !== 1 ? 'eis' : ''} — notifique um candidato para preencher.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {vagas.map(reserva => {
          const dia = String(reserva.dia).split('T')[0];
          const lista = candidatos[reserva.id] || [];
          const loading = loadingCandidatos[reserva.id];

          return (
            <div key={reserva.id} style={CARD}>
              {/* Slot header */}
              <SlotHeader>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={22} color="#92400E" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                    {formatarDataExibicao(dia)}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} />
                    {formatarHorarioBrasil(reserva.horario)}{reserva.horarioFinal ? ` – ${formatarHorarioBrasil(reserva.horarioFinal)}` : ''}
                    &nbsp;·&nbsp;
                    Liberado por: <strong style={{ color: '#555' }}>{reserva.nome} {reserva.sobrenome}</strong>
                  </p>
                </div>
                <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: '700' }}>
                  Disponível
                </span>
              </SlotHeader>

              {/* Candidates */}
              <div style={{ padding: '16px 24px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Candidatos sugeridos
                </p>

                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Carregando candidatos…</div>
                ) : lista.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                    Nenhum candidato disponível para esta vaga.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {lista.map((c, idx) => {
                      const key = `${reserva.id}_${c.usuario_id}`;
                      const jaNotificado = notificados[key];
                      const enviando = notificando[key];

                      return (
                        <CandidatoRow key={c.usuario_id} $urgent={c.is_urgente}>
                          {/* Priority badge */}
                          <div style={{ flexShrink: 0 }}>
                            {c.is_urgente ? (
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={16} color="#E8611A" />
                              </div>
                            ) : (
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E8F5EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={16} color="#1B4D3E" />
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>
                                {idx + 1}. {c.nome} {c.sobrenome}
                              </span>
                              {c.is_urgente && (
                                <span style={{ background: '#E8611A', color: 'white', borderRadius: '10px', padding: '2px 7px', fontSize: '11px', fontWeight: '700' }}>
                                  Urgência
                                </span>
                              )}
                            </div>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.is_urgente
                                ? (c.descricao_urgencia || 'Consulta emergencial')
                                : `${formatarDataExibicao(String(c.dia).split('T')[0])} às ${formatarHorarioBrasil(c.horario)}`}
                            </p>
                          </div>

                          <button
                            onClick={() => notificarCandidato(reserva, c)}
                            disabled={jaNotificado || enviando}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '8px 16px', borderRadius: '8px', border: 'none',
                              background: jaNotificado ? '#D1FAE5' : '#1B4D3E',
                              color: jaNotificado ? '#065F46' : 'white',
                              fontSize: '13px', fontWeight: '600', cursor: jaNotificado || enviando ? 'default' : 'pointer',
                              fontFamily: 'Figtree, sans-serif', flexShrink: 0,
                              opacity: enviando ? 0.7 : 1,
                            }}
                          >
                            {jaNotificado ? <><Check size={13} /> Notificado</> : enviando ? 'Enviando…' : <><Bell size={13} /> Notificar</>}
                          </button>
                        </CandidatoRow>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PagePad>
  );
};

export default VerVagas;
