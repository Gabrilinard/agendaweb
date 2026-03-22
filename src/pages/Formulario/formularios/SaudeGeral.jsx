import axios from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import {
  Actions,
  Button,
  Field,
  Grid,
  Input,
  Label,
  SectionTitle,
  Select,
  TextArea
} from '../style';

const normalizarTexto = (value) => (
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
);

const normalizarTipoProfissional = (value) => {
  const base = normalizarTexto(value);

  const pluralMap = {
    medicos: 'medico',
    fisioterapeutas: 'fisioterapeuta',
    fonoaudiologos: 'fonoaudiologo'
  };

  const possivelTipo = pluralMap[base] || base;

  const especialidadesMedicas = [
    'Clínico Geral',
    'Oftalmologista',
    'Cardiologista',
    'Dermatologista',
    'Pediatra',
    'Ginecologista',
    'Ortopedista',
    'Neurologista',
    'Psiquiatra',
    'Endocrinologista',
    'Gastroenterologista',
    'Urologista',
    'Otorrinolaringologista',
    'Pneumologista',
    'Reumatologista',
    'Oncologista',
    'Hematologista',
    'Nefrologista',
    'Anestesiologista',
    'Radiologista',
    'Patologista',
    'Medicina do Trabalho',
    'Medicina Esportiva',
    'Geriatra',
    'Mastologista',
    'Proctologista',
    'Angiologista',
    'Cirurgião Geral',
    'Cirurgião Plástico',
    'Cirurgião Cardiovascular',
    'Neurocirurgião',
    'Cirurgião Pediátrico'
  ];

  const especialidadesSet = new Set(especialidadesMedicas.map(normalizarTexto));
  if (especialidadesSet.has(possivelTipo)) return 'medico';

  return possivelTipo;
};

const mapTipoAtendimento = (tipoProfissional) => {
  const tipo = normalizarTipoProfissional(tipoProfissional);
  if (tipo === 'medico') return 'medico';
  if (tipo === 'fisioterapeuta') return 'fisioterapia';
  if (tipo === 'fonoaudiologo') return 'fonoaudiologia';
  return '';
};

const SaudeGeral = ({ nomeProfissional, tipoProfissional, reservaIds }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const reservaIdsNormalizados = useMemo(() => {
    if (Array.isArray(reservaIds)) return reservaIds.filter(Boolean);
    if (typeof reservaIds === 'number') return [reservaIds];
    return [];
  }, [reservaIds]);

  const atendimentoTipo = mapTipoAtendimento(tipoProfissional);

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

    fisioQueixaPrincipal: '',
    fisioLocalDor: '',
    fisioSenteDor: '',
    fisioNivelDor: '',
    fisioPioraMovimento: '',
    fisioDificuldadeAtividades: '',
    fisioLesoesTraumas: '',
    fisioFezFisioAntes: '',
    fisioDiagnostico: '',

    fonoDificuldadeFala: '',
    fonoTrocaOmissao: '',
    fonoDificuldadeCompreensao: '',
    fonoSuspeitaPerdaAuditiva: '',
    fonoExameAuditivo: '',
    fonoMastigarEngolir: '',
    fonoRespiraBoca: '',
    fonoCrianca: '',
    fonoIdadeComecouFalar: '',
    fonoLinguagemAdequada: '',

    outrosSintomas: {
      febre: false,
      tontura: false,
      faltaDeAr: false,
      nausea: false,
      dorPersistente: false
    },

    observacoes: ''
  });

  const updateField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const updateOutrosSintomas = (key) => (e) => {
    const checked = Boolean(e.target.checked);
    setForm((prev) => ({
      ...prev,
      outrosSintomas: { ...prev.outrosSintomas, [key]: checked }
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

    if (!atendimentoTipo) {
      showError('Tipo de atendimento inválido.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!reservaIdsNormalizados.length) {
        showError('Não foi possível identificar a reserva vinculada a este formulário.');
        return;
      }

      const payload = {
        profissional: nomeProfissional || null,
        tipoProfissional: (tipoProfissional || '').toLowerCase(),
        tipoAtendimento: atendimentoTipo,
        reservaIds: reservaIdsNormalizados,
        paciente: {
          id: user.id,
          nome: user.nome,
          sobrenome: user.sobrenome,
          email: user.email,
          telefone: user.telefone
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
            historicoFamiliar: form.historicoFamiliar
          },
          medicamentosAlergias: {
            usaMedicamento: form.usaMedicamento,
            medicamentosDetalhe: form.medicamentosDetalhe,
            suplementos: form.suplementos,
            alergiaMedicamento: form.alergiaMedicamento,
            alergiaMedicamentoDetalhe: form.alergiaMedicamentoDetalhe
          },
          habitosVida: {
            alimentacao: form.alimentacao,
            atividadeFisicaFrequencia: form.atividadeFisicaFrequencia,
            alcool: form.alcool,
            fuma: form.fuma,
            sono: form.sono
          },
          saudeEmocional: {
            estresse: form.estresse,
            ansiedadeDepressao: form.ansiedadeDepressao,
            acompanhamentoPsicologico: form.acompanhamentoPsicologico
          },
          outrosSintomas: form.outrosSintomas,
          observacoes: form.observacoes
        },
        especifico: atendimentoTipo === 'medico'
          ? {
              jaPassouAntes: form.medicoProblemaAntes,
              acompanhamentoOutroMedico: form.medicoAcompanhamentoOutro,
              examesRecentes: form.medicoExamesRecentes,
              doencasCronicas: form.medicoDoencasCronicas,
              vacinacaoEmDia: form.medicoVacinacaoEmDia
            }
          : atendimentoTipo === 'fisioterapia'
          ? {
              queixaPrincipal: form.fisioQueixaPrincipal,
              localDorOuLimitacao: form.fisioLocalDor,
              senteDor: form.fisioSenteDor,
              nivelDor: form.fisioNivelDor,
              pioraComMovimento: form.fisioPioraMovimento,
              dificuldadeAtividadesDia: form.fisioDificuldadeAtividades,
              lesoesTraumas: form.fisioLesoesTraumas,
              fezFisioAntes: form.fisioFezFisioAntes,
              diagnostico: form.fisioDiagnostico
            }
          : {
              comunicacao: {
                dificuldadeFala: form.fonoDificuldadeFala,
                trocaOmissao: form.fonoTrocaOmissao,
                dificuldadeCompreensao: form.fonoDificuldadeCompreensao
              },
              audicao: {
                suspeitaPerdaAuditiva: form.fonoSuspeitaPerdaAuditiva,
                exameAuditivo: form.fonoExameAuditivo
              },
              funcoesOrais: {
                mastigarEngolir: form.fonoMastigarEngolir,
                respiraPelaBoca: form.fonoRespiraBoca
              },
              crianca: {
                ehCrianca: form.fonoCrianca,
                idadeComecouFalar: form.fonoIdadeComecouFalar,
                linguagemAdequada: form.fonoLinguagemAdequada
              }
            },
        createdAt: new Date().toISOString()
      };

      await axios.post('http://localhost:3000/formularios', {
        reservaIds: reservaIdsNormalizados,
        tipoFormulario: 'saude_geral',
        tipoAtendimento: atendimentoTipo,
        usuarioId: user.id,
        conteudo: payload
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
      <SectionTitle>🩺 1. Motivo da Consulta</SectionTitle>
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
          <Label>A intensidade é</Label>
          <Select value={form.intensidade} onChange={updateField('intensidade')} required>
            <option value="">Selecione...</option>
            <option value="leve">Leve</option>
            <option value="moderada">Moderada</option>
            <option value="grave">Grave</option>
          </Select>
        </Field>
      </Grid>

      <SectionTitle>🏥 2. Histórico de Saúde</SectionTitle>
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

      <SectionTitle>💊 3. Medicamentos e Alergias</SectionTitle>
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

      <SectionTitle>🧬 4. Hábitos de Vida</SectionTitle>
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
          <Label>Atividade física: frequência semanal</Label>
          <Input value={form.atividadeFisicaFrequencia} onChange={updateField('atividadeFisicaFrequencia')} placeholder="Ex: 3x" />
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

      <SectionTitle>🧠 5. Saúde Emocional</SectionTitle>
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

      <SectionTitle>🔽 6. Selecione o tipo de atendimento</SectionTitle>
      <Grid>
        <Field style={{ gridColumn: '1 / -1' }}>
          <Label>Tipo</Label>
          <Select value={atendimentoTipo} disabled>
            <option value="medico">Médico</option>
            <option value="fisioterapia">Fisioterapia</option>
            <option value="fonoaudiologia">Fonoaudiologia</option>
          </Select>
        </Field>
      </Grid>

      {atendimentoTipo === 'medico' && (
        <>
          <SectionTitle>🩻 7. BLOCO ESPECÍFICO – MÉDICO</SectionTitle>
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
              <TextArea value={form.medicoDoencasCronicas} onChange={updateField('medicoDoencasCronicas')} placeholder="Diabetes, hipertensão, etc. (opcional)" />
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
        </>
      )}

      {atendimentoTipo === 'fisioterapia' && (
        <>
          <SectionTitle>🏃‍♂️ 7. BLOCO ESPECÍFICO – FISIOTERAPIA</SectionTitle>
          <Grid>
            <Field style={{ gridColumn: '1 / -1' }}>
              <Label>Queixa principal</Label>
              <TextArea value={form.fisioQueixaPrincipal} onChange={updateField('fisioQueixaPrincipal')} placeholder="Opcional" />
            </Field>
            <Field>
              <Label>Local da dor ou limitação</Label>
              <Input value={form.fisioLocalDor} onChange={updateField('fisioLocalDor')} placeholder="Coluna, joelho, ombro..." />
            </Field>
            <Field>
              <Label>Sente dor?</Label>
              <Select value={form.fisioSenteDor} onChange={updateField('fisioSenteDor')}>
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
                value={form.fisioNivelDor}
                onChange={updateField('fisioNivelDor')}
                placeholder="0-10"
              />
            </Field>
            <Field style={{ gridColumn: '1 / -1' }}>
              <Label>A dor piora com movimento?</Label>
              <Input value={form.fisioPioraMovimento} onChange={updateField('fisioPioraMovimento')} placeholder="Opcional" />
            </Field>
            <Field style={{ gridColumn: '1 / -1' }}>
              <Label>Tem dificuldade para realizar atividades do dia a dia?</Label>
              <TextArea value={form.fisioDificuldadeAtividades} onChange={updateField('fisioDificuldadeAtividades')} placeholder="Opcional" />
            </Field>
            <Field style={{ gridColumn: '1 / -1' }}>
              <Label>Já sofreu lesões ou traumas?</Label>
              <TextArea value={form.fisioLesoesTraumas} onChange={updateField('fisioLesoesTraumas')} placeholder="Opcional" />
            </Field>
            <Field>
              <Label>Já fez fisioterapia antes?</Label>
              <Select value={form.fisioFezFisioAntes} onChange={updateField('fisioFezFisioAntes')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field style={{ gridColumn: '1 / -1' }}>
              <Label>Possui diagnóstico?</Label>
              <Input value={form.fisioDiagnostico} onChange={updateField('fisioDiagnostico')} placeholder="Hérnia de disco, tendinite... (opcional)" />
            </Field>
          </Grid>
        </>
      )}

      {atendimentoTipo === 'fonoaudiologia' && (
        <>
          <SectionTitle>🗣️ 7. BLOCO ESPECÍFICO – FONOAUDIOLOGIA</SectionTitle>
          <Grid>
            <Field>
              <Label>Dificuldade na fala?</Label>
              <Select value={form.fonoDificuldadeFala} onChange={updateField('fonoDificuldadeFala')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field>
              <Label>Troca ou omissão de letras?</Label>
              <Select value={form.fonoTrocaOmissao} onChange={updateField('fonoTrocaOmissao')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field>
              <Label>Dificuldade de compreensão?</Label>
              <Select value={form.fonoDificuldadeCompreensao} onChange={updateField('fonoDificuldadeCompreensao')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field>
              <Label>Suspeita de perda auditiva?</Label>
              <Select value={form.fonoSuspeitaPerdaAuditiva} onChange={updateField('fonoSuspeitaPerdaAuditiva')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field>
              <Label>Já realizou exame auditivo?</Label>
              <Select value={form.fonoExameAuditivo} onChange={updateField('fonoExameAuditivo')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field>
              <Label>Dificuldade para mastigar ou engolir?</Label>
              <Select value={form.fonoMastigarEngolir} onChange={updateField('fonoMastigarEngolir')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field>
              <Label>Respira pela boca?</Label>
              <Select value={form.fonoRespiraBoca} onChange={updateField('fonoRespiraBoca')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field>
              <Label>(se criança) É criança?</Label>
              <Select value={form.fonoCrianca} onChange={updateField('fonoCrianca')}>
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
            <Field>
              <Label>Idade que começou a falar</Label>
              <Input
                value={form.fonoIdadeComecouFalar}
                onChange={updateField('fonoIdadeComecouFalar')}
                placeholder="Opcional"
                disabled={form.fonoCrianca !== 'sim'}
              />
            </Field>
            <Field>
              <Label>Desenvolvimento da linguagem adequado?</Label>
              <Select
                value={form.fonoLinguagemAdequada}
                onChange={updateField('fonoLinguagemAdequada')}
                disabled={form.fonoCrianca !== 'sim'}
              >
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </Field>
          </Grid>
        </>
      )}

      <SectionTitle>⚠️ 8. Outros Sintomas</SectionTitle>
      <Grid>
        <Field>
          <label>
            <input type="checkbox" checked={form.outrosSintomas.febre} onChange={updateOutrosSintomas('febre')} /> Febre
          </label>
        </Field>
        <Field>
          <label>
            <input type="checkbox" checked={form.outrosSintomas.tontura} onChange={updateOutrosSintomas('tontura')} /> Tontura
          </label>
        </Field>
        <Field>
          <label>
            <input type="checkbox" checked={form.outrosSintomas.faltaDeAr} onChange={updateOutrosSintomas('faltaDeAr')} /> Falta de ar
          </label>
        </Field>
        <Field>
          <label>
            <input type="checkbox" checked={form.outrosSintomas.nausea} onChange={updateOutrosSintomas('nausea')} /> Náusea
          </label>
        </Field>
        <Field>
          <label>
            <input type="checkbox" checked={form.outrosSintomas.dorPersistente} onChange={updateOutrosSintomas('dorPersistente')} /> Dor persistente
          </label>
        </Field>
      </Grid>

      <SectionTitle>📎 9. Observações</SectionTitle>
      <Grid>
        <Field style={{ gridColumn: '1 / -1' }}>
          <Label>Informações adicionais</Label>
          <TextArea value={form.observacoes} onChange={updateField('observacoes')} placeholder="Opcional" />
        </Field>
      </Grid>

      <Actions>
        <Button type="button" color="#6c757d" onClick={() => navigate('/minhas-consultas')} disabled={isSubmitting}>
          Pular
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </Actions>
    </form>
  );
};

export default SaudeGeral;
