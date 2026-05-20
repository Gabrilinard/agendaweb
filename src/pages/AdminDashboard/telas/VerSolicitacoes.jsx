import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };
const PAGE_SIZE = 10;

const STATUS_MAP = {
  confirmado:                       { label: 'Confirmado',          bg: '#D1FAE5', color: '#065F46' },
  pendente:                         { label: 'Pendente',            bg: '#FEF3C7', color: '#92400E' },
  negado:                           { label: 'Negado',              bg: '#FEE2E2', color: '#991B1B' },
  aguardando_confirmacao_paciente:  { label: 'Aguard. paciente',    bg: '#DBEAFE', color: '#1D4ED8' },
};
const getStatus = s => STATUS_MAP[s] || { label: s || 'Pendente', bg: '#F3F4F6', color: '#374151' };

const DIAS_SEMANA = [
  { key: 0, label: 'Dom' },
  { key: 1, label: 'Seg' },
  { key: 2, label: 'Ter' },
  { key: 3, label: 'Qua' },
  { key: 4, label: 'Qui' },
  { key: 5, label: 'Sex' },
  { key: 6, label: 'Sáb' },
];

const STATUS_FILTERS = [
  { key: 'confirmado',                      label: 'Confirmados' },
  { key: 'pendente',                        label: 'Pendentes' },
  { key: 'aguardando_confirmacao_paciente', label: 'Aguard. paciente' },
  { key: 'negado',                          label: 'Negados' },
  { key: 'urgente',                         label: '⚡ Emergentes' },
];

const parseDia = (dia) => {
  if (!dia) return null;
  const raw = String(dia).includes('T') ? String(dia).split('T')[0] : String(dia);
  const p = raw.split('-');
  if (p.length !== 3) return null;
  return new Date(+p[0], +p[1] - 1, +p[2]);
};

const formatarTitulo = (chave) => {
  if (!chave) return '';
  const t = { created_at: 'Criado em', updated_at: 'Atualizado em' };
  if (t[chave.toLowerCase()]) return t[chave.toLowerCase()];
  return String(chave)
    .replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(' ').map(w => {
      const wl = w.toLowerCase();
      if (['cpf', 'rg', 'sus', 'crm', 'id', 'cep'].includes(wl)) return wl.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
};

const formatarValor = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  if (typeof v === 'string') {
    const m = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    const h = v.trim().match(/^(\d{1,2}):(\d{2})/);
    if (h) return `${String(parseInt(h[1], 10)).padStart(2, '0')}:${h[2]}`;
  }
  return String(v);
};

const RenderConteudo = ({ valor, path = 'root' }) => {
  if (valor === null || valor === undefined) return <span style={{ color: '#aaa' }}>—</span>;
  if (Array.isArray(valor)) {
    if (!valor.length) return <span style={{ color: '#aaa' }}>—</span>;
    const primitivos = valor.every(v => ['string', 'number', 'boolean'].includes(typeof v) || v == null);
    if (primitivos) return <ul style={{ margin: 0, paddingLeft: '18px' }}>{valor.map((v, i) => <li key={i}>{formatarValor(v)}</li>)}</ul>;
    return <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{valor.map((v, i) => <div key={i} style={{ border: '1px solid #E0DFD9', borderRadius: '8px', padding: '10px' }}><RenderConteudo valor={v} path={`${path}.${i}`} /></div>)}</div>;
  }
  if (typeof valor === 'object') {
    const entries = Object.entries(valor).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entries.map(([k, v]) => {
          const nested = v && typeof v === 'object';
          return (
            <div key={k}>
              {nested ? (
                <>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#333', marginBottom: '6px' }}>{formatarTitulo(k)}</div>
                  <div style={{ borderLeft: '3px solid #E0DFD9', paddingLeft: '12px' }}><RenderConteudo valor={v} path={`${path}.${k}`} /></div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
                  <span style={{ fontWeight: '600', color: '#555', minWidth: '160px', flexShrink: 0 }}>{formatarTitulo(k)}:</span>
                  <span style={{ color: '#1a1a1a' }}>{formatarValor(v)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return <span style={{ fontSize: '13px', color: '#1a1a1a' }}>{formatarValor(valor)}</span>;
};

const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: 'Figtree, sans-serif',
      border: active ? '1.5px solid #1B4D3E' : '1.5px solid #E0DFD9',
      background: active ? '#1B4D3E' : 'white',
      color: active ? 'white' : '#555',
      transition: 'all 0.12s',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </button>
);

const VerSolicitacoes = ({
  reservas, formatarDataExibicao, formatarHorarioBrasil,
  selecionarReservaParaFormulario, reservaSelecionada,
  formularioSelecionado, carregandoFormulario, erroFormulario, onFecharFormulario,
  toggleStatus, mostrarMotivo, setMostrarMotivo, motivo, setMotivo, negarReserva,
  onEditarReserva, removerReserva,
}) => {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

  const [busca, setBusca] = useState('');
  const [statusFiltros, setStatusFiltros] = useState(new Set());
  const [diasFiltros, setDiasFiltros] = useState(new Set());
  const [ordem, setOrdem] = useState('recentes');
  const [page, setPage] = useState(1);

  const toggleFiltro = (set, setter, key) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setPage(1);
  };

  const listaFiltrada = useMemo(() => {
    let lista = reservas.filter(r => r.dia);

    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      lista = lista.filter(r => `${r.nome || ''} ${r.sobrenome || ''}`.toLowerCase().includes(q));
    }

    if (statusFiltros.size > 0) {
      lista = lista.filter(r => {
        if (statusFiltros.has('urgente') && Number(r.is_urgente) === 1) return true;
        if (statusFiltros.has(r.status)) return true;
        return false;
      });
    }

    if (diasFiltros.size > 0) {
      lista = lista.filter(r => {
        const d = parseDia(r.dia);
        return d && diasFiltros.has(d.getDay());
      });
    }

    lista.sort((a, b) => {
      const da = parseDia(a.dia)?.getTime() ?? 0;
      const db = parseDia(b.dia)?.getTime() ?? 0;
      return ordem === 'recentes' ? db - da : da - db;
    });

    return lista;
  }, [reservas, busca, statusFiltros, diasFiltros, ordem]);

  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / PAGE_SIZE));
  const pagina = listaFiltrada.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const parseConteudo = () => {
    const c = formularioSelecionado?.conteudo;
    if (!c) return null;
    if (typeof c === 'string') { try { return JSON.parse(c.trim()); } catch { return c; } }
    return c;
  };

  const hasFilters = busca.trim() || statusFiltros.size > 0 || diasFiltros.size > 0;

  const limparFiltros = () => {
    setBusca('');
    setStatusFiltros(new Set());
    setDiasFiltros(new Set());
    setPage(1);
  };

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Figtree, sans-serif', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {/* Main list */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Solicitações</h1>
          <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0' }}>
            {listaFiltrada.length} {listaFiltrada.length !== 1 ? 'solicitações encontradas' : 'solicitação encontrada'}
          </p>
        </div>

        {/* Search + sort */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} color="#aaa" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={busca}
              onChange={e => { setBusca(e.target.value); setPage(1); }}
              style={{
                width: '100%', padding: '9px 12px 9px 34px',
                border: '1.5px solid #E0DFD9', borderRadius: '9px',
                fontSize: '13px', fontFamily: 'Figtree, sans-serif',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <select
            value={ordem}
            onChange={e => { setOrdem(e.target.value); setPage(1); }}
            style={{
              padding: '9px 12px', border: '1.5px solid #E0DFD9', borderRadius: '9px',
              fontSize: '13px', fontFamily: 'Figtree, sans-serif',
              outline: 'none', background: 'white', cursor: 'pointer', color: '#333',
            }}
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigas">Mais antigas</option>
          </select>
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {STATUS_FILTERS.map(f => (
            <Chip key={f.key} active={statusFiltros.has(f.key)} onClick={() => toggleFiltro(statusFiltros, setStatusFiltros, f.key)}>
              {f.label}
            </Chip>
          ))}
        </div>

        {/* Day filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#888', fontWeight: '600', marginRight: '2px' }}>Dia:</span>
          {DIAS_SEMANA.map(d => (
            <Chip key={d.key} active={diasFiltros.has(d.key)} onClick={() => toggleFiltro(diasFiltros, setDiasFiltros, d.key)}>
              {d.label}
            </Chip>
          ))}
          {hasFilters && (
            <button
              onClick={limparFiltros}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: '#FEE2E2', color: '#991B1B', fontFamily: 'Figtree, sans-serif', marginLeft: '4px' }}
            >
              <X size={11} /> Limpar
            </button>
          )}
        </div>

        {/* List */}
        {pagina.length === 0 ? (
          <div style={{ ...CARD, padding: '48px', textAlign: 'center', color: '#888' }}>
            <p style={{ margin: 0 }}>Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pagina.map(r => {
              const s = getStatus(r.status);
              const selected = reservaSelecionada?.id === r.id;
              const isUrgente = Number(r.is_urgente) === 1;
              return (
                <div
                  key={r.id}
                  onClick={() => selecionarReservaParaFormulario(r)}
                  style={{
                    ...CARD, padding: '16px 20px', cursor: 'pointer',
                    border: selected ? '2px solid #1B4D3E' : '2px solid transparent',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>{r.nome} {r.sobrenome}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>
                        {formatarDataExibicao(r.dia)} às {formatarHorarioBrasil(r.horario)}
                        {r.telefone ? ` · ${r.telefone}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                      {isUrgente && (
                        <span style={{ background: '#FFF0E6', color: '#C2410C', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>
                          ⚡ Emergente
                        </span>
                      )}
                      <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600' }}>{s.label}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                    {r.status !== 'confirmado' && (
                      <button onClick={() => toggleStatus(r)} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: '#D1FAE5', color: '#065F46', border: 'none', fontFamily: 'Figtree, sans-serif' }}>
                        Confirmar
                      </button>
                    )}
                    {r.status === 'confirmado' && (
                      <button onClick={() => toggleStatus(r)} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: '#FEF3C7', color: '#92400E', border: 'none', fontFamily: 'Figtree, sans-serif' }}>
                        Tirar confirmação
                      </button>
                    )}
                    <button onClick={() => setMostrarMotivo(mostrarMotivo === r.id ? null : r.id)} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: '#FEE2E2', color: '#991B1B', border: 'none', fontFamily: 'Figtree, sans-serif' }}>
                      Negar
                    </button>
                    <button onClick={() => onEditarReserva(r)} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: '#F7F7F4', color: '#555', border: '1px solid #E0DFD9', fontFamily: 'Figtree, sans-serif' }}>
                      Editar
                    </button>
                    <button onClick={() => removerReserva(r.id)} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: 'none', color: '#EF4444', border: '1px solid #FECACA', fontFamily: 'Figtree, sans-serif' }}>
                      Remover
                    </button>
                  </div>

                  {/* Negar form */}
                  {mostrarMotivo === r.id && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#FFF5F5', borderRadius: '8px' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={motivo}
                        onChange={e => setMotivo(e.target.value)}
                        placeholder="Motivo da negação..."
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', marginBottom: '8px', fontFamily: 'Figtree, sans-serif' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => negarReserva(r)} style={{ padding: '7px 14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
                          Confirmar negação
                        </button>
                        <button onClick={() => setMostrarMotivo(null)} style={{ padding: '7px 14px', background: '#F7F7F4', color: '#555', border: '1px solid #E0DFD9', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '7px 10px', border: '1.5px solid #E0DFD9', borderRadius: '8px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, i, arr) => {
                if (i > 0 && n - arr[i - 1] > 1) acc.push('...');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === '...'
                  ? <span key={`e${i}`} style={{ fontSize: '13px', color: '#aaa', padding: '0 4px' }}>…</span>
                  : <button
                      key={n}
                      onClick={() => setPage(n)}
                      style={{
                        padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                        cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
                        border: n === page ? 'none' : '1.5px solid #E0DFD9',
                        background: n === page ? '#1B4D3E' : 'white',
                        color: n === page ? 'white' : '#333',
                      }}
                    >
                      {n}
                    </button>
              )
            }

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '7px 10px', border: '1.5px solid #E0DFD9', borderRadius: '8px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Formulário side panel */}
      {reservaSelecionada && (
        <div style={{ width: '380px', flexShrink: 0 }}>
          <div style={CARD}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>Formulário do paciente</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>
                  {reservaSelecionada.nome} {reservaSelecionada.sobrenome}
                </p>
              </div>
              <button onClick={onFecharFormulario} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>✕</button>
            </div>
            <div style={{ padding: '16px 20px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              {carregandoFormulario && <div style={{ textAlign: 'center', color: '#888', fontSize: '14px', padding: '20px 0' }}>Carregando...</div>}
              {!carregandoFormulario && erroFormulario && <div style={{ color: '#EF4444', fontSize: '13px' }}>{erroFormulario}</div>}
              {!carregandoFormulario && !erroFormulario && formularioSelecionado && (
                (() => {
                  const c = parseConteudo();
                  return c ? <RenderConteudo valor={c} /> : <div style={{ color: '#aaa', fontSize: '13px' }}>Nenhuma informação preenchida.</div>;
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerSolicitacoes;
