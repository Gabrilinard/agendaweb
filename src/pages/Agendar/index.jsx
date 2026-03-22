import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import EmergencyModal from './components/EmergencyModal';
import MapComponent from './components/MapComponent';
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
    TituloAgendamento
} from './style';

const Agendar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { nome: nomeProfissional, tipo, categoria } = location.state || {};
    const emailNotification = useEmailNotification(user);

    const { 
        profissionalInfo, 
        profissionalLocation, 
        enderecoCompleto, 
        reservasProfissional 
    } = useProfissional(nomeProfissional);

    const {
        dataSelecionada,
        setDataSelecionada,
        horario,
        setHorario,
        horariosDisponiveis,
        isDateAvailable,
        adicionarDiaReserva,
        enviarReservasEmLote,
        reservasTemporarias,
        datasSelecionadas
    } = useAgendamento(user, profissionalInfo, reservasProfissional, nomeProfissional, emailNotification);

    const {
        reservas,
        fetchReservas,
        loading: reservasLoading
    } = useReservas(user, profissionalInfo?.id);

    const reservaActions = useReservaActions(user, fetchReservas, emailNotification);

    const {
        showEmergencyModal,
        setShowEmergencyModal,
        urgenciaDescricao,
        setUrgenciaDescricao,
        urgenciaHorario,
        setUrgenciaHorario,
        urgenciaArquivo,
        setUrgenciaArquivo,
        handleEmergencySubmit
    } = useEmergencia(user, nomeProfissional);

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
            fonoaudiologos: 'fonoaudiologo'
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

    const handleSolicitarConsulta = async () => {
        await enviarReservasEmLote({
            onSuccess: ({ reservaIds }) => {
                if (
                    tipoProfissional === 'dentista' ||
                    tipoProfissional === 'nutricionista' ||
                    tipoProfissional === 'medico' ||
                    tipoProfissional === 'fisioterapeuta' ||
                    tipoProfissional === 'fonoaudiologo'
                ) {
                    navigate('/Formulario', { state: { nomeProfissional, tipoProfissional, reservaIds } });
                }
            }
        });
    };

    return (
        <ContainerGeral>
            <Header />
            <Container>
                {nomeProfissional ? (
                    <TituloAgendamento>Agendar com {nomeProfissional}</TituloAgendamento>
                ) : (
                    <h2>Agendar Consulta</h2>
                )}

                <Container_Important>
                    {profissionalInfo && nomeProfissional && (
                        <ProfessionalInfo profissionalInfo={profissionalInfo} />
                    )}

                    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', flex: 1 }}>
                        <ReservationForm 
                            user={user}
                            nomeProfissional={nomeProfissional}
                            dataSelecionada={dataSelecionada}
                            setDataSelecionada={setDataSelecionada}
                            horario={horario}
                            setHorario={setHorario}
                            horariosDisponiveis={horariosDisponiveis}
                            isDateAvailable={isDateAvailable}
                            adicionarDiaReserva={() => adicionarDiaReserva(reservas)}
                            enviarReservas={handleSolicitarConsulta}
                            reservasTemporarias={reservasTemporarias}
                            datasSelecionadas={datasSelecionadas}
                            onEmergencyClick={() => setShowEmergencyModal(true)}
                            MapComponent={
                                <MapComponent 
                                    location={profissionalLocation} 
                                    endereco={enderecoCompleto}
                                />
                            }
                        />
                    </div>
                </Container_Important>

                <ReservationList 
                    reservas={reservas} 
                    actions={reservaActions}
                />
            </Container>
            
            <EmergencyModal 
                show={showEmergencyModal}
                onClose={() => setShowEmergencyModal(false)}
                onSubmit={handleEmergencySubmit}
                user={user}
                urgenciaDescricao={urgenciaDescricao}
                setUrgenciaDescricao={setUrgenciaDescricao}
                urgenciaHorario={urgenciaHorario}
                setUrgenciaHorario={setUrgenciaHorario}
                urgenciaArquivo={urgenciaArquivo}
                setUrgenciaArquivo={setUrgenciaArquivo}
            />
            
            <Footer />
        </ContainerGeral>
    );
};

export default Agendar;
