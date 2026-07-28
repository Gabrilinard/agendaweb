import { useState } from 'react';
import { CalendarDays, CalendarPlus, CheckCircle, ClipboardList, MapPin, Zap } from 'lucide-react';
import styled from 'styled-components';
import NotificacoesBell from '../components/NotificacoesBell';

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  align-items: start;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AgendaTopBar = styled.div`
  padding: 22px 32px 16px;
  background: #F0EFE9;
  flex-shrink: 0;
  @media (max-width: 768px) {
    padding: 12px 16px 10px;
  }
`;

const AgendaTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const AgendaControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    gap: 6px;
    width: 100%;
  }
`;

const CalendarCard = styled.div`
  margin: 0 32px 24px;
  flex: 1;
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  @media (max-width: 768px) {
    display: none;
  }
`;

const CalendarInner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const MobileDayCard = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin: 0 12px 12px;
    background: white;
    border-radius: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    overflow: hidden;
    min-height: 0;
    height: 0;
  }
`;

const AgendaTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  @media (max-width: 768px) { font-size: 20px; }
`;

const AgendaSubtitle = styled.p`
  color: #888;
  font-size: 13px;
  margin: 4px 0 0;
  @media (max-width: 768px) { display: none; }
`;

const HomeWrap = styled.div`
  padding: 28px 32px;
  font-family: Figtree, sans-serif;
  @media (max-width: 768px) { padding: 20px 16px; }
`;

const ROW_HEIGHT = 56;
const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
// Usado só quando o profissional ainda não configurou nenhum horário de atendimento.
const FALLBACK_ROW_TIMES = Array.from({ length: 13 }, (_, i) => 7 + i);

const formatDecimalHour = (t) => {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const AVATAR_PALETTES = [
  { bg: '#FCDBB5', color: '#7A4100' },
  { bg: '#CCEDE8', color: '#1A5C54' },
  { bg: '#D6E8FF', color: '#1A3F6F' },
  { bg: '#F5D6FF', color: '#5C1A7A' },
  { bg: '#D6FFE8', color: '#1A5C35' },
  { bg: '#FFE8CC', color: '#7A4500' },
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

const getWeekStart = (offset = 0) => {
  const today = new Date();
  const dow = today.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
};
const getWeekDays = (start) =>
  Array.from({ length: 6 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });

const toDayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const parseH = (t) => {
  if (!t) return null;
  const m = String(t).match(/^(\d{1,2}):(\d{2})/);
  return m ? parseInt(m[1]) + parseInt(m[2]) / 60 : null;
};

const STATUS_COLORS = {
  confirmado: { bg: '#C8EDE5', color: '#1A5C54', border: '#9DD8CC' },
  pendente:   { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  negado:     { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  aguardando_confirmacao_paciente: { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' },
  liberado:   { bg: '#FFE8CC', color: '#92400E', border: '#FBD0A0' },
};
const STATUS_LABELS = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  negado: 'Negado',
  aguardando_confirmacao_paciente: 'Aguardando confirmação',
  liberado: 'Aguardando horário',
};
const getColor = (r) => STATUS_COLORS[r.status] || STATUS_COLORS.confirmado;

const DIAS_SEMANA_COMPLETO = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const normalizarDiaSemana = (d) => String(d || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/-?feira/g, '').replace(/\s+/g, '').trim();

// Horários (em hora decimal) configurados pelo profissional para o dia da semana de `date`.
const getHorariosDoDia = (horariosAtendimento, date) => {
  if (!horariosAtendimento || typeof horariosAtendimento !== 'object') return [];
  const diaSemana = DIAS_SEMANA_COMPLETO[date.getDay()];
  const chave = Object.keys(horariosAtendimento).find((k) => normalizarDiaSemana(k) === normalizarDiaSemana(diaSemana));
  const lista = chave ? horariosAtendimento[chave] : [];
  return (Array.isArray(lista) ? lista : []).map((h) => parseH(h)).filter((v) => v !== null).sort((a, b) => a - b);
};

// Linhas da agenda para os dias informados: união dos horários configurados pelo
// profissional (para cada dia da semana envolvido), mais qualquer horário de consulta
// que não esteja na grade dele (ex.: urgência encaixada) — para nada ficar escondido.
// Só cai no fallback de hora em hora se o profissional não tiver nada configurado.
const getRowTimes = (dates, horariosAtendimento, reservasExtras = []) => {
  const set = new Set();
  dates.forEach((d) => getHorariosDoDia(horariosAtendimento, d).forEach((h) => set.add(h)));
  reservasExtras.forEach((r) => {
    const t = parseH(r.horario);
    if (t !== null) set.add(t);
  });
  const rows = Array.from(set).sort((a, b) => a - b);
  return rows.length ? rows : FALLBACK_ROW_TIMES;
};

const RowAppt = ({ r, fmt }) => {
  const c = getColor(r);
  const isLiberado = r.status === 'liberado';
  return (
    <div style={{
      flex: 1, minWidth: 0, background: c.bg, borderLeft: `3px solid ${c.border}`, borderRadius: 6,
      padding: '4px 7px', overflow: 'hidden', cursor: 'pointer', boxSizing: 'border-box',
    }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: c.color, lineHeight: 1.2 }}>{fmt(r.horario)}</p>
      <p style={{ margin: 0, fontSize: 11, color: c.color, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {isLiberado ? STATUS_LABELS.liberado : `${r.nome} ${r.sobrenome ? r.sobrenome[0] + '.' : ''}`}
      </p>
    </div>
  );
};

const AgendaView = ({ reservas, formatarHorarioBrasil, irPara, horariosAtendimento, notificacoes, notificacoesCount, onAbrirNotificacoes }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState('semana');
  const [mobileDayOffset, setMobileDayOffset] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekStart = getWeekStart(weekOffset);
  const weekDays = getWeekDays(weekStart);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayKey = toDayKey(today);

  const selectedDay = new Date(); selectedDay.setDate(selectedDay.getDate() + dayOffset); selectedDay.setHours(0,0,0,0);
  const selectedDayKey = toDayKey(selectedDay);

  const monthViewDate = new Date(); monthViewDate.setDate(1); monthViewDate.setMonth(monthViewDate.getMonth() + monthOffset); monthViewDate.setHours(0,0,0,0);

  const handleNavPrev = () => {
    if (viewMode === 'dia') setDayOffset(d => d - 1);
    else if (viewMode === 'mês') setMonthOffset(m => m - 1);
    else setWeekOffset(w => w - 1);
  };
  const handleNavNext = () => {
    if (viewMode === 'dia') setDayOffset(d => d + 1);
    else if (viewMode === 'mês') setMonthOffset(m => m + 1);
    else setWeekOffset(w => w + 1);
  };

  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const firstDay = weekDays[0]; const lastDay = weekDays[5];
  const weekLabel = firstDay.getMonth() === lastDay.getMonth()
    ? `${months[firstDay.getMonth()]} ${firstDay.getFullYear()}`
    : `${months[firstDay.getMonth()]} – ${months[lastDay.getMonth()]} ${lastDay.getFullYear()}`;
  const navLabel = viewMode === 'dia'
    ? selectedDay.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\.$/, '')
    : viewMode === 'mês'
    ? `${months[monthViewDate.getMonth()]} ${monthViewDate.getFullYear()}`
    : weekLabel;

  const byDay = {};
  reservas.forEach(r => {
    if (!r.dia) return;
    if (r.status === 'transferido') return;
    const raw = String(r.dia).includes('T') ? String(r.dia).split('T')[0] : String(r.dia);
    if (!byDay[raw]) byDay[raw] = [];
    byDay[raw].push(r);
  });

  // Mobile day view
  const mobileDay = new Date();
  mobileDay.setDate(mobileDay.getDate() + mobileDayOffset);
  mobileDay.setHours(0, 0, 0, 0);
  const mobileDayKey = toDayKey(mobileDay);
  const mobileDayReservas = (byDay[mobileDayKey] || []).slice().sort((a, b) => (parseH(a.horario) || 0) - (parseH(b.horario) || 0));
  const mobileDayLabel = mobileDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#555', padding: '4px 10px', lineHeight: 1 };

  // Week strip for mobile
  const mobileWeekDays = (() => {
    const dow = mobileDay.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(mobileDay); mon.setDate(mobileDay.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  })();
  const DAY_INIT = ['D','S','T','Q','Q','S','S'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Figtree, sans-serif', background: '#F0EFE9' }}>
      <AgendaTopBar>
        <AgendaTopRow>
          <div>
            <AgendaTitle>Agenda da semana</AgendaTitle>
            <AgendaSubtitle>Visualize, mova e bloqueie horários — clique em um evento para detalhes</AgendaSubtitle>
          </div>
          <AgendaControls>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', borderRadius: '8px', padding: '4px', border: '1px solid #E0DFD9' }}>
              <button onClick={handleNavPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', fontSize: '14px', color: '#555', borderRadius: '6px' }}>‹</button>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', padding: '0 8px', minWidth: '130px', textAlign: 'center', textTransform: 'capitalize' }}>{navLabel}</span>
              <button onClick={handleNavNext} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', fontSize: '14px', color: '#555', borderRadius: '6px' }}>›</button>
            </div>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'white', borderRadius: '8px', border: '1px solid #E0DFD9', overflow: 'hidden' }}>
              {['Dia','Semana','Mês'].map(v => (
                <button key={v} onClick={() => setViewMode(v.toLowerCase())}
                  style={{ padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: viewMode === v.toLowerCase() ? '700' : '400', background: viewMode === v.toLowerCase() ? '#F0EFE9' : 'white', color: viewMode === v.toLowerCase() ? '#1a1a1a' : '#888', fontFamily: 'Figtree, sans-serif' }}>
                  {v}
                </button>
              ))}
            </div>
            {/* + Adicionar */}
            <button onClick={() => irPara('criar')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#1B4D3E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
              + Adicionar
            </button>
            <NotificacoesBell notificacoes={notificacoes} count={notificacoesCount} onAbrir={onAbrirNotificacoes} />
          </AgendaControls>
        </AgendaTopRow>
      </AgendaTopBar>

      {/* Calendar card */}
      <CalendarCard>
        <CalendarInner>

          {/* ── SEMANA ── */}
          {viewMode === 'semana' && <>
            <div style={{ display: 'flex', borderBottom: '1.5px solid #E8E8E2', flexShrink: 0 }}>
              <div style={{ width: 64, flexShrink: 0 }} />
              {weekDays.map((day, i) => {
                const key = toDayKey(day);
                const isToday = key === todayKey;
                const count = (byDay[key] || []).length;
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px 0 12px', borderLeft: '1px solid #F0EFE9', background: isToday ? '#F0F9F6' : 'transparent' }}>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: isToday ? '#1B4D3E' : '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{WEEK_LABELS[i]}</p>
                    <p style={{ margin: '3px 0 2px', fontSize: '22px', fontWeight: '700', color: isToday ? '#1B4D3E' : '#1a1a1a', lineHeight: 1 }}>{day.getDate()}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>{count > 0 ? `${count} consulta${count !== 1 ? 's' : ''}` : ''}</p>
                  </div>
                );
              })}
            </div>
            {(() => {
              const rows = getRowTimes(weekDays, horariosAtendimento, reservas);
              return (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', minHeight: 0 }}>
                  <div style={{ width: 64, flexShrink: 0, borderRight: '1px solid #F0EFE9' }}>
                    {rows.map(t => (
                      <div key={t} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, boxSizing: 'border-box', borderBottom: '1px solid #F5F5F0' }}>
                        <span style={{ fontSize: 11, color: '#bbb' }}>{formatDecimalHour(t)}</span>
                      </div>
                    ))}
                  </div>
                  {weekDays.map((day, i) => {
                    const key = toDayKey(day);
                    const isToday = key === todayKey;
                    const dayReservas = byDay[key] || [];
                    return (
                      <div key={i} style={{ flex: 1, borderLeft: '1px solid #F0EFE9', minWidth: 0, background: isToday ? '#FAFFFE' : 'white' }}>
                        {rows.map(t => {
                          const itens = dayReservas.filter(r => parseH(r.horario) === t);
                          return (
                            <div key={t} style={{ height: ROW_HEIGHT, borderBottom: '1px solid #F5F5F0', display: 'flex', alignItems: 'stretch', gap: 3, padding: 3, boxSizing: 'border-box' }}>
                              {itens.map(r => <RowAppt key={r.id} r={r} fmt={formatarHorarioBrasil} />)}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>}

          {/* ── DIA ── */}
          {viewMode === 'dia' && <>
            <div style={{ display: 'flex', borderBottom: '1.5px solid #E8E8E2', flexShrink: 0 }}>
              <div style={{ width: 64, flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'center', padding: '10px 0 12px', background: selectedDayKey === todayKey ? '#F0F9F6' : 'transparent' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: selectedDayKey === todayKey ? '#1B4D3E' : '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {selectedDay.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.','').toUpperCase()}
                </p>
                <p style={{ margin: '3px 0 2px', fontSize: '22px', fontWeight: '700', color: selectedDayKey === todayKey ? '#1B4D3E' : '#1a1a1a', lineHeight: 1 }}>{selectedDay.getDate()}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>
                  {(byDay[selectedDayKey] || []).length > 0 ? `${(byDay[selectedDayKey] || []).length} consulta${(byDay[selectedDayKey] || []).length !== 1 ? 's' : ''}` : ''}
                </p>
              </div>
            </div>
            {(() => {
              const dayReservas = byDay[selectedDayKey] || [];
              const rows = getRowTimes([selectedDay], horariosAtendimento, dayReservas);
              return (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', minHeight: 0 }}>
                  <div style={{ width: 64, flexShrink: 0, borderRight: '1px solid #F0EFE9' }}>
                    {rows.map(t => (
                      <div key={t} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, boxSizing: 'border-box', borderBottom: '1px solid #F5F5F0' }}>
                        <span style={{ fontSize: 11, color: '#bbb' }}>{formatDecimalHour(t)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, background: selectedDayKey === todayKey ? '#FAFFFE' : 'white' }}>
                    {rows.map(t => {
                      const itens = dayReservas.filter(r => parseH(r.horario) === t);
                      return (
                        <div key={t} style={{ height: ROW_HEIGHT, borderBottom: '1px solid #F5F5F0', display: 'flex', alignItems: 'stretch', gap: 3, padding: 3, boxSizing: 'border-box' }}>
                          {itens.map(r => <RowAppt key={r.id} r={r} fmt={formatarHorarioBrasil} />)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </>}

          {/* ── MÊS ── */}
          {viewMode === 'mês' && (() => {
            const yr = monthViewDate.getFullYear();
            const mo = monthViewDate.getMonth();
            const firstOfMonth = new Date(yr, mo, 1);
            const lastOfMonth = new Date(yr, mo + 1, 0);
            const dow = firstOfMonth.getDay();
            const startOffset = dow === 0 ? 6 : dow - 1;
            const cells = [];
            for (let i = 0; i < startOffset; i++) cells.push(null);
            for (let d = 1; d <= lastOfMonth.getDate(); d++) cells.push(d);
            while (cells.length % 7 !== 0) cells.push(null);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #F0EFE9', flexShrink: 0 }}>
                  {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (
                    <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', flex: 1 }}>
                  {cells.map((day, i) => {
                    if (!day) return <div key={i} style={{ borderBottom: '1px solid #F5F5F0', borderRight: '1px solid #F5F5F0', minHeight: 80 }} />;
                    const cellDate = new Date(yr, mo, day);
                    const cellKey = toDayKey(cellDate);
                    const isToday = cellKey === todayKey;
                    const cellReservas = byDay[cellKey] || [];
                    return (
                      <div key={i} onClick={() => { setDayOffset(Math.round((cellDate - today) / 86400000)); setViewMode('dia'); }}
                        style={{ padding: '6px 8px', borderBottom: '1px solid #F5F5F0', borderRight: '1px solid #F5F5F0', cursor: 'pointer', background: isToday ? '#F0F9F6' : 'white', minHeight: 80 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isToday ? '#1B4D3E' : 'transparent', color: isToday ? 'white' : '#1a1a1a', fontSize: '12px', fontWeight: isToday ? '700' : '400', marginBottom: 4 }}>{day}</div>
                        {cellReservas.slice(0,2).map((r, ri) => {
                          const c = getColor(r);
                          return <div key={ri} style={{ fontSize: '10px', color: c.color, background: c.bg, borderRadius: 3, padding: '1px 4px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.horario ? String(r.horario).substring(0,5) : ''} {r.nome}</div>;
                        })}
                        {cellReservas.length > 2 && <div style={{ fontSize: '10px', color: '#888' }}>+{cellReservas.length - 2}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        </CalendarInner>
      </CalendarCard>

      <MobileDayCard>

        {viewMode === 'mês' && (() => {
          const yr = monthViewDate.getFullYear();
          const mo = monthViewDate.getMonth();
          const firstOfMonth = new Date(yr, mo, 1);
          const lastOfMonth = new Date(yr, mo + 1, 0);
          const dow = firstOfMonth.getDay();
          const startOffset = dow === 0 ? 6 : dow - 1;
          const cells = [];
          for (let i = 0; i < startOffset; i++) cells.push(null);
          for (let d = 1; d <= lastOfMonth.getDate(); d++) cells.push(d);
          while (cells.length % 7 !== 0) cells.push(null);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #F0EFE9', flexShrink: 0, background: '#FAFAFA' }}>
                {['S','T','Q','Q','S','S','D'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '8px 0', fontSize: '11px', fontWeight: '700', color: '#bbb' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', flex: 1, overflowY: 'auto' }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={i} style={{ borderBottom: '1px solid #F5F5F0', borderRight: '1px solid #F5F5F0', minHeight: 52 }} />;
                  const cellDate = new Date(yr, mo, day);
                  const cellKey = toDayKey(cellDate);
                  const isToday = cellKey === todayKey;
                  const cellAppts = byDay[cellKey] || [];
                  return (
                    <div key={i} onClick={() => { setMobileDayOffset(Math.round((cellDate - today) / 86400000)); setViewMode('semana'); }}
                      style={{ padding: '6px 4px', borderBottom: '1px solid #F5F5F0', borderRight: '1px solid #F5F5F0', cursor: 'pointer', background: isToday ? '#F0F9F6' : 'white', minHeight: 52, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isToday ? '#1B4D3E' : 'transparent', color: isToday ? 'white' : '#1a1a1a', fontSize: '13px', fontWeight: isToday ? '700' : '400' }}>{day}</div>
                      {cellAppts.length > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1B4D3E', marginTop: 3 }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── MOBILE DIA (grade de horários) ── */}
        {viewMode === 'dia' && <>
          <div style={{ flexShrink: 0, borderBottom: '1px solid #F0EFE9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px' }}>
              <button onClick={() => setMobileDayOffset(d => d - 1)} style={navBtnStyle}>‹</button>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1a1a1a', textTransform: 'capitalize' }}>
                  {mobileDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#888' }}>
                  {mobileDayReservas.length === 0 ? 'Sem consultas' : `${mobileDayReservas.length} consulta${mobileDayReservas.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <button onClick={() => setMobileDayOffset(d => d + 1)} style={navBtnStyle}>›</button>
            </div>
          </div>
          {(() => {
            const rows = getRowTimes([mobileDay], horariosAtendimento, mobileDayReservas);
            return (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', minHeight: 0 }}>
                <div style={{ width: 52, flexShrink: 0, borderRight: '1px solid #F0EFE9' }}>
                  {rows.map(t => (
                    <div key={t} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, boxSizing: 'border-box', borderBottom: '1px solid #F5F5F0' }}>
                      <span style={{ fontSize: 10, color: '#bbb' }}>{formatDecimalHour(t)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, background: mobileDayKey === todayKey ? '#FAFFFE' : 'white' }}>
                  {rows.map(t => {
                    const itens = mobileDayReservas.filter(r => parseH(r.horario) === t);
                    return (
                      <div key={t} style={{ height: ROW_HEIGHT, borderBottom: '1px solid #F5F5F0', display: 'flex', alignItems: 'stretch', gap: 3, padding: 3, boxSizing: 'border-box' }}>
                        {itens.map(r => <RowAppt key={r.id} r={r} fmt={formatarHorarioBrasil} />)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>}

        {/* ── MOBILE SEMANA ── */}
        {viewMode === 'semana' && <>
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px 6px' }}>
              <button onClick={() => setMobileDayOffset(d => d - 7)} style={navBtnStyle}>‹</button>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#555', textTransform: 'capitalize' }}>
                {mobileDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setMobileDayOffset(d => d + 7)} style={navBtnStyle}>›</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 8px 10px' }}>
              {mobileWeekDays.map((d, i) => {
                const key = toDayKey(d);
                const isSelected = key === mobileDayKey;
                const isToday = key === todayKey;
                const hasAppts = (byDay[key] || []).length > 0;
                const offset = Math.round((d - today) / 86400000);
                return (
                  <div key={i} onClick={() => setMobileDayOffset(offset)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: isSelected ? '#1B4D3E' : '#999' }}>{DAY_INIT[d.getDay()]}</span>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? '#1B4D3E' : isToday ? '#E8F5EF' : 'transparent', color: isSelected ? 'white' : isToday ? '#1B4D3E' : '#333', fontSize: '15px', fontWeight: isSelected || isToday ? '700' : '400' }}>{d.getDate()}</div>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: hasAppts ? (isSelected ? 'white' : '#1B4D3E') : 'transparent' }} />
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: '1px solid #F0EFE9', padding: '8px 16px 6px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1a1a1a', textTransform: 'capitalize' }}>
                {mobileDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#888' }}>
                {mobileDayReservas.length === 0 ? 'Sem consultas' : `${mobileDayReservas.length} consulta${mobileDayReservas.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, borderTop: '1px solid #F0EFE9' }}>
            {mobileDayReservas.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#aaa' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Nenhuma consulta neste dia</p>
              </div>
            ) : (
              mobileDayReservas.map(r => {
                const c = getColor(r);
                const av = getAv(`${r.nome} ${r.sobrenome}`);
                const initials = getIn(`${r.nome} ${r.sobrenome}`);
                const statusLabel = STATUS_LABELS[r.status] || r.status;
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #F7F7F4' }}>
                    <div style={{ width: '44px', textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: c.color }}>{formatarHorarioBrasil(r.horario)}</p>
                      {r.horarioFinal && <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#aaa' }}>{formatarHorarioBrasil(r.horarioFinal)}</p>}
                    </div>
                    <div style={{ width: '3px', alignSelf: 'stretch', background: c.border, borderRadius: '3px', flexShrink: 0 }} />
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>{r.nome} {r.sobrenome}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.telefone || r.email || ''}</p>
                    </div>
                    <span style={{ background: c.bg, color: c.color, borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>{statusLabel}</span>
                  </div>
                );
              })
            )}
          </div>
        </>}

      </MobileDayCard>
    </div>
  );
};

// ── Home dashboard ───────────────────────────────────────────────────────────
const HomeView = ({ reservas, reservasPorData, formatarHorarioBrasil, formatarDataExibicao, irPara, user }) => {
  const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const hojeKey = toDayKey(hoje);

  const confirmadas = reservas.filter(r => r.status === 'confirmado');
  const pendentes = reservas.filter(r => r.status === 'pendente' && !r.is_urgente && (() => {
    if (!r.dia) return false;
    const raw = String(r.dia).includes('T') ? String(r.dia).split('T')[0] : String(r.dia);
    const p = raw.split('-');
    const d = p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : new Date(raw);
    d.setHours(0, 0, 0, 0); return d >= hoje;
  })());
  const urgentes = reservas.filter(r => r.is_urgente && (r.status === 'pendente' || r.status === 'aguardando_confirmacao_paciente'));
  const hojeConfirmadas = (reservasPorData[hojeKey] || []).filter(r => r.status === 'confirmado');

  const statCards = [
    { label: 'Consultas hoje', value: hojeConfirmadas.length, icon: <CalendarDays size={16} color="#1B4D3E" />, color: '#1B4D3E', bg: '#E8F5EF' },
    { label: 'Novas solicitações', value: pendentes.length, icon: <ClipboardList size={16} color="#92400E" />, color: '#92400E', bg: '#FEF3C7', action: () => irPara('solicitacoes') },
    { label: 'Urgências ativas', value: urgentes.length, icon: <Zap size={16} color="#E8611A" />, color: '#E8611A', bg: '#FFF3EE', action: () => irPara('urgencias') },
    { label: 'Total confirmadas', value: confirmadas.length, icon: <CheckCircle size={16} color="#1D4ED8" />, color: '#1D4ED8', bg: '#DBEAFE' },
  ];

  return (
    <HomeWrap>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Olá, {user?.nome || 'Profissional'}</h1>
        <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <div key={i} onClick={s.action} style={{ ...CARD, padding: '18px 20px', cursor: s.action ? 'pointer' : 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
              <div style={{ background: s.bg, borderRadius: '8px', padding: '6px 8px', fontSize: '14px' }}>{s.icon}</div>
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <TwoColGrid>
        <div style={CARD}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>Agenda de hoje</h2>
            <button onClick={() => irPara('agenda')} style={{ background: 'none', border: '1.5px solid #E0DFD9', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>Ver tudo →</button>
          </div>
          {hojeConfirmadas.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>Nenhuma consulta confirmada para hoje</div>
          ) : (
            <div>
              {hojeConfirmadas.map(r => {
                const av = getAv(`${r.nome} ${r.sobrenome}`);
                const initials = getIn(`${r.nome} ${r.sobrenome}`);
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #F7F7F4' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>{r.nome} {r.sobrenome}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{r.telefone || r.email}</p>
                    </div>
                    <span style={{ background: '#E8F5EF', color: '#1B4D3E', borderRadius: '7px', padding: '5px 10px', fontSize: '13px', fontWeight: '700' }}>{formatarHorarioBrasil(r.horario)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={CARD}>
            <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#E8611A" />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>Urgências</h3>
              {urgentes.length > 0 && <span style={{ marginLeft: 'auto', background: '#E8611A', color: 'white', borderRadius: '10px', padding: '2px 7px', fontSize: '11px', fontWeight: '700' }}>{urgentes.length}</span>}
            </div>
            {urgentes.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Nenhuma urgência</div>
            ) : urgentes.slice(0, 3).map(r => (
              <div key={r.id} style={{ padding: '10px 18px', borderBottom: '1px solid #F7F7F4' }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: '#1a1a1a' }}>{r.nome} {r.sobrenome}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.descricao_urgencia || 'Sem descrição'}</p>
              </div>
            ))}
            {urgentes.length > 3 && <button onClick={() => irPara('urgencias')} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#E8611A', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>Ver mais →</button>}
          </div>

          <div style={CARD}>
            <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #F0EFE9' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>Ações rápidas</h3>
            </div>
            <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { icon: <CalendarPlus size={14} color="#1B4D3E" />, label: 'Nova consulta', screen: 'criar', color: '#1B4D3E', bg: '#E8F5EF' },
                { icon: <ClipboardList size={14} color="#92400E" />, label: 'Ver solicitações', screen: 'solicitacoes', color: '#92400E', bg: '#FEF3C7' },
                { icon: <MapPin size={14} color="#1D4ED8" />, label: 'Editar localização', screen: 'mapa', color: '#1D4ED8', bg: '#DBEAFE' },
              ].map((a, i) => (
                <button key={i} onClick={() => irPara(a.screen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: '#F7F7F4', cursor: 'pointer', textAlign: 'left', fontFamily: 'Figtree, sans-serif', fontSize: '13px', color: '#333' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{a.icon}</div>
                  <span style={{ fontWeight: '500' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </TwoColGrid>
    </HomeWrap>
  );
};

const Inicio = ({ reservas, reservasPorData, formatarHorarioBrasil, formatarDataExibicao, irPara, user, modoAgenda, horariosAtendimento, notificacoes, notificacoesCount, onAbrirNotificacoes }) => {
  if (modoAgenda) return (
    <AgendaView
      reservas={reservas} formatarHorarioBrasil={formatarHorarioBrasil} irPara={irPara} horariosAtendimento={horariosAtendimento}
      notificacoes={notificacoes} notificacoesCount={notificacoesCount} onAbrirNotificacoes={onAbrirNotificacoes}
    />
  );
  return <HomeView reservas={reservas} reservasPorData={reservasPorData} formatarHorarioBrasil={formatarHorarioBrasil} formatarDataExibicao={formatarDataExibicao} irPara={irPara} user={user} />;
};

export default Inicio;
