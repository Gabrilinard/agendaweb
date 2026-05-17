import axios from 'axios';
import { ptBR } from 'date-fns/locale';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, CalendarDays, CalendarPlus, ClipboardList, Clock, Home, LogOut, MapPin, User, UserCircle, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import CriarConsulta from './telas/CriarConsulta';
import EditarInformacoes from './telas/EditarInformacoes';
import EditarMapa from './telas/EditarMapa';
import Inicio from './telas/VerConsultas';
import VerHistorico from './telas/VerHistorico';
import VerSolicitacoes from './telas/VerSolicitacoes';
import VerUrgencias from './telas/VerUrgencias';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AVATAR_PALETTES = [
  { bg: '#FCDBB5', color: '#7A4100' },
  { bg: '#CCEDE8', color: '#1A5C54' },
  { bg: '#D6E8FF', color: '#1A3F6F' },
  { bg: '#F5D6FF', color: '#5C1A7A' },
  { bg: '#D6FFE8', color: '#1A5C35' },
];
const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};
const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AdminDashboard = () => {
  const [activeScreen, setActiveScreen] = useState('home');
  const [reservas, setReservas] = useState([]);
  const [reservasPorData, setReservasPorData] = useState({});

  // Criar consulta state
  const [nomeReserva, setNomeReserva] = useState('');
  const [sobrenomeReserva, setSobrenomeReserva] = useState('');
  const [emailReserva, setEmailReserva] = useState('');
  const [dataReserva, setDataReserva] = useState(new Date());
  const [telefoneReserva, setTelefoneReserva] = useState('');
  const [horarioReserva, setHorarioReserva] = useState('');
  const [userId, setUserId] = useState(null);
  const [cpfUsuario, setCpfUsuario] = useState('');

  // Editar reserva
  const [showReservaEdit, setShowReservaEdit] = useState(false);
  const [editReservaId, setEditReservaId] = useState(null);
  const [editReservaData, setEditReservaData] = useState(new Date());
  const [editReservaHorario, setEditReservaHorario] = useState('');

  // Solicitações
  const [motivo, setMotivo] = useState('');
  const [mostrarMotivo, setMostrarMotivo] = useState(null);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  const [formularioSelecionado, setFormularioSelecionado] = useState(null);
  const [carregandoFormulario, setCarregandoFormulario] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');
  const [searchHistory, setSearchHistory] = useState('');

  // Mapa
  const [editLatitude, setEditLatitude] = useState(null);
  const [editLongitude, setEditLongitude] = useState(null);
  const [editCidade, setEditCidade] = useState('');
  const [editUfRegiao, setEditUfRegiao] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);

  // Informações
  const [editDescricao, setEditDescricao] = useState('');
  const [editPublicoAtendido, setEditPublicoAtendido] = useState('');
  const [editModalidade, setEditModalidade] = useState('');
  const [editValorConsulta, setEditValorConsulta] = useState('');
  const [editDiasAtendimento, setEditDiasAtendimento] = useState([]);
  const [editHorariosAtendimento, setEditHorariosAtendimento] = useState({});
  const [editTipoProfissional, setEditTipoProfissional] = useState('');
  const [editNumeroConselho, setEditNumeroConselho] = useState('');

  const { logout, user } = useAuth();
  const { success, error: showError, warning } = useNotification();
  const navigate = useNavigate();
  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  // ── formatters ──────────────────────────────────────────────
  const formatarHorarioBrasil = (horario) => {
    if (!horario) return '';
    const h = typeof horario !== 'string' ? String(horario) : horario;
    const m1 = h.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (m1) {
      let hr = parseInt(m1[1], 10);
      const per = m1[4].toUpperCase();
      if (per === 'PM' && hr !== 12) hr += 12;
      else if (per === 'AM' && hr === 12) hr = 0;
      return `${String(hr).padStart(2, '0')}:${m1[2]}`;
    }
    const m2 = h.match(/^(\d{1,2}):(\d{2})/);
    if (m2) return `${String(parseInt(m2[1], 10)).padStart(2, '0')}:${m2[2]}`;
    return h;
  };

  const formatarDataExibicao = (dataString) => {
    if (!dataString) return '';
    let d;
    if (dataString instanceof Date) { d = dataString; }
    else {
      const raw = String(dataString).includes('T') ? String(dataString).split('T')[0] : String(dataString);
      const p = raw.split('-');
      d = p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : new Date(raw);
    }
    if (isNaN(d.getTime())) return dataString;
    const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    return `${dias[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  // ── data fetching ────────────────────────────────────────────
  const buscarReservas = async () => {
    if (!user?.id) return;
    const isProfissional = user.tipoUsuario === 'profissional';
    const url = isProfissional
      ? `http://localhost:3000/reservas?profissional_id=${user.id}`
      : 'http://localhost:3000/reservas';
    try {
      const { data } = await axios.get(url);
      setReservas(data);
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const porData = data.reduce((acc, r) => {
        if (!r.dia) return acc;
        const raw = String(r.dia).includes('T') ? String(r.dia).split('T')[0] : String(r.dia);
        const p = raw.split('-');
        const dr = p.length === 3 ? new Date(+p[0],+p[1]-1,+p[2]) : new Date(raw);
        dr.setHours(0,0,0,0);
        if (dr >= hoje) {
          const key = `${dr.getFullYear()}-${String(dr.getMonth()+1).padStart(2,'0')}-${String(dr.getDate()).padStart(2,'0')}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(r);
        }
        return acc;
      }, {});
      Object.values(porData).forEach(arr => arr.sort((a,b) => (a.horario||'').localeCompare(b.horario||'')));
      setReservasPorData(porData);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { buscarReservas(); }, [user]);

  useEffect(() => {
    if (cpfUsuario && cpfUsuario.replace(/\D/g,'').length === 11) buscarUsuarioPorCPF(cpfUsuario);
    else if (cpfUsuario === '') { setNomeReserva(''); setSobrenomeReserva(''); setEmailReserva(''); setTelefoneReserva(''); setUserId(null); }
  }, [cpfUsuario]);

  // ── screen navigation ────────────────────────────────────────
  const irPara = async (screen) => {
    if (screen === 'mapa') {
      try {
        const { data } = await axios.get(`http://localhost:3000/usuarios/solicitarDados/${user.id}`);
        setEditingUserId(user.id);
        setEditLatitude(data.latitude ? parseFloat(data.latitude) : null);
        setEditLongitude(data.longitude ? parseFloat(data.longitude) : null);
        if (data.cidade) setEditCidade(data.cidade);
        if (data.ufRegiao) setEditUfRegiao(data.ufRegiao);
      } catch { setEditingUserId(user.id); }
    }
    if (screen === 'informacoes') {
      try {
        const { data } = await axios.get(`http://localhost:3000/usuarios/solicitarDados/${user.id}`);
        setEditingUserId(user.id);
        setEditTipoProfissional(data.tipoProfissional || '');
        setEditNumeroConselho(data.numeroConselho || '');
        setEditDescricao(data.descricao || '');
        setEditPublicoAtendido(data.publicoAtendido || '');
        setEditModalidade(data.modalidade || '');
        setEditValorConsulta(data.valorConsulta || '');
        let dias = data.diasAtendimento;
        if (typeof dias === 'string') { try { dias = JSON.parse(dias); } catch { dias = dias.split(',').map(d=>d.trim()).filter(Boolean); } }
        setEditDiasAtendimento(Array.isArray(dias) ? dias : []);
        let hors = data.horariosAtendimento;
        if (typeof hors === 'string') { try { hors = JSON.parse(hors); } catch { hors = {}; } }
        setEditHorariosAtendimento(typeof hors === 'object' && hors ? hors : {});
      } catch { showError('Erro ao carregar informações.'); }
    }
    setActiveScreen(screen);
  };

  // ── actions ──────────────────────────────────────────────────
  const buscarUsuarioPorCPF = async (cpf) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/usuarios/buscarPorCPF/${cpf.replace(/\D/g,'')}`);
      setNomeReserva(data.nome); setSobrenomeReserva(data.sobrenome);
      setEmailReserva(data.email); setTelefoneReserva(data.telefone); setUserId(data.id);
    } catch (e) {
      if (e.response?.status === 404) showError('Usuário não encontrado.');
      else showError('Erro ao buscar usuário.');
      setNomeReserva(''); setSobrenomeReserva(''); setEmailReserva(''); setTelefoneReserva(''); setUserId(null);
    }
  };

  const handleCreateReserva = async () => {
    if (!userId) { warning('Busque um usuário pelo CPF primeiro.'); return; }
    if (!dataReserva || !horarioReserva) { warning('Preencha data e horário.'); return; }
    try {
      const hFim = new Date(`1970-01-01T${horarioReserva}:00`);
      hFim.setTime(hFim.getTime() + 3600000);
      const d = dataReserva;
      await axios.post('http://localhost:3000/reservas', {
        nome: nomeReserva, sobrenome: sobrenomeReserva, email: emailReserva,
        dia: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
        horario: horarioReserva,
        horarioFinal: `${String(hFim.getHours()).padStart(2,'0')}:${String(hFim.getMinutes()).padStart(2,'0')}`,
        qntd_pessoa: 1, telefone: telefoneReserva, usuario_id: userId, profissional_id: user.id, status: 'confirmado',
      });
      success('Consulta criada!');
      setNomeReserva(''); setSobrenomeReserva(''); setEmailReserva(''); setTelefoneReserva('');
      setDataReserva(new Date()); setHorarioReserva(''); setCpfUsuario(''); setUserId(null);
      buscarReservas();
    } catch { showError('Erro ao criar consulta.'); }
  };

  const atualizarStatus = (id, status) => {
    axios.patch(`http://localhost:3000/reservas/${id}`, { status })
      .then(() => { setReservas(prev => prev.map(r => r.id === id ? {...r, status} : r)); buscarReservas(); })
      .catch(e => console.error(e));
  };

  const toggleStatus = (reserva) => atualizarStatus(reserva.id, reserva.status === 'confirmado' ? 'pendente' : 'confirmado');

  const removerReserva = (id) => {
    if (!window.confirm('Remover esta consulta?')) return;
    axios.delete(`http://localhost:3000/reservas/${id}`)
      .then(() => { setReservas(prev => prev.filter(r => r.id !== id)); success('Consulta removida!'); buscarReservas(); })
      .catch(e => console.error(e));
  };

  const negarReserva = (reserva) => {
    if (!motivo.trim()) { warning('Insira o motivo.'); return; }
    axios.patch(`http://localhost:3000/reservas/negado/${reserva.id}`, { status: 'negado', motivoNegacao: motivo })
      .then(() => { setReservas(prev => prev.map(r => r.id === reserva.id ? {...r, status:'negado', motivoNegacao: motivo} : r)); success('Consulta negada!'); setMotivo(''); setMostrarMotivo(null); })
      .catch(e => console.error(e));
  };

  const abrirEdicaoReserva = (reserva) => {
    if (!reserva?.id) return;
    setEditReservaId(reserva.id);
    const raw = String(reserva.dia).includes('T') ? String(reserva.dia).split('T')[0] : String(reserva.dia);
    const p = raw.split('-');
    setEditReservaData(p.length === 3 ? new Date(+p[0],+p[1]-1,+p[2],12) : new Date(raw));
    setEditReservaHorario(reserva.horario);
    setShowReservaEdit(true);
  };

  const handleUpdateReserva = async (novoStatus = null) => {
    if (!editReservaId || !editReservaData || !editReservaHorario) { warning('Preencha todos os campos.'); return; }
    try {
      const d = editReservaData;
      const hFim = new Date(`1970-01-01T${editReservaHorario}:00`);
      hFim.setTime(hFim.getTime() + 3600000);
      await axios.patch(`http://localhost:3000/reservas/${editReservaId}`, {
        dia: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
        horario: editReservaHorario,
        horarioFinal: `${String(hFim.getHours()).padStart(2,'0')}:${String(hFim.getMinutes()).padStart(2,'0')}`,
        status: novoStatus || 'aguardando_confirmacao_paciente',
      });
      success(novoStatus === 'confirmado' ? 'Consulta confirmada!' : 'Consulta atualizada.');
      setShowReservaEdit(false); setEditReservaId(null); buscarReservas();
    } catch { showError('Erro ao atualizar.'); }
  };

  const selecionarReservaParaFormulario = async (reserva) => {
    if (!reserva?.id) return;
    setReservaSelecionada(reserva); setFormularioSelecionado(null); setErroFormulario(''); setCarregandoFormulario(true);
    try {
      const { data } = await axios.get(`http://localhost:3000/formularios/reserva/${reserva.id}`);
      setFormularioSelecionado(data);
    } catch (e) {
      setErroFormulario(e?.response?.status === 404 ? 'Nenhum formulário encontrado.' : 'Erro ao buscar formulário.');
    } finally { setCarregandoFormulario(false); }
  };

  const converterEstado = (nome) => {
    if (!nome) return null;
    const map = { acre:'AC',alagoas:'AL',amapá:'AP',amazonas:'AM',bahia:'BA',ceará:'CE','distrito federal':'DF','espírito santo':'ES',goiás:'GO',maranhão:'MA','mato grosso':'MT','mato grosso do sul':'MS','minas gerais':'MG',pará:'PA',paraíba:'PB',paraná:'PR',pernambuco:'PE',piauí:'PI','rio de janeiro':'RJ','rio grande do norte':'RN','rio grande do sul':'RS',rondônia:'RO',roraima:'RR','santa catarina':'SC','são paulo':'SP',sergipe:'SE',tocantins:'TO' };
    const n = nome.toLowerCase().trim();
    if (map[n]) return map[n];
    if (nome.length === 2) return nome.toUpperCase();
    return null;
  };

  const buscarLocalizacao = async (lat, lng) => {
    try {
      const { address } = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`).then(r=>r.json());
      if (address) {
        let uf = address.state_code || address.state;
        if (uf) { let u = uf.replace(/^[A-Z]{2}-/,'').toUpperCase(); if (u.length > 2) { const s = converterEstado(u); if (s) u = s; } setEditUfRegiao(u); }
        const cidade = address.city || address.town || address.village || address.municipality || address.county || '';
        if (cidade) setEditCidade(cidade);
      }
    } catch (e) { console.error(e); }
  };

  const handleMapClick = (lat, lng) => { setEditLatitude(lat); setEditLongitude(lng); buscarLocalizacao(lat, lng); };

  const handleEditarMapa = async () => {
    if (!editingUserId || !editLatitude || !editLongitude) { warning('Selecione uma localização.'); return; }
    try {
      await axios.patch(`http://localhost:3000/usuarios/${editingUserId}/localizacao`, { latitude: editLatitude, longitude: editLongitude, cidade: editCidade, ufRegiao: editUfRegiao });
      success('Localização atualizada!');
    } catch { showError('Erro ao atualizar localização.'); }
  };

  const handleEditarInformacoes = async () => {
    if (!editingUserId) { warning('Erro ao identificar usuário.'); return; }
    try {
      await axios.patch(`http://localhost:3000/usuarios/${editingUserId}/informacoes`, { descricao: editDescricao, publicoAtendido: editPublicoAtendido, modalidade: editModalidade, valorConsulta: editValorConsulta, diasAtendimento: editDiasAtendimento, horariosAtendimento: editHorariosAtendimento });
      success('Informações salvas!');
    } catch { showError('Erro ao salvar.'); }
  };

  const handleSalvarHorarios = async ({ diasAtendimento, horariosAtendimento }) => {
    if (!user?.id) { warning('Erro ao identificar usuário.'); return; }
    try {
      await axios.patch(`http://localhost:3000/usuarios/${user.id}/informacoes`, { diasAtendimento, horariosAtendimento });
      success('Horários salvos! Os pacientes já podem ver os novos horários.');
    } catch { showError('Erro ao salvar horários.'); }
  };

  const handleEditDiaChange = (e) => {
    const dia = e.target.value;
    if (dia === 'Todos os dias') {
      const all = diasSemana.every(d => editDiasAtendimento.includes(d));
      if (all) { setEditDiasAtendimento([]); setEditHorariosAtendimento({}); }
      else {
        setEditDiasAtendimento([...diasSemana]);
        const h = {}; diasSemana.forEach(d => { h[d] = editHorariosAtendimento[d] || ['08:00']; }); setEditHorariosAtendimento(h);
      }
    } else {
      if (editDiasAtendimento.includes(dia)) {
        setEditDiasAtendimento(editDiasAtendimento.filter(d => d !== dia));
        const h = {...editHorariosAtendimento}; delete h[dia]; setEditHorariosAtendimento(h);
      } else {
        setEditDiasAtendimento([...editDiasAtendimento, dia]);
        setEditHorariosAtendimento({...editHorariosAtendimento, [dia]: ['08:00']});
      }
    }
  };
  const handleEditAddHorario = (dia) => setEditHorariosAtendimento(p => ({...p, [dia]: [...(p[dia]||[]), '']}));
  const handleEditRemoveHorario = (dia, i) => setEditHorariosAtendimento(p => { const h=[...p[dia]]; h.splice(i,1); return {...p,[dia]:h}; });
  const handleEditHorarioChange = (dia, i, v) => setEditHorariosAtendimento(p => { const h=[...p[dia]]; h[i]=v; return {...p,[dia]:h}; });

  // LocationPicker (passed to EditarMapa)
  const LocationPickerEdit = ({ onLocationSelect, initialLat, initialLng }) => {
    const [pos, setPos] = useState(initialLat && initialLng ? [initialLat, initialLng] : [-14.235, -51.925]);
    useEffect(() => { if (initialLat && initialLng) setPos([initialLat, initialLng]); }, [initialLat, initialLng]);
    function Marker_() {
      useMapEvents({ click(e) { const {lat,lng} = e.latlng; setPos([lat,lng]); onLocationSelect(lat,lng); } });
      return pos ? <Marker position={pos}/> : null;
    }
    return (
      <MapContainer center={pos} zoom={6} style={{height:'100%', width:'100%'}}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        <Marker_/>
      </MapContainer>
    );
  };

  // ── badge counts ─────────────────────────────────────────────
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const pendentes = reservas.filter(r => !r.is_urgente && r.status === 'pendente' && r.dia && (() => { const raw = String(r.dia).includes('T') ? String(r.dia).split('T')[0] : String(r.dia); const p = raw.split('-'); const d = p.length===3 ? new Date(+p[0],+p[1]-1,+p[2]) : new Date(raw); d.setHours(0,0,0,0); return d >= hoje; })()).length;
  const urgentes = reservas.filter(r => {
    if (!r.is_urgente) return false;
    if (r.dia) {
      const raw = String(r.dia).includes('T') ? String(r.dia).split('T')[0] : String(r.dia);
      const p = raw.split('-');
      const d = p.length === 3 ? new Date(+p[0], +p[1]-1, +p[2]) : new Date(raw);
      d.setHours(0,0,0,0);
      if (d < hoje) return false;
    }
    return true;
  }).length;

  // ── avatar ───────────────────────────────────────────────────
  const nomeCompleto = `${user?.nome||''} ${user?.sobrenome||''}`.trim();
  const av = getAvatarColor(nomeCompleto);
  const initials = getInitials(nomeCompleto);

  const navItems = [
    { key: 'home',         icon: <Home size={16} />,          label: 'Início' },
    { key: 'agenda',       icon: <Calendar size={16} />,      label: 'Agenda' },
    { key: 'horarios',     icon: <CalendarDays size={16} />,  label: 'Editar Horários' },
    { key: 'criar',        icon: <CalendarPlus size={16} />,  label: 'Criar Consulta' },
    { key: 'solicitacoes', icon: <ClipboardList size={16} />, label: 'Solicitações', badge: pendentes || null, badgeColor: '#1B4D3E' },
    { key: 'urgencias',    icon: <Zap size={16} />,           label: 'Urgências',    badge: urgentes || null,  badgeColor: '#E8611A' },
    { key: 'historico',    icon: <Clock size={16} />,         label: 'Histórico' },
    { key: 'mapa',         icon: <MapPin size={16} />,        label: 'Editar Mapa' },
    { key: 'informacoes',  icon: <User size={16} />,          label: 'Informações' },
  ];

  // ── sidebar style helpers ────────────────────────────────────
  const navBtn = (key) => ({
    width: 'calc(100% - 16px)', margin: '1px 8px', padding: '10px 12px',
    background: activeScreen === key ? '#E8F5EF' : 'none',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: '10px', borderRadius: '8px',
    color: activeScreen === key ? '#1B4D3E' : '#555',
    fontWeight: activeScreen === key ? '600' : '400',
    fontSize: '14px', fontFamily: 'Figtree, sans-serif', textAlign: 'left',
  });

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <Inicio reservas={reservas} reservasPorData={reservasPorData} formatarHorarioBrasil={formatarHorarioBrasil} formatarDataExibicao={formatarDataExibicao} irPara={irPara} user={user} />;
      case 'agenda':
        return <Inicio reservas={reservas} reservasPorData={reservasPorData} formatarHorarioBrasil={formatarHorarioBrasil} formatarDataExibicao={formatarDataExibicao} irPara={irPara} user={user} modoAgenda />;
      case 'horarios':
        return (
          <CriarConsulta
            modo="horarios"
            cpfUsuario={cpfUsuario} setCpfUsuario={setCpfUsuario} userId={userId}
            nomeReserva={nomeReserva} sobrenomeReserva={sobrenomeReserva}
            emailReserva={emailReserva} telefoneReserva={telefoneReserva}
            dataReserva={dataReserva} setDataReserva={setDataReserva}
            horarioReserva={horarioReserva} setHorarioReserva={setHorarioReserva}
            formatarHorarioBrasil={formatarHorarioBrasil}
            handleCreateReserva={handleCreateReserva}
            onSalvarHorarios={handleSalvarHorarios}
          />
        );
      case 'criar':
        return (
          <CriarConsulta
            modo="paciente"
            cpfUsuario={cpfUsuario} setCpfUsuario={setCpfUsuario} userId={userId}
            nomeReserva={nomeReserva} sobrenomeReserva={sobrenomeReserva}
            emailReserva={emailReserva} telefoneReserva={telefoneReserva}
            dataReserva={dataReserva} setDataReserva={setDataReserva}
            horarioReserva={horarioReserva} setHorarioReserva={setHorarioReserva}
            formatarHorarioBrasil={formatarHorarioBrasil}
            handleCreateReserva={handleCreateReserva}
          />
        );
      case 'solicitacoes':
        return (
          <VerSolicitacoes
            reservas={reservas} formatarDataExibicao={formatarDataExibicao} formatarHorarioBrasil={formatarHorarioBrasil}
            selecionarReservaParaFormulario={selecionarReservaParaFormulario}
            reservaSelecionada={reservaSelecionada} formularioSelecionado={formularioSelecionado}
            carregandoFormulario={carregandoFormulario} erroFormulario={erroFormulario}
            onFecharFormulario={() => { setReservaSelecionada(null); setFormularioSelecionado(null); setErroFormulario(''); }}
            toggleStatus={toggleStatus} mostrarMotivo={mostrarMotivo} setMostrarMotivo={setMostrarMotivo}
            motivo={motivo} setMotivo={setMotivo} negarReserva={negarReserva}
            onEditarReserva={abrirEdicaoReserva} removerReserva={removerReserva}
          />
        );
      case 'urgencias':
        return (
          <VerUrgencias
            reservas={reservas} formatarDataExibicao={formatarDataExibicao} formatarHorarioBrasil={formatarHorarioBrasil}
            success={success} showError={showError} buscarReservas={buscarReservas}
            onEditarReserva={abrirEdicaoReserva} removerReserva={removerReserva}
          />
        );
      case 'historico':
        return (
          <VerHistorico
            reservas={reservas} searchHistory={searchHistory} setSearchHistory={setSearchHistory}
            formatarDataExibicao={formatarDataExibicao} formatarHorarioBrasil={formatarHorarioBrasil}
          />
        );
      case 'mapa':
        return (
          <EditarMapa
            LocationPickerEdit={LocationPickerEdit} handleMapClick={handleMapClick}
            editLatitude={editLatitude} editLongitude={editLongitude}
            editUfRegiao={editUfRegiao} editCidade={editCidade}
            setEditCidade={setEditCidade} setEditUfRegiao={setEditUfRegiao}
            handleEditarMapa={handleEditarMapa}
          />
        );
      case 'informacoes':
        return (
          <EditarInformacoes
            editTipoProfissional={editTipoProfissional}
            editNumeroConselho={editNumeroConselho}
            editDescricao={editDescricao} setEditDescricao={setEditDescricao}
            editPublicoAtendido={editPublicoAtendido} setEditPublicoAtendido={setEditPublicoAtendido}
            editModalidade={editModalidade} setEditModalidade={setEditModalidade}
            editValorConsulta={editValorConsulta} setEditValorConsulta={setEditValorConsulta}
            diasSemana={diasSemana} editDiasAtendimento={editDiasAtendimento}
            editHorariosAtendimento={editHorariosAtendimento}
            handleEditDiaChange={handleEditDiaChange} handleEditHorarioChange={handleEditHorarioChange}
            handleEditRemoveHorario={handleEditRemoveHorario} handleEditAddHorario={handleEditAddHorario}
            handleEditarInformacoes={handleEditarInformacoes}
            user={user}
          />
        );
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Figtree, sans-serif' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: '260px', background: 'white', height: '100vh', position: 'fixed',
        left: 0, top: 0, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid #F0EFE9', zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #F0EFE9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: '#1B4D3E', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>Aa</div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '13px', color: '#1a1a1a', margin: 0 }}>Agende Aqui</p>
              <p style={{ fontSize: '10px', color: '#888', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Saúde sob demanda</p>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EFE9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nome ? `Dr. ${user.nome} ${user.sobrenome||''}` : 'Profissional'}
              </p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.tipoProfissional || 'Especialidade'}
              </p>
            </div>
          </div>
          <div style={{ background: '#D1FAE5', borderRadius: '6px', padding: '4px 10px', width: 'fit-content' }}>
            <span style={{ fontSize: '11px', color: '#065F46', fontWeight: '600' }}>● Aceitando consultas</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => irPara(item.key)} style={navBtn(item.key)}>
              <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? (
                <span style={{ background: item.badgeColor, color: 'white', borderRadius: '10px', padding: '2px 7px', fontSize: '11px', fontWeight: '700' }}>{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #F0EFE9', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button onClick={() => navigate('/EmpresasProfissionais')} style={{ ...navBtn('_'), color: '#555' }}>
            <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCircle size={16} /></span>
            <span>Modo paciente</span>
          </button>
          <button onClick={() => { logout(); navigate('/Entrar'); }} style={{ ...navBtn('_'), color: '#EF4444' }}>
            <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut size={16} /></span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', background: '#F0EFE9' }}>
        {renderScreen()}

        {/* Edit reservation modal */}
        {showReservaEdit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: 'white', borderRadius: '14px', padding: '28px', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 20px', color: '#1a1a1a' }}>Editar Consulta</h3>
              <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#555' }}>Nova Data</label>
              <div style={{ marginBottom: '16px', border: '1px solid #E0DFD9', borderRadius: '8px', padding: '8px' }}>
                <DatePicker selected={editReservaData} onChange={d => d && setEditReservaData(d)} minDate={new Date()} dateFormat="dd/MM/yyyy" locale={ptBR} showPopperArrow={false} required inline />
              </div>
              <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#555' }}>Novo Horário</label>
              <input type="text" value={editReservaHorario} onChange={e => setEditReservaHorario(e.target.value)} maxLength={5} placeholder="HH:MM"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleUpdateReserva('confirmado')} style={{ flex: 1, padding: '10px', background: '#1B4D3E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Confirmar</button>
                <button onClick={() => handleUpdateReserva()} style={{ flex: 1, padding: '10px', background: '#F7F7F4', color: '#333', border: '1px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Sugerir horário</button>
                <button onClick={() => setShowReservaEdit(false)} style={{ padding: '10px 14px', background: 'none', border: '1px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#888' }}>✕</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
