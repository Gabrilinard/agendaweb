import { Calendar, Edit2, FileText, Wallet, X } from 'lucide-react';
import { getAvatarColor, getInitials } from '../../../utils/avatar';
import { parseDia } from '../../../utils/formatters';
import {
  ActionBtn,
  ActionsRow,
  BadgesRow,
  BORDER,
  CardDivider,
  CardFooter,
  CardInfoArea,
  CardMain,
  CardWrapper,
  ConfirmBar,
  ConfirmBtns,
  ConfirmNo,
  ConfirmYes,
  ConsultaCard as Card,
  DARK_GREEN,
  DateBox,
  DateDay,
  DateMonth,
  DateTime,
  LibeLink,
  ModalityBadge,
  MONTH_SHORT,
  MUTED,
  PaymentNote,
  ProfAvatar,
  ProfInfo,
  ProfName,
  ProfRow,
  ProfSpec,
  RescheduleBar,
  StatusBadge,
  TEXT,
} from '../styles';
import { statusStyle } from '../utils';

const NOTA_LABELS = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

const AvaliacaoForm = ({ consulta, nota, setNota, comentario, setComentario, enviando, onEnviar, onCancelar }) => (
  <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px 24px', background: '#FAFAF8', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: TEXT }}>
      Avaliar consulta com {consulta.nomeOutro}
    </span>
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => setNota(n)}
          style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: n <= nota ? '#F59E0B' : '#D1D5DB', lineHeight: 1, padding: '2px' }}
        >
          ★
        </button>
      ))}
      {nota > 0 && (
        <span style={{ alignSelf: 'center', fontSize: '0.82rem', color: MUTED, marginLeft: 4 }}>
          {NOTA_LABELS[nota]}
        </span>
      )}
    </div>
    <textarea
      placeholder="Deixe um comentário (opcional)..."
      value={comentario}
      onChange={e => setComentario(e.target.value)}
      rows={3}
      style={{ width: '100%', padding: '10px', border: `1.5px solid ${BORDER}`, borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'Figtree, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
    />
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <ConfirmNo onClick={onCancelar}>Cancelar</ConfirmNo>
      <ConfirmYes
        style={{ background: DARK_GREEN, opacity: enviando ? 0.6 : 1 }}
        onClick={onEnviar}
        disabled={enviando}
      >
        {enviando ? 'Enviando...' : 'Enviar avaliação'}
      </ConfirmYes>
    </div>
  </div>
);

const ConsultaCard = ({
  c,
  today,
  isPaciente,
  confirmingId,
  setConfirmingId,
  liberandoId,
  setLiberandoId,
  avaliandoId,
  setAvaliandoId,
  notaAvaliacao,
  setNotaAvaliacao,
  comentarioAvaliacao,
  setComentarioAvaliacao,
  enviandoAvaliacao,
  avaliacoesFeitas,
  onVerFormulario,
  onEditar,
  onCancelar,
  onConfirmarCancelamento,
  onLiberarHorario,
  onConfirmarLiberacao,
  onAceitarRemarcacao,
  onRecusarRemarcacao,
  onConfirmarPresenca,
  onEnviarAvaliacao,
}) => {
  const dia = parseDia(c.dia);
  const { bg, color, label } = statusStyle(c.status);
  const av = getAvatarColor(c.nomeOutro || '');
  const initials = getInitials(c.nomeOutro || '');

  const isActive = c.status === 'pendente' || c.status === 'confirmado' || c.status === 'aguardando_confirmacao_paciente';
  const isRescheduled = c.status === 'aguardando_confirmacao_paciente';
  const isUrgente = Number(c.is_urgente) === 1;
  const isPast = c.status === 'confirmado' && dia && dia < today;

  const dataHoraConsulta = (() => {
    if (!dia || !c.horario) return null;
    const [h, m] = String(c.horario).split(':').map(Number);
    const dt = new Date(dia);
    dt.setHours(h || 0, m || 0, 0, 0);
    return dt;
  })();
  const faltaMenosDe48h = !!dataHoraConsulta && (dataHoraConsulta.getTime() - Date.now()) < 48 * 60 * 60 * 1000;
  const presencaConfirmada = Number(c.presenca_confirmada) === 1;
  const precisaConfirmarPresenca = c.status === 'confirmado' && faltaMenosDe48h && !isPast && !presencaConfirmada;
  const jaAvaliou = avaliacoesFeitas.has(c.id);
  const isAvaliando = avaliandoId === c.id;
  const valor = c.valorConsulta ? `· R$ ${Number(c.valorConsulta).toFixed(0)}` : '';

  return (
    <CardWrapper key={c.id}>
      <Card>
        <PaymentNote title="O pagamento desta consulta é feito presencialmente, no momento do atendimento.">
          <Wallet size={11} /> Pagamento na hora
        </PaymentNote>
        <CardMain>
          <DateBox>
            <DateMonth>{dia ? MONTH_SHORT[dia.getMonth()] : '—'}</DateMonth>
            <DateDay>{dia ? dia.getDate() : '—'}</DateDay>
            <DateTime>{c.horario || ''}</DateTime>
          </DateBox>

          <CardDivider />

          <CardInfoArea>
            <BadgesRow>
              <StatusBadge $bg={bg} $color={color}>{label}</StatusBadge>
              {isUrgente && <StatusBadge $bg="#FFF0E6" $color="#C2410C">⚡ Emergente</StatusBadge>}
              {presencaConfirmada && <StatusBadge $bg="#D1FAE5" $color="#065F46">✓ Presença confirmada</StatusBadge>}
              <ModalityBadge>Online</ModalityBadge>
            </BadgesRow>
            <ProfRow>
              <ProfAvatar $bg={av.bg} $color={av.color}>{initials}</ProfAvatar>
              <ProfInfo>
                <ProfName>{c.nomeOutro || '—'}</ProfName>
                <ProfSpec>{c.especialidade || ''}{valor}</ProfSpec>
              </ProfInfo>
            </ProfRow>
          </CardInfoArea>

          {isActive && (
            <ActionsRow>
              {!isPast && (
                <ActionBtn onClick={() => onVerFormulario(c)}>
                  <FileText size={14} /> Formulário
                </ActionBtn>
              )}
              {!isRescheduled && !isPast && !faltaMenosDe48h && (
                <ActionBtn onClick={() => onEditar(c)}>
                  <Edit2 size={14} /> Editar
                </ActionBtn>
              )}
              {!faltaMenosDe48h && (
                <ActionBtn $danger onClick={() => onCancelar(c.id)}>
                  <X size={14} /> Cancelar
                </ActionBtn>
              )}
            </ActionsRow>
          )}
        </CardMain>

        {isActive && confirmingId === c.id ? (
          <ConfirmBar>
            Tem certeza que deseja cancelar esta consulta?
            <ConfirmBtns>
              <ConfirmNo onClick={() => setConfirmingId(null)}>Voltar</ConfirmNo>
              <ConfirmYes onClick={onConfirmarCancelamento}>Sim, cancelar</ConfirmYes>
            </ConfirmBtns>
          </ConfirmBar>
        ) : isActive && liberandoId === c.id ? (
          <ConfirmBar style={{ background: '#FFF7F0', borderColor: '#FED7B0' }}>
            <span style={{ flex: '1 1 auto', minWidth: 0 }}>
              Esse horário será liberado para que outro paciente possa ocupá-lo. Em seguida, você será redirecionado para marcar uma nova consulta ou editar esta para outro horário. Deseja confirmar?
            </span>
            <ConfirmBtns>
              <ConfirmNo onClick={() => setLiberandoId(null)}>Voltar</ConfirmNo>
              <ConfirmYes style={{ background: '#E8611A' }} onClick={onConfirmarLiberacao}>Sim, liberar</ConfirmYes>
            </ConfirmBtns>
          </ConfirmBar>
        ) : isRescheduled ? (
          <RescheduleBar>
            <span style={{ flex: 1 }}>O profissional propôs este novo horário. Deseja confirmar?</span>
            <ConfirmBtns>
              <ConfirmNo onClick={() => onRecusarRemarcacao(c)}>Recusar</ConfirmNo>
              <ConfirmNo onClick={() => onEditar(c)}>Sugerir outro horário</ConfirmNo>
              <ConfirmYes style={{ background: '#1C5C40' }} onClick={() => onAceitarRemarcacao(c)}>Confirmar</ConfirmYes>
            </ConfirmBtns>
          </RescheduleBar>
        ) : precisaConfirmarPresenca ? (
          <RescheduleBar style={{ background: '#EFF6FF', borderColor: '#BFDBFE', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 auto', minWidth: 0 }}>
                Sua consulta é em menos de 48h. Confirma presença? Se não confirmar até 15h antes do horário, ele será liberado automaticamente para outro paciente.
              </span>
              <ConfirmBtns>
                <ConfirmNo onClick={() => onLiberarHorario(c.id)}>Não posso, liberar horário</ConfirmNo>
                <ConfirmYes style={{ background: '#1C5C40' }} onClick={() => onConfirmarPresenca(c)}>Confirmar presença</ConfirmYes>
              </ConfirmBtns>
            </div>
            <span style={{ fontSize: '0.78rem', color: MUTED }}>
              Atenção: faltar a uma consulta já confirmada pela 2ª vez bloqueia novos agendamentos por 60 dias.
            </span>
          </RescheduleBar>
        ) : isActive && (
          <CardFooter>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={13} />
              {faltaMenosDe48h
                ? 'Faltam menos de 48h — não é mais possível cancelar, mas você pode '
                : 'Não vai poder ir? '}
              <LibeLink onClick={() => onLiberarHorario(c.id)}>Liberar horário</LibeLink>
              &nbsp;— outro paciente pode aproveitá-lo.
            </span>
          </CardFooter>
        )}

        {isPast && isPaciente && !isAvaliando && (
          <CardFooter style={{ justifyContent: 'space-between', background: jaAvaliou ? '#F0FDF4' : '#FAFAF8' }}>
            {jaAvaliou ? (
              <span style={{ color: '#1A5C3C', fontWeight: 600 }}>✓ Você já avaliou esta consulta</span>
            ) : (
              <>
                <span>Como foi sua consulta com <strong>{c.nomeOutro}</strong>?</span>
                <LibeLink onClick={() => { setAvaliandoId(c.id); setNotaAvaliacao(0); setComentarioAvaliacao(''); }}>
                  Avaliar agora
                </LibeLink>
              </>
            )}
          </CardFooter>
        )}

        {isAvaliando && (
          <AvaliacaoForm
            consulta={c}
            nota={notaAvaliacao}
            setNota={setNotaAvaliacao}
            comentario={comentarioAvaliacao}
            setComentario={setComentarioAvaliacao}
            enviando={enviandoAvaliacao}
            onEnviar={() => onEnviarAvaliacao(c)}
            onCancelar={() => setAvaliandoId(null)}
          />
        )}
      </Card>
    </CardWrapper>
  );
};

export default ConsultaCard;
