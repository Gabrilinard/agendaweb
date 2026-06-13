import axios from 'axios';
import {
  AlertTriangle,
  Brain,
  Building2,
  Ear,
  FileText,
  Heart,
  MessageCircle,
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

const Fonoaudiologia = ({ nomeProfissional, reservaIds, pendingReservas }) => {
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
    // geral
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

    // específico fonoaudiologia
    dificuldadeFala: '',
    trocaOmissao: '',
    dificuldadeCompreensao: '',
    suspeitaPerdaAuditiva: '',
    exameAuditivo: '',
    mastigarEngolir: '',
    respiraBoca: '',
    ehCrianca: '',
    idadeComecouFalar: '',
    linguagemAdequada: '',
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
            axios.post('http://localhost:3000/reservas', {
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
        tipoProfissional: 'fonoaudiologo',
        tipoAtendimento: 'fonoaudiologia',
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
          comunicacao: {
            dificuldadeFala: form.dificuldadeFala,
            trocaOmissao: form.trocaOmissao,
            dificuldadeCompreensao: form.dificuldadeCompreensao,
          },
          audicao: {
            suspeitaPerdaAuditiva: form.suspeitaPerdaAuditiva,
            exameAuditivo: form.exameAuditivo,
          },
          funcoesOrais: {
            mastigarEngolir: form.mastigarEngolir,
            respiraPelaBoca: form.respiraBoca,
          },
          crianca: {
            ehCrianca: form.ehCrianca,
            idadeComecouFalar: form.idadeComecouFalar,
            linguagemAdequada: form.linguagemAdequada,
          },
        },
        createdAt: new Date().toISOString(),
      };

      await axios.post('http://localhost:3000/formularios', {
        reservaIds: idsParaUsar,
        tipoFormulario: 'saude_geral',
        tipoAtendimento: 'fonoaudiologia',
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
        <SectionTitle><MessageCircle size={16} /> Comunicação e Fala</SectionTitle>
        <Grid>
          <Field>
            <Label>Dificuldade na fala?</Label>
            <Select value={form.dificuldadeFala} onChange={updateField('dificuldadeFala')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Troca ou omissão de letras?</Label>
            <Select value={form.trocaOmissao} onChange={updateField('trocaOmissao')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Dificuldade de compreensão?</Label>
            <Select value={form.dificuldadeCompreensao} onChange={updateField('dificuldadeCompreensao')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Ear size={16} /> Audição</SectionTitle>
        <Grid>
          <Field>
            <Label>Suspeita de perda auditiva?</Label>
            <Select value={form.suspeitaPerdaAuditiva} onChange={updateField('suspeitaPerdaAuditiva')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Já realizou exame auditivo?</Label>
            <Select value={form.exameAuditivo} onChange={updateField('exameAuditivo')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Stethoscope size={16} /> Funções Orais</SectionTitle>
        <Grid>
          <Field>
            <Label>Dificuldade para mastigar ou engolir?</Label>
            <Select value={form.mastigarEngolir} onChange={updateField('mastigarEngolir')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Respira pela boca?</Label>
            <Select value={form.respiraBoca} onChange={updateField('respiraBoca')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Brain size={16} /> Desenvolvimento (se criança)</SectionTitle>
        <Grid>
          <Field>
            <Label>É criança?</Label>
            <Select value={form.ehCrianca} onChange={updateField('ehCrianca')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Idade que começou a falar</Label>
            <Input
              value={form.idadeComecouFalar}
              onChange={updateField('idadeComecouFalar')}
              placeholder="Opcional"
              disabled={form.ehCrianca !== 'sim'}
            />
          </Field>
          <Field>
            <Label>Desenvolvimento da linguagem adequado?</Label>
            <Select
              value={form.linguagemAdequada}
              onChange={updateField('linguagemAdequada')}
              disabled={form.ehCrianca !== 'sim'}
            >
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

export default Fonoaudiologia;
