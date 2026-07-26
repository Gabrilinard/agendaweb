import { useState } from 'react';
import { CalendarDays, CalendarPlus, CheckCircle, ClipboardList, MapPin, Zap } from 'lucide-react';
import styled from 'styled-components';

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

const HOUR_HEIGHT = 72;
const START_HOUR = 7;
const END_HOUR = 20;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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

const ApptBlock = ({ r, fmt }) => {
  const t = parseH(r.horario);
  if (t === null || t < START_HOUR || t >= END_HOUR) return null;
  const endT = r.horarioFinal ? parseH(r.horarioFinal) : t + 1;
  const top = (t - START_HOUR) * HOUR_HEIGHT + 2;
  const height = Math.max((endT - t) * HOUR_HEIGHT - 4, 28);
  const c = getColor(r);
  const isLiberado = r.status === 'liberado';
  return (
    <div style={{
      position: 'absolute', top, left: 3, right: 3, height,
      background: c.bg, borderLeft: `3px solid ${c.border}`, borderRadius: 6,
      padding: '4px 7px', overflow: 'hidden', cursor: 'pointer', zIndex: 2,
    }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: c.color, lineHeight: 1.2 }}>{fmt(r.horario)}</p>
      {height > 36 && (
        <p style={{ margin: 0, fontSize: 11, color: c.color, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isLiberado ? STATUS_LABELS.liberado : `${r.nome} ${r.sobrenome ? r.sobrenome[0] + '.' : ''}`}
        </p>
      )}
    </div>
  );
};

const AgendaView = ({ reservas, formatarHorarioBrasil, irPara }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState('semana');
  const [mobileDayOffset, setMobileDayOffset] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekStart = getWeekStart(weekOffset);
  const weekDays = getWeekDays(weekStart);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayKey = toDayKey(today);
  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const nowTop = (nowH - START_HOUR) * HOUR_HEIGHT;

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
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', minHeight: 0 }}>
              <div style={{ width: 64, flexShrink: 0, borderRight: '1px solid #F0EFE9' }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: HOUR_HEIGHT, display: 'flex', alignItems: 'flex-start', paddingTop: 4, boxSizing: 'border-box' }}>
                    <span style={{ fontSize: 11, color: '#bbb', width: '100%', textAlign: 'right', paddingRight: 8 }}>{String(h).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>
              {weekDays.map((day, i) => {
                const key = toDayKey(day);
                const isToday = key === todayKey;
                const dayReservas = byDay[key] || [];
                const totalH = HOURS.length * HOUR_HEIGHT;
                return (
                  <div key={i} style={{ flex: 1, position: 'relative', borderLeft: '1px solid #F0EFE9', minWidth: 0, background: isToday ? '#FAFFFE' : 'white', minHeight: totalH }}>
                    {HOURS.map(h => <div key={h} style={{ position: 'absolute', top: (h - START_HOUR) * HOUR_HEIGHT, left: 0, right: 0, borderTop: '1px solid #F5F5F0', height: HOUR_HEIGHT }} />)}
                    {isToday && nowTop >= 0 && nowTop <= totalH && (
                      <div style={{ position: 'absolute', top: nowTop, left: 0, right: 0, zIndex: 5, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: '#E8611A' }} />
                        <div style={{ height: 2, background: '#E8611A', position: 'absolute', left: 5, right: 0, top: -1 }} />
                      </div>
                    )}
                    {dayReservas.map(r => <ApptBlock key={r.id} r={r} fmt={formatarHorarioBrasil} />)}
                  </div>
                );
              })}
            </div>
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
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', minHeight: 0 }}>
              <div style={{ width: 64, flexShrink: 0, borderRight: '1px solid #F0EFE9' }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: HOUR_HEIGHT, display: 'flex', alignItems: 'flex-start', paddingTop: 4, boxSizing: 'border-box' }}>
                    <span style={{ fontSize: 11, color: '#bbb', width: '100%', textAlign: 'right', paddingRight: 8 }}>{String(h).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, position: 'relative', background: selectedDayKey === todayKey ? '#FAFFFE' : 'white', minHeight: HOURS.length * HOUR_HEIGHT }}>
                {HOURS.map(h => <div key={h} style={{ position: 'absolute', top: (h - START_HOUR) * HOUR_HEIGHT, left: 0, right: 0, borderTop: '1px solid #F5F5F0', height: HOUR_HEIGHT }} />)}
                {selectedDayKey === todayKey && nowTop >= 0 && nowTop <= HOURS.length * HOUR_HEIGHT && (
                  <div style={{ position: 'absolute', top: nowTop, left: 0, right: 0, zIndex: 5, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: '#E8611A' }} />
                    <div style={{ height: 2, background: '#E8611A', position: 'absolute', left: 5, right: 0, top: -1 }} />
                  </div>
                )}
                {(byDay[selectedDayKey] || []).map(r => <ApptBlock key={r.id} r={r} fmt={formatarHorarioBrasil} />)}
              </div>
            </div>
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
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', minHeight: 0 }}>
            <div style={{ width: 52, flexShrink: 0, borderRight: '1px solid #F0EFE9' }}>
              {HOURS.map(h => (
                <div key={h} style={{ height: HOUR_HEIGHT, display: 'flex', alignItems: 'flex-start', paddingTop: 4, boxSizing: 'border-box' }}>
                  <span style={{ fontSize: 10, color: '#bbb', width: '100%', textAlign: 'right', paddingRight: 6 }}>{String(h).padStart(2,'0')}:00</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative', background: mobileDayKey === todayKey ? '#FAFFFE' : 'white', minHeight: HOURS.length * HOUR_HEIGHT }}>
              {HOURS.map(h => <div key={h} style={{ position: 'absolute', top: (h - START_HOUR) * HOUR_HEIGHT, left: 0, right: 0, borderTop: '1px solid #F5F5F0', height: HOUR_HEIGHT }} />)}
              {mobileDayKey === todayKey && nowTop >= 0 && nowTop <= HOURS.length * HOUR_HEIGHT && (
                <div style={{ position: 'absolute', top: nowTop, left: 0, right: 0, zIndex: 5, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: '#E8611A' }} />
                  <div style={{ height: 2, background: '#E8611A', position: 'absolute', left: 5, right: 0, top: -1 }} />
                </div>
              )}
              {mobileDayReservas.map(r => <ApptBlock key={r.id} r={r} fmt={formatarHorarioBrasil} />)}
            </div>
          </div>
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

const Inicio = ({ reservas, reservasPorData, formatarHorarioBrasil, formatarDataExibicao, irPara, user, modoAgenda }) => {
  if (modoAgenda) return <AgendaView reservas={reservas} formatarHorarioBrasil={formatarHorarioBrasil} irPara={irPara} />;
  return <HomeView reservas={reservas} reservasPorData={reservasPorData} formatarHorarioBrasil={formatarHorarioBrasil} formatarDataExibicao={formatarDataExibicao} irPara={irPara} user={user} />;
};

export default Inicio;
