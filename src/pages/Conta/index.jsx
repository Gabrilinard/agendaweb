import { Check, Edit2, LogOut, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { OPCOES_GENERO } from '../../utils/titulo';
import { updatePerfil } from './api';

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

const InfoSelect = styled.select`
  font-size: 0.85rem;
  color: ${TEXT};
  font-weight: 500;
  text-align: right;
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  padding: 6px 10px;
  width: 60%;
  font-family: 'Figtree', sans-serif;
  background: #fff;

  &:focus {
    outline: none;
    border-color: ${MID_GREEN};
  }
`;

const InfoInput = styled.input`
  font-size: 0.85rem;
  color: ${TEXT};
  font-weight: 500;
  text-align: right;
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  padding: 6px 10px;
  width: 60%;
  font-family: 'Figtree', sans-serif;

  &:focus {
    outline: none;
    border-color: ${MID_GREEN};
  }

  &:disabled {
    background: ${BG};
    color: ${MUTED};
    cursor: not-allowed;
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 24px;
`;

const SaveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 12px;
  background: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: background 0.2s;

  &:hover {
    background: ${MID_GREEN};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  color: ${MUTED};
  border: 1.5px solid ${BORDER};
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
`;

const Conta = () => {
    const { user, logout, updateUser, viewMode, setViewMode } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useNotification();

    const [isEditing, setIsEditing] = useState(false);
    const [editNome, setEditNome] = useState('');
    const [editSobrenome, setEditSobrenome] = useState('');
    const [editTelefone, setEditTelefone] = useState('');
    const [editGenero, setEditGenero] = useState('');
    const [salvando, setSalvando] = useState(false);

    const initials = user
        ? `${user.nome?.[0] || ''}${user.sobrenome?.[0] || ''}`.toUpperCase()
        : 'U';

    const podeAlternarModo = user?.tipoUsuario === 'profissional';
    const tipoLabel = user?.tipoUsuario === 'profissional' && viewMode !== 'paciente' ? 'Profissional' : 'Paciente';

    const entrarComoProfissional = () => {
        setViewMode('profissional');
        navigate('/AdminDashboard');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleIniciarEdicao = () => {
        setEditNome(user?.nome || '');
        setEditSobrenome(user?.sobrenome || '');
        setEditTelefone(user?.telefone || '');
        setEditGenero(user?.genero || '');
        setIsEditing(true);
    };

    const handleCancelarEdicao = () => {
        setIsEditing(false);
    };

    const handleSalvarPerfil = async () => {
        if (!user?.id) {
            showError('Erro ao identificar usuário.');
            return;
        }
        setSalvando(true);
        try {
            await updatePerfil(user.id, {
                nome: editNome,
                sobrenome: editSobrenome,
                telefone: editTelefone,
                genero: editGenero || null,
            });
            updateUser({ nome: editNome, sobrenome: editSobrenome, telefone: editTelefone, genero: editGenero || null });
            success('Perfil atualizado com sucesso!');
            setIsEditing(false);
        } catch {
            showError('Erro ao atualizar perfil.');
        } finally {
            setSalvando(false);
        }
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
                                <InfoLabel>Nome</InfoLabel>
                                {isEditing ? (
                                    <InfoInput
                                        value={editNome}
                                        onChange={(e) => setEditNome(e.target.value)}
                                    />
                                ) : (
                                    <InfoValue>{user?.nome || '—'}</InfoValue>
                                )}
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Sobrenome</InfoLabel>
                                {isEditing ? (
                                    <InfoInput
                                        value={editSobrenome}
                                        onChange={(e) => setEditSobrenome(e.target.value)}
                                    />
                                ) : (
                                    <InfoValue>{user?.sobrenome || '—'}</InfoValue>
                                )}
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Email</InfoLabel>
                                <InfoValue>{user?.email || '—'}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Telefone</InfoLabel>
                                {isEditing ? (
                                    <InfoInput
                                        value={editTelefone}
                                        onChange={(e) => setEditTelefone(e.target.value)}
                                    />
                                ) : (
                                    <InfoValue>{user?.telefone || '—'}</InfoValue>
                                )}
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Gênero</InfoLabel>
                                {isEditing ? (
                                    <InfoSelect
                                        value={editGenero}
                                        onChange={(e) => setEditGenero(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {OPCOES_GENERO.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </InfoSelect>
                                ) : (
                                    <InfoValue>
                                        {OPCOES_GENERO.find((o) => o.value === user?.genero)?.label || '—'}
                                    </InfoValue>
                                )}
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Tipo de conta</InfoLabel>
                                {isEditing ? (
                                    <InfoInput value={tipoLabel} disabled />
                                ) : (
                                    <InfoValue>{tipoLabel}</InfoValue>
                                )}
                            </InfoRow>
                        </InfoList>

                        {isEditing ? (
                            <EditActions>
                                <CancelBtn onClick={handleCancelarEdicao} disabled={salvando}>
                                    <X size={14} />
                                    Cancelar
                                </CancelBtn>
                                <SaveBtn onClick={handleSalvarPerfil} disabled={salvando}>
                                    <Check size={14} />
                                    {salvando ? 'Salvando...' : 'Salvar'}
                                </SaveBtn>
                            </EditActions>
                        ) : (
                            <EditBtn onClick={handleIniciarEdicao}>
                                <Edit2 size={14} />
                                Editar perfil
                            </EditBtn>
                        )}
                    </Card>

                    <RightCol>
                        {podeAlternarModo ? (
                            <ProfCard>
                                <SparkleIcon>✳</SparkleIcon>
                                <ProfCardTitle>Modo profissional</ProfCardTitle>
                                <ProfCardDesc>
                                    Sua conta também tem acesso profissional. Volte para o dashboard — agenda, urgências e solicitações em um só lugar.
                                </ProfCardDesc>
                                <ProfBtn onClick={entrarComoProfissional}>
                                    <Users size={16} />
                                    Entrar como profissional
                                </ProfBtn>
                            </ProfCard>
                        ) : (
                            <ProfCard>
                                <SparkleIcon>✳</SparkleIcon>
                                <ProfCardTitle>Quer testar o lado profissional?</ProfCardTitle>
                                <ProfCardDesc>
                                    Veja como é o dashboard de profissionais — agenda, urgências e solicitações em um só lugar.
                                </ProfCardDesc>
                                <ProfBtn onClick={() => navigate('/Registrar?tipo=profissional')}>
                                    <Users size={16} />
                                    Entrar como profissional
                                </ProfBtn>
                            </ProfCard>
                        )}

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
