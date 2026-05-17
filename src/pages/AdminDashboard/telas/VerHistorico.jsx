import { useState } from 'react';
import { Clock, Download, Search } from 'lucide-react';

const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };

const AVATAR_PALETTES = [
  { bg: '#FCDBB5', color: '#7A4100' },
  { bg: '#CCEDE8', color: '#1A5C54' },
  { bg: '#D6E8FF', color: '#1A3F6F' },
  { bg: '#F5D6FF', color: '#5C1A7A' },
  { bg: '#D6FFE8', color: '#1A5C35' },
  { bg: '#FFE8E8', color: '#7A1A1A' },
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

const toDate = (v) => {
  if (!v) return new Date(0);
  const raw = String(v).includes('T') ? String(v).split('T')[0] : String(v);
  const p = raw.split('-');
  return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : new Date(raw);
};

const getTipo = (r) => {
  if (r.is_urgente) return { label: 'Urgência', bg: '#FFF3EE', color: '#E8611A' };
  if (r.status === 'negado') return { label: 'Cancelado', bg: '#FEE2E2', color: '#991B1B' };
  return { label: 'Consulta', bg: '#E8F5EF', color: '#1B4D3E' };
};

const getDesfecho = (r) => {
  if (r.status === 'confirmado') return 'Atendido';
  if (r.status === 'negado') return 'Cancelado';
  if (r.is_urgente) return 'Aguardando';
  return '—';
};

const getDuracao = (r) => {
  if (!r.horario || !r.horarioFinal) return '—';
  const parseMin = (t) => { const [h, m] = String(t).match(/^(\d{1,2}):(\d{2})/)?.slice(1).map(Number) || [0, 0]; return h * 60 + m; };
  const diff = parseMin(r.horarioFinal) - parseMin(r.horario);
  if (diff <= 0) return '—';
  return `${diff}min`;
};

const DATE_FILTERS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Tudo', days: null },
];

const VerHistorico = ({ reservas, searchHistory, setSearchHistory, formatarDataExibicao, formatarHorarioBrasil }) => {
  const [dateFilter, setDateFilter] = useState(30);
  const [tipoFilter, setTipoFilter] = useState('');

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const cutoff = dateFilter !== null ? new Date(hoje.getTime() - dateFilter * 86400000) : null;

  const filtradas = reservas
    .filter(r => {
      if (!r.dia) return false;
      const d = toDate(r.dia); d.setHours(0, 0, 0, 0);
      if (d >= hoje) return false;
      if (cutoff && d < cutoff) return false;
      if (tipoFilter === 'urgencia' && !r.is_urgente) return false;
      if (tipoFilter === 'cancelado' && r.status !== 'negado') return false;
      if (tipoFilter === 'consulta' && (r.is_urgente || r.status === 'negado')) return false;
      if (searchHistory) {
        const q = searchHistory.toLowerCase();
        const nome = `${r.nome || ''} ${r.sobrenome || ''}`.toLowerCase();
        return nome.includes(q) || (r.email || '').toLowerCase().includes(q) || (r.telefone || '').includes(q);
      }
      return true;
    })
    .sort((a, b) => toDate(b.dia) - toDate(a.dia));

  const exportCSV = () => {
    const header = 'Nome,Email,Telefone,Data,Horário,Tipo,Desfecho,Duração\n';
    const rows = filtradas.map(r => {
      const tipo = getTipo(r);
      return `"${r.nome || ''} ${r.sobrenome || ''}","${r.email || ''}","${r.telefone || ''}","${formatarDataExibicao(r.dia)}","${formatarHorarioBrasil(r.horario)}","${tipo.label}","${getDesfecho(r)}","${getDuracao(r)}"`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'historico.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Figtree, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Histórico de atendimentos</h1>
          <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0' }}>Todas as consultas concluídas. Filtre por paciente, data ou tipo.</p>
        </div>
        <button onClick={exportCSV} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px',
          border: '1.5px solid #E0DFD9', borderRadius: '8px', background: 'white',
          fontSize: '13px', fontWeight: '600', color: '#333', cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
        }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none', display: 'flex' }}><Search size={14} /></span>
          <input
            type="text" placeholder="Buscar paciente ou desfecho..."
            value={searchHistory} onChange={e => setSearchHistory(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '13px', fontFamily: 'Figtree, sans-serif', outline: 'none', boxSizing: 'border-box', background: 'white' }}
          />
        </div>
        <select
          value={dateFilter ?? 'null'}
          onChange={e => setDateFilter(e.target.value === 'null' ? null : parseInt(e.target.value))}
          style={{ padding: '10px 14px', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '13px', fontFamily: 'Figtree, sans-serif', background: 'white', cursor: 'pointer', color: '#333' }}
        >
          {DATE_FILTERS.map(f => <option key={f.label} value={f.days ?? 'null'}>{f.label}</option>)}
        </select>
        <select
          value={tipoFilter}
          onChange={e => setTipoFilter(e.target.value)}
          style={{ padding: '10px 14px', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '13px', fontFamily: 'Figtree, sans-serif', background: 'white', cursor: 'pointer', color: '#333' }}
        >
          <option value="">Todos os tipos</option>
          <option value="consulta">Consulta</option>
          <option value="urgencia">Urgência</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Table */}
      {filtradas.length === 0 ? (
        <div style={{ ...CARD, padding: '64px', textAlign: 'center', color: '#888' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><Clock size={32} color="#bbb" /></div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Nenhum registro encontrado</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>O histórico mostra consultas de datas anteriores</p>
        </div>
      ) : (
        <div style={CARD}>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.9fr 1.1fr 0.7fr 32px',
            padding: '12px 20px', borderBottom: '1.5px solid #F0EFE9',
          }}>
            {['PACIENTE', 'DATA', 'TIPO', 'DESFECHO', 'DURAÇÃO', ''].map((h, i) => (
              <span key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
            ))}
          </div>

          {filtradas.map((r, i) => {
            const fullName = `${r.nome || ''} ${r.sobrenome || ''}`.trim();
            const av = getAv(fullName);
            const initials = getIn(fullName);
            const tipo = getTipo(r);
            const desfecho = getDesfecho(r);
            const duracao = getDuracao(r);
            const dataFmt = (() => {
              const raw = String(r.dia).includes('T') ? String(r.dia).split('T')[0] : String(r.dia);
              const p = raw.split('-');
              const d = p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : new Date(raw);
              return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} às ${formatarHorarioBrasil(r.horario)}`;
            })();

            return (
              <div
                key={r.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.9fr 1.1fr 0.7fr 32px',
                  padding: '14px 20px', borderBottom: i < filtradas.length - 1 ? '1px solid #F7F7F4' : 'none',
                  alignItems: 'center',
                }}
              >
                {/* Patient */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>{fullName}</span>
                </div>

                {/* Data */}
                <span style={{ fontSize: '13px', color: '#555' }}>{dataFmt}</span>

                {/* Tipo */}
                <span style={{ background: tipo.bg, color: tipo.color, borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', display: 'inline-block' }}>
                  {tipo.label}
                </span>

                {/* Desfecho */}
                <span style={{ fontSize: '13px', color: '#555' }}>{desfecho}</span>

                {/* Duração */}
                <span style={{ fontSize: '13px', color: '#888' }}>{duracao}</span>

                {/* Actions */}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '16px', padding: '2px 4px', lineHeight: 1 }}>···</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VerHistorico;
