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

  const tipo = (tipoProfissional || '').toLowerCase();

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
