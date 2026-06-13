import { useEffect, useState } from 'react';
import { getReservas, negarReserva, updateReserva } from './api';
import { formatarDataExibicao, formatarHorarioBrasil, parseDia } from '../../utils/formatters';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
    AcceptButton,
    Actions,
    AttachmentLink,
    Button,
    Container,
    Content,
    DenyButton,
    DescriptionBox,
    EditButton,
    EmptyState,
    InfoGroup,
    InfoLabel,
    InfoValue,
    ModalContent,
    ModalOverlay,
    Title,
    UrgenciaCard,
    UrgenciaList
} from './style';

const Urgencia = () => {
  const { user } = useAuth();
  const { success, error: showError, warning } = useNotification();
  const [urgencias, setUrgencias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyingId, setDenyingId] = useState(null);
  const [denyReason, setDenyReason] = useState('');

  useEffect(() => {
    fetchUrgencias();
  }, [user]);

  const fetchUrgencias = async () => {
    if (!user) return;

    try {
      const isProfissional = user.tipoUsuario === 'profissional';
      const params = isProfissional ? { profissional_id: user.id } : {};

      const response = await getReservas(params);
      const urgentRequests = response.data.filter(reserva =>
        reserva.is_urgente &&
        (reserva.status === 'pendente' || reserva.status === 'aguardando_confirmacao_paciente')
      );

      urgentRequests.sort((a, b) => {
        const dateA = parseDia(a.dia) || new Date(0);
        const dateB = parseDia(b.dia) || new Date(0);
        if (dateA - dateB !== 0) return dateA - dateB;
        return (a.horario || '').localeCompare(b.horario || '');
      });

      setUrgencias(urgentRequests);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar urgências:', error);
      showError('Erro ao carregar solicitações de urgência.');
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await updateReserva(id, { status: 'confirmado' });
      success('Solicitação de urgência aceita com sucesso!');
      fetchUrgencias();
    } catch (error) {
      console.error('Erro ao aceitar urgência:', error);
      showError('Erro ao aceitar solicitação.');
    }
  };

  const handleDenySubmit = async () => {
    if (!denyReason) {
      warning('Por favor, informe o motivo.');
      return;
    }

    try {
      await negarReserva(denyingId, { status: 'negado', motivoNegacao: denyReason });
      success('Solicitação negada com sucesso.');
      setShowDenyModal(false);
      setDenyReason('');
      setDenyingId(null);
      fetchUrgencias();
    } catch (error) {
      console.error('Erro ao negar urgência:', error);
      showError('Erro ao negar solicitação.');
    }
  };

  const openEditModal = (reserva) => {
    setEditingId(reserva.id);
    let dateStr = '';
    if (reserva.dia) {
        if (typeof reserva.dia === 'string') {
            dateStr = reserva.dia.split('T')[0];
        } else {
            dateStr = new Date(reserva.dia).toISOString().split('T')[0];
        }
    }
    setEditDate(dateStr);
    setEditTime(reserva.horario || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        const [horas, minutos] = editTime.split(':').map(Number);
        const horarioObj = new Date();
        horarioObj.setHours(horas, minutos, 0);
        horarioObj.setHours(horarioObj.getHours() + 1);
        const horarioFinal = horarioObj.toTimeString().slice(0, 5);

        await updateReserva(editingId, {
            dia: editDate,
            horario: editTime,
            horarioFinal: horarioFinal,
            status: 'aguardando_confirmacao_paciente'
        });

        success('Agendamento atualizado com sucesso!');
        setShowEditModal(false);
        fetchUrgencias();
    } catch (error) {
        console.error('Erro ao editar agendamento:', error);
        showError('Erro ao atualizar agendamento.');
    }
  };

  return (
    <Container>
      <Content>
        <Title>🚨 Solicitações de Urgência</Title>
        
        {loading ? (
          <p>Carregando...</p>
        ) : urgencias.length === 0 ? (
          <EmptyState>Nenhuma solicitação de urgência pendente.</EmptyState>
        ) : (
          <UrgenciaList>
            {urgencias.map(reserva => (
              <UrgenciaCard key={reserva.id}>
                <InfoGroup>
                  <InfoLabel>Paciente</InfoLabel>
                  <InfoValue>{reserva.nome} {reserva.sobrenome}</InfoValue>
                  <InfoLabel>Contato</InfoLabel>
                  <InfoValue>{reserva.telefone}</InfoValue>
                </InfoGroup>
                
                <InfoGroup>
                  <InfoLabel>Data Preferencial</InfoLabel>
                  <InfoValue>{formatarDataExibicao(reserva.dia)}</InfoValue>
                  <InfoLabel>Horário</InfoLabel>
                  <InfoValue>{formatarHorarioBrasil(reserva.horario)}</InfoValue>
                </InfoGroup>

                <InfoGroup style={{flex: 2}}>
                  <InfoLabel>Descrição da Urgência</InfoLabel>
                  <DescriptionBox>
                    {reserva.descricao_urgencia}
                  </DescriptionBox>
                  {reserva.arquivo_urgencia && (
                    <AttachmentLink href={`http://localhost:3000${reserva.arquivo_urgencia}`} target="_blank" rel="noopener noreferrer">
                      📎 Visualizar Anexo/Comprovante
                    </AttachmentLink>
                  )}
                </InfoGroup>

                <Actions>
                  <AcceptButton onClick={() => handleAccept(reserva.id)}>Aceitar</AcceptButton>
                  <EditButton onClick={() => openEditModal(reserva)}>Ajustar</EditButton>
                  <DenyButton onClick={() => {
                    setDenyingId(reserva.id);
                    setShowDenyModal(true);
                  }}>Negar</DenyButton>
                </Actions>
              </UrgenciaCard>
            ))}
          </UrgenciaList>
        )}
      </Content>
      <Footer />

      {showEditModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>Ajustar Horário/Data</h3>
            <form onSubmit={handleEditSubmit}>
                <div style={{marginBottom: '15px'}}>
                    <label style={{display: 'block', marginBottom: '5px'}}>Data:</label>
                    <input 
                        type="date" 
                        value={editDate} 
                        onChange={(e) => setEditDate(e.target.value)}
                        required
                        style={{width: '100%', padding: '8px'}}
                    />
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label style={{display: 'block', marginBottom: '5px'}}>Horário:</label>
                    <input 
                        type="time" 
                        value={editTime} 
                        onChange={(e) => setEditTime(e.target.value)}
                        required
                        style={{width: '100%', padding: '8px'}}
                    />
                </div>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                    <Button type="button" onClick={() => setShowEditModal(false)} style={{backgroundColor: '#999'}}>Cancelar</Button>
                    <Button type="submit" style={{backgroundColor: '#1976d2'}}>Salvar Ajuste</Button>
                </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      {showDenyModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>Negar Solicitação</h3>
            <p>Por favor, informe o motivo da negação:</p>
            <textarea 
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                style={{width: '100%', minHeight: '100px', padding: '10px', marginBottom: '15px'}}
                placeholder="Motivo..."
            />
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <Button onClick={() => setShowDenyModal(false)} style={{backgroundColor: '#999'}}>Cancelar</Button>
                <Button onClick={handleDenySubmit} style={{backgroundColor: '#c62828'}}>Confirmar Negação</Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Urgencia;
