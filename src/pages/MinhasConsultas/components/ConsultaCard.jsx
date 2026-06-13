import { Calendar, Edit2, FileText, X } from 'lucide-react';
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
  const jaAvaliou = avaliacoesFeitas.has(c.id);
  const isAvaliando = avaliandoId === c.id;
  const valor = c.valorConsulta ? `· R$ ${Number(c.valorConsulta).toFixed(0)}` : '';

  return (
    <CardWrapper key={c.id}>
      <Card>
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
              <ActionBtn onClick={() => onVerFormulario(c)}>
                <FileText size={14} /> Formulário
              </ActionBtn>
              {!isRescheduled && (
                <ActionBtn onClick={() => onEditar(c)}>
                  <Edit2 size={14} /> Editar
                </ActionBtn>
              )}
              <ActionBtn $danger onClick={() => onCancelar(c.id)}>
                <X size={14} /> Cancelar
              </ActionBtn>
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
            Liberar abre seu horário para outro paciente ser atendido. Deseja confirmar?
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
              <ConfirmYes style={{ background: '#1C5C40' }} onClick={() => onAceitarRemarcacao(c)}>Confirmar</ConfirmYes>
            </ConfirmBtns>
          </RescheduleBar>
        ) : isActive && (
          <CardFooter>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={13} />
              Não vai poder ir?&nbsp;
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
