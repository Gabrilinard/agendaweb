import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { formatarDataBrasil } from './utils/formatters';
import EmergencyModal from './components/EmergencyModal';
import ProfessionalInfo from './components/ProfessionalInfo';
import ReservationForm from './components/ReservationForm';
import ReservationList from './components/ReservationList';
import { useAgendamento } from './hooks/useAgendamento';
import { useEmailNotification } from './hooks/useEmailNotification';
import { useEmergencia } from './hooks/useEmergencia';
import { useProfissional } from './hooks/useProfissional';
import { useReservaActions } from './hooks/useReservaActions';
import { useReservas } from './hooks/useReservas';

import {
    Container,
    Container_Important,
    ContainerGeral,
} from './style';

const Agendar = () => {
    const { user } = useAuth();
    const { warning } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        nome: nomeProfissional,
        tipo,
        categoria,
        profissionalId: profissionalIdSugerido,
        diaSugerido,
        horarioSugerido,
        modalidadeSugerida,
    } = location.state || {};
    const emailNotification = useEmailNotification(user);

    const {
        profissionalInfo,
        profissionalLocation,
        enderecoCompleto,
        reservasProfissional
    } = useProfissional(nomeProfissional, profissionalIdSugerido);

    const {
        dataSelecionada,
        setDataSelecionada,
        horario,
        setHorario,
        horariosDisponiveis,
        modalidadeSelecionada,
        setModalidadeSelecionada,
        getValorModalidade,
        isDateAvailable,
        enviarReservasEmLote,
    } = useAgendamento(user, profissionalInfo, reservasProfissional, nomeProfissional, emailNotification, {
        dia: diaSugerido,
        horario: horarioSugerido,
        modalidade: modalidadeSugerida,
    });

    const {
        reservas,
        fetchReservas,
        loading: reservasLoading
    } = useReservas(user, profissionalInfo?.id);

    const reservaActions = useReservaActions(user, fetchReservas, emailNotification, profissionalInfo, reservasProfissional);

    const {
        showEmergencyModal,
        setShowEmergencyModal,
        urgenciaDescricao,
        setUrgenciaDescricao,
        urgenciaHorario,
        setUrgenciaHorario,
        urgenciaArquivo,
        setUrgenciaArquivo,
        urgenciaModalidade,
        setUrgenciaModalidade,
        urgenciaDia,
        setUrgenciaDia,
        urgenciaTurno,
        urgenciaDias,
        urgenciaConsultaModalidade,
        setUrgenciaConsultaModalidade,
        toggleTurno,
        toggleDia,
        handleEmergencySubmit
    } = useEmergencia(user, nomeProfissional, profissionalInfo);

    const normalizarTexto = (value) => (
        String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
    );

    const normalizarTipoProfissional = (value) => {
        const base = normalizarTexto(value);

        const pluralMap = {
            medicos: 'medico',
            dentistas: 'dentista',
            nutricionistas: 'nutricionista',
            fisioterapeutas: 'fisioterapeuta',
            fonoaudiologos: 'fonoaudiologo',
            psicologos: 'psicologo'
        };

        const possivelTipo = pluralMap[base] || base;

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

        const especialidadesSet = new Set(especialidadesMedicas.map(normalizarTexto));
        if (especialidadesSet.has(possivelTipo)) return 'medico';

        return possivelTipo;
    };

    const tipoProfissional = normalizarTipoProfissional(categoria || tipo || profissionalInfo?.tipoProfissional);

    const TIPOS_COM_FORMULARIO = new Set(['dentista', 'nutricionista', 'medico', 'fisioterapeuta', 'fonoaudiologo', 'psicologo']);

    const calcHorarioFinal = (h) => {
        if (!h) return '';
        const [hr, min] = h.split(':').map(Number);
        return `${String((hr + 1) % 24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    const handleSolicitarConsulta = async () => {
        if (!modalidadeSelecionada) {
            warning('Por favor, escolha a modalidade da consulta.');
            return;
        }

        if (TIPOS_COM_FORMULARIO.has(tipoProfissional)) {
            if (!dataSelecionada || !horario) {
                return;
            }

            const valorModalidade = getValorModalidade(modalidadeSelecionada);
            const pendingReservasComModalidade = [{
                dia: formatarDataBrasil(dataSelecionada),
                horario,
                horarioFinal: calcHorarioFinal(horario),
                modalidade: modalidadeSelecionada,
                valor: valorModalidade,
            }];

            navigate('/Formulario', {
                state: {
                    nomeProfissional,
                    tipoProfissional,
                    profissionalId: profissionalInfo?.id,
                    pendingReservas: pendingReservasComModalidade,
                }
            });
        } else {
            await enviarReservasEmLote();
        }
    };

    return (
        <ContainerGeral>
            <Header />
            <Container>
                <div style={{ maxWidth: '1100px', width: '100%' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'white', border: '1.5px solid #E5E0DA',
                            borderRadius: '10px', cursor: 'pointer',
                            color: '#444', fontSize: '13px', fontWeight: '600',
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            marginBottom: '20px', padding: '8px 16px',
                            fontFamily: 'Figtree, sans-serif',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            transition: 'background 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F2EDE8'; e.currentTarget.style.borderColor = '#c5bfb8'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E5E0DA'; }}
                    >
                        ← Voltar para lista
                    </button>

                    {diaSugerido && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            background: 'linear-gradient(135deg, #FFF7F0, #FFEFE0)',
                            border: '1.5px solid #FBD9A5', borderRadius: '12px',
                            padding: '16px 20px', marginBottom: '20px',
                            fontFamily: 'Figtree, sans-serif',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                                background: '#FFE3C2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px',
                            }}>
                                🗓️
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '14.5px', fontWeight: '700', color: '#7A4100' }}>
                                    Horário anterior liberado
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#9A5B14' }}>
                                    Escolha abaixo um novo dia e horário para marcar sua consulta novamente, ou{' '}
                                    <button
                                        onClick={() => document.getElementById('reservation-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                        style={{
                                            background: 'none', border: 'none', padding: 0, margin: 0,
                                            color: '#7A4100', fontWeight: '700', fontSize: '13px',
                                            textDecoration: 'underline', cursor: 'pointer',
                                            fontFamily: 'Figtree, sans-serif',
                                        }}
                                    >
                                        role até o final da página para editar seu horário liberado
                                    </button>.
                                </p>
                            </div>
                        </div>
                    )}

                    <Container_Important>
                        {profissionalInfo && (
                            <ProfessionalInfo
                                profissionalInfo={profissionalInfo}
                                location={profissionalLocation}
                                endereco={enderecoCompleto}
                            />
                        )}

                        <ReservationForm
                            user={user}
                            nomeProfissional={nomeProfissional}
                            profissionalInfo={profissionalInfo}
                            dataSelecionada={dataSelecionada}
                            setDataSelecionada={setDataSelecionada}
                            horario={horario}
                            setHorario={setHorario}
                            horariosDisponiveis={horariosDisponiveis}
                            modalidadeSelecionada={modalidadeSelecionada}
                            setModalidadeSelecionada={setModalidadeSelecionada}
                            isDateAvailable={isDateAvailable}
                            enviarReservas={handleSolicitarConsulta}
                            onEmergencyClick={() => setShowEmergencyModal(true)}
                        />
                    </Container_Important>

                    <div id="reservation-form">
                        <ReservationList
                            reservas={reservas}
                            actions={reservaActions}
                            nomeProfissional={nomeProfissional}
                        />
                    </div>
                </div>
            </Container>
            
            <EmergencyModal
                show={showEmergencyModal}
                onClose={() => setShowEmergencyModal(false)}
                onSubmit={handleEmergencySubmit}
                user={user}
                profissionalInfo={profissionalInfo}
                urgenciaConsultaModalidade={urgenciaConsultaModalidade}
                setUrgenciaConsultaModalidade={setUrgenciaConsultaModalidade}
                urgenciaDescricao={urgenciaDescricao}
                setUrgenciaDescricao={setUrgenciaDescricao}
                urgenciaHorario={urgenciaHorario}
                setUrgenciaHorario={setUrgenciaHorario}
                urgenciaArquivo={urgenciaArquivo}
                setUrgenciaArquivo={setUrgenciaArquivo}
                urgenciaModalidade={urgenciaModalidade}
                setUrgenciaModalidade={setUrgenciaModalidade}
                urgenciaDia={urgenciaDia}
                setUrgenciaDia={setUrgenciaDia}
                urgenciaTurno={urgenciaTurno}
                urgenciaDias={urgenciaDias}
                toggleTurno={toggleTurno}
                toggleDia={toggleDia}
            />
            
            <Footer />
        </ContainerGeral>
    );
};

export default Agendar;
