import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import ConsultaCard from './components/ConsultaCard';
import EditDrawer from './components/EditDrawer';
import FormDrawer from './components/FormDrawer';
import VagaPendenteAlert from './components/VagaPendenteAlert';
import { useAvaliacao } from './hooks/useAvaliacao';
import { useConsultas } from './hooks/useConsultas';
import { useEditConsulta } from './hooks/useEditConsulta';
import { useFormulario } from './hooks/useFormulario';
import {
  Content,
  EmptyMsg,
  NewBtn,
  PageDesc,
  PageTitle,
  PageTop,
  PageWrapper,
  SectionLabel,
  Tab,
  TabCount,
  TabsRow,
  TitleArea,
} from './styles';

const TABS = [
  { key: 'proximas',  label: 'Próximas' },
  { key: 'concluidas', label: 'Concluídas' },
  { key: 'canceladas', label: 'Canceladas' },
];

const MinhasConsultas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('proximas');

  const avaliacao = useAvaliacao();

  const consultas = useConsultas({ onLoaded: avaliacao.verificarAvaliacoes });

  const edit = useEditConsulta({ onSaved: consultas.buscarConsultas });

  const formulario = useFormulario();

  useEffect(() => {
    if (!user?.id) { navigate('/Entrar'); return; }
    consultas.buscarConsultas();
    consultas.buscarVagasPendentes();
  }, []);

  const tabMap = {
    proximas:  consultas.proximas,
    concluidas: consultas.concluidas,
    canceladas: consultas.canceladas,
  };
  const shown = tabMap[activeTab] || [];
  const isPaciente = user?.tipoUsuario !== 'profissional';

  const cardProps = {
    today: consultas.today,
    isPaciente,
    confirmingId: consultas.confirmingId,
    setConfirmingId: consultas.setConfirmingId,
    liberandoId: consultas.liberandoId,
    setLiberandoId: consultas.setLiberandoId,
    avaliandoId: avaliacao.avaliandoId,
    setAvaliandoId: avaliacao.setAvaliandoId,
    notaAvaliacao: avaliacao.notaAvaliacao,
    setNotaAvaliacao: avaliacao.setNotaAvaliacao,
    comentarioAvaliacao: avaliacao.comentarioAvaliacao,
    setComentarioAvaliacao: avaliacao.setComentarioAvaliacao,
    enviandoAvaliacao: avaliacao.enviandoAvaliacao,
    avaliacoesFeitas: avaliacao.avaliacoesFeitas,
    onVerFormulario: formulario.handleVerFormulario,
    onEditar: edit.handleEditar,
    onCancelar: consultas.handleCancelar,
    onConfirmarCancelamento: consultas.handleConfirmarCancelamento,
    onLiberarHorario: consultas.handleLiberarHorario,
    onConfirmarLiberacao: consultas.handleConfirmarLiberacao,
    onAceitarRemarcacao: consultas.handleAceitarRemarcacao,
    onRecusarRemarcacao: consultas.handleRecusarRemarcacao,
    onEnviarAvaliacao: avaliacao.handleEnviarAvaliacao,
  };

  return (
    <PageWrapper>
      <Header />
      <Content>
        {consultas.vagasPendentes.map(notif => (
          <VagaPendenteAlert
            key={notif.id}
            notif={notif}
            aceitando={consultas.aceitandoVaga === notif.id}
            onAceitar={consultas.handleAceitarVaga}
            onRecusar={consultas.handleRecusarVaga}
          />
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
          {TABS.map(t => (
            <Tab key={t.key} $active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>
              {t.label}
              <TabCount $active={activeTab === t.key}>{tabMap[t.key].length}</TabCount>
            </Tab>
          ))}
        </TabsRow>

        {consultas.loading ? (
          <EmptyMsg>Carregando...</EmptyMsg>
        ) : shown.length === 0 ? (
          <EmptyMsg>Nenhuma consulta nesta categoria.</EmptyMsg>
        ) : (
          shown.map(c => <ConsultaCard key={c.id} c={c} {...cardProps} />)
        )}
      </Content>

      <FormDrawer
        open={formulario.formDrawerOpen}
        onClose={() => formulario.setFormDrawerOpen(false)}
        loadingForm={formulario.loadingForm}
        formData={formulario.formData}
      />

      <EditDrawer
        open={edit.editDrawerOpen}
        onClose={() => edit.setEditDrawerOpen(false)}
        novaData={edit.novaData}
        setNovaData={edit.setNovaData}
        novoHorario={edit.novoHorario}
        setNovoHorario={edit.setNovoHorario}
        onSalvar={edit.handleSalvar}
      />

      <Footer />
    </PageWrapper>
  );
};

export default MinhasConsultas;
