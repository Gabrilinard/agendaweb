import { createFormulario, createReserva } from '../api';
import {
  AlertTriangle,
  Brain,
  Building2,
  FileText,
  Heart,
  Pill,
  Send,
  Stethoscope,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import {
  Actions,
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

const SaudeGeral = ({ nomeProfissional, reservaIds, pendingReservas }) => {
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

    medicoProblemaAntes: '',
    medicoAcompanhamentoOutro: '',
    medicoExamesRecentes: '',
    medicoDoencasCronicas: '',
    medicoVacinacaoEmDia: '',

    outrosSintomas: {
      febre: false,
      tontura: false,
      faltaDeAr: false,
      nausea: false,
      dorPersistente: false,
    },

    observacoes: '',
  });

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const updateOutrosSintomas = (key) => (e) => {
    const checked = Boolean(e.target.checked);
    setForm((prev) => ({
      ...prev,
      outrosSintomas: { ...prev.outrosSintomas, [key]: checked },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('Você precisa estar logado.');
      navigate('/Entrar');
      return;
    }

    if (!form.motivoPrincipal.trim()) {
      showError('Informe o principal motivo da consulta.');
      return;
    }

    if (!form.inicioSintomas.trim()) {
      showError('Informe há quanto tempo os sintomas começaram.');
      return;
    }

    if (!form.intensidade) {
      showError('Selecione a intensidade.');
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
        tipoProfissional: 'medico',
        tipoAtendimento: 'medico',
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
          jaPassouAntes: form.medicoProblemaAntes,
          acompanhamentoOutroMedico: form.medicoAcompanhamentoOutro,
          examesRecentes: form.medicoExamesRecentes,
          doencasCronicas: form.medicoDoencasCronicas,
          vacinacaoEmDia: form.medicoVacinacaoEmDia,
        },
        createdAt: new Date().toISOString(),
      };

      await createFormulario({
        reservaIds: idsParaUsar,
        tipoFormulario: 'saude_geral',
        tipoAtendimento: 'medico',
        usuarioId: user.id,
        conteudo: payload,
      });

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
            <TextArea value={form.sintomas} onChange={updateField('sintomas')} />
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
            <Select value={form.doencaDiagnosticada} onChange={updateField('doencaDiagnosticada')}>
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
              placeholder="Opcional"
              disabled={form.doencaDiagnosticada !== 'sim'}
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Já realizou cirurgias? Quais?</Label>
            <TextArea value={form.cirurgias} onChange={updateField('cirurgias')} placeholder="Opcional" />
          </Field>
          <Field>
            <Label>Já foi internado?</Label>
            <Select value={form.internacao} onChange={updateField('internacao')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Histórico familiar de doenças importantes</Label>
            <TextArea value={form.historicoFamiliar} onChange={updateField('historicoFamiliar')} placeholder="Opcional" />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Pill size={16} /> Medicamentos e Alergias</SectionTitle>
        <Grid>
          <Field>
            <Label>Usa algum medicamento atualmente?</Label>
            <Select value={form.usaMedicamento} onChange={updateField('usaMedicamento')}>
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
              placeholder="Opcional"
              disabled={form.usaMedicamento !== 'sim'}
            />
          </Field>
          <Field>
            <Label>Usa suplementos?</Label>
            <Input value={form.suplementos} onChange={updateField('suplementos')} placeholder="Opcional" />
          </Field>
          <Field>
            <Label>Possui alergia a medicamentos?</Label>
            <Select value={form.alergiaMedicamento} onChange={updateField('alergiaMedicamento')}>
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
              placeholder="Opcional"
              disabled={form.alergiaMedicamento !== 'sim'}
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Heart size={16} /> Hábitos de Vida</SectionTitle>
        <Grid>
          <Field>
            <Label>Alimentação</Label>
            <Select value={form.alimentacao} onChange={updateField('alimentacao')}>
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
            />
          </Field>
          <Field>
            <Label>Consumo de álcool</Label>
            <Select value={form.alcool} onChange={updateField('alcool')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Fuma</Label>
            <Select value={form.fuma} onChange={updateField('fuma')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Qualidade do sono</Label>
            <Select value={form.sono} onChange={updateField('sono')}>
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
            <Select value={form.estresse} onChange={updateField('estresse')}>
              <option value="">Selecione...</option>
              <option value="baixo">Baixo</option>
              <option value="medio">Médio</option>
              <option value="alto">Alto</option>
            </Select>
          </Field>
          <Field>
            <Label>Ansiedade ou depressão diagnosticada?</Label>
            <Select value={form.ansiedadeDepressao} onChange={updateField('ansiedadeDepressao')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Faz acompanhamento psicológico?</Label>
            <Select value={form.acompanhamentoPsicologico} onChange={updateField('acompanhamentoPsicologico')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Stethoscope size={16} /> Informações Médicas</SectionTitle>
        <Grid>
          <Field>
            <Label>Já passou por esse problema antes?</Label>
            <Select value={form.medicoProblemaAntes} onChange={updateField('medicoProblemaAntes')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Está em acompanhamento com outro médico?</Label>
            <Select value={form.medicoAcompanhamentoOutro} onChange={updateField('medicoAcompanhamentoOutro')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Possui exames recentes?</Label>
            <Select value={form.medicoExamesRecentes} onChange={updateField('medicoExamesRecentes')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Histórico de doenças crônicas</Label>
            <TextArea
              value={form.medicoDoencasCronicas}
              onChange={updateField('medicoDoencasCronicas')}
              placeholder="Diabetes, hipertensão, etc. (opcional)"
            />
          </Field>
          <Field>
            <Label>Vacinação em dia?</Label>
            <Select value={form.medicoVacinacaoEmDia} onChange={updateField('medicoVacinacaoEmDia')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
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
          <TextArea value={form.observacoes} onChange={updateField('observacoes')} placeholder="Opcional" />
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

export default SaudeGeral;
