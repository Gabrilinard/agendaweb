import axios from 'axios';
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
    if (h >= 8 && h < 18) slots.push(`Hoje ${String(h).padStart(2, '0')}:${min}`);
  }
  slots.push('Amanhã 09:00');
  return slots.slice(0, 3);
};

const VerUrgencias = ({
  reservas, formatarDataExibicao, formatarHorarioBrasil,
  success, showError, buscarReservas, onEditarReserva, removerReserva,
}) => {
  const [now, setNow] = useState(new Date());
  const [selectedId, setSelectedId] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const urgencias = reservas.filter(r => {
    if (!r.is_urgente) return false;
    if (dismissed.has(r.id)) return false;
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

  // auto-select first if none selected
  useEffect(() => {
    if (!selectedId && urgencias.length > 0) setSelectedId(urgencias[0].id);
  }, [urgencias.length]);

  const aceitar = (r) => {
    setDismissed(prev => new Set([...prev, r.id]));
    setSelectedId(null);
    axios.patch(`http://localhost:3000/reservas/${r.id}`, { is_urgente: false, status: 'confirmado' })
      .then(() => { success('Urgência aceita e convertida em consulta confirmada!'); buscarReservas(); })
      .catch(() => {
        setDismissed(prev => { const s = new Set(prev); s.delete(r.id); return s; });
        showError('Erro ao processar urgência.');
      });
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
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>⚡</div>
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
                  style={{
                    ...CARD,
                    padding: '16px',
                    cursor: 'pointer',
                    border: `2px solid ${selected ? '#E8611A' : 'transparent'}`,
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ background: '#FFF3EE', color: '#E8611A', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Urgente
                    </span>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>URG-{r.id}</span>
                  </div>

                  {/* Patient row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>{fullName}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                        {r.email ? `· ${r.tipoProfissional || 'Clínica geral'}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {r.descricao_urgencia && (
                    <p style={{
                      margin: '0 0 10px',
                      fontSize: '13px', color: '#555', lineHeight: '1.5',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {r.descricao_urgencia}
                    </p>
                  )}

                  {/* Footer */}
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
              <div style={{
                padding: '20px 24px',
                background: '#FFFBF5',
                borderBottom: '1px solid #F0EFE9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                      <span style={{ background: '#FFF3EE', color: '#E8611A', borderRadius: '6px', padding: '3px 10px', fontSize: '12px', fontWeight: '700' }}>Urgente</span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#888' }}>
                      {detalhes.email || ''} · URG-{detalhes.id} · {formatElapsedMin(getElapsedSeconds(detalhes, now))}
                    </p>
                  </div>
                </div>
                {detalhes.telefone && (
                  <a href={`tel:${detalhes.telefone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: '1.5px solid #E0DFD9', borderRadius: '8px', textDecoration: 'none', color: '#333', fontSize: '13px', fontWeight: '600', background: 'white', flexShrink: 0 }}>
                    📞 Ligar
                  </a>
                )}
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
                {/* Descrição */}
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Descrição do paciente</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1a1a1a', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {detalhes.descricao_urgencia || 'Sem descrição'}
                  </p>
                </div>

                {/* Data/hora solicitada */}
                {detalhes.dia && (
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Data/horário preferido</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ background: '#F7F7F4', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#333', fontWeight: '500' }}>
                        📅 {formatarDataExibicao(detalhes.dia)}
                      </span>
                      {detalhes.horario && (
                        <span style={{ background: '#F7F7F4', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#333', fontWeight: '500' }}>
                          🕐 {formatarHorarioBrasil(detalhes.horario)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Contato */}
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Contato</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {detalhes.telefone && <span style={{ background: '#F7F7F4', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#333' }}>📞 {detalhes.telefone}</span>}
                    {detalhes.email && <span style={{ background: '#F7F7F4', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#333' }}>✉ {detalhes.email}</span>}
                  </div>
                </div>

                {/* Anexo */}
                {detalhes.arquivo_urgencia && (
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Anexos</p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a
                        href={`http://localhost:3000${detalhes.arquivo_urgencia}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: '1.5px solid #E0DFD9', borderRadius: '8px', textDecoration: 'none', color: '#333', fontSize: '13px', fontWeight: '500', background: 'white' }}
                      >
                        <span style={{ fontSize: '18px' }}>📄</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>Arquivo anexado</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>Clique para abrir</p>
                        </div>
                        <span style={{ marginLeft: '4px', color: '#888', fontSize: '14px' }}>↓</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Slots sugeridos */}
                <div style={{ background: '#E8F5EF', borderRadius: '10px', padding: '14px 18px', border: '1.5px dashed #9DD8CC' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#1B4D3E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✦ Slots sugeridos baseados na urgência
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {suggestedSlots.map((slot, i) => (
                      <button key={i} style={{ padding: '7px 14px', background: 'white', border: '1.5px solid #1B4D3E', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#1B4D3E', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
                {detalhes.telefone && (
                  <a href={`tel:${detalhes.telefone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: '1.5px solid #E0DFD9', borderRadius: '8px', textDecoration: 'none', color: '#333', fontSize: '13px', fontWeight: '600', background: 'white' }}>
                    📞 Mensagem
                  </a>
                )}
                <button onClick={() => onEditarReserva(detalhes)} style={{ padding: '10px 16px', background: 'none', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '13px', color: '#333', cursor: 'pointer', fontFamily: 'Figtree, sans-serif', fontWeight: '500' }}>
                  Solicitar mais info
                </button>
                <div style={{ flex: 1 }} />
                <button onClick={() => removerReserva(detalhes.id)} style={{ padding: '10px 16px', background: 'none', border: 'none', color: '#EF4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
                  Não posso atender
                </button>
                <button
                  onClick={() => aceitar(detalhes)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: '#E8611A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}
                >
                  ⚡ Aceitar urgência
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
