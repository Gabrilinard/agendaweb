import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Nutricao from './formularios/Nutricao';
import Odontologia from './formularios/Odontologia';
import SaudeGeral from './formularios/SaudeGeral';
import { Card, Content, PageWrapper, Subtitle, Title } from './style';

const Formulario = () => {
  const { user } = useAuth();
  const { warning } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const { nomeProfissional, tipoProfissional, reservaIds } = location.state || {};

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

  const tipo = normalizarTipoProfissional(tipoProfissional);

  return (
    <PageWrapper>
      <Header />
      <Content>
        <Card>
          <Title>Formulário Pré-Consulta</Title>
          <Subtitle>
            {nomeProfissional ? `Profissional: ${nomeProfissional}` : 'Preencha as informações antes da consulta.'}
          </Subtitle>

          {tipo === 'dentista' ? (
            <Odontologia nomeProfissional={nomeProfissional} reservaIds={reservaIds} />
          ) : tipo === 'nutricionista' ? (
            <Nutricao nomeProfissional={nomeProfissional} reservaIds={reservaIds} />
          ) : tipo === 'medico' || tipo === 'fisioterapeuta' || tipo === 'fonoaudiologo' ? (
            <SaudeGeral
              nomeProfissional={nomeProfissional}
              tipoProfissional={tipo}
              reservaIds={reservaIds}
            />
          ) : (
            <>
              <Subtitle>Formulário ainda não disponível para este tipo de profissional.</Subtitle>
            </>
          )}
        </Card>
      </Content>
      <Footer />
    </PageWrapper>
  );
};

export default Formulario;
