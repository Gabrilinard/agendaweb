import axios from 'axios';
import { Brain, FileText, Heart, MessageCircle, Pill, Send, Shield, Users } from 'lucide-react';
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
  SectionBlock,
  SectionTitle,
  Select,
  TextArea,
} from '../style';

const Psicologia = ({ nomeProfissional, reservaIds, pendingReservas }) => {
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
    motivoBusca: '',
    tempoSintomas: '',
    intensidade: '',

    diagnosticoPrevio: '',
    diagnosticoQual: '',
    jaFezTerapia: '',
    tempoTerapiaAnterior: '',
    motivoEncerramento: '',

    usaMedicamentoPsiq: '',
    medicamentoPsiqDetalhe: '',
    acompanhamentoPsiquiatra: '',

    nivelAnsiedade: '',
    nivelDepressao: '',
    qualidadeSono: '',
    nivelEstresse: '',
    autoestima: '',
    pensamentosNegativoRecorrente: '',

    situacaoTrabalho: '',
    relacionamentoFamiliar: '',
    relacionamentoSocial: '',
    relacaoAmorosa: '',

    eventoTraumatico: '',
    eventoTraumaticoDetalhe: '',

    objetivos: '',
    expectativasTerapia: '',

    observacoes: '',
  });

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('Você precisa estar logado.');
      navigate('/Entrar');
      return;
    }

    if (!form.motivoBusca.trim()) {
      showError('Informe o motivo da busca por atendimento.');
      return;
    }

    if (!form.intensidade) {
      showError('Selecione o nível de impacto na sua vida.');
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
        tipoProfissional: 'psicologo',
        tipoAtendimento: 'psicologia',
        reservaIds: idsParaUsar,
        paciente: {
          id: user.id, nome: user.nome, sobrenome: user.sobrenome,
          email: user.email, telefone: user.telefone,
        },
        motivoBusca: {
          motivoPrincipal: form.motivoBusca,
          tempoSintomas: form.tempoSintomas,
          intensidade: form.intensidade,
        },
        historicoPsicologico: {
          diagnosticoPrevio: form.diagnosticoPrevio,
          diagnosticoQual: form.diagnosticoQual,
          jaFezTerapia: form.jaFezTerapia,
          tempoTerapiaAnterior: form.tempoTerapiaAnterior,
          motivoEncerramento: form.motivoEncerramento,
        },
        medicamentos: {
          usaMedicamentoPsiq: form.usaMedicamentoPsiq,
          medicamentoPsiqDetalhe: form.medicamentoPsiqDetalhe,
          acompanhamentoPsiquiatra: form.acompanhamentoPsiquiatra,
        },
        saudeEmocional: {
          nivelAnsiedade: form.nivelAnsiedade,
          nivelDepressao: form.nivelDepressao,
          qualidadeSono: form.qualidadeSono,
          nivelEstresse: form.nivelEstresse,
          autoestima: form.autoestima,
          pensamentosNegativoRecorrente: form.pensamentosNegativoRecorrente,
        },
        contextoVida: {
          situacaoTrabalho: form.situacaoTrabalho,
          relacionamentoFamiliar: form.relacionamentoFamiliar,
          relacionamentoSocial: form.relacionamentoSocial,
          relacaoAmorosa: form.relacaoAmorosa,
        },
        trauma: {
          eventoTraumatico: form.eventoTraumatico,
          eventoTraumaticoDetalhe: form.eventoTraumaticoDetalhe,
        },
        objetivos: {
          objetivos: form.objetivos,
          expectativasTerapia: form.expectativasTerapia,
        },
        observacoes: form.observacoes,
        createdAt: new Date().toISOString(),
      };

      await axios.post('http://localhost:3000/formularios', {
        reservaIds: idsParaUsar,
        tipoFormulario: 'psicologia',
        tipoAtendimento: 'psicologia',
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
        <SectionTitle><Brain size={16} /> Motivo da Busca</SectionTitle>
        <Grid>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>O que te trouxe a buscar atendimento psicológico?</Label>
            <TextArea
              value={form.motivoBusca}
              onChange={updateField('motivoBusca')}
              placeholder="Descreva com suas palavras o que está sentindo ou vivenciando..."
              required
            />
          </Field>
          <Field>
            <Label>Há quanto tempo está vivenciando isso?</Label>
            <Input
              value={form.tempoSintomas}
              onChange={updateField('tempoSintomas')}
              placeholder="Ex: 2 semanas, 6 meses, alguns anos..."
            />
          </Field>
          <Field>
            <Label>Qual o impacto disso no seu dia a dia?</Label>
            <Select value={form.intensidade} onChange={updateField('intensidade')} required>
              <option value="">Selecione...</option>
              <option value="leve">Leve — consigo funcionar normalmente</option>
              <option value="moderado">Moderado — afeta algumas áreas da minha vida</option>
              <option value="intenso">Intenso — compromete bastante meu dia a dia</option>
              <option value="muito_intenso">Muito intenso — estou em sofrimento significativo</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Shield size={16} /> Histórico Psicológico</SectionTitle>
        <Grid>
          <Field>
            <Label>Possui algum diagnóstico psicológico ou psiquiátrico?</Label>
            <Select value={form.diagnosticoPrevio} onChange={updateField('diagnosticoPrevio')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
              <option value="suspeita">Tenho suspeita, mas sem diagnóstico</option>
            </Select>
          </Field>
          <Field>
            <Label>Qual diagnóstico?</Label>
            <Input
              value={form.diagnosticoQual}
              onChange={updateField('diagnosticoQual')}
              placeholder="Ansiedade, depressão, TDAH, TOC... (opcional)"
              disabled={form.diagnosticoPrevio !== 'sim'}
            />
          </Field>
          <Field>
            <Label>Já fez terapia antes?</Label>
            <Select value={form.jaFezTerapia} onChange={updateField('jaFezTerapia')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Por quanto tempo?</Label>
            <Input
              value={form.tempoTerapiaAnterior}
              onChange={updateField('tempoTerapiaAnterior')}
              placeholder="Ex: 6 meses, 2 anos... (opcional)"
              disabled={form.jaFezTerapia !== 'sim'}
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Por que encerrou o atendimento anterior?</Label>
            <Input
              value={form.motivoEncerramento}
              onChange={updateField('motivoEncerramento')}
              placeholder="Opcional"
              disabled={form.jaFezTerapia !== 'sim'}
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Pill size={16} /> Medicamentos Psiquiátricos</SectionTitle>
        <Grid>
          <Field>
            <Label>Usa algum medicamento psiquiátrico atualmente?</Label>
            <Select value={form.usaMedicamentoPsiq} onChange={updateField('usaMedicamentoPsiq')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <Field>
            <Label>Quais? (se souber as dosagens)</Label>
            <Input
              value={form.medicamentoPsiqDetalhe}
              onChange={updateField('medicamentoPsiqDetalhe')}
              placeholder="Ex: Sertralina 50mg... (opcional)"
              disabled={form.usaMedicamentoPsiq !== 'sim'}
            />
          </Field>
          <Field>
            <Label>Está em acompanhamento com psiquiatra?</Label>
            <Select value={form.acompanhamentoPsiquiatra} onChange={updateField('acompanhamentoPsiquiatra')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Heart size={16} /> Saúde Emocional Atual</SectionTitle>
        <Grid>
          <Field>
            <Label>Nível de ansiedade</Label>
            <Select value={form.nivelAnsiedade} onChange={updateField('nivelAnsiedade')}>
              <option value="">Selecione...</option>
              <option value="ausente">Ausente</option>
              <option value="leve">Leve</option>
              <option value="moderado">Moderado</option>
              <option value="intenso">Intenso</option>
            </Select>
          </Field>
          <Field>
            <Label>Nível de tristeza / depressão</Label>
            <Select value={form.nivelDepressao} onChange={updateField('nivelDepressao')}>
              <option value="">Selecione...</option>
              <option value="ausente">Ausente</option>
              <option value="leve">Leve</option>
              <option value="moderado">Moderado</option>
              <option value="intenso">Intenso</option>
            </Select>
          </Field>
          <Field>
            <Label>Qualidade do sono</Label>
            <Select value={form.qualidadeSono} onChange={updateField('qualidadeSono')}>
              <option value="">Selecione...</option>
              <option value="boa">Boa</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim — dificuldade para dormir ou acordar cedo</option>
              <option value="muito_ruim">Muito ruim — insônia ou sono excessivo</option>
            </Select>
          </Field>
          <Field>
            <Label>Nível de estresse</Label>
            <Select value={form.nivelEstresse} onChange={updateField('nivelEstresse')}>
              <option value="">Selecione...</option>
              <option value="baixo">Baixo</option>
              <option value="medio">Médio</option>
              <option value="alto">Alto</option>
              <option value="muito_alto">Muito alto</option>
            </Select>
          </Field>
          <Field>
            <Label>Como está sua autoestima?</Label>
            <Select value={form.autoestima} onChange={updateField('autoestima')}>
              <option value="">Selecione...</option>
              <option value="boa">Boa</option>
              <option value="regular">Regular</option>
              <option value="baixa">Baixa</option>
              <option value="muito_baixa">Muito baixa</option>
            </Select>
          </Field>
          <Field>
            <Label>Tem pensamentos negativos recorrentes?</Label>
            <Select value={form.pensamentosNegativoRecorrente} onChange={updateField('pensamentosNegativoRecorrente')}>
              <option value="">Selecione...</option>
              <option value="nao">Não</option>
              <option value="raramente">Raramente</option>
              <option value="frequentemente">Frequentemente</option>
              <option value="quase_sempre">Quase sempre</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Users size={16} /> Contexto de Vida</SectionTitle>
        <Grid>
          <Field>
            <Label>Situação profissional</Label>
            <Select value={form.situacaoTrabalho} onChange={updateField('situacaoTrabalho')}>
              <option value="">Selecione...</option>
              <option value="empregado">Empregado(a)</option>
              <option value="autonomo">Autônomo(a) / Freelancer</option>
              <option value="desempregado">Desempregado(a)</option>
              <option value="estudante">Estudante</option>
              <option value="aposentado">Aposentado(a)</option>
              <option value="licenca">De licença</option>
            </Select>
          </Field>
          <Field>
            <Label>Como está seu relacionamento familiar?</Label>
            <Select value={form.relacionamentoFamiliar} onChange={updateField('relacionamentoFamiliar')}>
              <option value="">Selecione...</option>
              <option value="muito_bom">Muito bom</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim / Conflituoso</option>
              <option value="distante">Distante / Sem contato</option>
            </Select>
          </Field>
          <Field>
            <Label>Tem rede de apoio social (amigos, colegas)?</Label>
            <Select value={form.relacionamentoSocial} onChange={updateField('relacionamentoSocial')}>
              <option value="">Selecione...</option>
              <option value="sim_forte">Sim, tenho boas amizades</option>
              <option value="sim_limitada">Sim, mas é limitada</option>
              <option value="nao">Não / Sinto-me isolado(a)</option>
            </Select>
          </Field>
          <Field>
            <Label>Está em relacionamento amoroso?</Label>
            <Select value={form.relacaoAmorosa} onChange={updateField('relacaoAmorosa')}>
              <option value="">Selecione...</option>
              <option value="sim_bem">Sim, está bem</option>
              <option value="sim_dificuldades">Sim, com dificuldades</option>
              <option value="nao">Não</option>
              <option value="prefiro_nao_dizer">Prefiro não informar</option>
            </Select>
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><MessageCircle size={16} /> Eventos e Experiências</SectionTitle>
        <Grid>
          <Field>
            <Label>Passou por algum evento traumático ou muito estressante?</Label>
            <Select value={form.eventoTraumatico} onChange={updateField('eventoTraumatico')}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
              <option value="prefiro_nao_dizer">Prefiro não informar agora</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Se quiser compartilhar, descreva brevemente</Label>
            <TextArea
              value={form.eventoTraumaticoDetalhe}
              onChange={updateField('eventoTraumaticoDetalhe')}
              placeholder="Apenas o que você se sentir confortável em compartilhar (opcional)"
              disabled={form.eventoTraumatico !== 'sim'}
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Brain size={16} /> Objetivos com a Terapia</SectionTitle>
        <Grid>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>O que você espera alcançar com o acompanhamento psicológico?</Label>
            <TextArea
              value={form.objetivos}
              onChange={updateField('objetivos')}
              placeholder="Ex: Reduzir a ansiedade, melhorar relacionamentos, me conhecer melhor..."
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Tem alguma expectativa específica sobre a terapia?</Label>
            <TextArea
              value={form.expectativasTerapia}
              onChange={updateField('expectativasTerapia')}
              placeholder="Opcional"
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><FileText size={16} /> Observações</SectionTitle>
        <Field>
          <Label>Há algo mais que gostaria que o psicólogo soubesse antes da consulta?</Label>
          <TextArea
            value={form.observacoes}
            onChange={updateField('observacoes')}
            placeholder="Opcional"
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

export default Psicologia;
