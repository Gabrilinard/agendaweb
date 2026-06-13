import { useEffect, useState } from 'react';
import { Input, Select } from '../style';

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toTime = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const DURACOES = [{ v: 30, l: '30 min' }, { v: 45, l: '45 min' }, { v: 60, l: '1 hora' }];
const DIAS_CHIPS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const gerarSlots = (inicio, fim, duracao, pausaAtiva, pausaInicio, pausaFim) => {
  const slots = [];
  let cur = toMin(inicio);
  const end = toMin(fim);
  const pI = pausaAtiva ? toMin(pausaInicio) : null;
  const pF = pausaAtiva ? toMin(pausaFim) : null;
  while (cur + duracao <= end) {
    if (pI !== null && cur >= pI && cur < pF) { cur = pF; continue; }
    slots.push(toTime(cur));
    cur += duracao;
  }
  return slots;
};

const chipStyle = (active) => ({
  padding: '6px 13px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
  cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
  border: `1.5px solid ${active ? '#1B4D3E' : '#ccc'}`,
  background: active ? '#1B4D3E' : 'white',
  color: active ? 'white' : '#555',
  transition: 'all 0.12s',
});

const timeInput = {
  padding: '8px 10px', border: '1px solid #ccc', borderRadius: '6px',
  fontSize: '13px', fontFamily: 'Figtree, sans-serif', width: '90px',
};

const HorariosSetup = ({
  diasSemana, diasAtendimento, setDiasAtendimento,
  horariosAtendimento, setHorariosAtendimento,
  handleDiaChange, handleHorarioChange, handleAddHorario, handleRemoveHorario,
  formatarHorarioInput, normalizarHorario24h, ordenarHorariosDia,
}) => {
  const [modo, setModo] = useState('rapido');
  const [diasRapido, setDiasRapido] = useState(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']);
  const [entrada, setEntrada] = useState('08:00');
  const [saida, setSaida] = useState('17:00');
  const [duracao, setDuracao] = useState(30);
  const [pausaAtiva, setPausaAtiva] = useState(true);
  const [pausaInicio, setPausaInicio] = useState('12:00');
  const [pausaFim, setPausaFim] = useState('13:00');
  const [aplicado, setAplicado] = useState(false);
  const [slotsEditaveis, setSlotsEditaveis] = useState([]);

  const regen = (e, s, d, pa, pi, pf) => { setSlotsEditaveis(gerarSlots(e, s, d, pa, pi, pf)); setAplicado(false); };

  const handleEntrada  = v => { setEntrada(v);     regen(v, saida, duracao, pausaAtiva, pausaInicio, pausaFim); };
  const handleSaida    = v => { setSaida(v);       regen(entrada, v, duracao, pausaAtiva, pausaInicio, pausaFim); };
  const handleDuracao  = v => { setDuracao(v);     regen(entrada, saida, v, pausaAtiva, pausaInicio, pausaFim); };
  const handlePausa    = v => { setPausaAtiva(v);  regen(entrada, saida, duracao, v, pausaInicio, pausaFim); };
  const handlePausaIni = v => { setPausaInicio(v); regen(entrada, saida, duracao, pausaAtiva, v, pausaFim); };
  const handlePausaFim = v => { setPausaFim(v);    regen(entrada, saida, duracao, pausaAtiva, pausaInicio, v); };

  const removerSlot = (slot) => { setSlotsEditaveis(prev => prev.filter(s => s !== slot)); setAplicado(false); };
  const toggleDiaRapido = (dia) => {
    setDiasRapido(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
    setAplicado(false);
  };

  useEffect(() => {
    setSlotsEditaveis(gerarSlots(entrada, saida, duracao, pausaAtiva, pausaInicio, pausaFim));
  }, []);

  useEffect(() => {
    if (modo !== 'rapido' || !diasRapido.length || !slotsEditaveis.length) return;
    const dias = DIAS_CHIPS.filter(d => diasRapido.includes(d));
    setDiasAtendimento(dias);
    const horarios = {};
    dias.forEach(d => { horarios[d] = [...slotsEditaveis]; });
    setHorariosAtendimento(horarios);
  }, [diasRapido, slotsEditaveis, modo]);

  const aplicarRapido = () => {
    if (!diasRapido.length || !slotsEditaveis.length) return;
    const dias = DIAS_CHIPS.filter(d => diasRapido.includes(d));
    setDiasAtendimento(dias);
    const horarios = {};
    dias.forEach(d => { horarios[d] = [...slotsEditaveis]; });
    setHorariosAtendimento(horarios);
    setAplicado(true);
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '10px', textAlign: 'left', fontWeight: 'bold' }}>
        Dias & Horários de Atendimento:
      </label>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {[{ k: 'rapido', l: '⚡ Configuração rápida' }, { k: 'manual', l: 'Personalizado' }].map(opt => (
          <button key={opt.k} type="button" onClick={() => setModo(opt.k)} style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
            border: `1.5px solid ${modo === opt.k ? '#1B4D3E' : '#ccc'}`,
            background: modo === opt.k ? '#1B4D3E' : 'white',
            color: modo === opt.k ? 'white' : '#555',
          }}>
            {opt.l}
          </button>
        ))}
      </div>

      {modo === 'rapido' && (
        <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: '#555' }}>DIAS DA SEMANA</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {DIAS_CHIPS.map(d => (
                <button key={d} type="button" onClick={() => toggleDiaRapido(d)} style={chipStyle(diasRapido.includes(d))}>
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: '700', color: '#555' }}>ENTRADA</p>
              <input type="time" value={entrada} onChange={e => handleEntrada(e.target.value)} style={timeInput} />
            </div>
            <div>
              <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: '700', color: '#555' }}>SAÍDA</p>
              <input type="time" value={saida} onChange={e => handleSaida(e.target.value)} style={timeInput} />
            </div>
            <div>
              <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: '700', color: '#555' }}>DURAÇÃO DA CONSULTA</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {DURACOES.map(d => (
                  <button key={d.v} type="button" onClick={() => handleDuracao(d.v)} style={chipStyle(duracao === d.v)}>{d.l}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={pausaAtiva} onChange={e => handlePausa(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: '#1B4D3E', cursor: 'pointer' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>Pausa no almoço</span>
            </label>
            {pausaAtiva && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingLeft: '23px' }}>
                <input type="time" value={pausaInicio} onChange={e => handlePausaIni(e.target.value)} style={timeInput} />
                <span style={{ fontSize: '13px', color: '#888' }}>até</span>
                <input type="time" value={pausaFim} onChange={e => handlePausaFim(e.target.value)} style={timeInput} />
              </div>
            )}
          </div>

          {slotsEditaveis.length > 0 && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '700', color: '#555' }}>
                PRÉVIA — {slotsEditaveis.length} horários (clique × para remover)
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {slotsEditaveis.map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', padding: '3px 4px 3px 8px', fontSize: '12px', color: '#333' }}>
                    {s}
                    <button type="button" onClick={() => removerSlot(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button type="button" onClick={aplicarRapido}
            disabled={!diasRapido.length || !slotsEditaveis.length}
            style={{
              padding: '10px', borderRadius: '7px', fontSize: '13px', fontWeight: '700',
              cursor: !diasRapido.length || !slotsEditaveis.length ? 'not-allowed' : 'pointer',
              border: 'none', fontFamily: 'Figtree, sans-serif',
              background: aplicado ? '#D1FAE5' : '#1B4D3E',
              color: aplicado ? '#065F46' : 'white',
              opacity: !diasRapido.length || !slotsEditaveis.length ? 0.5 : 1,
              transition: 'all 0.15s',
            }}>
            {aplicado ? '✓ Horários aplicados!' : `Aplicar para ${diasRapido.length} dia(s) selecionado(s)`}
          </button>
        </div>
      )}

      {modo === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Select onChange={handleDiaChange} value="">
            <option value="" disabled>Adicionar dia...</option>
            <option value="Todos os dias">Todos os dias</option>
            {diasSemana.map(dia => (
              <option key={dia} value={dia} disabled={diasAtendimento.includes(dia)}>{dia}</option>
            ))}
          </Select>

          {diasAtendimento.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {diasAtendimento.map(dia => (
                <span key={dia} style={{ background: '#e0e0e0', padding: '5px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                  {dia}
                  <button type="button" onClick={() => handleDiaChange({ target: { value: dia } })}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#ff4444', padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          )}

          {diasAtendimento.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Horários por Dia:</label>
              {diasAtendimento.map(dia => (
                <div key={dia} style={{ marginBottom: '12px', padding: '10px', border: '1px solid #eee', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>{dia}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {horariosAtendimento[dia]?.map((horario, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Input type="text" value={horario} placeholder="HH:MM" inputMode="numeric" maxLength={5}
                          onChange={e => handleHorarioChange(dia, index, formatarHorarioInput(e.target.value))}
                          onBlur={e => { handleHorarioChange(dia, index, normalizarHorario24h(e.target.value)); ordenarHorariosDia(dia); }}
                          style={{ width: '90px' }} />
                        {horariosAtendimento[dia].length > 1 && (
                          <button type="button" onClick={() => handleRemoveHorario(dia, index)}
                            style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddHorario(dia)}
                      style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '13px' }}>
                      + Horário
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HorariosSetup;
