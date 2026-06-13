import axios from 'axios';
import { useEffect, useState } from 'react';
import { BsActivity, BsVolumeUpFill } from 'react-icons/bs';
import { FaAppleAlt, FaBolt, FaBrain, FaClipboardList, FaStethoscope, FaTooth, FaUsers } from 'react-icons/fa';
import { CalendarDays, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import {
    AppointmentConf,
    AppointmentDate,
    AppointmentInfoWrap,
    AppointmentName,
    AppointmentOverlay,
    AppointmentSpec,
    BadgeNew,
    CalendarArrow,
    CalendarCard,
    CalendarGrid,
    CalendarHeader,
    CalendarMonth,
    DayCell,
    DayLabel,
    DifferentialCard,
    DifferentialDesc,
    DifferentialIcon,
    DifferentialName,
    DifferentialsGrid,
    DifferentialsSection,
    HeroButtons,
    HeroDesc,
    HeroLeft,
    HeroRight,
    HeroSection,
    HeroTitle,
    HeroTitleItalic,
    NextAppCard,
    NextAppDateBox,
    NextAppInfo,
    NextAppLabel,
    NextAppName,
    NextAppSection,
    NextAppSpec,
    OutlineButton,
    PageWrapper,
    PrimaryButton,
    ProfAvatar,
    SecondaryButton,
    SectionLabel,
    SectionSubtitle,
    SectionTitle,
    SpecialtyCard,
    SpecialtyDesc,
    SpecialtyIcon,
    SpecialtyLink,
    SpecialtyName,
    SpecialtiesGrid,
    SpecialtiesSection,
    StatDivider,
    StatItem,
    StatLabel,
    StatNumber,
    StatsSection,
} from './style';

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTH_SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const DAY_HEADERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const specialties = [
    { icon: <FaStethoscope />, name: 'Médicos', desc: 'Clínicos e especialistas' },
    { icon: <FaTooth />, name: 'Dentistas', desc: 'Odontologia geral e estética' },
    { icon: <FaAppleAlt />, name: 'Nutricionistas', desc: 'Plano alimentar e acompanhamento' },
    { icon: <BsActivity />, name: 'Fisioterapeutas', desc: 'Reabilitação e RPG' },
    { icon: <BsVolumeUpFill />, name: 'Fonoaudiólogos', desc: 'Voz, fala e audição' },
    { icon: <FaBrain />, name: 'Psicólogos', desc: 'Saúde mental e bem-estar emocional' },
];

const differentials = [
    {
        icon: <FaBolt />,
        name: 'Consulta Emergente',
        desc: 'Anexe arquivo, descreva o caso e receba retorno em menos de 1h. Sem precisar ir à emergência se expor.',
        iconColor: '#E5830F',
        iconBg: '#FEF0E2',
    },
    {
        icon: <FaClipboardList />,
        name: 'Formulário por área',
        desc: 'Cada especialidade tem perguntas específicas. O profissional já chega à consulta sabendo o caso.',
        iconColor: '#2D6A4F',
        iconBg: '#E0F0E8',
    },
    {
        icon: <FaUsers />,
        name: 'Horário liberado, fila inteligente',
        desc: 'Se alguém faltar, o sistema oferece o horário ao próximo paciente. 1h para confirmar — e a vaga não se perde.',
        iconColor: '#2D6A4F',
        iconBg: '#E0F0E8',
    },
];

const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
};

// Parse date string as local midnight to avoid UTC offset issues
const parseDia = (dia) => {
    if (!dia) return null;
    const str = String(dia).split('T')[0];
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [professionalCount, setProfessionalCount] = useState(0);
    const [nextConsulta, setNextConsulta] = useState(null);
    const [nextProfName, setNextProfName] = useState('');
    const [nextProfSpec, setNextProfSpec] = useState('');
    const now = new Date();
    const [calYear, setCalYear] = useState(now.getFullYear());
    const [calMonth, setCalMonth] = useState(now.getMonth());

    useEffect(() => {
        axios.get('http://localhost:3000/profissionais')
            .then(res => setProfessionalCount(res.data.length))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        axios.get(`http://localhost:3000/reservas?usuario_id=${user.id}`)
            .then(async res => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const upcoming = (res.data || [])
                    .filter(r => (r.status === 'confirmado' || r.status === 'pendente') && parseDia(r.dia) >= today)
                    .sort((a, b) => parseDia(a.dia) - parseDia(b.dia))[0];
                if (!upcoming) return;
                setNextConsulta(upcoming);
                if (upcoming.profissional_id) {
                    try {
                        const pr = await axios.get(`http://localhost:3000/usuarios/solicitarDados/${upcoming.profissional_id}`);
                        setNextProfName(`${pr.data.nome} ${pr.data.sobrenome}`);
                        setNextProfSpec(pr.data.tipoProfissional || pr.data.especialidadeMedica || 'Especialista');
                    } catch (_) {}
                }
            })
            .catch(() => {});
    }, [user]);

    const today = new Date();
    const isToday = (day) =>
        day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

    const appointmentDay = (() => {
        if (!nextConsulta) return null;
        const d = parseDia(nextConsulta.dia);
        if (!d) return null;
        if (d.getMonth() === calMonth && d.getFullYear() === calYear) return d.getDate();
        return null;
    })();

    const calDays = generateCalendarDays(calYear, calMonth);

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
        else setCalMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
        else setCalMonth(m => m + 1);
    };

    const nextDia = parseDia(nextConsulta?.dia);

    return (
        <PageWrapper>
            <Header />

            <HeroSection>
                <HeroLeft>
                    <HeroTitle>
                        Sua saúde,<br />
                        <HeroTitleItalic>quando você precisar.</HeroTitleItalic>
                    </HeroTitle>
                    <HeroDesc>
                        Marque consultas com médicos, dentistas, nutricionistas e mais. Sem filas,
                        sem esperar um mês — e com a opção de consulta emergente quando o tempo não pode esperar.
                    </HeroDesc>
                    <HeroButtons>
                        <PrimaryButton onClick={() => navigate(user ? '/profissionais' : '/Entrar')}>
                            <Search size={16} style={{ marginRight: 8, flexShrink: 0 }} />
                            Encontrar profissional
                        </PrimaryButton>
                        <SecondaryButton onClick={() => navigate('/minhas-consultas')}>
                            Minhas consultas →
                        </SecondaryButton>
                    </HeroButtons>
                </HeroLeft>

                <HeroRight>
                    <CalendarCard>
                        <CalendarHeader>
                            <CalendarArrow onClick={prevMonth}>‹</CalendarArrow>
                            <CalendarMonth>{MONTH_NAMES[calMonth]} {calYear}</CalendarMonth>
                            <CalendarArrow onClick={nextMonth}>›</CalendarArrow>
                        </CalendarHeader>
                        <CalendarGrid>
                            {DAY_HEADERS.map((d, i) => <DayLabel key={i}>{d}</DayLabel>)}
                            {calDays.map((day, i) => (
                                <DayCell
                                    key={i}
                                    $isToday={isToday(day)}
                                    $hasAppointment={day === appointmentDay}
                                    $isEmpty={!day}
                                >
                                    {day}
                                </DayCell>
                            ))}
                        </CalendarGrid>

                        {nextConsulta && (
                            <AppointmentOverlay>
                                <ProfAvatar>{(nextProfName || 'P')[0]}</ProfAvatar>
                                <AppointmentInfoWrap>
                                    <AppointmentName>{nextProfName || 'Profissional'}</AppointmentName>
                                    <AppointmentSpec>{nextProfSpec} · Online</AppointmentSpec>
                                </AppointmentInfoWrap>
                                <AppointmentConf>✓ Confirmado</AppointmentConf>
                                <AppointmentDate>
                                    <CalendarDays size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                    {nextDia
                                        ? nextDia.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
                                        : ''} · {nextConsulta.horario}
                                </AppointmentDate>
                            </AppointmentOverlay>
                        )}
                    </CalendarCard>
                </HeroRight>
            </HeroSection>

            <StatsSection>
                <StatItem>
                    <StatNumber>{professionalCount}+</StatNumber>
                    <StatLabel>PROFISSIONAIS VERIFICADOS</StatLabel>
                </StatItem>
                <StatDivider />
                <StatItem>
                    <StatNumber>&lt; 1h</StatNumber>
                    <StatLabel>RESPOSTA DE EMERGÊNCIA</StatLabel>
                </StatItem>
            </StatsSection>

            {user && nextConsulta && nextDia && (
                <NextAppSection>
                    <NextAppCard>
                        <NextAppDateBox>
                            <span>{MONTH_SHORT[nextDia.getMonth()]}</span>
                            <strong>{String(nextDia.getDate()).padStart(2, '0')}</strong>
                        </NextAppDateBox>
                        <NextAppInfo>
                            <NextAppLabel>PRÓXIMA CONSULTA</NextAppLabel>
                            <NextAppName>{nextProfName || 'Profissional'} · {nextConsulta.horario}</NextAppName>
                            <NextAppSpec>{nextProfSpec} · online</NextAppSpec>
                        </NextAppInfo>
                        <div style={{ flexShrink: 0 }}>
                            <PrimaryButton onClick={() => navigate('/minhas-consultas')}>
                                Ver detalhes
                            </PrimaryButton>
                        </div>
                    </NextAppCard>
                </NextAppSection>
            )}

            <SpecialtiesSection>
                <SectionLabel>ESPECIALIDADES</SectionLabel>
                <SectionTitle>Qual cuidado você precisa hoje?</SectionTitle>
                <SectionSubtitle>
                    Cada área tem um formulário pré-consulta próprio, para que o profissional já chegue preparado.
                </SectionSubtitle>
                <SpecialtiesGrid>
                    {specialties.map((s, i) => (
                        <SpecialtyCard key={i} onClick={() => navigate('/profissionais')}>
                            <SpecialtyIcon>{s.icon}</SpecialtyIcon>
                            <SpecialtyName>{s.name}</SpecialtyName>
                            <SpecialtyDesc>{s.desc}</SpecialtyDesc>
                            <SpecialtyLink>Ver profissionais →</SpecialtyLink>
                        </SpecialtyCard>
                    ))}
                </SpecialtiesGrid>
            </SpecialtiesSection>

            <DifferentialsSection>
                <SectionLabel>DIFERENCIAIS</SectionLabel>
                <SectionTitle>Pensado para os dois lados</SectionTitle>
                <SectionSubtitle>
                    Recursos que outras plataformas não oferecem — feitos para reduzir espera, fila e tempo perdido.
                </SectionSubtitle>
                <DifferentialsGrid>
                    {differentials.map((d, i) => (
                        <DifferentialCard key={i}>
                            <DifferentialIcon $color={d.iconColor} $bg={d.iconBg}>
                                {d.icon}
                            </DifferentialIcon>
                            <DifferentialName>{d.name}</DifferentialName>
                            <DifferentialDesc>{d.desc}</DifferentialDesc>
                        </DifferentialCard>
                    ))}
                </DifferentialsGrid>
            </DifferentialsSection>

            <Footer />
        </PageWrapper>
    );
};

export default Home;
