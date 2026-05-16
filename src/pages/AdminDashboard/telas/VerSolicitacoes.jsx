import { useState } from 'react';

const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };

const STATUS_MAP = {
  confirmado: { label: 'Confirmado', bg: '#D1FAE5', color: '#065F46' },
  pendente:   { label: 'Pendente',   bg: '#FEF3C7', color: '#92400E' },
  negado:     { label: 'Negado',     bg: '#FEE2E2', color: '#991B1B' },
  aguardando_confirmacao_paciente: { label: 'Aguardando', bg: '#DBEAFE', color: '#1D4ED8' },
};
const getStatus = s => STATUS_MAP[s] || { label: s || 'Pendente', bg: '#F3F4F6', color: '#374151' };

const formatarTitulo = (chave) => {
  if (!chave) return '';
  const t = { created_at:'Criado em', updated_at:'Atualizado em' };
  if (t[chave.toLowerCase()]) return t[chave.toLowerCase()];
  return String(chave)
    .replace(/_/g,' ').replace(/([a-z0-9])([A-Z])/g,'$1 $2')
    .split(' ').map(w => {
      const wl = w.toLowerCase();
      if (['cpf','rg','sus','crm','id','cep'].includes(wl)) return wl.toUpperCase();
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
    if (h) return `${String(parseInt(h[1],10)).padStart(2,'0')}:${h[2]}`;
  }
  return String(v);
};

const RenderConteudo = ({ valor, path = 'root' }) => {
  if (valor === null || valor === undefined) return <span style={{ color: '#aaa' }}>—</span>;
  if (Array.isArray(valor)) {
    if (!valor.length) return <span style={{ color: '#aaa' }}>—</span>;
    const primitivos = valor.every(v => ['string','number','boolean'].includes(typeof v) || v == null);
    if (primitivos) return <ul style={{ margin: 0, paddingLeft: '18px' }}>{valor.map((v,i) => <li key={i}>{formatarValor(v)}</li>)}</ul>;
    return <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>{valor.map((v,i) => <div key={i} style={{ border:'1px solid #E0DFD9', borderRadius:'8px', padding:'10px' }}><RenderConteudo valor={v} path={`${path}.${i}`} /></div>)}</div>;
  }
  if (typeof valor === 'object') {
    const entries = Object.entries(valor).sort(([a],[b]) => a.localeCompare(b,'pt-BR'));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entries.map(([k,v]) => {
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

const VerSolicitacoes = ({
  reservas, formatarDataExibicao, formatarHorarioBrasil,
  selecionarReservaParaFormulario, reservaSelecionada,
  formularioSelecionado, carregandoFormulario, erroFormulario, onFecharFormulario,
  toggleStatus, mostrarMotivo, setMostrarMotivo, motivo, setMotivo, negarReserva,
  onEditarReserva, removerReserva,
}) => {
  const hoje = new Date(); hoje.setHours(0,0,0,0);

  const lista = reservas.filter(r => {
    if (!r.dia || r.is_urgente) return false;
    const raw = String(r.dia).includes('T') ? String(r.dia).split('T')[0] : String(r.dia);
    const p = raw.split('-');
    const d = p.length === 3 ? new Date(+p[0],+p[1]-1,+p[2]) : new Date(raw);
    d.setHours(0,0,0,0);
    return d >= hoje;
  });

  const parseConteudo = () => {
    const c = formularioSelecionado?.conteudo;
    if (!c) return null;
    if (typeof c === 'string') { try { return JSON.parse(c.trim()); } catch { return c; } }
    return c;
  };

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Figtree, sans-serif', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {/* Main list */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Solicitações</h1>
          <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0' }}>{lista.length} solicitação{lista.length !== 1 ? 'ões' : ''} ativa{lista.length !== 1 ? 's' : ''}</p>
        </div>

        {lista.length === 0 ? (
          <div style={{ ...CARD, padding: '48px', textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>≡</div>
            <p style={{ margin: 0 }}>Nenhuma solicitação pendente</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lista.map(r => {
              const s = getStatus(r.status);
              const selected = reservaSelecionada?.id === r.id;
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
                    <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>{s.label}</span>
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
