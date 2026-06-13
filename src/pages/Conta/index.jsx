import { Edit2, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';

const DARK_GREEN = '#1C5C40';
const MID_GREEN = '#2D8A62';
const BG = '#F7F3EE';
const BORDER = '#E5E0DA';
const TEXT = '#111';
const MUTED = '#666';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${BG};
  font-family: 'Figtree', sans-serif;
`;

const Content = styled.div`
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 32px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 32px 20px;
  }
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${MID_GREEN};
  letter-spacing: 0.12em;
  margin-bottom: 8px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${TEXT};
  margin: 0 0 32px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid ${BORDER};
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const UserAvatarLarge = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #F5C4B0;
  color: #8B3A20;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UserNameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserFullName = styled.span`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${TEXT};
`;

const UserEmailSmall = styled.span`
  font-size: 0.82rem;
  color: ${MUTED};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${BORDER};
  margin: 0 0 20px;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid ${BORDER};

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 0.85rem;
  color: ${MUTED};
  font-weight: 400;
`;

const InfoValue = styled.span`
  font-size: 0.85rem;
  color: ${TEXT};
  font-weight: 500;
  text-align: right;
`;

const EditBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  background: transparent;
  color: ${TEXT};
  border: 1.5px solid ${BORDER};
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: ${MID_GREEN};
    color: ${MID_GREEN};
  }
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ProfCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid ${BORDER};
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const SparkleIcon = styled.div`
  font-size: 1.3rem;
  color: ${MID_GREEN};
  line-height: 1;
`;

const ProfCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${TEXT};
  margin: 0;
`;

const ProfCardDesc = styled.p`
  font-size: 0.85rem;
  color: ${MUTED};
  line-height: 1.5;
  margin: 0;
  flex: 1;
`;

const ProfBtn = styled.button`
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
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  margin-top: 8px;
  transition: background 0.2s;

  &:hover {
    background: ${MID_GREEN};
  }
`;

const LogoutSection = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px 0 0;
  margin-top: auto;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  border: none;
  color: #C53030;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: #FFF5F5;
  }
`;

const Conta = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const initials = user
        ? `${user.nome?.[0] || ''}${user.sobrenome?.[0] || ''}`.toUpperCase()
        : 'U';

    const tipoLabel = user?.tipoUsuario === 'profissional' ? 'Profissional' : 'Paciente';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <PageWrapper>
            <Header />
            <Content>
                <SectionLabel>CONTA</SectionLabel>
                <PageTitle>Suas informações</PageTitle>

                <Grid>
                    <Card>
                        <UserHeader>
                            <UserAvatarLarge>{initials}</UserAvatarLarge>
                            <UserNameBlock>
                                <UserFullName>{user?.nome} {user?.sobrenome}</UserFullName>
                                <UserEmailSmall>{user?.email}</UserEmailSmall>
                            </UserNameBlock>
                        </UserHeader>

                        <Divider />

                        <InfoList>
                            <InfoRow>
                                <InfoLabel>Email</InfoLabel>
                                <InfoValue>{user?.email || '—'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Telefone</InfoLabel>
                                <InfoValue>{user?.telefone || '—'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Tipo de conta</InfoLabel>
                                <InfoValue>{tipoLabel}</InfoValue>
                            </InfoRow>
                        </InfoList>

                        <EditBtn>
                            <Edit2 size={14} />
                            Editar perfil
                        </EditBtn>
                    </Card>

                    <RightCol>
                        <ProfCard>
                            <SparkleIcon>✳</SparkleIcon>
                            <ProfCardTitle>Quer testar o lado profissional?</ProfCardTitle>
                            <ProfCardDesc>
                                Veja como é o dashboard de profissionais — agenda, urgências e solicitações em um só lugar.
                            </ProfCardDesc>
                            <ProfBtn onClick={() => navigate('/Registrar')}>
                                <Users size={16} />
                                Entrar como profissional
                            </ProfBtn>
                        </ProfCard>

                        <LogoutSection>
                            <LogoutBtn onClick={handleLogout}>
                                <LogOut size={14} />
                                Sair da conta
                            </LogoutBtn>
                        </LogoutSection>
                    </RightCol>
                </Grid>
            </Content>
            <Footer />
        </PageWrapper>
    );
};

export default Conta;
