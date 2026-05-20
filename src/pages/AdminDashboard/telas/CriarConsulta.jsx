import { ptBR } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';

const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };
const inputS = {
  padding: '10px 12px', border: '1.5px solid #E0DFD9', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'Figtree, sans-serif', outline: 'none', color: '#1a1a1a',
  background: 'white', width: '100%', boxSizing: 'border-box',
};
const labelS = { fontSize: '13px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '6px' };

const toMin = (t) => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m; };
const toStr = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIA_FULL = { Dom: 'Domingo', Seg: 'Segunda', Ter: 'Terça', Qua: 'Quarta', Qui: 'Quinta', Sex: 'Sexta', Sáb: 'Sábado' };
const DURACOES = [{ v: '15', l: '15 min' }, { v: '20', l: '20 min' }, { v: '30', l: '30 min' }, { v: '45', l: '45 min' }, { v: '60', l: '1 hora' }, { v: '90', l: '1h 30min' }];

const gerarSlots = (inicio, fim, duracao, pausaAlmoco) => {
  const slots = [];
  let cur = toMin(inicio);
  const end = toMin(fim);
  const dur = parseInt(duracao);
  const pStart = 12 * 60;
  const pEnd = 13 * 60 + 30;
  while (cur + dur <= end) {
    if (pausaAlmoco && cur >= pStart && cur < pEnd) { cur = pEnd; continue; }
    slots.push(toStr(cur));
    cur += dur;
  }
  return slots;
};

const DIA_ABREV_MAP = { Domingo: 'Dom', Segunda: 'Seg', Terça: 'Ter', Quarta: 'Qua', Quinta: 'Qui', Sexta: 'Sex', Sábado: 'Sáb' };

const CriarConsulta = ({
  modo = 'horarios',
  cpfUsuario, setCpfUsuario, userId,
  nomeReserva, sobrenomeReserva, emailReserva, telefoneReserva,
  dataReserva, setDataReserva,
  horarioReserva, setHorarioReserva,
  formatarHorarioBrasil,
  handleCreateReserva,
  onSalvarHorarios,
  horariosAtendimentoAtual,
  diasAtendimentoAtual,
}) => {
  const [tab, setTab] = useState('recorrente');
  const [modoHorario, setModoHorario] = useState('intervalo');

  const savedEntries = horariosAtendimentoAtual ? Object.entries(horariosAtendimentoAtual) : [];
  const firstSavedSlots = savedEntries.length > 0 && Array.isArray(savedEntries[0][1]) ? savedEntries[0][1] : null;

  const savedDayAbrevs = Array.isArray(diasAtendimentoAtual)
    ? diasAtendimentoAtual.map(d => DIA_ABREV_MAP[d] || d).filter(a => DIAS_ABREV.includes(a))
    : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  // Intervalo
  const [selectedDays, setSelectedDays] = useState(savedDayAbrevs.length ? savedDayAbrevs : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
  const [inicio, setInicio] = useState('08:00');
  const [fim, setFim] = useState('17:00');
  const [duracao, setDuracao] = useState('30');
  const [pausaAlmoco, setPausaAlmoco] = useState(true);

  // Avulso
  const [avulsoDays, setAvulsoDays] = useState(savedDayAbrevs.length ? savedDayAbrevs : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
  const [avulsoSlots, setAvulsoSlots] = useState(['08:00']);
  const [avulsoInput, setAvulsoInput] = useState('');

  const [localSuccess, setLocalSuccess] = useState('');
  const [slotsEditaveis, setSlotsEditaveis] = useState(
    () => firstSavedSlots ? [...firstSavedSlots] : gerarSlots('08:00', '17:00', '30', true)
  );
  const [slotsManualmenteTocados, setSlotsManualmenteTocados] = useState(false);
  const [slotsOriginais, setSlotsOriginais] = useState(
    () => firstSavedSlots ? [...firstSavedSlots] : gerarSlots('08:00', '17:00', '30', true)
  );

  const toggleDay = (d) => setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleAvulsoDay = (d) => setAvulsoDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  useEffect(() => {
    if (!horariosAtendimentoAtual) return;
    const entries = Object.entries(horariosAtendimentoAtual);
    if (entries.length > 0 && Array.isArray(entries[0][1]) && entries[0][1].length > 0) {
      setSlotsEditaveis([...entries[0][1]]);
      setSlotsOriginais([...entries[0][1]]);
      setSlotsManualmenteTocados(false);
    }
    if (Array.isArray(diasAtendimentoAtual) && diasAtendimentoAtual.length > 0) {
      const abrevs = diasAtendimentoAtual.map(d => DIA_ABREV_MAP[d] || d).filter(a => DIAS_ABREV.includes(a));
      if (abrevs.length > 0) { setSelectedDays(abrevs); setAvulsoDays(abrevs); }
    }
  }, [horariosAtendimentoAtual, diasAtendimentoAtual]);

  useEffect(() => {
    if (!slotsManualmenteTocados) return;
    const novos = gerarSlots(inicio, fim, duracao, pausaAlmoco);
    setSlotsEditaveis(novos);
    setSlotsOriginais(novos);
  }, [inicio, fim, duracao, pausaAlmoco]);

  const removerSlotIntervalo = (slot) => { setSlotsManualmenteTocados(true); setSlotsEditaveis(prev => prev.filter(s => s !== slot)); };

  const formatCPF = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const handleHorarioChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length <= 2) setHorarioReserva(v);
    else if (v.length <= 4) setHorarioReserva(v.slice(0, 2) + ':' + v.slice(2));
    else setHorarioReserva(v.slice(0, 2) + ':' + v.slice(2, 4));
  };

  const handleAdicionarAvulso = () => {
    const t = avulsoInput.trim();
    if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return;
    const formatted = t.split(':').map((x, i) => i === 0 ? String(parseInt(x)).padStart(2, '0') : x).join(':');
    if (!avulsoSlots.includes(formatted)) {
      setAvulsoSlots(prev => [...prev, formatted].sort());
    }
    setAvulsoInput('');
  };

  const handleCriarHorarios = () => {
    if (!onSalvarHorarios) return;

    let dias, horarios;
    if (modoHorario === 'intervalo') {
      if (selectedDays.length === 0) return;
      if (slotsEditaveis.length === 0) return;
      dias = selectedDays.map(d => DIA_FULL[d] || d);
      horarios = {};
      dias.forEach(d => { horarios[d] = [...slotsEditaveis]; });
    } else {
      if (avulsoDays.length === 0 || avulsoSlots.length === 0) return;
      dias = avulsoDays.map(d => DIA_FULL[d] || d);
      horarios = {};
      dias.forEach(d => { horarios[d] = [...avulsoSlots]; });
    }

    onSalvarHorarios({ diasAtendimento: dias, horariosAtendimento: horarios });
    setLocalSuccess('Horários salvos com sucesso!');
    setTimeout(() => setLocalSuccess(''), 3000);
  };

  const subtitulo = modo === 'paciente'
    ? 'Agende uma consulta diretamente para um paciente pelo CPF.'
    : 'Configure quais horários ficam visíveis para os pacientes agendarem.';

  /* ── Modo paciente ── */
  if (modo === 'paciente') {
    return (
      <div style={{ padding: '28px 32px', fontFamily: 'Figtree, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Criar consulta para paciente</h1>
            <p style={{ color: '#888', fontSize: '14px', margin: '6px 0 0' }}>{subtitulo}</p>
          </div>

          <div style={CARD}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelS}>CPF do paciente</label>
                <input
                  type="text" value={cpfUsuario}
                  onChange={e => setCpfUsuario(formatCPF(e.target.value))}
                  placeholder="000.000.000-00" maxLength={14}
                  style={{ ...inputS, fontSize: '16px', padding: '12px 14px' }}
                  autoFocus
                />
              </div>

              {userId ? (
                <div style={{ padding: '14px 16px', background: '#E8F5EF', borderRadius: '10px', border: '1.5px solid #9DD8CC', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1B4D3E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                    {(nomeReserva?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#1B4D3E' }}>{nomeReserva} {sobrenomeReserva}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#1B4D3E', opacity: 0.8 }}>{emailReserva}{telefoneReserva ? ` · ${telefoneReserva}` : ''}</p>
                  </div>
                </div>
              ) : cpfUsuario.replace(/\D/g, '').length === 11 ? (
                <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: '8px', border: '1.5px solid #FECACA' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', fontWeight: '500' }}>Paciente não encontrado com este CPF.</p>
                </div>
              ) : null}

              <div>
                <label style={labelS}>Data da consulta</label>
                <div style={{ border: '1.5px solid #E0DFD9', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                  <DatePicker selected={dataReserva} onChange={d => d && setDataReserva(d)} minDate={new Date()} dateFormat="dd/MM/yyyy" locale={ptBR} showPopperArrow={false} inline />
                </div>
              </div>

              <div>
                <label style={labelS}>Horário</label>
                <input
                  type="text" placeholder="HH:MM"
                  value={horarioReserva ? (formatarHorarioBrasil(horarioReserva) || horarioReserva) : ''}
                  onChange={handleHorarioChange} maxLength={5}
                  style={{ ...inputS, fontSize: '16px', padding: '12px 14px', letterSpacing: '2px' }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #F0EFE9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button style={{ padding: '10px 20px', background: 'none', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
                Limpar
              </button>
              <button
                onClick={handleCreateReserva}
                disabled={!userId}
                style={{ padding: '10px 28px', background: userId ? '#1B4D3E' : '#ccc', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: userId ? 'pointer' : 'not-allowed', fontFamily: 'Figtree, sans-serif' }}
              >
                ✓ Criar consulta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Modo horarios ── */
  const TABS = [
    { key: 'recorrente', label: 'Configurar horários' },
    { key: 'bloquear',   label: 'Bloquear período' },
  ];

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Figtree, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Editar horários</h1>
        <p style={{ color: '#888', fontSize: '14px', margin: '6px 0 0', maxWidth: '520px' }}>{subtitulo}</p>
      </div>

      {localSuccess && (
        <div style={{ background: '#D1FAE5', color: '#065F46', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontWeight: '600', fontSize: '14px' }}>
          ✓ {localSuccess}
        </div>
      )}

      <div style={{ ...CARD, padding: '20px 24px', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Horários cadastrados atualmente
        </p>
        {savedEntries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {savedEntries.map(([dia, horas]) => {
              const arr = Array.isArray(horas) ? horas : [];
              return (
                <div key={dia} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ minWidth: '80px', fontSize: '13px', fontWeight: '700', color: '#1B4D3E', paddingTop: '3px' }}>{dia}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {arr.map(h => (
                      <span key={h} style={{ background: '#E8F5EF', color: '#1B4D3E', borderRadius: '5px', padding: '2px 8px', fontSize: '12px', fontWeight: '600' }}>{h}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#aaa', fontStyle: 'italic' }}>
            Nenhum horário configurado ainda. Use o formulário abaixo para configurar pela primeira vez.
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        {/* Main form */}
        <div style={CARD}>
          {/* Tabs */}
          <div style={{ display: 'flex', padding: '16px 20px 0', gap: '4px', borderBottom: '1px solid #F0EFE9' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '8px 16px', borderRadius: '8px 8px 0 0', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: tab === t.key ? '700' : '400',
                background: tab === t.key ? '#F0EFE9' : 'transparent',
                color: tab === t.key ? '#1a1a1a' : '#888',
                fontFamily: 'Figtree, sans-serif',
                marginBottom: tab === t.key ? '-1px' : 0,
                borderBottom: tab === t.key ? '2px solid #1B4D3E' : 'none',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px' }}>
            {/* ── Configurar horários ── */}
            {tab === 'recorrente' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Modo toggle */}
                <div>
                  <label style={labelS}>Tipo de configuração</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { v: 'intervalo', label: 'Intervalo automático', desc: 'Gera todos os slots entre horário inicial e final' },
                      { v: 'avulso',   label: 'Horários específicos', desc: 'Escolha manualmente cada horário disponível' },
                    ].map(opt => {
                      const active = modoHorario === opt.v;
                      return (
                        <button key={opt.v} onClick={() => setModoHorario(opt.v)} style={{
                          padding: '14px', borderRadius: '10px', border: '1.5px solid',
                          borderColor: active ? '#1B4D3E' : '#E0DFD9',
                          background: active ? '#E8F5EF' : 'white',
                          cursor: 'pointer', textAlign: 'left', fontFamily: 'Figtree, sans-serif',
                        }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: active ? '#1B4D3E' : '#333' }}>{opt.label}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888', lineHeight: 1.4 }}>{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Intervalo ── */}
                {modoHorario === 'intervalo' && (
                  <>
                    {/* Days */}
                    <div>
                      <label style={labelS}>Dias da semana</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {DIAS_ABREV.map(d => {
                          const active = selectedDays.includes(d);
                          return (
                            <button key={d} onClick={() => toggleDay(d)} style={{
                              padding: '9px 14px', borderRadius: '8px', border: '1.5px solid',
                              borderColor: active ? '#1B4D3E' : '#E0DFD9',
                              background: active ? '#1B4D3E' : 'white',
                              color: active ? 'white' : '#555',
                              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                              fontFamily: 'Figtree, sans-serif',
                            }}>
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time range + duration */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={labelS}>Início</label>
                        <input type="time" value={inicio} onChange={e => { setSlotsManualmenteTocados(true); setInicio(e.target.value); }} style={inputS} />
                      </div>
                      <div>
                        <label style={labelS}>Fim</label>
                        <input type="time" value={fim} onChange={e => { setSlotsManualmenteTocados(true); setFim(e.target.value); }} style={inputS} />
                      </div>
                      <div>
                        <label style={labelS}>Duração</label>
                        <select value={duracao} onChange={e => { setSlotsManualmenteTocados(true); setDuracao(e.target.value); }} style={{ ...inputS, cursor: 'pointer' }}>
                          {DURACOES.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Pausa almoço */}
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', borderRadius: '10px',
                      background: pausaAlmoco ? '#F0F9F6' : '#F7F7F4',
                      border: `1.5px solid ${pausaAlmoco ? '#9DD8CC' : '#E0DFD9'}`,
                      cursor: 'pointer',
                    }}>
                      <input type="checkbox" checked={pausaAlmoco} onChange={e => { setSlotsManualmenteTocados(true); setPausaAlmoco(e.target.checked); }}
                        style={{ width: '16px', height: '16px', accentColor: '#1B4D3E', cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Pausa para almoço (12:00 – 13:30)</span>
                    </label>

                    {/* Preview inline com remoção */}
                    {slotsEditaveis.length > 0 && (() => {
                      const removidos = slotsOriginais.filter(s => !slotsEditaveis.includes(s));
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                              <label style={{ ...labelS, marginBottom: 0 }}>
                                Horários ativos ({slotsEditaveis.length}) — clique × para remover
                              </label>
                              <button
                                onClick={() => { const r = gerarSlots(inicio, fim, duracao, pausaAlmoco); setSlotsEditaveis(r); setSlotsOriginais(r); }}
                                style={{ padding: '5px 12px', background: 'none', border: '1.5px solid #1B4D3E', color: '#1B4D3E', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif', whiteSpace: 'nowrap' }}
                              >
                                ↺ Restaurar horários
                              </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {slotsEditaveis.map(s => (
                                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#E8F5EF', color: '#1B4D3E', borderRadius: '6px', padding: '4px 6px 4px 10px', fontSize: '13px', fontWeight: '600' }}>
                                  {s}
                                  <button onClick={() => removerSlotIntervalo(s)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4D3E', fontSize: '14px', lineHeight: 1, padding: '0 2px', opacity: 0.6 }}>×</button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {removidos.length > 0 && (
                            <div style={{ background: '#F7F7F4', borderRadius: '8px', padding: '12px' }}>
                              <label style={{ ...labelS, marginBottom: '8px', color: '#888' }}>
                                Horários removidos ({removidos.length}) — clique + para readicionar
                              </label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {removidos.map(s => (
                                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'white', color: '#888', border: '1px dashed #ccc', borderRadius: '6px', padding: '4px 6px 4px 10px', fontSize: '13px', fontWeight: '600' }}>
                                    {s}
                                    <button onClick={() => setSlotsEditaveis(prev => [...prev, s].sort())}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4D3E', fontSize: '15px', lineHeight: 1, padding: '0 2px', fontWeight: '700' }}>+</button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* ── Avulso ── */}
                {modoHorario === 'avulso' && (
                  <>
                    {/* Days */}
                    <div>
                      <label style={labelS}>Dias da semana</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {DIAS_ABREV.map(d => {
                          const active = avulsoDays.includes(d);
                          return (
                            <button key={d} onClick={() => toggleAvulsoDay(d)} style={{
                              padding: '9px 14px', borderRadius: '8px', border: '1.5px solid',
                              borderColor: active ? '#1B4D3E' : '#E0DFD9',
                              background: active ? '#1B4D3E' : 'white',
                              color: active ? 'white' : '#555',
                              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                              fontFamily: 'Figtree, sans-serif',
                            }}>
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Adicionar horário */}
                    <div>
                      <label style={labelS}>Adicionar horário</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="time" value={avulsoInput} onChange={e => setAvulsoInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAdicionarAvulso()}
                          style={{ ...inputS, flex: 1 }}
                        />
                        <button onClick={handleAdicionarAvulso} style={{
                          padding: '10px 18px', background: '#1B4D3E', color: 'white', border: 'none',
                          borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif', flexShrink: 0,
                        }}>
                          + Adicionar
                        </button>
                      </div>
                    </div>

                    {/* Lista de slots avulsos */}
                    {avulsoSlots.length > 0 && (
                      <div>
                        <label style={{ ...labelS, marginBottom: '10px' }}>Horários selecionados ({avulsoSlots.length})</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {avulsoSlots.map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#E8F5EF', borderRadius: '8px', padding: '6px 10px 6px 12px', border: '1px solid #9DD8CC' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1B4D3E' }}>{s}</span>
                              <button
                                onClick={() => setAvulsoSlots(prev => prev.filter(x => x !== s))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4D3E', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}
                              >×</button>
                            </div>
                          ))}
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#888' }}>
                          Esses horários serão aplicados a todos os dias selecionados acima.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Bloquear tab ── */}
            {tab === 'bloquear' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '460px' }}>
                <div style={{ padding: '16px', background: '#FFF3EE', borderRadius: '10px', border: '1.5px solid #FED7B0' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#E8611A' }}>⚠ Bloquear período</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>Os horários bloqueados ficam indisponíveis para os pacientes agendarem.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelS}>Data início</label>
                    <input type="date" style={inputS} />
                  </div>
                  <div>
                    <label style={labelS}>Data fim</label>
                    <input type="date" style={inputS} />
                  </div>
                </div>
                <div>
                  <label style={labelS}>Motivo (opcional)</label>
                  <input type="text" placeholder="Ex: Férias, congresso..." style={inputS} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={{ padding: '10px 20px', background: 'none', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
              Cancelar
            </button>
            <button
              onClick={handleCriarHorarios}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#1B4D3E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}
            >
              ✓ {tab === 'bloquear' ? 'Bloquear período' : 'Salvar horários'}
            </button>
          </div>
        </div>

        {/* Right panel — summary */}
        {tab === 'recorrente' && (
          <div style={CARD}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F0EFE9' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>Resumo</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>O que os pacientes verão:</p>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modoHorario === 'intervalo' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#E8F5EF', borderRadius: '10px', padding: '14px' }}>
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1B4D3E' }}>{slotsEditaveis.length}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#1B4D3E', fontWeight: '500' }}>slots por dia</p>
                    </div>
                    <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '14px' }}>
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#333' }}>{selectedDays.length}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888', fontWeight: '500' }}>dias/semana</p>
                    </div>
                  </div>
                  <div style={{ background: '#F0F9F6', borderRadius: '8px', padding: '10px 14px' }}>
                    <span style={{ fontSize: '13px', color: '#1B4D3E', fontWeight: '600' }}>
                      Total: ~{slotsEditaveis.length * selectedDays.length} consultas/semana
                    </span>
                  </div>
                  {selectedDays.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888', fontWeight: '500' }}>Dias configurados:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {selectedDays.map(d => (
                          <span key={d} style={{ background: '#1B4D3E', color: 'white', borderRadius: '5px', padding: '3px 8px', fontSize: '12px', fontWeight: '600' }}>{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#E8F5EF', borderRadius: '10px', padding: '14px' }}>
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1B4D3E' }}>{avulsoSlots.length}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#1B4D3E', fontWeight: '500' }}>slots por dia</p>
                    </div>
                    <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '14px' }}>
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#333' }}>{avulsoDays.length}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888', fontWeight: '500' }}>dias/semana</p>
                    </div>
                  </div>
                  {avulsoSlots.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888', fontWeight: '500' }}>Horários:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {avulsoSlots.map(s => (
                          <span key={s} style={{ background: '#E8F5EF', color: '#1B4D3E', borderRadius: '5px', padding: '3px 8px', fontSize: '12px', fontWeight: '600' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CriarConsulta;
