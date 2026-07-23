import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import styled from 'styled-components';

const DashLayout = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: Figtree, sans-serif;
`;

const DashMain = styled.main`
  margin-left: 260px;
  flex: 1;
  min-height: 100vh;
  background: #F0EFE9;

  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: 56px;
  }
`;

const SidebarOverlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $open }) => $open ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1199;
  }
`;

const MobileHamburger = styled.button`
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 1198;
  background: white;
  border: 1px solid #E0DFD9;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);

  @media (max-width: 768px) {
    display: flex;
  }
`;
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getAvatarColor, getInitials } from '../../utils/avatar';
import { formatarDataCompleta as formatarDataExibicao, formatarHorarioBrasil, parseDia } from '../../utils/formatters';
import { solicitarDados } from './api';
import EditarReservaModal from './components/EditarReservaModal';
import LocationPickerEdit from './components/LocationPickerEdit';
import Sidebar from './components/Sidebar';
import useEditarReserva from './hooks/useEditarReserva';
import useInformacoes from './hooks/useInformacoes';
import useLocalizacao from './hooks/useLocalizacao';
import useNovaReserva from './hooks/useNovaReserva';
import useReservasDashboard from './hooks/useReservasDashboard';
import CriarConsulta from './telas/CriarConsulta';
import EditarInformacoes from './telas/EditarInformacoes';
import EditarMapa from './telas/EditarMapa';
import Inicio from './telas/VerConsultas';
import VerHistorico from './telas/VerHistorico';
import VerSolicitacoes from './telas/VerSolicitacoes';
import VerUrgencias from './telas/VerUrgencias';
import VerVagas from './telas/VerVagas';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminDashboard = () => {
  const [activeScreen, setActiveScreen] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user, setViewMode } = useAuth();
  const { success, error: showError, warning } = useNotification();
  const navigate = useNavigate();
  const notify = { success, showError, warning };

  const { reservas, setReservas, reservasPorData, buscarReservas } = useReservasDashboard(user);
  const novaReserva = useNovaReserva(user, notify, buscarReservas);
  const edicao = useEditarReserva(reservas, setReservas, buscarReservas, notify);
  const localizacao = useLocalizacao(notify);
  const informacoes = useInformacoes(user, notify);

  const irPara = async (screen) => {
    if (screen === 'mapa') {
      try {
        const { data } = await solicitarDados(user.id);
        localizacao.carregarDados(data, user.id);
      } catch { localizacao.setEditingUserId(user.id); }
    }
    if (screen === 'informacoes' || screen === 'horarios') {
      try {
        const { data } = await solicitarDados(user.id);
        informacoes.carregarDados(data, user.id, screen);
        setActiveScreen(screen);
      } catch { showError('Erro ao carregar informações.'); }
      return;
    }
    setActiveScreen(screen);
  };

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const pendentes = reservas.filter(r => !r.is_urgente && r.status === 'pendente' && r.dia && parseDia(r.dia) >= hoje).length;
  const vagasCount = reservas.filter(r => r.status === 'liberado').length;
  const URGENCIA_STATUS_ATIVOS = new Set(['pendente', 'aguardando_confirmacao_paciente']);
  const urgentes = reservas.filter(r => r.is_urgente && URGENCIA_STATUS_ATIVOS.has(r.status) && (!r.dia || parseDia(r.dia) >= hoje)).length;

  const nomeCompleto = `${user?.nome || ''} ${user?.sobrenome || ''}`.trim();
  const av = getAvatarColor(nomeCompleto);
  const initials = getInitials(nomeCompleto);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
      case 'agenda':
        return (
          <Inicio
            reservas={reservas} reservasPorData={reservasPorData}
            formatarHorarioBrasil={formatarHorarioBrasil} formatarDataExibicao={formatarDataExibicao}
            irPara={irPara} user={user} modoAgenda={activeScreen === 'agenda'}
          />
        );
      case 'horarios':
        return (
          <CriarConsulta
            modo="horarios"
            {...novaReserva}
            formatarHorarioBrasil={formatarHorarioBrasil}
            onSalvarHorarios={informacoes.handleSalvarHorarios}
            horariosAtendimentoAtual={informacoes.editHorariosAtendimento}
            diasAtendimentoAtual={informacoes.editDiasAtendimento}
          />
        );
      case 'criar':
        return (
          <CriarConsulta
            modo="paciente"
            {...novaReserva}
            formatarHorarioBrasil={formatarHorarioBrasil}
          />
        );
      case 'solicitacoes':
        return (
          <VerSolicitacoes
            reservas={reservas} formatarDataExibicao={formatarDataExibicao} formatarHorarioBrasil={formatarHorarioBrasil}
            selecionarReservaParaFormulario={edicao.selecionarReservaParaFormulario}
            reservaSelecionada={edicao.reservaSelecionada} formularioSelecionado={edicao.formularioSelecionado}
            carregandoFormulario={edicao.carregandoFormulario} erroFormulario={edicao.erroFormulario}
            onFecharFormulario={edicao.fecharFormulario}
            toggleStatus={edicao.toggleStatus} mostrarMotivo={edicao.mostrarMotivo} setMostrarMotivo={edicao.setMostrarMotivo}
            motivo={edicao.motivo} setMotivo={edicao.setMotivo} negarReserva={edicao.handleNegarReserva}
            onEditarReserva={edicao.abrirEdicaoReserva} removerReserva={edicao.removerReserva}
          />
        );
      case 'urgencias':
        return (
          <VerUrgencias
            reservas={reservas} formatarDataExibicao={formatarDataExibicao} formatarHorarioBrasil={formatarHorarioBrasil}
            success={success} showError={showError} buscarReservas={buscarReservas}
            onEditarReserva={edicao.abrirEdicaoReserva} removerReserva={edicao.removerReserva}
          />
        );
      case 'vagas':
        return (
          <VerVagas
            reservas={reservas} formatarDataExibicao={formatarDataExibicao} formatarHorarioBrasil={formatarHorarioBrasil}
            user={user} success={success} showError={showError} buscarReservas={buscarReservas}
          />
        );
      case 'historico':
        return (
          <VerHistorico
            reservas={reservas} searchHistory={edicao.searchHistory} setSearchHistory={edicao.setSearchHistory}
            formatarDataExibicao={formatarDataExibicao} formatarHorarioBrasil={formatarHorarioBrasil}
          />
        );
      case 'mapa':
        return (
          <EditarMapa
            LocationPickerEdit={LocationPickerEdit} handleMapClick={localizacao.handleMapClick}
            editLatitude={localizacao.editLatitude} editLongitude={localizacao.editLongitude}
            editUfRegiao={localizacao.editUfRegiao} editCidade={localizacao.editCidade}
            setEditCidade={localizacao.setEditCidade} setEditUfRegiao={localizacao.setEditUfRegiao}
            handleEditarMapa={localizacao.handleEditarMapa}
          />
        );
      case 'informacoes':
        return (
          <EditarInformacoes
            editTipoProfissional={informacoes.editTipoProfissional}
            editNumeroConselho={informacoes.editNumeroConselho}
            editDescricao={informacoes.editDescricao} setEditDescricao={informacoes.setEditDescricao}
            editPublicoAtendido={informacoes.editPublicoAtendido} setEditPublicoAtendido={informacoes.setEditPublicoAtendido}
            editModalidade={informacoes.editModalidade} setEditModalidade={informacoes.setEditModalidade}
            editValorConsulta={informacoes.editValorConsulta} setEditValorConsulta={informacoes.setEditValorConsulta}
            diasSemana={informacoes.diasSemana} editDiasAtendimento={informacoes.editDiasAtendimento}
            editHorariosAtendimento={informacoes.editHorariosAtendimento}
            handleEditDiaChange={informacoes.handleEditDiaChange} handleEditHorarioChange={informacoes.handleEditHorarioChange}
            handleEditRemoveHorario={informacoes.handleEditRemoveHorario} handleEditAddHorario={informacoes.handleEditAddHorario}
            handleEditarInformacoes={informacoes.handleEditarInformacoes}
            user={user}
          />
        );
      default: return null;
    }
  };

  const irParaComFechar = async (screen) => {
    await irPara(screen);
    setSidebarOpen(false);
  };

  return (
    <DashLayout>
      <SidebarOverlay $open={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <MobileHamburger onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
        <Menu size={20} color="#333" />
      </MobileHamburger>
      <Sidebar
        user={user} av={av} initials={initials}
        activeScreen={activeScreen} irPara={irParaComFechar}
        navigate={navigate} logout={logout} setViewMode={setViewMode}
        pendentes={pendentes} urgentes={urgentes} vagasCount={vagasCount}
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
      />
      <DashMain>
        {renderScreen()}
        <EditarReservaModal
          show={edicao.showReservaEdit}
          onClose={() => edicao.setShowReservaEdit(false)}
          editReservaData={edicao.editReservaData}
          setEditReservaData={edicao.setEditReservaData}
          editReservaHorario={edicao.editReservaHorario}
          setEditReservaHorario={edicao.setEditReservaHorario}
          handleUpdateReserva={edicao.handleUpdateReserva}
        />
      </DashMain>
    </DashLayout>
  );
};

export default AdminDashboard;
