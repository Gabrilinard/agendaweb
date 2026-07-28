import { createFormulario, createReserva } from '../api';
import { AlertCircle, ClipboardList, Paperclip, Send, Smile } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import {
  Actions,
  AttachmentBox,
  AttachmentHint,
  Button,
  Field,
  Grid,
  Input,
  Label,
  SectionBlock,
  SectionTitle,
  Select,
  TextArea,
} from '../style';

const REQUIRED_FIELDS = [
  { key: 'motivoConsulta', label: 'o motivo da consulta' },
  { key: 'escovacaoFrequencia', label: 'a frequência de escovação diária' },
  { key: 'dor', label: 'se sente dor nos dentes ou gengiva' },
  { key: 'sangramento', label: 'se há sangramento gengival' },
  { key: 'sensibilidade', label: 'se há sensibilidade a frio ou quente' },
  { key: 'fioDental', label: 'se usa fio dental' },
  { key: 'ultimaConsulta', label: 'a data da última consulta ao dentista' },
  { key: 'tratamentoCanal', label: 'se já fez tratamento de canal' },
  { key: 'aparelhoOrto', label: 'se usa aparelho ortodôntico' },
  { key: 'bruxismo', label: 'se possui bruxismo' },
  { key: 'alergiaAnestesia', label: 'se possui alergia a anestesia' },
  { key: 'problemasCardiacos', label: 'se possui problemas cardíacos' },
  { key: 'anticoagulantes', label: 'se usa medicamentos anticoagulantes' },
];

const hoje = new Date();
const DATA_MIN = new Date(hoje.getFullYear() - 120, hoje.getMonth(), hoje.getDate()).toISOString().slice(0, 10);
const DATA_MAX = hoje.toISOString().slice(0, 10);

const Odontologia = ({ nomeProfissional, profissionalId, reservaIds, pendingReservas }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const reservaIdsNormalizados = useMemo(() => {
    if (Array.isArray(reservaIds)) return reservaIds.filter(Boolean);
    if (typeof reservaIds === 'number') return [reservaIds];
    return [];
  }, [reservaIds]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    motivoConsulta: '',
    dor: '',
    sangramento: '',
    sensibilidade: '',
    escovacaoFrequencia: '',
    fioDental: '',
    ultimaConsulta: '',
    tratamentoCanal: '',
    aparelhoOrto: '',
    bruxismo: '',
    alergiaAnestesia: '',
    alergiaAnestesiaDetalhe: '',
    problemasCardiacos: '',
    anticoagulantes: '',
    anticoagulantesDetalhe: '',
  });

  const [examesArquivo, setExamesArquivo] = useState(null);
  const fileInputRef = useRef();

  const updateField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setExamesArquivo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('Você precisa estar logado.');
      navigate('/Entrar');
      return;
    }

    for (const campo of REQUIRED_FIELDS) {
      if (!String(form[campo.key]).trim()) {
        showError(`Informe ${campo.label}.`);
        return;
      }
    }

    if (form.alergiaAnestesia === 'sim' && !form.alergiaAnestesiaDetalhe.trim()) {
      showError('Informe a qual anestesia tem alergia.');
      return;
    }

    if (form.anticoagulantes === 'sim' && !form.anticoagulantesDetalhe.trim()) {
      showError('Informe quais anticoagulantes utiliza.');
      return;
    }

    if (form.ultimaConsulta < DATA_MIN || form.ultimaConsulta > DATA_MAX) {
      showError('Informe uma data válida para a última consulta ao dentista (não pode ser no futuro nem excessivamente antiga).');
      return;
    }

    setIsSubmitting(true);
    try {
      let idsParaUsar = [...reservaIdsNormalizados];

      if (!idsParaUsar.length && pendingReservas?.length) {
        const criadas = await Promise.all(
          pendingReservas.map((r) =>
            createReserva({
              nome: user.nome, sobrenome: user.sobrenome,
              email: user.email, telefone: user.telefone || '',
              dia: r.dia, horario: r.horario, horarioFinal: r.horarioFinal,
              qntd_pessoa: 1, usuario_id: user.id,
              nomeProfissional: nomeProfissional || null,
              profissional_id: profissionalId || null,
              modalidade: r.modalidade, valor: r.valor,
            })
          )
        );
        idsParaUsar = criadas.map((r) => r.data?.id).filter(Boolean);
      }

      if (!idsParaUsar.length) {
        showError('Não foi possível identificar a reserva vinculada a este formulário.');
        return;
      }

      const payload = {
        profissional: nomeProfissional || null,
        tipoProfissional: 'dentista',
        reservaIds: idsParaUsar,
        paciente: {
          id: user.id, nome: user.nome, sobrenome: user.sobrenome,
          email: user.email, telefone: user.telefone,
        },
        odontologia: form,
        createdAt: new Date().toISOString(),
      };

      if (examesArquivo) {
        const formData = new FormData();
        formData.append('reservaIds', JSON.stringify(idsParaUsar));
        formData.append('tipoFormulario', 'dentista');
        formData.append('usuarioId', user.id);
        formData.append('conteudo', JSON.stringify(payload));
        formData.append('exame_anexo', examesArquivo);
        await createFormulario(formData);
      } else {
        await createFormulario({
          reservaIds: idsParaUsar,
          tipoFormulario: 'dentista',
          tipoAtendimento: null,
          usuarioId: user.id,
          conteudo: payload,
        });
      }

      success('Formulário odontológico enviado com sucesso!');
      navigate('/minhas-consultas');
    } catch (err) {
      console.error(err);
      showError('Erro ao enviar o formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <SectionBlock>
        <SectionTitle><Smile size={16} /> Saúde Bucal</SectionTitle>
        <Grid>
          <Field>
            <Label>Motivo da consulta</Label>
            <TextArea
              value={form.motivoConsulta}
              onChange={updateField('motivoConsulta')}
              placeholder="Dor, limpeza, estética, etc."
              required
            />
          </Field>
          <Field>
            <Label>Frequência de escovação diária</Label>
            <Select value={form.escovacaoFrequencia} onChange={updateField('escovacaoFrequencia')} required>
              <option value="">Selecione...</option>
              <option value="1x">1x ao dia</option>
              <option value="2x">2x ao dia</option>
              <option value="3x">3x ao dia</option>
              <option value="4x_ou_mais">4x ou mais</option>
            </Select>
          </Field>
          <Field>
            <Label>Sente dor nos dentes ou gengiva?</Label>
            <Select value={form.dor} onChange={updateField('dor')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Sangramento gengival?</Label>
            <Select value={form.sangramento} onChange={updateField('sangramento')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Sensibilidade (frio / quente)?</Label>
            <Select value={form.sensibilidade} onChange={updateField('sensibilidade')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Uso de fio dental</Label>
            <Select value={form.fioDental} onChange={updateField('fioDental')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><ClipboardList size={16} /> Histórico Odontológico</SectionTitle>
        <Grid>
          <Field>
            <Label>Última consulta ao dentista</Label>
            <Input
              type="date"
              value={form.ultimaConsulta}
              onChange={updateField('ultimaConsulta')}
              min={DATA_MIN}
              max={DATA_MAX}
              required
            />
          </Field>
          <Field>
            <Label>Já fez tratamento de canal?</Label>
            <Select value={form.tratamentoCanal} onChange={updateField('tratamentoCanal')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Uso de aparelho ortodôntico</Label>
            <Select value={form.aparelhoOrto} onChange={updateField('aparelhoOrto')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Bruxismo (ranger os dentes)</Label>
            <Select value={form.bruxismo} onChange={updateField('bruxismo')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><AlertCircle size={16} /> Informações Importantes</SectionTitle>
        <Grid>
          <Field>
            <Label>Alergia a anestesia?</Label>
            <Select value={form.alergiaAnestesia} onChange={updateField('alergiaAnestesia')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Se sim, qual?</Label>
            <Input
              value={form.alergiaAnestesiaDetalhe}
              onChange={updateField('alergiaAnestesiaDetalhe')}
              placeholder={form.alergiaAnestesia === 'sim' ? '' : 'Não se aplica'}
              disabled={form.alergiaAnestesia !== 'sim'}
              required={form.alergiaAnestesia === 'sim'}
            />
          </Field>
          <Field>
            <Label>Problemas cardíacos</Label>
            <Select value={form.problemasCardiacos} onChange={updateField('problemasCardiacos')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Uso de medicamentos anticoagulantes</Label>
            <Select value={form.anticoagulantes} onChange={updateField('anticoagulantes')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Quais anticoagulantes?</Label>
            <Input
              value={form.anticoagulantesDetalhe}
              onChange={updateField('anticoagulantesDetalhe')}
              placeholder={form.anticoagulantes === 'sim' ? '' : 'Não se aplica'}
              disabled={form.anticoagulantes !== 'sim'}
              required={form.anticoagulantes === 'sim'}
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Anexar exame recente (opcional)</Label>
            <AttachmentBox
              onClick={handleFileClick}
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Paperclip size={16} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
                {examesArquivo ? examesArquivo.name : 'Clique para anexar ou arraste um arquivo'}
              </div>
              <AttachmentHint>PNG, JPG ou PDF (opcional)</AttachmentHint>
            </AttachmentBox>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setExamesArquivo(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </Field>
        </Grid>
      </SectionBlock>

      <Actions>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            'Enviando...'
          ) : (
            <>
              <Send size={15} />
              Enviar Formulário
            </>
          )}
        </Button>
      </Actions>
    </form>
  );
};

export default Odontologia;
