import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: rgb(227, 228, 222);
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  padding-top: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  background-color: white;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const RadioInput = styled.input`
  cursor: pointer;
`;

const EyeIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

const Button = styled.button`
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const LoginButton = styled.button`
  padding: 12px;
  background-color: rgb(143, 142, 142);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: rgb(82, 83, 84);
  }
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  margin: 15px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

const LocationPicker = ({ onLocationSelect, initialLat, initialLng }) => {
  const [position, setPosition] = useState(initialLat && initialLng ? [initialLat, initialLng] : [-14.235, -51.9253]);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });

    return position === null ? null : <Marker position={position} />;
  }

  return (
    <MapContainer
      center={position}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
};

// ── helpers ──────────────────────────────────────────────────────────────────
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

  const regenerarSlots = (e, s, d, pa, pi, pf) => {
    setSlotsEditaveis(gerarSlots(e, s, d, pa, pi, pf));
    setAplicado(false);
  };

  const handleEntrada   = v => { setEntrada(v);      regenerarSlots(v, saida, duracao, pausaAtiva, pausaInicio, pausaFim); };
  const handleSaida     = v => { setSaida(v);        regenerarSlots(entrada, v, duracao, pausaAtiva, pausaInicio, pausaFim); };
  const handleDuracao   = v => { setDuracao(v);      regenerarSlots(entrada, saida, v, pausaAtiva, pausaInicio, pausaFim); };
  const handlePausa     = v => { setPausaAtiva(v);   regenerarSlots(entrada, saida, duracao, v, pausaInicio, pausaFim); };
  const handlePausaIni  = v => { setPausaInicio(v);  regenerarSlots(entrada, saida, duracao, pausaAtiva, v, pausaFim); };
  const handlePausaFim  = v => { setPausaFim(v);     regenerarSlots(entrada, saida, duracao, pausaAtiva, pausaInicio, v); };

  const removerSlot = (slot) => { setSlotsEditaveis(prev => prev.filter(s => s !== slot)); setAplicado(false); };

  const toggleDiaRapido = (dia) => {
    setDiasRapido(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
    setAplicado(false);
  };

  // init slots on mount
  useEffect(() => {
    setSlotsEditaveis(gerarSlots(entrada, saida, duracao, pausaAtiva, pausaInicio, pausaFim));
  }, []);

  // auto-sync parent state whenever quick-mode config changes
  useEffect(() => {
    if (modo !== 'rapido') return;
    if (!diasRapido.length || !slotsEditaveis.length) return;
    const novosDias = DIAS_CHIPS.filter(d => diasRapido.includes(d));
    setDiasAtendimento(novosDias);
    const novosHorarios = {};
    novosDias.forEach(d => { novosHorarios[d] = [...slotsEditaveis]; });
    setHorariosAtendimento(novosHorarios);
  }, [diasRapido, slotsEditaveis, modo]);

  const aplicarRapido = () => {
    if (!diasRapido.length || !slotsEditaveis.length) return;
    const novosDias = DIAS_CHIPS.filter(d => diasRapido.includes(d));
    setDiasAtendimento(novosDias);
    const novosHorarios = {};
    novosDias.forEach(d => { novosHorarios[d] = [...slotsEditaveis]; });
    setHorariosAtendimento(novosHorarios);
    setAplicado(true);
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '10px', textAlign: 'left', fontWeight: 'bold' }}>
        Dias & Horários de Atendimento:
      </label>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {[{ k: 'rapido', l: '⚡ Configuração rápida' }, { k: 'manual', l: 'Personalizado' }].map(opt => (
          <button
            key={opt.k} type="button"
            onClick={() => setModo(opt.k)}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
              border: `1.5px solid ${modo === opt.k ? '#1B4D3E' : '#ccc'}`,
              background: modo === opt.k ? '#1B4D3E' : 'white',
              color: modo === opt.k ? 'white' : '#555',
            }}
          >
            {opt.l}
          </button>
        ))}
      </div>

      {modo === 'rapido' && (
        <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Dias */}
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

          {/* Horários entrada/saída */}
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
                  <button key={d.v} type="button" onClick={() => handleDuracao(d.v)} style={chipStyle(duracao === d.v)}>
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pausa almoço */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input
                type="checkbox" checked={pausaAtiva}
                onChange={e => handlePausa(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: '#1B4D3E', cursor: 'pointer' }}
              />
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

          {/* Preview com remoção individual */}
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
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={aplicarRapido}
            disabled={!diasRapido.length || !slotsEditaveis.length}
            style={{
              padding: '10px', borderRadius: '7px', fontSize: '13px', fontWeight: '700',
              cursor: !diasRapido.length || !slotsEditaveis.length ? 'not-allowed' : 'pointer',
              border: 'none', fontFamily: 'Figtree, sans-serif',
              background: aplicado ? '#D1FAE5' : '#1B4D3E',
              color: aplicado ? '#065F46' : 'white',
              opacity: !diasRapido.length || !slotsEditaveis.length ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >
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
                        <Input
                          type="text" value={horario} placeholder="HH:MM"
                          inputMode="numeric" maxLength={5}
                          onChange={e => handleHorarioChange(dia, index, formatarHorarioInput(e.target.value))}
                          onBlur={e => { handleHorarioChange(dia, index, normalizarHorario24h(e.target.value)); ordenarHorariosDia(dia); }}
                          style={{ width: '90px' }}
                        />
                        {horariosAtendimento[dia].length > 1 && (
                          <button type="button" onClick={() => handleRemoveHorario(dia, index)}
                            style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ×
                          </button>
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

const Registro = () => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('paciente');
  const [tipoProfissional, setTipoProfissional] = useState('');
  const [especialidadeMedica, setEspecialidadeMedica] = useState('');
  const [profissaoCustomizada, setProfissaoCustomizada] = useState('');
  const [numeroConselho, setNumeroConselho] = useState('');
  const [ufRegiao, setUfRegiao] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [cidade, setCidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [publicoAtendido, setPublicoAtendido] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [valorConsulta, setValorConsulta] = useState('');
  const [diasAtendimento, setDiasAtendimento] = useState([]);
  const [horariosAtendimento, setHorariosAtendimento] = useState({});
  const [cpf, setCpf] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: showError } = useNotification();

  const converterEstadoParaSigla = (estadoNome) => {
    const estadosMap = {
      'acre': 'AC',
      'alagoas': 'AL',
      'amapá': 'AP',
      'amazonas': 'AM',
      'bahia': 'BA',
      'ceará': 'CE',
      'distrito federal': 'DF',
      'espírito santo': 'ES',
      'goiás': 'GO',
      'maranhão': 'MA',
      'mato grosso': 'MT',
      'mato grosso do sul': 'MS',
      'minas gerais': 'MG',
      'pará': 'PA',
      'paraíba': 'PB',
      'paraná': 'PR',
      'pernambuco': 'PE',
      'piauí': 'PI',
      'rio de janeiro': 'RJ',
      'rio grande do norte': 'RN',
      'rio grande do sul': 'RS',
      'rondônia': 'RO',
      'roraima': 'RR',
      'santa catarina': 'SC',
      'são paulo': 'SP',
      'sergipe': 'SE',
      'tocantins': 'TO'
    };

    if (!estadoNome) return null;

    const estadoNormalizado = estadoNome.toLowerCase().trim();
    
    if (estadosMap[estadoNormalizado]) {
      return estadosMap[estadoNormalizado];
    }

    if (estadoNome.length === 2 && /^[A-Z]{2}$/i.test(estadoNome)) {
      return estadoNome.toUpperCase();
    }

    return null;
  };

  const buscarLocalizacao = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`);
      const data = await response.json();
      
      if (data && data.address) {
        let uf = data.address.state_code || data.address.state;
        const cidadeNome = data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county || '';
        
        if (uf) {
          let ufLimpo = uf.replace(/^[A-Z]{2}-/, '').toUpperCase();
          
          if (ufLimpo.length > 2) {
            const sigla = converterEstadoParaSigla(ufLimpo);
            if (sigla) {
              ufLimpo = sigla;
            }
          }
          
          setUfRegiao(ufLimpo);
        }
        if (cidadeNome) {
          setCidade(cidadeNome);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
    }
  };

  const handleMapClick = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    buscarLocalizacao(lat, lng);
  };

  const formatarNumeroConselho = (valor, tipoProfissional) => {
    if (!valor) return '';
    
    let apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length === 0) return '';
    
    switch (tipoProfissional) {
      case 'medico':
        if (apenasNumeros.length > 6) apenasNumeros = apenasNumeros.slice(0, 6);
        return `CRM ${apenasNumeros}`;
      case 'dentista':
        if (apenasNumeros.length > 6) apenasNumeros = apenasNumeros.slice(0, 6);
        return `CRO ${apenasNumeros}`;
      case 'nutricionista':
        if (apenasNumeros.length > 5) apenasNumeros = apenasNumeros.slice(0, 5);
        return `CRN ${apenasNumeros}`;
      case 'fisioterapeuta':
        if (apenasNumeros.length > 6) apenasNumeros = apenasNumeros.slice(0, 6);
        return `CREFITO ${apenasNumeros}`;
      case 'fonoaudiologo':
        if (apenasNumeros.length > 5) apenasNumeros = apenasNumeros.slice(0, 5);
        return `CRFa ${apenasNumeros}`;
      default:
        if (apenasNumeros.length > 10) apenasNumeros = apenasNumeros.slice(0, 10);
        return apenasNumeros;
    }
  };

  const validarNumeroConselho = (valor, tipoProfissional) => {
    if (!valor || !valor.trim()) return false;
    
    const apenasNumeros = valor.replace(/\D/g, '');
    
    switch (tipoProfissional) {
      case 'medico':
        return /^CRM\s?\d{4,6}$/i.test(valor.trim()) && apenasNumeros.length >= 4 && apenasNumeros.length <= 6;
      case 'dentista':
        return /^CRO\s?\d{4,6}$/i.test(valor.trim()) && apenasNumeros.length >= 4 && apenasNumeros.length <= 6;
      case 'nutricionista':
        return /^CRN\s?\d{4,5}$/i.test(valor.trim()) && apenasNumeros.length >= 4 && apenasNumeros.length <= 5;
      case 'fisioterapeuta':
        return /^CREFITO\s?\d{4,6}$/i.test(valor.trim()) && apenasNumeros.length >= 4 && apenasNumeros.length <= 6;
      case 'fonoaudiologo':
        return /^CRFa\s?\d{4,5}$/i.test(valor.trim()) && apenasNumeros.length >= 4 && apenasNumeros.length <= 5;
      default:
        return apenasNumeros.length >= 3 && apenasNumeros.length <= 10;
    }
  };

  const formatarCPF = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 3) return apenasNumeros;
    if (apenasNumeros.length <= 6) return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`;
    if (apenasNumeros.length <= 9) return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`;
    return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`;
  };

  const formatarHorarioInput = (valor) => {
    if (!valor) return '';
    const apenasNumeros = String(valor).replace(/\D/g, '').slice(0, 4);
    if (apenasNumeros.length <= 2) return apenasNumeros;
    return `${apenasNumeros.slice(0, 2)}:${apenasNumeros.slice(2)}`;
  };

  const normalizarHorario24h = (valor) => {
    if (!valor) return '';
    const texto = String(valor).trim();

    const matchAMPM = texto.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (matchAMPM) {
      let horas = parseInt(matchAMPM[1], 10);
      const minutos = parseInt(matchAMPM[2], 10);
      const periodo = matchAMPM[4].toUpperCase();

      if (Number.isNaN(horas) || Number.isNaN(minutos)) return '';
      if (minutos < 0 || minutos > 59) return '';

      if (periodo === 'PM' && horas !== 12) horas += 12;
      if (periodo === 'AM' && horas === 12) horas = 0;
      if (horas < 0 || horas > 23) return '';

      return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }

    const apenasNumeros = texto.replace(/\D/g, '').slice(0, 4);
    if (apenasNumeros.length !== 4) return texto;

    const horas = parseInt(apenasNumeros.slice(0, 2), 10);
    const minutos = parseInt(apenasNumeros.slice(2, 4), 10);
    if (Number.isNaN(horas) || Number.isNaN(minutos)) return '';
    if (horas < 0 || horas > 23) return '';
    if (minutos < 0 || minutos > 59) return '';

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  };

  const validarCPF = (cpf) => {
    if (!cpf) return false;
    
    const apenasNumeros = cpf.replace(/\D/g, '');
    
    if (apenasNumeros.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(apenasNumeros)) return false;
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(apenasNumeros.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(apenasNumeros.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(apenasNumeros.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(apenasNumeros.substring(10, 11))) return false;
    
    return true;
  };

  const handleCPFChange = (e) => {
    const valor = e.target.value;
    const formatado = formatarCPF(valor);
    setCpf(formatado);
  };

  const handleNumeroConselhoChange = (e) => {
    const valor = e.target.value;
    const formatado = formatarNumeroConselho(valor, tipoProfissional);
    setNumeroConselho(formatado);
  };

  const especialidadesMedicas = [
    'Clínico Geral',
    'Oftalmologista',
    'Cardiologista',
    'Dermatologista',
    'Pediatra',
    'Ginecologista',
    'Ortopedista',
    'Neurologista',
    'Psiquiatra',
    'Endocrinologista',
    'Gastroenterologista',
    'Urologista',
    'Otorrinolaringologista',
    'Pneumologista',
    'Reumatologista',
    'Oncologista',
    'Hematologista',
    'Nefrologista',
    'Anestesiologista',
    'Radiologista',
    'Patologista',
    'Medicina do Trabalho',
    'Medicina Esportiva',
    'Geriatra',
    'Mastologista',
    'Proctologista',
    'Angiologista',
    'Cirurgião Geral',
    'Cirurgião Plástico',
    'Cirurgião Cardiovascular',
    'Neurocirurgião',
    'Cirurgião Pediátrico'
  ];

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const handleDiaChange = (e) => {
    const dia = e.target.value;
    if (dia === 'Todos os dias') {
      // Se "Todos os dias" foi selecionado (verificamos se já temos todos os dias selecionados)
      const todosSelecionados = diasSemana.every(d => diasAtendimento.includes(d));
      
      if (todosSelecionados) {
        setDiasAtendimento([]);
        setHorariosAtendimento({});
      } else {
        setDiasAtendimento([...diasSemana]);
        const newHorarios = {};
        diasSemana.forEach(d => {
            newHorarios[d] = horariosAtendimento[d] || ['08:00'];
        });
        setHorariosAtendimento(newHorarios);
      }
    } else {
      // Toggle dia individual
      if (diasAtendimento.includes(dia)) {
        setDiasAtendimento(diasAtendimento.filter(d => d !== dia));
        const newHorarios = { ...horariosAtendimento };
        delete newHorarios[dia];
        setHorariosAtendimento(newHorarios);
      } else {
        setDiasAtendimento([...diasAtendimento, dia]);
        setHorariosAtendimento({
            ...horariosAtendimento,
            [dia]: ['08:00']
        });
      }
    }
  };

  const handleAddHorario = (dia) => {
    setHorariosAtendimento(prev => ({
      ...prev,
      [dia]: [...(prev[dia] || []), '']
    }));
  };

  const handleRemoveHorario = (dia, index) => {
    setHorariosAtendimento(prev => {
        const novosHorarios = [...prev[dia]];
        novosHorarios.splice(index, 1);
        return {
            ...prev,
            [dia]: novosHorarios
        };
    });
  };

  const handleHorarioChange = (dia, index, valor) => {
    setHorariosAtendimento(prev => {
        const novosHorarios = [...prev[dia]];
        novosHorarios[index] = valor;
        return {
            ...prev,
            [dia]: novosHorarios
        };
    });
  };

  const ordenarHorariosDia = (dia) => {
    setHorariosAtendimento(prev => {
      const horarios = [...(prev[dia] || [])];
      const regexHorarioValido = /^([01]\d|2[0-3]):[0-5]\d$/;

      const comMeta = horarios.map((v, idx) => {
        const texto = String(v || '').trim();
        const valido = regexHorarioValido.test(texto);
        const minutos = valido ? (parseInt(texto.slice(0, 2), 10) * 60 + parseInt(texto.slice(3, 5), 10)) : Number.POSITIVE_INFINITY;
        return { valor: v, idx, valido, minutos };
      });

      comMeta.sort((a, b) => {
        if (a.valido !== b.valido) return a.valido ? -1 : 1;
        if (a.minutos !== b.minutos) return a.minutos - b.minutos;
        return a.idx - b.idx;
      });

      return {
        ...prev,
        [dia]: comMeta.map(i => i.valor)
      };
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const senhaValida = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  
    if (!senhaValida.test(senha)) {
      showError('A senha deve ter no mínimo 8 caracteres, incluindo pelo menos um número e uma letra maiúscula.');
      return;
    }
  
    if (senha !== confirmarSenha) {
      showError('As senhas não coincidem!');
      return;
    }

    if (!cpf || !cpf.trim()) {
      showError('Por favor, informe o CPF.');
      return;
    }

    if (!validarCPF(cpf)) {
      showError('CPF inválido. Por favor, verifique o CPF informado.');
      return;
    }

    if (tipoUsuario === 'profissional') {
      if (!tipoProfissional) {
        showError('Por favor, selecione o tipo de profissional.');
        return;
      }
      if (tipoProfissional === 'medico' && !especialidadeMedica) {
        showError('Por favor, selecione sua especialidade médica.');
        return;
      }
      if (tipoProfissional === 'outros' && !profissaoCustomizada.trim()) {
        showError('Por favor, informe sua profissão.');
        return;
      }
      if (!numeroConselho || !numeroConselho.trim()) {
        showError('Por favor, informe o número do conselho.');
        return;
      }
      if (!validarNumeroConselho(numeroConselho, tipoProfissional)) {
        let mensagemErro = 'Número do conselho inválido. ';
        switch (tipoProfissional) {
          case 'medico':
            mensagemErro += 'Formato esperado: CRM 123456 (4 a 6 dígitos)';
            break;
          case 'dentista':
            mensagemErro += 'Formato esperado: CRO 123456 (4 a 6 dígitos)';
            break;
          case 'nutricionista':
            mensagemErro += 'Formato esperado: CRN 12345 (4 a 5 dígitos)';
            break;
          case 'fisioterapeuta':
            mensagemErro += 'Formato esperado: CREFITO 123456 (4 a 6 dígitos)';
            break;
          case 'fonoaudiologo':
            mensagemErro += 'Formato esperado: CRFa 12345 (4 a 5 dígitos)';
            break;
          default:
            mensagemErro += 'Formato inválido (3 a 10 dígitos)';
        }
        showError(mensagemErro);
        return;
      }
      if (!latitude || !longitude) {
        showError('Por favor, selecione sua localização no mapa.');
        return;
      }
      if (!ufRegiao || !ufRegiao.trim()) {
        showError('Por favor, selecione a UF/Região no mapa.');
        return;
      }
      if (!cidade || !cidade.trim()) {
        showError('Por favor, selecione sua cidade no mapa.');
        return;
      }
      if (!descricao || !descricao.trim()) {
        showError('Por favor, preencha a descrição.');
        return;
      }
      if (!publicoAtendido || !publicoAtendido.trim()) {
        showError('Por favor, selecione o público atendido.');
        return;
      }
      if (!modalidade || !modalidade.trim()) {
        showError('Por favor, selecione a modalidade.');
        return;
      }
    }
  
    try {
      const tipoUsuarioFinal = tipoUsuario || 'paciente';
      
      const dadosRegistro = {
        nome,
        sobrenome,
        telefone,
        email,
        senha,
        cpf: cpf.replace(/\D/g, ''),
        tipoUsuario: tipoUsuarioFinal,
        ...(tipoUsuarioFinal === 'profissional' && {
          tipoProfissional: tipoProfissional === 'outros' ? profissaoCustomizada : tipoProfissional,
          especialidadeMedica: tipoProfissional === 'medico' ? especialidadeMedica : null,
          profissaoCustomizada: tipoProfissional === 'outros' ? profissaoCustomizada : null,
          numeroConselho: numeroConselho.trim(),
          ufRegiao: ufRegiao.trim(),
          latitude: latitude,
          longitude: longitude,
          cidade: cidade.trim(),
          descricao: descricao.trim(),
          publicoAtendido: publicoAtendido.trim(),
          modalidade: modalidade,
          valorConsulta: valorConsulta,
          diasAtendimento: diasAtendimento,
          horariosAtendimento: horariosAtendimento
        })
      };
      
      const response = await axios.post('http://localhost:3000/register', dadosRegistro);
      console.log(response.data);
      success('Usuário cadastrado com sucesso!');

      await new Promise(resolve => setTimeout(resolve, 500));
      const userData = await login(email, senha);
      if (userData) {
        navigate(tipoUsuario === 'profissional' ? '/AdminDashboard' : '/');
      } else {
        navigate('/Entrar');
      }
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.error || 'Erro ao registrar. Tente novamente.');
    }
  };
  

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmarSenha(e.target.value);
    setPasswordsMatch(e.target.value === senha);
  };

  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); 
  
    if (value.length > 11) value = value.slice(0, 11); 
  
    if (value.length > 2 && value.length <= 7) {
      value = `${value.slice(0, 2)} ${value.slice(2)}`;
    } else if (value.length > 7) {
      value = `${value.slice(0, 2)} ${value.slice(2, 7)}-${value.slice(7)}`;
    }
  
    setTelefone(value);
  };
  

  return (
    <Container>
      <Header />
      <Content>
        <Form onSubmit={handleRegister}>
          <h2>Registrar-se</h2>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', textAlign: 'left', fontWeight: 'bold' }}>Tipo de Usuário:</label>
            <RadioGroup>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="tipoUsuario"
                  value="paciente"
                  checked={tipoUsuario === 'paciente'}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                />
                Paciente
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="tipoUsuario"
                  value="profissional"
                  checked={tipoUsuario === 'profissional'}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                />
                Profissional
              </RadioLabel>
            </RadioGroup>
          </div>

          <Input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <Input type="text" placeholder="Sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required />
          <Input 
            type="text" 
            placeholder="CPF" 
            value={cpf} 
            onChange={handleCPFChange}
            maxLength={14}
            required 
          />
          <Input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={handleTelefoneChange}
            maxLength="15"
            required
            />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <InputWrapper>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <EyeIcon onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </EyeIcon>
          </InputWrapper>

          <InputWrapper>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar Senha"
              value={confirmarSenha}
              onChange={handleConfirmPasswordChange}
              required
            />
            <EyeIcon onClick={toggleConfirmPasswordVisibility}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </EyeIcon>
          </InputWrapper>

          {!passwordsMatch && <p style={{ color: 'red' }}>As senhas não coincidem.</p>}

          {tipoUsuario === 'profissional' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '16px', textAlign: 'left', fontWeight: 'bold' }}>Tipo de Profissional:</label>
                <Select
                  value={tipoProfissional}
                  onChange={(e) => {
                    setTipoProfissional(e.target.value);
                    if (e.target.value !== 'outros') {
                      setProfissaoCustomizada('');
                    }
                    if (e.target.value !== 'medico') {
                      setEspecialidadeMedica('');
                    }
                  }}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="medico">Médico</option>
                  <option value="dentista">Dentista</option>
                  <option value="nutricionista">Nutricionista</option>
                  <option value="fisioterapeuta">Fisioterapeuta</option>
                  <option value="fonoaudiologo">Fonoaudiólogo</option>
                  <option value="outros">Outros</option>
                </Select>
              </div>

              {tipoProfissional === 'medico' && (
                <div>
                  <label style={{ fontWeight: 'bold' }}>Especialidade Médica:</label>
                  <Select
                    value={especialidadeMedica}
                    onChange={(e) => setEspecialidadeMedica(e.target.value)}
                    required
                  >
                    <option value="">Selecione sua especialidade...</option>
                    {especialidadesMedicas.map((especialidade) => (
                      <option key={especialidade} value={especialidade}>
                        {especialidade}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {tipoProfissional === 'outros' && (
                <Input
                  type="text"
                  placeholder="Digite sua profissão"
                  value={profissaoCustomizada}
                  onChange={(e) => setProfissaoCustomizada(e.target.value)}
                  required
                />
              )}

              <Input
                type="text"
                placeholder={
                  tipoProfissional === 'medico' ? 'CRM 123456' :
                  tipoProfissional === 'dentista' ? 'CRO 123456' :
                  tipoProfissional === 'nutricionista' ? 'CRN 12345' :
                  tipoProfissional === 'fisioterapeuta' ? 'CREFITO 123456' :
                  tipoProfissional === 'fonoaudiologo' ? 'CRFa 12345' :
                  'Número do Conselho'
                }
                value={numeroConselho}
                onChange={handleNumeroConselhoChange}
                maxLength={
                  tipoProfissional === 'medico' ? 11 :
                  tipoProfissional === 'dentista' ? 11 :
                  tipoProfissional === 'nutricionista' ? 10 :
                  tipoProfissional === 'fisioterapeuta' ? 14 :
                  tipoProfissional === 'fonoaudiologo' ? 10 :
                  15
                }
                required
              />

              {numeroConselho && numeroConselho.trim() && (
                <>
                  <label style={{ fontWeight: 'bold' }}>Local do seu atendimento</label>
                  <MapWrapper>
                    <LocationPicker onLocationSelect={handleMapClick} />
                  </MapWrapper>
                </>
              )}
              
              {latitude && longitude && (
                <>
                  <Input
                    type="text"
                    value={ufRegiao}
                    placeholder="UF/Região (preenchido automaticamente)"
                    readOnly
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                  <Input
                    type="text"
                    value={cidade}
                    placeholder="Cidade (preenchida automaticamente)"
                    readOnly
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                    Localização selecionada: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </>
              )}

              <label style={{ display: 'block', marginBottom: '2px', textAlign: 'left', fontWeight: 'bold' }}>Descrição:</label>
              <textarea
                placeholder="Descreva sua experiência e especialidades..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%',
                  minHeight: '100px',
                  fontFamily: 'Figtree, sans-serif',
                  resize: 'vertical'
                }}
                required
              />

              <label style={{ display: 'block', marginBottom: '2px', textAlign: 'left', fontWeight: 'bold' }}>Público Atendido:</label>
              <Select
                value={publicoAtendido}
                onChange={(e) => setPublicoAtendido(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="Adultos">Adultos</option>
                <option value="Crianças">Crianças</option>
                <option value="Idosos">Idosos</option>
                <option value="Adultos e Crianças">Adultos e Crianças</option>
                <option value="Adultos e Idosos">Adultos e Idosos</option>
                <option value="Crianças e Idosos">Crianças e Idosos</option>
                <option value="Todos">Todos</option>
              </Select>

              <label style={{ display: 'block', marginBottom: '2px', textAlign: 'left', fontWeight: 'bold' }}>Modalidade:</label>
              <Select
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
                <option value="domiciliar">Domiciliar</option>
                <option value="presencial,online">Presencial e Online</option>
                <option value="presencial,domiciliar">Presencial e Domiciliar</option>
                <option value="online,domiciliar">Online e Domiciliar</option>
                <option value="presencial,online,domiciliar">Presencial, Online e Domiciliar</option>
              </Select>

              <label style={{ display: 'block', marginBottom: '2px', textAlign: 'left', fontWeight: 'bold' }}>Valor da Consulta:</label>
              <div style={{ marginBottom: '15px' }}>
                <Select
                  value={valorConsulta === 'A negociar' ? 'A negociar' : 'Definir valor'}
                  onChange={(e) => {
                    if (e.target.value === 'A negociar') {
                      setValorConsulta('A negociar');
                    } else {
                      setValorConsulta('');
                    }
                  }}
                  style={{ marginBottom: '10px' }}
                >
                  <option value="Definir valor">Definir valor (R$)</option>
                  <option value="A negociar">Valor a negociar</option>
                </Select>
                
                {valorConsulta !== 'A negociar' && (
                  <Input
                    type="number"
                    placeholder="Ex: 150.00"
                    value={valorConsulta}
                    onChange={(e) => setValorConsulta(e.target.value)}
                    required={valorConsulta !== 'A negociar'}
                    min="0"
                    step="0.01"
                  />
                )}
              </div>

              <HorariosSetup
                diasSemana={diasSemana}
                diasAtendimento={diasAtendimento}
                setDiasAtendimento={setDiasAtendimento}
                horariosAtendimento={horariosAtendimento}
                setHorariosAtendimento={setHorariosAtendimento}
                handleDiaChange={handleDiaChange}
                handleHorarioChange={handleHorarioChange}
                handleAddHorario={handleAddHorario}
                handleRemoveHorario={handleRemoveHorario}
                formatarHorarioInput={formatarHorarioInput}
                normalizarHorario24h={normalizarHorario24h}
                ordenarHorariosDia={ordenarHorariosDia}
              />
            </>
          )}

          <Button type="submit">Criar Conta</Button>
          <LoginButton onClick={() => navigate('/Entrar')}>Já tem uma conta? Faça o Login</LoginButton>
        </Form>
      </Content>
      <Footer />
    </Container>
  );
};

export default Registro;
