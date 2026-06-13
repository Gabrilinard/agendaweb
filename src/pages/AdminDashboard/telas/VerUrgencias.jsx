import { updateReserva } from '../api';
import { CalendarClock, CalendarDays, Clock, Download, Mail, MessageCircle, Smartphone, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };

const AVATAR_PALETTES = [
  { bg: '#FCDBB5', color: '#7A4100' },
  { bg: '#CCEDE8', color: '#1A5C54' },
  { bg: '#D6E8FF', color: '#1A3F6F' },
  { bg: '#F5D6FF', color: '#5C1A7A' },
  { bg: '#D6FFE8', color: '#1A5C35' },
  { bg: '#FFE0E0', color: '#7A1A1A' },
];
const getAv = (name = '') => {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length];
};
const getIn = (name = '') => {
  const p = name.trim().split(' ').filter(Boolean);
  if (!p.length) return '?';
  if (p.length === 1) return p[0][0].toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const getElapsedSeconds = (r, now) => {
  const created = r.created_at || r.createdAt;
  if (!created) return null;
  return Math.max(0, Math.floor((now - new Date(created)) / 1000));
};

const formatTimer = (secs) => {
  if (secs === null) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatElapsedMin = (secs) => {
  if (secs === null) return '';
  if (secs < 60) return 'há poucos segundos';
  const m = Math.floor(secs / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  return `há ${h}h${m % 60 > 0 ? ` ${m % 60}min` : ''}`;
};

const getSuggestedSlots = () => {
  const now = new Date();
  const slots = [];
  const nH = now.getHours() + Math.ceil(now.getMinutes() / 30) * 0.5 + 1;
  for (let i = 0; i < 2; i++) {
    const t = nH + i;
    const h = Math.floor(t);
    const min = t % 1 === 0.5 ? '30' : '00';
    if (h >= 8 && h < 18) {
      const today = new Date().toISOString().split('T')[0];
      slots.push({ label: `Hoje ${String(h).padStart(2, '0')}:${min}`, dia: today, horario: `${String(h).padStart(2, '0')}:${min}` });
    }
  }
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  slots.push({ label: 'Amanhã 09:00', dia: tomorrow.toISOString().split('T')[0], horario: '09:00' });
  return slots.slice(0, 3);
};

const toWhatsApp = (telefone) => {
  if (!telefone) return null;
  const digits = String(telefone).replace(/\D/g, '');
  const num = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${num}`;
};

const VerUrgencias = ({
  reservas, formatarDataExibicao, formatarHorarioBrasil,
  success, showError, buscarReservas, removerReserva,
}) => {
  const [now, setNow] = useState(new Date());
  const [selectedId, setSelectedId] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());
  const [showAjuste, setShowAjuste] = useState(false);
  const [ajusteDia, setAjusteDia] = useState('');
  const [ajusteHorario, setAjusteHorario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const urgencias = reservas.filter(r => {
    if (!r.is_urgente) return false;
    if (dismissed.has(r.id)) return false;
    if (r.status !== 'pendente') return false;
    if (r.dia) {
      const raw = String(r.dia).includes('T') ? String(r.dia).split('T')[0] : String(r.dia);
      const p = raw.split('-');
      const d = p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : new Date(raw);
      d.setHours(0, 0, 0, 0);
      if (d < hoje) return false;
    }
    return true;
  });
  const detalhes = urgencias.find(r => r.id === selectedId) || null;

  useEffect(() => {
    if (!selectedId && urgencias.length > 0) setSelectedId(urgencias[0].id);
  }, [urgencias.length]);

  useEffect(() => {
    setShowAjuste(false);
    setAjusteDia('');
    setAjusteHorario('');
  }, [selectedId]);

  const aceitar = (r) => {
    setDismissed(prev => new Set([...prev, r.id]));
    setSelectedId(null);
    updateReserva(r.id, { is_urgente: false, status: 'confirmado' })
      .then(() => { success('Urgência aceita e convertida em consulta confirmada!'); buscarReservas(); })
      .catch(() => {
        setDismissed(prev => { const s = new Set(prev); s.delete(r.id); return s; });
        showError('Erro ao processar urgência.');
      });
  };

  const proporHorario = async (r) => {
    if (!ajusteDia || !ajusteHorario) {
      showError('Preencha data e horário.');
      return;
    }
    const [hh, mm] = ajusteHorario.split(':').map(Number);
    const horarioFinal = `${String((hh + 1) % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    setEnviando(true);
    try {
      await updateReserva(r.id, {
        dia: ajusteDia,
        horario: ajusteHorario,
        horarioFinal,
        status: 'aguardando_confirmacao_paciente',
      });
      setDismissed(prev => new Set([...prev, r.id]));
      setSelectedId(null);
      success('Horário proposto enviado ao paciente!');
      buscarReservas();
    } catch {
      showError('Erro ao propor horário.');
    } finally {
      setEnviando(false);
    }
  };

  const usarSlot = (slot) => {
    setAjusteDia(slot.dia);
    setAjusteHorario(slot.horario);
    setShowAjuste(true);
  };

  const abrirOutroHorario = () => {
    setAjusteDia('');
    setAjusteHorario('');
    setShowAjuste(true);
  };

  const suggestedSlots = getSuggestedSlots();

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Figtree, sans-serif', minHeight: '100vh' }}>
      {urgencias.length === 0 ? (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Urgências</h1>
            <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0' }}>Nenhuma urgência ativa</p>
          </div>
          <div style={{ ...CARD, padding: '64px', textAlign: 'center', color: '#888' }}>
            <Zap size={36} color="#E8611A" style={{ marginBottom: '14px' }} />
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Sem urgências no momento</p>
            <p style={{ margin: '6px 0 0', fontSize: '13px' }}>Quando um paciente solicitar atendimento urgente, aparecerá aqui</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'stretch', height: 'calc(100vh - 100px)' }}>
          {/* Left list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', height: '100%', paddingBottom: '20px' }}>
            {urgencias.map(r => {
              const fullName = `${r.nome || ''} ${r.sobrenome || ''}`.trim();
              const av = getAv(fullName);
              const initials = getIn(fullName);
              const elapsed = getElapsedSeconds(r, now);
              const timer = formatTimer(elapsed);
              const selected = r.id === selectedId;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  style={{ ...CARD, padding: '16px', cursor: 'pointer', border: `2px solid ${selected ? '#E8611A' : 'transparent'}`, transition: 'border-color 0.15s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ background: '#FFF3EE', color: '#E8611A', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={10} /> Urgente
                    </span>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>URG-{r.id}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>{fullName}</p>
                    </div>
                  </div>

                  {r.descricao_urgencia && (
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#555', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {r.descricao_urgencia}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#aaa' }}>{formatElapsedMin(elapsed)}</span>
                    {timer && (
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#E8611A', fontVariantNumeric: 'tabular-nums' }}>
                        {timer}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right detail panel */}
          {detalhes ? (
            <div style={{ ...CARD, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
              {/* Patient header */}
              <div style={{ padding: '20px 24px', background: '#FFFBF5', borderBottom: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  {(() => {
                    const fn = `${detalhes.nome || ''} ${detalhes.sobrenome || ''}`.trim();
                    const av = getAv(fn);
                    return (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                        {getIn(fn)}
                      </div>
                    );
                  })()}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1a1a1a' }}>
                        {detalhes.nome} {detalhes.sobrenome}
                      </h2>
                      <span style={{ background: '#FFF3EE', color: '#E8611A', borderRadius: '6px', padding: '3px 10px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={11} /> Urgente
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#888' }}>
                      {detalhes.email || ''} · URG-{detalhes.id} · {formatElapsedMin(getElapsedSeconds(detalhes, now))}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
                {/* Descrição */}
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Descrição do paciente</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1a1a1a', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {detalhes.descricao_urgencia || 'Sem descrição'}
                  </p>
                </div>

                {/* Data/hora preferida */}
                {detalhes.dia && (
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Data/horário preferido</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ background: '#F7F7F4', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#333', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarDays size={13} color="#888" /> {formatarDataExibicao(detalhes.dia)}
                      </span>
                      {detalhes.horario && (
                        <span style={{ background: '#F7F7F4', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#333', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} color="#888" /> {formatarHorarioBrasil(detalhes.horario)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Contato */}
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Contato</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {detalhes.telefone && (
                      <span style={{ background: '#F7F7F4', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#333', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Smartphone size={13} color="#888" /> {detalhes.telefone}
                      </span>
                    )}
                    {detalhes.email && (
                      <span style={{ background: '#F7F7F4', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#333', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="#888" /> {detalhes.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Anexo */}
                {detalhes.arquivo_urgencia && (
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Anexos</p>
                    <a
                      href={`http://localhost:3000${detalhes.arquivo_urgencia}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: '1.5px solid #E0DFD9', borderRadius: '8px', textDecoration: 'none', color: '#333', fontSize: '13px', fontWeight: '500', background: 'white' }}
                    >
                      <Download size={16} color="#888" />
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>Arquivo anexado</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>Clique para abrir</p>
                      </div>
                    </a>
                  </div>
                )}

                {/* Propor horário */}
                <div style={{ background: '#E8F5EF', borderRadius: '10px', padding: '16px 18px', border: '1.5px dashed #9DD8CC' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#1B4D3E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarClock size={14} /> Propor horário ao paciente
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {suggestedSlots.map((slot, i) => {
                      const active = ajusteDia === slot.dia && ajusteHorario === slot.horario && showAjuste;
                      return (
                        <button
                          key={i}
                          onClick={() => usarSlot(slot)}
                          style={{
                            padding: '7px 14px',
                            background: active ? '#1B4D3E' : 'white',
                            color: active ? 'white' : '#1B4D3E',
                            border: '1.5px solid #1B4D3E',
                            borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                            cursor: 'pointer', fontFamily: 'Figtree, sans-serif', transition: 'all 0.12s',
                          }}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                    <button
                      onClick={abrirOutroHorario}
                      style={{ padding: '7px 14px', background: 'white', border: '1.5px solid #1B4D3E', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#1B4D3E', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}
                    >
                      Outro horário...
                    </button>
                  </div>

                  {showAjuste && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #9DD8CC' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#1B4D3E', display: 'block', marginBottom: '4px' }}>DATA</label>
                        <input
                          type="date"
                          value={ajusteDia}
                          onChange={e => setAjusteDia(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          style={{ padding: '8px 10px', borderRadius: '7px', border: '1.5px solid #9DD8CC', fontSize: '13px', fontFamily: 'Figtree, sans-serif', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#1B4D3E', display: 'block', marginBottom: '4px' }}>HORÁRIO</label>
                        <input
                          type="time"
                          value={ajusteHorario}
                          onChange={e => setAjusteHorario(e.target.value)}
                          style={{ padding: '8px 10px', borderRadius: '7px', border: '1.5px solid #9DD8CC', fontSize: '13px', fontFamily: 'Figtree, sans-serif', outline: 'none' }}
                        />
                      </div>
                      <button
                        onClick={() => proporHorario(detalhes)}
                        disabled={enviando || !ajusteDia || !ajusteHorario}
                        style={{
                          padding: '9px 18px', background: '#1B4D3E', color: 'white',
                          border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                          cursor: enviando || !ajusteDia || !ajusteHorario ? 'not-allowed' : 'pointer',
                          fontFamily: 'Figtree, sans-serif',
                          opacity: enviando || !ajusteDia || !ajusteHorario ? 0.6 : 1,
                        }}
                      >
                        {enviando ? 'Enviando...' : 'Propor ao paciente'}
                      </button>
                      <button
                        onClick={() => setShowAjuste(false)}
                        style={{ padding: '9px 14px', background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
                {detalhes.telefone && toWhatsApp(detalhes.telefone) && (
                  <a
                    href={toWhatsApp(detalhes.telefone)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: '1.5px solid #E0DFD9', borderRadius: '8px', textDecoration: 'none', color: '#333', fontSize: '13px', fontWeight: '600', background: 'white' }}
                  >
                    <MessageCircle size={15} /> Mensagem
                  </a>
                )}
                <div style={{ flex: 1 }} />
                <button onClick={() => removerReserva(detalhes.id)} style={{ padding: '10px 16px', background: 'none', border: 'none', color: '#EF4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
                  Não posso atender
                </button>
                <button
                  onClick={() => aceitar(detalhes)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: '#E8611A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}
                >
                  <Zap size={16} /> Aceitar urgência
                </button>
              </div>
            </div>
          ) : (
            <div style={{ ...CARD, padding: '48px', textAlign: 'center', color: '#888' }}>
              <p style={{ margin: 0 }}>Selecione uma urgência ao lado para ver os detalhes</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerUrgencias;
