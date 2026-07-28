import { createFormulario, createReserva } from '../api';
import {
  Activity,
  AlertTriangle,
  Brain,
  Building2,
  FileText,
  Heart,
  Paperclip,
  Pill,
  Send,
  Stethoscope,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import {
  Actions,
  AttachmentBox,
  AttachmentHint,
  Button,
  CheckboxGroup,
  CheckboxLabel,
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
  { key: 'motivoPrincipal', label: 'o principal motivo da consulta' },
  { key: 'sintomas', label: 'os sintomas que está sentindo' },
  { key: 'inicioSintomas', label: 'há quanto tempo os sintomas começaram' },
  { key: 'intensidade', label: 'a intensidade' },
  { key: 'doencaDiagnosticada', label: 'se possui alguma doença diagnosticada' },
  { key: 'cirurgias', label: 'se já realizou cirurgias' },
  { key: 'internacao', label: 'se já foi internado' },
  { key: 'historicoFamiliar', label: 'o histórico familiar de doenças' },
  { key: 'usaMedicamento', label: 'se usa algum medicamento atualmente' },
  { key: 'suplementos', label: 'se usa suplementos' },
  { key: 'alergiaMedicamento', label: 'se possui alergia a medicamentos' },
  { key: 'alimentacao', label: 'a alimentação' },
  { key: 'atividadeFisicaFrequencia', label: 'a frequência de atividade física' },
  { key: 'alcool', label: 'o consumo de álcool' },
  { key: 'fuma', label: 'se fuma' },
  { key: 'sono', label: 'a qualidade do sono' },
  { key: 'estresse', label: 'o nível de estresse' },
  { key: 'ansiedadeDepressao', label: 'se possui ansiedade ou depressão diagnosticada' },
  { key: 'acompanhamentoPsicologico', label: 'se faz acompanhamento psicológico' },
  { key: 'queixaPrincipal', label: 'a queixa principal' },
  { key: 'localDor', label: 'o local da dor ou limitação' },
  { key: 'senteDor', label: 'se sente dor' },
  { key: 'nivelDor', label: 'o nível da dor' },
  { key: 'pioraMovimento', label: 'se a dor piora com movimento' },
  { key: 'dificuldadeAtividades', label: 'se tem dificuldade para atividades do dia a dia' },
  { key: 'lesoesTraumas', label: 'se já sofreu lesões ou traumas' },
  { key: 'fezFisioAntes', label: 'se já fez fisioterapia antes' },
  { key: 'diagnostico', label: 'o diagnóstico' },
  { key: 'observacoes', label: 'as observações' },
];

const Fisioterapia = ({ nomeProfissional, profissionalId, reservaIds, pendingReservas }) => {
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
    motivoPrincipal: '',
    sintomas: '',
    inicioSintomas: '',
    intensidade: '',

    doencaDiagnosticada: '',
    doencaQual: '',
    cirurgias: '',
    internacao: '',
    historicoFamiliar: '',

    usaMedicamento: '',
    medicamentosDetalhe: '',
    suplementos: '',
    alergiaMedicamento: '',
    alergiaMedicamentoDetalhe: '',

    alimentacao: '',
    atividadeFisicaFrequencia: '',
    alcool: '',
    fuma: '',
    sono: '',

    estresse: '',
    ansiedadeDepressao: '',
    acompanhamentoPsicologico: '',

    outrosSintomas: {
      febre: false,
      tontura: false,
      faltaDeAr: false,
      nausea: false,
      dorPersistente: false,
    },

    observacoes: '',

    queixaPrincipal: '',
    localDor: '',
    senteDor: '',
    nivelDor: '',
    pioraMovimento: '',
    dificuldadeAtividades: '',
    lesoesTraumas: '',
    fezFisioAntes: '',
    diagnostico: '',
  });

  const [examesArquivo, setExamesArquivo] = useState(null);
  const fileInputRef = useRef();

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const updateOutrosSintomas = (key) => (e) => {
    const checked = Boolean(e.target.checked);
    setForm((prev) => ({
      ...prev,
      outrosSintomas: { ...prev.outrosSintomas, [key]: checked },
    }));
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

    if (form.doencaDiagnosticada === 'sim' && !form.doencaQual.trim()) {
      showError('Informe qual doença foi diagnosticada.');
      return;
    }

    if (form.usaMedicamento === 'sim' && !form.medicamentosDetalhe.trim()) {
      showError('Informe quais medicamentos utiliza e as dosagens.');
      return;
    }

    if (form.alergiaMedicamento === 'sim' && !form.alergiaMedicamentoDetalhe.trim()) {
      showError('Informe a qual medicamento tem alergia.');
      return;
    }

    const nivelDorNum = Number(form.nivelDor);
    if (!Number.isInteger(nivelDorNum) || nivelDorNum < 0 || nivelDorNum > 10) {
      showError('O nível da dor deve ser um número inteiro entre 0 e 10.');
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
        tipoProfissional: 'fisioterapeuta',
        tipoAtendimento: 'fisioterapia',
        reservaIds: idsParaUsar,
        paciente: {
          id: user.id, nome: user.nome, sobrenome: user.sobrenome,
          email: user.email, telefone: user.telefone,
        },
        geral: {
          motivoPrincipal: form.motivoPrincipal,
          sintomas: form.sintomas,
          inicioSintomas: form.inicioSintomas,
          intensidade: form.intensidade,
          historicoSaude: {
            doencaDiagnosticada: form.doencaDiagnosticada,
            doencaQual: form.doencaQual,
            cirurgias: form.cirurgias,
            internacao: form.internacao,
            historicoFamiliar: form.historicoFamiliar,
          },
          medicamentosAlergias: {
            usaMedicamento: form.usaMedicamento,
            medicamentosDetalhe: form.medicamentosDetalhe,
            suplementos: form.suplementos,
            alergiaMedicamento: form.alergiaMedicamento,
            alergiaMedicamentoDetalhe: form.alergiaMedicamentoDetalhe,
          },
          habitosVida: {
            alimentacao: form.alimentacao,
            atividadeFisicaFrequencia: form.atividadeFisicaFrequencia,
            alcool: form.alcool,
            fuma: form.fuma,
            sono: form.sono,
          },
          saudeEmocional: {
            estresse: form.estresse,
            ansiedadeDepressao: form.ansiedadeDepressao,
            acompanhamentoPsicologico: form.acompanhamentoPsicologico,
          },
          outrosSintomas: form.outrosSintomas,
          observacoes: form.observacoes,
        },
        especifico: {
          queixaPrincipal: form.queixaPrincipal,
          localDorOuLimitacao: form.localDor,
          senteDor: form.senteDor,
          nivelDor: form.nivelDor,
          pioraComMovimento: form.pioraMovimento,
          dificuldadeAtividadesDia: form.dificuldadeAtividades,
          lesoesTraumas: form.lesoesTraumas,
          fezFisioAntes: form.fezFisioAntes,
          diagnostico: form.diagnostico,
        },
        createdAt: new Date().toISOString(),
      };

      if (examesArquivo) {
        const formData = new FormData();
        formData.append('reservaIds', JSON.stringify(idsParaUsar));
        formData.append('tipoFormulario', 'saude_geral');
        formData.append('tipoAtendimento', 'fisioterapia');
        formData.append('usuarioId', user.id);
        formData.append('conteudo', JSON.stringify(payload));
        formData.append('exame_anexo', examesArquivo);
        await createFormulario(formData);
      } else {
        await createFormulario({
          reservaIds: idsParaUsar,
          tipoFormulario: 'saude_geral',
          tipoAtendimento: 'fisioterapia',
          usuarioId: user.id,
          conteudo: payload,
        });
      }

      success('Formulário enviado com sucesso!');
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
        <SectionTitle><Stethoscope size={16} /> Motivo da Consulta</SectionTitle>
        <Grid>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Qual o principal motivo da consulta?</Label>
            <TextArea value={form.motivoPrincipal} onChange={updateField('motivoPrincipal')} required />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Quais sintomas você está sentindo?</Label>
            <TextArea value={form.sintomas} onChange={updateField('sintomas')} required />
          </Field>
          <Field>
            <Label>Há quanto tempo os sintomas começaram?</Label>
            <Input
              value={form.inicioSintomas}
              onChange={updateField('inicioSintomas')}
              placeholder="Ex: 2 dias, 1 semana, 3 meses"
              required
            />
          </Field>
          <Field>
            <Label>Intensidade</Label>
            <Select value={form.intensidade} onChange={updateField('intensidade')} required>
              <option value="">Selecione...</option>
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="grave">Grave</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Building2 size={16} /> Histórico de Saúde</SectionTitle>
        <Grid>
          <Field>
            <Label>Possui alguma doença diagnosticada?</Label>
            <Select value={form.doencaDiagnosticada} onChange={updateField('doencaDiagnosticada')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Qual?</Label>
            <Input
              value={form.doencaQual}
              onChange={updateField('doencaQual')}
              placeholder={form.doencaDiagnosticada === 'sim' ? '' : 'Não se aplica'}
              disabled={form.doencaDiagnosticada !== 'sim'}
              required={form.doencaDiagnosticada === 'sim'}
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Já realizou cirurgias? Quais?</Label>
            <TextArea value={form.cirurgias} onChange={updateField('cirurgias')} required />
          </Field>
          <Field>
            <Label>Já foi internado?</Label>
            <Select value={form.internacao} onChange={updateField('internacao')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Histórico familiar de doenças importantes</Label>
            <TextArea value={form.historicoFamiliar} onChange={updateField('historicoFamiliar')} required />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Pill size={16} /> Medicamentos e Alergias</SectionTitle>
        <Grid>
          <Field>
            <Label>Usa algum medicamento atualmente?</Label>
            <Select value={form.usaMedicamento} onChange={updateField('usaMedicamento')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Quais e dosagens (se souber)</Label>
            <Input
              value={form.medicamentosDetalhe}
              onChange={updateField('medicamentosDetalhe')}
              placeholder={form.usaMedicamento === 'sim' ? '' : 'Não se aplica'}
              disabled={form.usaMedicamento !== 'sim'}
              required={form.usaMedicamento === 'sim'}
            />
          </Field>
          <Field>
            <Label>Usa suplementos?</Label>
            <Input value={form.suplementos} onChange={updateField('suplementos')} required />
          </Field>
          <Field>
            <Label>Possui alergia a medicamentos?</Label>
            <Select value={form.alergiaMedicamento} onChange={updateField('alergiaMedicamento')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Se sim, qual?</Label>
            <Input
              value={form.alergiaMedicamentoDetalhe}
              onChange={updateField('alergiaMedicamentoDetalhe')}
              placeholder={form.alergiaMedicamento === 'sim' ? '' : 'Não se aplica'}
              disabled={form.alergiaMedicamento !== 'sim'}
              required={form.alergiaMedicamento === 'sim'}
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Heart size={16} /> Hábitos de Vida</SectionTitle>
        <Grid>
          <Field>
            <Label>Alimentação</Label>
            <Select value={form.alimentacao} onChange={updateField('alimentacao')} required>
              <option value="">Selecione...</option>
              <option value="boa">Boa</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim</option>
            </Select>
          </Field>
          <Field>
            <Label>Atividade física — frequência semanal</Label>
            <Input
              value={form.atividadeFisicaFrequencia}
              onChange={updateField('atividadeFisicaFrequencia')}
              placeholder="Ex: 3x por semana"
              required
            />
          </Field>
          <Field>
            <Label>Consumo de álcool</Label>
            <Select value={form.alcool} onChange={updateField('alcool')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Fuma</Label>
            <Select value={form.fuma} onChange={updateField('fuma')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Qualidade do sono</Label>
            <Select value={form.sono} onChange={updateField('sono')} required>
              <option value="">Selecione...</option>
              <option value="boa">Boa</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Brain size={16} /> Saúde Emocional</SectionTitle>
        <Grid>
          <Field>
            <Label>Nível de estresse</Label>
            <Select value={form.estresse} onChange={updateField('estresse')} required>
              <option value="">Selecione...</option>
              <option value="baixo">Baixo</option>
              <option value="medio">Médio</option>
              <option value="alto">Alto</option>
            </Select>
          </Field>
          <Field>
            <Label>Ansiedade ou depressão diagnosticada?</Label>
            <Select value={form.ansiedadeDepressao} onChange={updateField('ansiedadeDepressao')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Faz acompanhamento psicológico?</Label>
            <Select value={form.acompanhamentoPsicologico} onChange={updateField('acompanhamentoPsicologico')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Activity size={16} /> Informações de Fisioterapia</SectionTitle>
        <Grid>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Queixa principal</Label>
            <TextArea value={form.queixaPrincipal} onChange={updateField('queixaPrincipal')} required />
          </Field>
          <Field>
            <Label>Local da dor ou limitação</Label>
            <Input
              value={form.localDor}
              onChange={updateField('localDor')}
              placeholder="Coluna, joelho, ombro..."
              required
            />
          </Field>
          <Field>
            <Label>Sente dor?</Label>
            <Select value={form.senteDor} onChange={updateField('senteDor')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Nível da dor (0 a 10)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              value={form.nivelDor}
              onChange={updateField('nivelDor')}
              placeholder="0–10"
              required
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>A dor piora com movimento?</Label>
            <Input value={form.pioraMovimento} onChange={updateField('pioraMovimento')} required />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Tem dificuldade para realizar atividades do dia a dia?</Label>
            <TextArea value={form.dificuldadeAtividades} onChange={updateField('dificuldadeAtividades')} required />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Já sofreu lesões ou traumas?</Label>
            <TextArea value={form.lesoesTraumas} onChange={updateField('lesoesTraumas')} required />
          </Field>
          <Field>
            <Label>Já fez fisioterapia antes?</Label>
            <Select value={form.fezFisioAntes} onChange={updateField('fezFisioAntes')} required>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Possui diagnóstico?</Label>
            <Input
              value={form.diagnostico}
              onChange={updateField('diagnostico')}
              placeholder="Hérnia de disco, tendinite..."
              required
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><AlertTriangle size={16} /> Outros Sintomas</SectionTitle>
        <CheckboxGroup>
          <CheckboxLabel>
            <input type="checkbox" checked={form.outrosSintomas.febre} onChange={updateOutrosSintomas('febre')} />
            Febre
          </CheckboxLabel>
          <CheckboxLabel>
            <input type="checkbox" checked={form.outrosSintomas.tontura} onChange={updateOutrosSintomas('tontura')} />
            Tontura
          </CheckboxLabel>
          <CheckboxLabel>
            <input type="checkbox" checked={form.outrosSintomas.faltaDeAr} onChange={updateOutrosSintomas('faltaDeAr')} />
            Falta de ar
          </CheckboxLabel>
          <CheckboxLabel>
            <input type="checkbox" checked={form.outrosSintomas.nausea} onChange={updateOutrosSintomas('nausea')} />
            Náusea
          </CheckboxLabel>
          <CheckboxLabel>
            <input type="checkbox" checked={form.outrosSintomas.dorPersistente} onChange={updateOutrosSintomas('dorPersistente')} />
            Dor persistente
          </CheckboxLabel>
        </CheckboxGroup>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><FileText size={16} /> Observações</SectionTitle>
        <Field>
          <Label>Informações adicionais</Label>
          <TextArea value={form.observacoes} onChange={updateField('observacoes')} required />
        </Field>
        <Field style={{ marginTop: 12 }}>
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

export default Fisioterapia;
