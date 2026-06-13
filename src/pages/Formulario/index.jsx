import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Fisioterapia from './formularios/Fisioterapia';
import Fonoaudiologia from './formularios/Fonoaudiologia';
import Nutricao from './formularios/Nutricao';
import Odontologia from './formularios/Odontologia';
import Psicologia from './formularios/Psicologia';
import SaudeGeral from './formularios/Medico';
import { Card, Content, PageWrapper, Subtitle, Title } from './style';

const Formulario = () => {
  const { user } = useAuth();
  const { warning } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const { nomeProfissional, tipoProfissional, reservaIds, pendingReservas } = location.state || {};

  if (!user) {
    warning('Você precisa estar logado.');
    navigate('/Entrar');
    return null;
  }

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

  const tipo = normalizarTipoProfissional(tipoProfissional);

  return (
    <PageWrapper>
      <Header />
      <Content>
        <Card>
          <Title>Formulário Pré-Consulta</Title>
          <Subtitle>
            {nomeProfissional
              ? `Profissional: ${nomeProfissional}`
              : 'Preencha as informações antes da consulta.'}
          </Subtitle>
          <hr style={{ border: 'none', borderTop: '1px solid #E2E8E5', margin: '0 0 4px' }} />

          {tipo === 'dentista' ? (
            <Odontologia nomeProfissional={nomeProfissional} reservaIds={reservaIds} pendingReservas={pendingReservas} />
          ) : tipo === 'nutricionista' ? (
            <Nutricao nomeProfissional={nomeProfissional} reservaIds={reservaIds} pendingReservas={pendingReservas} />
          ) : tipo === 'psicologo' ? (
            <Psicologia nomeProfissional={nomeProfissional} reservaIds={reservaIds} pendingReservas={pendingReservas} />
          ) : tipo === 'fisioterapeuta' ? (
            <Fisioterapia nomeProfissional={nomeProfissional} reservaIds={reservaIds} pendingReservas={pendingReservas} />
          ) : tipo === 'fonoaudiologo' ? (
            <Fonoaudiologia nomeProfissional={nomeProfissional} reservaIds={reservaIds} pendingReservas={pendingReservas} />
          ) : tipo === 'medico' ? (
            <SaudeGeral nomeProfissional={nomeProfissional} reservaIds={reservaIds} pendingReservas={pendingReservas} />
          ) : (
            <Subtitle>Formulário ainda não disponível para este tipo de profissional.</Subtitle>
          )}
        </Card>
      </Content>
      <Footer />
    </PageWrapper>
  );
};

export default Formulario;
