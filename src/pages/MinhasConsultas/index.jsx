import axios from 'axios';
import { ptBR } from 'date-fns/locale';
import { Calendar, Edit2, FileText, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const DARK_GREEN = '#1C5C40';
const MID_GREEN = '#2D8A62';
const BG = '#F7F3EE';
const BORDER = '#E5E0DA';
const TEXT = '#111';
const MUTED = '#666';

const MONTH_SHORT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

const AVATAR_COLORS = [
  { bg: '#D4EDE1', color: '#1A5C3C' },
  { bg: '#FDE8CC', color: '#8B4A00' },
  { bg: '#D6E8F5', color: '#1A4A7A' },
  { bg: '#F5D6E8', color: '#7A1A5A' },
  { bg: '#E8E0F5', color: '#4A1A7A' },
  { bg: '#F5E8D6', color: '#7A4A1A' },
];

const parseDia = (dia) => {
  if (!dia) return null;
  const str = String(dia).split('T')[0];
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

const getAvatarColor = (name = '') => {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// ── Styled Components ──────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${BG};
  font-family: 'Figtree', sans-serif;
`;

const Content = styled.div`
  flex: 1;
  max-width: 920px;
  margin: 0 auto;
  padding: 48px 32px;
  width: 100%;

  @media (max-width: 768px) { padding: 32px 16px; }
`;

const PageTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 600px) { flex-direction: column; }
`;

const TitleArea = styled.div``;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${MID_GREEN};
  letter-spacing: 0.12em;
  margin-bottom: 6px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${TEXT};
  margin: 0 0 8px;
`;

const PageDesc = styled.p`
  font-size: 0.88rem;
  color: ${MUTED};
  line-height: 1.5;
  margin: 0;
  max-width: 480px;
`;

const NewBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.2s;

  &:hover { background: ${MID_GREEN}; }
`;

// Tabs
const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  background: #EDEAE4;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 28px;
  width: fit-content;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border-radius: 9px;
  border: none;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: all 0.15s;
  background: ${({ $active }) => $active ? '#fff' : 'transparent'};
  color: ${({ $active }) => $active ? TEXT : MUTED};
  box-shadow: ${({ $active }) => $active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none'};
`;

const TabCount = styled.span`
  background: ${({ $active }) => $active ? '#EDEAE4' : 'transparent'};
  color: ${MUTED};
  font-size: 0.75rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
`;

// Card
const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
`;

const ConsultaCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid ${BORDER};
  overflow: hidden;
`;

const CardMain = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 14px;
    padding: 16px;
  }
`;

const DateBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  flex-shrink: 0;
  gap: 1px;
`;

const DateMonth = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${MUTED};
  letter-spacing: 0.08em;
`;

const DateDay = styled.span`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${TEXT};
  line-height: 1;
`;

const DateTime = styled.span`
  font-size: 0.72rem;
  color: ${MUTED};
  font-weight: 500;
`;

const CardDivider = styled.div`
  width: 1px;
  height: 48px;
  background: ${BORDER};
  flex-shrink: 0;

  @media (max-width: 600px) { display: none; }
`;

const BadgesRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const StatusBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const ModalityBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 99px;
  background: #EDEAE4;
  color: ${MUTED};
`;

const ProfRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProfAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ProfInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${TEXT};
`;

const ProfSpec = styled.span`
  font-size: 0.78rem;
  color: ${MUTED};
`;

const CardInfoArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  padding: 7px 10px;
  font-size: 0.82rem;
  font-weight: 500;
  color: ${({ $danger }) => $danger ? '#C53030' : TEXT};
  cursor: pointer;
  border-radius: 8px;
  font-family: 'Figtree', sans-serif;
  transition: background 0.15s;

  &:hover {
    background: ${({ $danger }) => $danger ? '#FFF5F5' : '#F2EDE8'};
  }
`;

const CardFooter = styled.div`
  border-top: 1px solid ${BORDER};
  padding: 10px 24px;
  font-size: 0.8rem;
  color: ${MUTED};
  background: #FAFAF8;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LibeLink = styled.button`
  background: none;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${TEXT};
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;
  font-family: 'Figtree', sans-serif;
`;

const ConfirmBar = styled.div`
  border-top: 1px solid #FDDEDE;
  background: #FFF8F8;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #C53030;
  font-weight: 500;
`;

const RescheduleBar = styled.div`
  border-top: 1px solid #FED7B0;
  background: #FFF7F0;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #7C2D12;
  font-weight: 500;
  flex-wrap: wrap;
`;

const ConfirmBtns = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const ConfirmYes = styled.button`
  background: #C53030;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 6px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  &:hover { background: #A02828; }
`;

const ConfirmNo = styled.button`
  background: transparent;
  color: ${TEXT};
  border: 1.5px solid ${BORDER};
  border-radius: 7px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  &:hover { background: #F2EDE8; }
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${MUTED};
  font-size: 0.95rem;
`;

// Drawer
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 300;
  display: ${({ $open }) => $open ? 'block' : 'none'};
`;

const Drawer = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 360px;
  background: #fff;
  z-index: 301;
  padding: 28px 24px;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transform: ${({ $open }) => $open ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.25s ease;

  @media (max-width: 480px) { width: 100%; }
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DrawerTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${TEXT};
  margin: 0;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${MUTED};
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  &:hover { background: #F2EDE8; color: ${TEXT}; }
`;

const FieldLabel = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${MUTED};
  display: block;
  margin-bottom: 6px;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Figtree', sans-serif;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: ${MID_GREEN}; }
`;

const SaveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  margin-top: 8px;
  &:hover { background: ${MID_GREEN}; }
`;

const DPWrapper = styled.div`
  .react-datepicker-wrapper { width: 100%; }
  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid ${BORDER};
    border-radius: 8px;
    font-size: 0.9rem;
    font-family: 'Figtree', sans-serif;
    outline: none;
    box-sizing: border-box;
    &:focus { border-color: ${MID_GREEN}; }
  }
`;

const humanize = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

const SKIP_KEYS = new Set(['createdAt', 'profissional', 'tipoProfissional', 'tipoAtendimento', 'reservaIds', 'paciente']);

const flattenConteudo = (obj, prefix = '') => {
  const entries = [];
  for (const [key, val] of Object.entries(obj || {})) {
    if (SKIP_KEYS.has(key)) continue;
    const label = prefix ? `${prefix} › ${humanize(key)}` : humanize(key);
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      entries.push(...flattenConteudo(val, humanize(key)));
    } else if (typeof val === 'boolean') {
      if (val) entries.push({ label, value: 'Sim' });
    } else if (val !== '' && val !== null && val !== undefined) {
      entries.push({ label, value: String(val) });
    }
  }
  return entries;
};

// ── Status helpers ─────────────────────────────────────────────────────────────

const statusStyle = (status) => {
  switch (status) {
    case 'confirmado':                    return { bg: '#D4F0DE', color: '#1A5C3C', label: 'Confirmada' };
    case 'pendente':                      return { bg: '#FEF0CC', color: '#A05800', label: 'Aguardando confirmação' };
    case 'aguardando_confirmacao_paciente': return { bg: '#FEE2CC', color: '#C2410C', label: 'Novo horário proposto' };
    case 'negado':                        return { bg: '#FDDEDE', color: '#C53030', label: 'Cancelada' };
    case 'ausente':                       return { bg: '#FDDEDE', color: '#C53030', label: 'Não compareceu' };
    default:                              return { bg: '#EDEAE4', color: MUTED, label: status };
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

const MinhasConsultas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('proximas');
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [liberandoId, setLiberandoId] = useState(null);
  const [novaData, setNovaData] = useState(new Date());
  const [novoHorario, setNovoHorario] = useState('');
  const [vagasPendentes, setVagasPendentes] = useState([]);
  const [aceitandoVaga, setAceitandoVaga] = useState(null);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

  const [avaliandoId, setAvaliandoId] = useState(null);
  const [notaAvaliacao, setNotaAvaliacao] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');
  const [avaliacoesFeitas, setAvaliacoesFeitas] = useState(new Set());
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  useEffect(() => {
    if (!user?.id) { navigate('/Entrar'); return; }
    buscarConsultas();
    buscarVagasPendentes();
  }, []);

  const verificarAvaliacoes = async (lista) => {
    const passadas = lista.filter(c =>
      c.status === 'confirmado' && parseDia(c.dia) < today && c.profissional_id
    );
    const results = await Promise.all(passadas.map(async c => {
      try {
        const { data } = await axios.get(`http://localhost:3000/avaliacoes/reserva/${c.id}`);
        return data.avaliado ? c.id : null;
      } catch { return null; }
    }));
    setAvaliacoesFeitas(new Set(results.filter(Boolean)));
  };

  const handleEnviarAvaliacao = async (c) => {
    if (!notaAvaliacao) { showError('Selecione uma nota.'); return; }
    setEnviandoAvaliacao(true);
    try {
      await axios.post('http://localhost:3000/avaliacoes', {
        reserva_id: c.id,
        usuario_id: user.id,
        profissional_id: c.profissional_id,
        nota: notaAvaliacao,
        comentario: comentarioAvaliacao,
      });
      success('Avaliação enviada!');
      setAvaliacoesFeitas(prev => new Set([...prev, c.id]));
      setAvaliandoId(null);
      setNotaAvaliacao(0);
      setComentarioAvaliacao('');
    } catch (e) {
      showError(e.response?.data?.error || 'Erro ao enviar avaliação.');
    } finally { setEnviandoAvaliacao(false); }
  };

  const buscarVagasPendentes = async () => {
    if (!user?.id) return;
    try {
      const { data } = await axios.get(`http://localhost:3000/vagas/pendentes/${user.id}`);
      setVagasPendentes(data || []);
    } catch { /* silently ignore */ }
  };

  const buscarConsultas = async () => {
    try {
      setLoading(true);
      const isProfissional = user.tipoUsuario === 'profissional';
      const url = isProfissional
        ? `http://localhost:3000/reservas?profissional_id=${user.id}`
        : `http://localhost:3000/reservas?usuario_id=${user.id}`;

      const { data } = await axios.get(url);

      const enriched = await Promise.all((data || []).map(async (c) => {

        const otherId = isProfissional ? c.usuario_id : c.profissional_id;
        if (!otherId) return c;
        try {
          const { data: p } = await axios.get(`http://localhost:3000/usuarios/solicitarDados/${otherId}`);
          return {
            ...c,
            nomeOutro: `${p.nome} ${p.sobrenome}`,
            especialidade: p.tipoProfissional || p.especialidadeMedica || p.profissaoCustomizada || 'Especialista',
            tipoProfissionalRaw: p.tipoProfissional || p.especialidadeMedica || p.profissaoCustomizada || '',
            valorConsulta: p.valorConsulta,
          };
        } catch { return c; }
      }));

      setConsultas(enriched);
      verificarAvaliacoes(enriched);
    } catch { showError('Erro ao carregar consultas.'); }
    finally { setLoading(false); }
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const ocultos = new Set(['liberado', 'transferido']);
  const ativas = new Set(['pendente', 'confirmado', 'aguardando_confirmacao_paciente']);
  const proximas  = consultas.filter(c => ativas.has(c.status) && parseDia(c.dia) >= today);
  const concluidas = consultas.filter(c => ativas.has(c.status) && parseDia(c.dia) < today);
  const canceladas = consultas.filter(c => (c.status === 'negado' || c.status === 'ausente') && !ocultos.has(c.status));

  const tabList = { proximas, concluidas, canceladas };
  const shown = tabList[activeTab] || [];

  const handleCancelar = (id) => setConfirmingId(id);

  const handleConfirmarCancelamento = async () => {
    try {
      await axios.patch(`http://localhost:3000/reservas/${confirmingId}`, { status: 'negado' });
      success('Consulta cancelada.');
      setConfirmingId(null);
      buscarConsultas();
    } catch { showError('Erro ao cancelar.'); }
  };

  const handleLiberarHorario = (id) => { setConfirmingId(null); setLiberandoId(id); };

  const handleConfirmarLiberacao = async () => {
    try {
      await axios.post(`http://localhost:3000/vagas/liberar/${liberandoId}`);
      success('Horário liberado! O profissional será notificado.');
      setLiberandoId(null);
      buscarConsultas();
    } catch { showError('Erro ao liberar horário.'); }
  };

  const handleAceitarVaga = async (notif) => {
    setAceitandoVaga(notif.id);
    try {
      await axios.post(`http://localhost:3000/vagas/aceitar/${notif.id}`, { token: notif.token });
      success('Vaga aceita! Sua consulta foi atualizada.');
      buscarVagasPendentes();
      buscarConsultas();
    } catch { showError('Erro ao aceitar vaga.'); }
    finally { setAceitandoVaga(null); }
  };

  const handleRecusarVaga = async (notif) => {
    try {
      await axios.post(`http://localhost:3000/vagas/recusar/${notif.id}`);
      setVagasPendentes(prev => prev.filter(v => v.id !== notif.id));
    } catch { /* silently ignore */ }
  };

  const handleVerFormulario = async (c) => {
    setFormData(null);
    setLoadingForm(true);
    setFormDrawerOpen(true);
    try {
      const { data } = await axios.get(`http://localhost:3000/formularios/reserva/${c.id}`);
      setFormData(data);
    } catch (err) {
      setFormDrawerOpen(false);
      if (err.response?.status === 404) {
        navigate('/Formulario', {
          state: {
            reservaIds: [c.id],
            tipoProfissional: c.tipoProfissionalRaw,
            nomeProfissional: c.nomeOutro,
          }
        });
      } else {
        showError('Erro ao carregar formulário.');
      }
    } finally {
      setLoadingForm(false);
    }
  };

  const handleAceitarRemarcacao = async (c) => {
    try {
      await axios.patch(`http://localhost:3000/reservas/${c.id}`, { status: 'confirmado', dia: c.dia, horario: c.horario });
      success('Novo horário confirmado!');
      buscarConsultas();
    } catch { showError('Erro ao confirmar.'); }
  };

  const handleRecusarRemarcacao = async (c) => {
    try {
      await axios.patch(`http://localhost:3000/reservas/${c.id}`, { status: 'negado' });
      success('Remarcação recusada.');
      buscarConsultas();
    } catch { showError('Erro ao recusar.'); }
  };

  const handleEditar = (c) => {
    setConsultaEditando(c);
    const d = parseDia(c.dia) || new Date();
    setNovaData(d);
    setNovoHorario(c.horario || '');
    setEditDrawerOpen(true);
  };

  const handleSalvar = async () => {
    if (!novaData || !/^([01]?\d|2[0-3]):([0-5]\d)$/.test(novoHorario)) {
      showError('Data ou horário inválido.'); return;
    }
    const [y, m, d] = [novaData.getFullYear(), String(novaData.getMonth()+1).padStart(2,'0'), String(novaData.getDate()).padStart(2,'0')];
    const [hh, mm] = novoHorario.split(':').map(Number);
    const hFinal = new Date(0, 0, 0, hh + 1, mm).toTimeString().slice(0, 5);
    try {
      await axios.patch(`http://localhost:3000/reservas/editar/${consultaEditando.id}`, {
        dia: `${y}-${m}-${d}`,
        horario: novoHorario,
        horarioFinal: hFinal,
        qntd_pessoa: consultaEditando.qntd_pessoa || 1,
        status: 'pendente',
      });
      success('Edição enviada! Aguardando confirmação.');
      setEditDrawerOpen(false);
      buscarConsultas();
    } catch { showError('Erro ao editar.'); }
  };

  const renderCard = (c) => {
    const dia = parseDia(c.dia);
    const { bg, color, label } = statusStyle(c.status);
    const av = getAvatarColor(c.nomeOutro || '');
    const initials = getInitials(c.nomeOutro || '');
    const isActive = c.status === 'pendente' || c.status === 'confirmado' || c.status === 'aguardando_confirmacao_paciente';
    const isRescheduled = c.status === 'aguardando_confirmacao_paciente';
    const isUrgente = Number(c.is_urgente) === 1;
    const valor = c.valorConsulta ? `· R$ ${Number(c.valorConsulta).toFixed(0)}` : '';
    const isPast = c.status === 'confirmado' && dia && dia < today;
    const isPaciente = user?.tipoUsuario !== 'profissional';
    const jaAvaliou = avaliacoesFeitas.has(c.id);
    const isAvaliando = avaliandoId === c.id;

    return (
      <CardWrapper key={c.id}>
        <ConsultaCard>
          <CardMain>
            <DateBox>
              <DateMonth>{dia ? MONTH_SHORT[dia.getMonth()] : '—'}</DateMonth>
              <DateDay>{dia ? dia.getDate() : '—'}</DateDay>
              <DateTime>{c.horario || ''}</DateTime>
            </DateBox>

            <CardDivider />

            <CardInfoArea>
              <BadgesRow>
                <StatusBadge $bg={bg} $color={color}>{label}</StatusBadge>
                {isUrgente && (
                  <StatusBadge $bg="#FFF0E6" $color="#C2410C">⚡ Emergente</StatusBadge>
                )}
                <ModalityBadge>Online</ModalityBadge>
              </BadgesRow>
              <ProfRow>
                <ProfAvatar $bg={av.bg} $color={av.color}>{initials}</ProfAvatar>
                <ProfInfo>
                  <ProfName>{c.nomeOutro || '—'}</ProfName>
                  <ProfSpec>{c.especialidade || ''}{valor}</ProfSpec>
                </ProfInfo>
              </ProfRow>
            </CardInfoArea>

            {isActive && (
              <ActionsRow>
                <ActionBtn onClick={() => handleVerFormulario(c)}>
                  <FileText size={14} /> Formulário
                </ActionBtn>
                {!isRescheduled && (
                  <ActionBtn onClick={() => handleEditar(c)}>
                    <Edit2 size={14} /> Editar
                  </ActionBtn>
                )}
                <ActionBtn $danger onClick={() => handleCancelar(c.id)}>
                  <X size={14} /> Cancelar
                </ActionBtn>
              </ActionsRow>
            )}
          </CardMain>

          {isActive && confirmingId === c.id ? (
            <ConfirmBar>
              Tem certeza que deseja cancelar esta consulta?
              <ConfirmBtns>
                <ConfirmNo onClick={() => setConfirmingId(null)}>Voltar</ConfirmNo>
                <ConfirmYes onClick={handleConfirmarCancelamento}>Sim, cancelar</ConfirmYes>
              </ConfirmBtns>
            </ConfirmBar>
          ) : isActive && liberandoId === c.id ? (
            <ConfirmBar style={{ background: '#FFF7F0', borderColor: '#FED7B0' }}>
              Liberar abre seu horário para outro paciente ser atendido. Deseja confirmar?
              <ConfirmBtns>
                <ConfirmNo onClick={() => setLiberandoId(null)}>Voltar</ConfirmNo>
                <ConfirmYes style={{ background: '#E8611A' }} onClick={handleConfirmarLiberacao}>Sim, liberar</ConfirmYes>
              </ConfirmBtns>
            </ConfirmBar>
          ) : isRescheduled ? (
            <RescheduleBar>
              <span style={{ flex: 1 }}>
                O profissional propôs este novo horário. Deseja confirmar?
              </span>
              <ConfirmBtns>
                <ConfirmNo onClick={() => handleRecusarRemarcacao(c)}>Recusar</ConfirmNo>
                <ConfirmYes style={{ background: '#1C5C40' }} onClick={() => handleAceitarRemarcacao(c)}>
                  Confirmar
                </ConfirmYes>
              </ConfirmBtns>
            </RescheduleBar>
          ) : isActive && (
            <CardFooter>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} />
                Não vai poder ir?&nbsp;
                <LibeLink onClick={() => handleLiberarHorario(c.id)}>Liberar horário</LibeLink>
                &nbsp;— outro paciente pode aproveitá-lo.
              </span>
            </CardFooter>
          )}

          {isPast && isPaciente && !isAvaliando && (
            <CardFooter style={{ justifyContent: 'space-between', background: jaAvaliou ? '#F0FDF4' : '#FAFAF8' }}>
              {jaAvaliou ? (
                <span style={{ color: '#1A5C3C', fontWeight: 600 }}>✓ Você já avaliou esta consulta</span>
              ) : (
                <>
                  <span>Como foi sua consulta com <strong>{c.nomeOutro}</strong>?</span>
                  <LibeLink onClick={() => { setAvaliandoId(c.id); setNotaAvaliacao(0); setComentarioAvaliacao(''); }}>
                    Avaliar agora
                  </LibeLink>
                </>
              )}
            </CardFooter>
          )}

          {isAvaliando && (
            <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px 24px', background: '#FAFAF8', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: TEXT }}>Avaliar consulta com {c.nomeOutro}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setNotaAvaliacao(n)} style={{
                    fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer',
                    color: n <= notaAvaliacao ? '#F59E0B' : '#D1D5DB', lineHeight: 1, padding: '2px'
                  }}>★</button>
                ))}
                {notaAvaliacao > 0 && (
                  <span style={{ alignSelf: 'center', fontSize: '0.82rem', color: MUTED, marginLeft: 4 }}>
                    {['','Ruim','Regular','Bom','Muito bom','Excelente'][notaAvaliacao]}
                  </span>
                )}
              </div>
              <textarea
                placeholder="Deixe um comentário (opcional)..."
                value={comentarioAvaliacao}
                onChange={e => setComentarioAvaliacao(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', border: `1.5px solid ${BORDER}`, borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'Figtree, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <ConfirmNo onClick={() => setAvaliandoId(null)}>Cancelar</ConfirmNo>
                <ConfirmYes
                  style={{ background: DARK_GREEN, opacity: enviandoAvaliacao ? 0.6 : 1 }}
                  onClick={() => handleEnviarAvaliacao(c)}
                  disabled={enviandoAvaliacao}
                >
                  {enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
                </ConfirmYes>
              </div>
            </div>
          )}
        </ConsultaCard>
      </CardWrapper>
    );
  };

  return (
    <PageWrapper>
      <Header />
      <Content>
        {/* Vagas pendentes banner */}
        {vagasPendentes.map(notif => (
          <div key={notif.id} style={{
            background: '#FFF7F0', border: '1.5px solid #FED7B0', borderRadius: '12px',
            padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px',
            fontFamily: 'Figtree, sans-serif',
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Calendar size={20} color="#E8611A" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#C2410C' }}>
                Uma vaga se abriu!
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#7C2D12' }}>
                Dr. {notif.prof_nome} {notif.prof_sobrenome} · {notif.dia} às {notif.horario}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => handleRecusarVaga(notif)}
                style={{ padding: '8px 14px', background: 'none', border: '1.5px solid #FED7B0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#7C2D12', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}
              >
                Não, obrigado
              </button>
              <button
                onClick={() => handleAceitarVaga(notif)}
                disabled={aceitandoVaga === notif.id}
                style={{ padding: '8px 18px', background: '#E8611A', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: 'white', cursor: 'pointer', fontFamily: 'Figtree, sans-serif', opacity: aceitandoVaga === notif.id ? 0.7 : 1 }}
              >
                {aceitandoVaga === notif.id ? 'Aceitando…' : 'Aceitar vaga'}
              </button>
            </div>
          </div>
        ))}

        <PageTop>
          <TitleArea>
            <SectionLabel>AGENDA</SectionLabel>
            <PageTitle>Minhas consultas</PageTitle>
            <PageDesc>
              Acompanhe status, prepare-se com o formulário, ou avise se não puder comparecer — outro paciente pode aproveitar.
            </PageDesc>
          </TitleArea>
          <NewBtn onClick={() => navigate('/profissionais')}>
            <Plus size={16} /> Nova consulta
          </NewBtn>
        </PageTop>

        <TabsRow>
          {[
            { key: 'proximas',  label: 'Próximas',  count: proximas.length },
            { key: 'concluidas', label: 'Concluídas', count: concluidas.length },
            { key: 'canceladas', label: 'Canceladas', count: canceladas.length },
          ].map(t => (
            <Tab key={t.key} $active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>
              {t.label}
              <TabCount $active={activeTab === t.key}>{t.count}</TabCount>
            </Tab>
          ))}
        </TabsRow>

        {loading ? (
          <EmptyMsg>Carregando...</EmptyMsg>
        ) : shown.length === 0 ? (
          <EmptyMsg>Nenhuma consulta nesta categoria.</EmptyMsg>
        ) : (
          shown.map(renderCard)
        )}
      </Content>

      {/* Form View Drawer */}
      <Overlay $open={formDrawerOpen} onClick={() => setFormDrawerOpen(false)} />
      <Drawer $open={formDrawerOpen} style={{ width: '420px' }}>
        <DrawerHeader>
          <DrawerTitle>Formulário preenchido</DrawerTitle>
          <CloseBtn onClick={() => setFormDrawerOpen(false)}><X size={20} /></CloseBtn>
        </DrawerHeader>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loadingForm ? (
            <div style={{ color: MUTED, fontSize: '0.9rem' }}>Carregando...</div>
          ) : formData?.conteudo ? (
            flattenConteudo(formData.conteudo).map(({ label, value }, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${BORDER}`, padding: '10px 0' }}>
                <div style={{ fontSize: '0.73rem', fontWeight: 700, color: MUTED, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '0.88rem', color: TEXT }}>{value}</div>
              </div>
            ))
          ) : (
            <div style={{ color: MUTED, fontSize: '0.9rem' }}>Formulário não encontrado.</div>
          )}
        </div>
      </Drawer>

      {/* Edit Drawer */}
      <Overlay $open={editDrawerOpen} onClick={() => setEditDrawerOpen(false)} />
      <Drawer $open={editDrawerOpen}>
        <DrawerHeader>
          <DrawerTitle>Editar consulta</DrawerTitle>
          <CloseBtn onClick={() => setEditDrawerOpen(false)}><X size={20} /></CloseBtn>
        </DrawerHeader>

        <div>
          <FieldLabel>Data</FieldLabel>
          <DPWrapper>
            <DatePicker
              selected={novaData}
              onChange={d => d && setNovaData(d)}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              showPopperArrow={false}
            />
          </DPWrapper>
        </div>

        <div>
          <FieldLabel>Horário</FieldLabel>
          <FieldInput
            type="text"
            placeholder="HH:MM"
            value={novoHorario}
            onChange={e => {
              let v = e.target.value.replace(/\D/g, '');
              if (v.length <= 2) setNovoHorario(v);
              else setNovoHorario(v.slice(0, 2) + ':' + v.slice(2, 4));
            }}
          />
        </div>

        <SaveBtn onClick={handleSalvar}>Salvar alteração</SaveBtn>
      </Drawer>

      <Footer />
    </PageWrapper>
  );
};

export default MinhasConsultas;
