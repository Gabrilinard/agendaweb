import { ptBR } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useMemo, useState } from 'react';

const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };
const inputS = {
  padding: '10px 12px', border: '1.5px solid #E0DFD9', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'Figtree, sans-serif', outline: 'none', color: '#1a1a1a',
  background: 'white', width: '100%', boxSizing: 'border-box',
};
const labelS = { fontSize: '13px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '6px' };

const toMin = (t) => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m; };

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DURACOES = [{ v: '15', l: '15 min' }, { v: '20', l: '20 min' }, { v: '30', l: '30 min' }, { v: '45', l: '45 min' }, { v: '60', l: '1 hora' }, { v: '90', l: '1h 30min' }];

const CriarConsulta = ({
  cpfUsuario, setCpfUsuario, userId,
  nomeReserva, sobrenomeReserva, emailReserva, telefoneReserva,
  dataReserva, setDataReserva,
  horarioReserva, setHorarioReserva,
  formatarHorarioBrasil,
  handleCreateReserva,
}) => {
  const [tab, setTab] = useState('recorrente');
  const [selectedDays, setSelectedDays] = useState(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
  const [inicio, setInicio] = useState('08:00');
  const [fim, setFim] = useState('17:00');
  const [duracao, setDuracao] = useState('30');
  const [modalidade, setModalidade] = useState('ambos');
  const [pausaAlmoco, setPausaAlmoco] = useState(true);
  const [aceitarEmergentes, setAceitarEmergentes] = useState(true);
  const [localSuccess, setLocalSuccess] = useState('');

  const toggleDay = (d) => setSelectedDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const slotsPerDay = useMemo(() => {
    const start = toMin(inicio);
    const end = toMin(fim);
    const pause = pausaAlmoco ? 90 : 0;
    const available = end - start - pause;
    return Math.max(0, Math.floor(available / parseInt(duracao)));
  }, [inicio, fim, duracao, pausaAlmoco]);

  const daysPerWeek = selectedDays.length;
  const totalWeek = slotsPerDay * daysPerWeek;

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

  const handleCriarHorarios = () => {
    setLocalSuccess('Horários criados com sucesso!');
    setTimeout(() => setLocalSuccess(''), 3000);
  };

  const TABS = [
    { key: 'recorrente', icon: '≡', label: 'Horário recorrente' },
    { key: 'unico', icon: '+', label: 'Horário único' },
    { key: 'bloquear', icon: '×', label: 'Bloquear período' },
  ];

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Figtree, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Criar consulta / bloquear horário</h1>
        <p style={{ color: '#888', fontSize: '14px', margin: '6px 0 0', maxWidth: '520px' }}>
          Configure horários únicos ou repetições semanais. Pacientes vão ver apenas os horários liberados.
        </p>
      </div>

      {localSuccess && (
        <div style={{ background: '#D1FAE5', color: '#065F46', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontWeight: '600', fontSize: '14px' }}>
          ✓ {localSuccess}
        </div>
      )}

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
                display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: tab === t.key ? '-1px' : 0,
                borderBottom: tab === t.key ? '2px solid #1B4D3E' : 'none',
              }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px' }}>
            {/* ── Recorrente tab ── */}
            {tab === 'recorrente' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Days */}
                <div>
                  <label style={labelS}>Dias da semana</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DIAS.map(d => {
                      const active = selectedDays.includes(d);
                      return (
                        <button key={d} onClick={() => toggleDay(d)} style={{
                          padding: '10px 16px', borderRadius: '8px', border: '1.5px solid',
                          borderColor: active ? '#1B4D3E' : '#E0DFD9',
                          background: active ? '#1B4D3E' : 'white',
                          color: active ? 'white' : '#555',
                          fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                          fontFamily: 'Figtree, sans-serif',
                        }}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelS}>Início</label>
                    <input type="time" value={inicio} onChange={e => setInicio(e.target.value)} style={inputS} />
                  </div>
                  <div>
                    <label style={labelS}>Fim</label>
                    <input type="time" value={fim} onChange={e => setFim(e.target.value)} style={inputS} />
                  </div>
                  <div>
                    <label style={labelS}>Duração</label>
                    <select value={duracao} onChange={e => setDuracao(e.target.value)} style={{ ...inputS, cursor: 'pointer' }}>
                      {DURACOES.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Modalidade */}
                <div>
                  <label style={labelS}>Modalidade</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {['presencial', 'online', 'ambos'].map(m => {
                      const active = modalidade === m;
                      const labels = { presencial: 'Presencial', online: 'Online', ambos: 'Ambos' };
                      return (
                        <button key={m} onClick={() => setModalidade(m)} style={{
                          padding: '11px', borderRadius: '8px', border: '1.5px solid',
                          borderColor: active ? '#1B4D3E' : '#E0DFD9',
                          background: active ? '#E8F5EF' : 'white',
                          color: active ? '#1B4D3E' : '#555',
                          fontSize: '14px', fontWeight: active ? '700' : '400',
                          cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
                        }}>
                          {labels[m]}
                        </button>
                      );
                    })}
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
                  <input type="checkbox" checked={pausaAlmoco} onChange={e => setPausaAlmoco(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#1B4D3E', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Pausa para almoço (12:00 – 13:30)</span>
                </label>

                {/* Aceitar emergentes */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '14px 16px', borderRadius: '10px',
                  background: aceitarEmergentes ? '#FFFBEB' : '#F7F7F4',
                  border: `1.5px solid ${aceitarEmergentes ? '#FDE68A' : '#E0DFD9'}`,
                  cursor: 'pointer',
                }}>
                  <input type="checkbox" checked={aceitarEmergentes} onChange={e => setAceitarEmergentes(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#E8611A', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: aceitarEmergentes ? '#E8611A' : '#555' }}>
                      Aceitar consultas emergentes neste período
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#888' }}>
                      Pacientes em urgência poderão solicitar atendimento
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* ── Horário único tab ── */}
            {tab === 'unico' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '460px' }}>
                <div>
                  <label style={labelS}>CPF do paciente</label>
                  <input
                    type="text" value={cpfUsuario}
                    onChange={e => setCpfUsuario(formatCPF(e.target.value))}
                    placeholder="000.000.000-00" maxLength={14} style={inputS}
                  />
                </div>
                {userId && (
                  <div style={{ padding: '12px 16px', background: '#E8F5EF', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '14px', color: '#1B4D3E' }}>Paciente encontrado ✓</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1B4D3E' }}>{nomeReserva} {sobrenomeReserva} · {emailReserva}</p>
                  </div>
                )}
                <div>
                  <label style={labelS}>Data</label>
                  <div style={{ border: '1.5px solid #E0DFD9', borderRadius: '8px', overflow: 'hidden' }}>
                    <DatePicker selected={dataReserva} onChange={d => d && setDataReserva(d)} minDate={new Date()} dateFormat="dd/MM/yyyy" locale={ptBR} showPopperArrow={false} inline />
                  </div>
                </div>
                <div>
                  <label style={labelS}>Horário</label>
                  <input type="text" placeholder="HH:MM" value={horarioReserva ? (formatarHorarioBrasil(horarioReserva) || horarioReserva) : ''} onChange={handleHorarioChange} maxLength={5} style={inputS} />
                </div>
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
              onClick={tab === 'unico' ? handleCreateReserva : handleCriarHorarios}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#1B4D3E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}
            >
              ✓ {tab === 'unico' ? 'Criar consulta' : tab === 'bloquear' ? 'Bloquear' : 'Criar horários'}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Preview */}
          {tab === 'recorrente' && (
            <div style={CARD}>
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F0EFE9' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>Pré-visualização</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>Com a configuração atual:</p>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: '#E8F5EF', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1B4D3E' }}>{slotsPerDay}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#1B4D3E', fontWeight: '500' }}>slots por dia</p>
                  </div>
                  <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#333' }}>{daysPerWeek}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888', fontWeight: '500' }}>dias/semana</p>
                  </div>
                </div>
                <div style={{ background: '#F0F9F6', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#1B4D3E' }}>ℹ</span>
                  <span style={{ fontSize: '13px', color: '#1B4D3E', fontWeight: '600' }}>Total: ~{totalWeek} consultas/semana</span>
                </div>
              </div>
            </div>
          )}

          {/* Dicas */}
          <div style={CARD}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F0EFE9' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>Dicas</h3>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Slots curtos (15-20 min) funcionam melhor para retorno',
                'Aceite emergências em pelo menos um dia da semana',
                'Bloqueie 5 min entre consultas para anotações',
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#555' }}>
                  <span style={{ color: '#1B4D3E', fontWeight: '700', flexShrink: 0 }}>✓</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarConsulta;
