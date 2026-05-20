import axios from 'axios';
import { useEffect, useState } from 'react';
import { BsActivity, BsVolumeUpFill } from 'react-icons/bs';
import { FaAppleAlt, FaStethoscope, FaTooth } from 'react-icons/fa';
import { CheckCircle, ChevronDown, MapPin, Search } from 'lucide-react';
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

const AVATAR_COLORS = [
  { bg: '#D4EDE1', color: '#1A5C3C' },
  { bg: '#FDE8CC', color: '#8B4A00' },
  { bg: '#D6E8F5', color: '#1A4A7A' },
  { bg: '#F5D6E8', color: '#7A1A5A' },
  { bg: '#E8E0F5', color: '#4A1A7A' },
  { bg: '#FDE8CC', color: '#7A4A1A' },
];

const getAvatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const getInitials = (name = '') => {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

const CATEGORIAS = [
  { key: 'medico',        label: 'Médicos',         icon: <FaStethoscope /> },
  { key: 'dentista',      label: 'Dentistas',        icon: <FaTooth /> },
  { key: 'nutricionista', label: 'Nutricionistas',   icon: <FaAppleAlt /> },
  { key: 'fisioterapeuta',label: 'Fisioterapeutas',  icon: <BsActivity /> },
  { key: 'fonoaudiologo', label: 'Fonoaudiólogos',   icon: <BsVolumeUpFill /> },
];

// ── Styled ──────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${BG};
  font-family: 'Figtree', sans-serif;
`;

const Content = styled.div`
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 32px;
  width: 100%;

  @media (max-width: 768px) { padding: 32px 16px; }
`;

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
  margin: 0 0 28px;
  line-height: 1.5;
`;

// Category tabs
const SpecTabs = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  background: #fff;
  border: 1.5px solid ${BORDER};
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 20px;
  width: fit-content;

  @media (max-width: 768px) { width: 100%; }
`;

const SpecTab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: all 0.15s;
  background: ${({ $active }) => $active ? DARK_GREEN : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : MUTED};
  white-space: nowrap;

  svg { font-size: 0.85rem; }

  &:hover {
    background: ${({ $active }) => $active ? DARK_GREEN : '#F2EDE8'};
    color: ${({ $active }) => $active ? '#fff' : TEXT};
  }
`;

const TabCount = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  opacity: 0.75;
`;

// Filters row
const FiltersRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchWrap = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  color: #aaa;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1.5px solid ${BORDER};
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: 'Figtree', sans-serif;
  background: #fff;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: ${MID_GREEN}; }
  &::placeholder { color: #bbb; }
`;

const SelectWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const StyledSelect = styled.select`
  appearance: none;
  background: #fff;
  border: 1.5px solid ${BORDER};
  border-radius: 10px;
  padding: 11px 36px 11px 14px;
  font-size: 0.85rem;
  font-family: 'Figtree', sans-serif;
  color: ${TEXT};
  cursor: pointer;
  outline: none;
  min-width: 170px;
  &:focus { border-color: ${MID_GREEN}; }
`;

const SelectArrow = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${MUTED};
  display: flex;
  align-items: center;
`;

const ResultCount = styled.div`
  font-size: 0.82rem;
  color: ${MUTED};
  margin-bottom: 20px;

  strong { color: ${TEXT}; }
`;

// Cards grid
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const ProfCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid ${BORDER};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
`;

const CardBody = styled.div`
  padding: 20px 20px 16px;
  flex: 1;
`;

const ProfHeader = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ProfMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
`;

const ProfName = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${TEXT};
`;

const VerifiedIcon = styled.span`
  color: ${MID_GREEN};
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const ProfSpec = styled.div`
  font-size: 0.82rem;
  color: ${MUTED};
  margin-bottom: 4px;
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: ${MUTED};
`;

const TagsRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const Tag = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 99px;
  background: ${({ $variant }) =>
    $variant === 'green' ? '#D4F0DE' :
    $variant === 'blue'  ? '#D6E8F5' :
    $variant === 'purple'? '#E8E0F5' :
    $variant === 'orange'? '#FDE8CC' :
    '#EDEAE4'};
  color: ${({ $variant }) =>
    $variant === 'green' ? '#1A5C3C' :
    $variant === 'blue'  ? '#1A4A7A' :
    $variant === 'purple'? '#4A1A7A' :
    $variant === 'orange'? '#8B4A00' :
    MUTED};
`;

const CardDivider = styled.hr`
  border: none;
  border-top: 1px solid ${BORDER};
  margin: 0;
`;

const CardFooterSection = styled.div`
  padding: 14px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const NextSlot = styled.div``;
const NextLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  color: ${MUTED};
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;
const NextTime = styled.div`
  font-size: 0.88rem;
  font-weight: 700;
  color: ${TEXT};
`;
const HorariosGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;
const HorarioChip = styled.div`
  background: #f0f4f2;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: ${TEXT};
  white-space: nowrap;
`;

const PriceArea = styled.div`
  text-align: right;
`;
const PriceLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  color: ${MUTED};
  letter-spacing: 0.06em;
  margin-bottom: 2px;
`;
const PriceValue = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  color: ${TEXT};
`;

const AgendaBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 40px);
  margin: 14px 20px 20px;
  padding: 13px;
  background: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: background 0.2s;

  &:hover { background: ${MID_GREEN}; }
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${MUTED};
  font-size: 0.95rem;
`;

// ── Component ────────────────────────────────────────────────────────────────

const PUBLICO_OPTIONS = [
  'Crianças (0-14)',
  'Adolescentes (15-17)',
  'Adultos e idosos',
  'Gestantes',
  'Todos',
];

const EmpresasProfissionais = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { warning } = useNotification();

  const [byCategoria, setByCategoria] = useState({});
  const [categoriaAtiva, setCategoriaAtiva] = useState('medico');
  const [busca, setBusca] = useState('');
  const [filtroModalidade, setFiltroModalidade] = useState('');
  const [filtroPublico, setFiltroPublico] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const result = {};
      for (const c of CATEGORIAS) {
        try {
          const { data } = await axios.get(`http://localhost:3000/profissionais/${c.key}`);
          result[c.key] = data || [];
        } catch { result[c.key] = []; }
      }
      setByCategoria(result);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const profAtivos = byCategoria[categoriaAtiva] || [];

  const filtrados = profAtivos.filter(p => {
    const matchBusca = !busca ||
      p.nomeCompleto?.toLowerCase().includes(busca.toLowerCase()) ||
      p.tipoProfissional?.toLowerCase().includes(busca.toLowerCase());

    const matchModal = !filtroModalidade ||
      p.modalidade?.toLowerCase().includes(filtroModalidade.toLowerCase());

    const matchPublico = !filtroPublico ||
      p.publicoAtendido?.toLowerCase().includes(filtroPublico.toLowerCase());

    return matchBusca && matchModal && matchPublico;
  });

  const handleAgendar = (p) => {
    if (!user) { warning('Você precisa estar logado para agendar.'); navigate('/Entrar'); return; }
    navigate('/Agendar', { state: { nome: p.nomeCompleto, tipo: p.tipoProfissional, categoria: categoriaAtiva, profissionalId: p.id } });
  };

  const getModalidadeTags = (modalidade) => {
    if (!modalidade) return [];
    const m = modalidade.toLowerCase();
    const tags = [];
    if (m.includes('online')) tags.push({ label: 'Online', variant: 'green' });
    if (m.includes('presencial')) tags.push({ label: 'Presencial', variant: '' });
    return tags;
  };

  return (
    <PageWrapper>
      <Header />
      <Content>
        <SectionLabel>BUSCAR</SectionLabel>
        <PageTitle>Profissionais disponíveis</PageTitle>
        <PageDesc>Escolha a especialidade, filtre por modalidade e veja quem tem horário aberto agora.</PageDesc>

        {/* Specialty tabs */}
        <SpecTabs>
          {CATEGORIAS.map(c => (
            <SpecTab
              key={c.key}
              $active={categoriaAtiva === c.key}
              onClick={() => { setCategoriaAtiva(c.key); setBusca(''); setFiltroModalidade(''); setFiltroPublico(''); }}
            >
              {c.icon}
              {c.label}
              <TabCount>{(byCategoria[c.key] || []).length}</TabCount>
            </SpecTab>
          ))}
        </SpecTabs>

        {/* Filters */}
        <FiltersRow>
          <SearchWrap>
            <SearchIcon><Search size={16} /></SearchIcon>
            <SearchInput
              placeholder="Buscar por nome ou subespecialidade..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </SearchWrap>

          <SelectWrap>
            <StyledSelect value={filtroModalidade} onChange={e => setFiltroModalidade(e.target.value)}>
              <option value="">Todas as modalidades</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
            </StyledSelect>
            <SelectArrow><ChevronDown size={15} /></SelectArrow>
          </SelectWrap>

          <SelectWrap>
            <StyledSelect value={filtroPublico} onChange={e => setFiltroPublico(e.target.value)}>
              <option value="">Tipo de público</option>
              {PUBLICO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </StyledSelect>
            <SelectArrow><ChevronDown size={15} /></SelectArrow>
          </SelectWrap>
        </FiltersRow>

        <ResultCount>
          <strong>{filtrados.length}</strong> {filtrados.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
        </ResultCount>

        {loading ? (
          <EmptyMsg>Carregando...</EmptyMsg>
        ) : filtrados.length === 0 ? (
          <EmptyMsg>Nenhum profissional encontrado com esses filtros.</EmptyMsg>
        ) : (
          <CardsGrid>
            {filtrados.map(p => {
              const av = getAvatarColor(p.nomeCompleto || '');
              const initials = getInitials(p.nomeCompleto || '');
              const modalTags = getModalidadeTags(p.modalidade);
              const hasLocation = p.cidade || p.ufRegiao;
              const hasValor = p.valorConsulta && Number(p.valorConsulta) > 0;
              const horarioEntries = (() => {
                if (!p.horariosAtendimento) return [];
                try {
                  const obj = typeof p.horariosAtendimento === 'string'
                    ? JSON.parse(p.horariosAtendimento)
                    : p.horariosAtendimento;
                  return Object.entries(obj)
                    .map(([dia, horas]) => {
                      const arr = Array.isArray(horas) ? horas.filter(Boolean) : [];
                      if (!arr.length) return null;
                      const abrev = dia.slice(0, 3);
                      return arr.length === 1
                        ? `${abrev}: ${arr[0]}`
                        : `${abrev}: ${arr[0]} – ${arr[arr.length - 1]}`;
                    })
                    .filter(Boolean);
                } catch {
                  return [];
                }
              })();

              return (
                <ProfCard key={p.id}>
                  <CardBody>
                    <ProfHeader>
                      <Avatar $bg={av.bg} $color={av.color}>{initials}</Avatar>
                      <ProfMeta>
                        <NameRow>
                          <ProfName>{p.nomeCompleto}</ProfName>
                          <VerifiedIcon><CheckCircle size={16} /></VerifiedIcon>
                        </NameRow>
                        <ProfSpec>{p.tipoProfissional}</ProfSpec>
                        {hasLocation && (
                          <LocationRow>
                            <MapPin size={12} />
                            {[p.cidade, p.ufRegiao].filter(Boolean).join(', ')}
                          </LocationRow>
                        )}
                      </ProfMeta>
                    </ProfHeader>

                    <TagsRow>
                      {modalTags.map(t => <Tag key={t.label} $variant={t.variant}>{t.label}</Tag>)}
                      {p.publicoAtendido && (
                        <Tag $variant="blue">{p.publicoAtendido}</Tag>
                      )}
                    </TagsRow>
                  </CardBody>

                  <CardDivider />

                  <CardFooterSection style={{ alignItems: 'flex-start', paddingTop: '14px' }}>
                    {horarioEntries.length > 0 ? (
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <NextLabel>HORÁRIOS DE ATENDIMENTO</NextLabel>
                        <HorariosGrid>
                          {horarioEntries.map(entry => (
                            <HorarioChip key={entry}>{entry}</HorarioChip>
                          ))}
                        </HorariosGrid>
                      </div>
                    ) : <div />}

                    {hasValor && (
                      <PriceArea style={{ marginLeft: '16px', flexShrink: 0 }}>
                        <PriceLabel>A PARTIR DE</PriceLabel>
                        <PriceValue>R$ {Number(p.valorConsulta).toFixed(0)}</PriceValue>
                      </PriceArea>
                    )}
                  </CardFooterSection>

                  <AgendaBtn onClick={() => handleAgendar(p)}>
                    Ver agenda →
                  </AgendaBtn>
                </ProfCard>
              );
            })}
          </CardsGrid>
        )}
      </Content>
      <Footer />
    </PageWrapper>
  );
};

export default EmpresasProfissionais;
