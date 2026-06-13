import { createFormulario, createReserva } from '../api';
import { Activity, Dna, Scale, Send, Utensils } from 'lucide-react';
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

const Nutricao = ({ nomeProfissional, reservaIds, pendingReservas }) => {
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
    objetivo: '',
    refeicoesPorDia: '',
    aguaDiaria: '',
    restricoes: '',
    preferenciasAversoes: '',
    atividadeFisica: '',
    rotinaTrabalho: '',
    horariosRefeicoes: '',
    problemasMetabolicos: '',
    examesRecentes: '',
    suplementos: '',
  });

  const updateField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('Você precisa estar logado.');
      navigate('/Entrar');
      return;
    }

    if (!form.objetivo.trim()) {
      showError('Informe seu objetivo.');
      return;
    }

    if (!form.refeicoesPorDia) {
      showError('Informe quantas refeições faz por dia.');
      return;
    }

    if (!form.aguaDiaria) {
      showError('Informe seu consumo diário de água.');
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
        tipoProfissional: 'nutricionista',
        reservaIds: idsParaUsar,
        paciente: {
          id: user.id, nome: user.nome, sobrenome: user.sobrenome,
          email: user.email, telefone: user.telefone,
        },
        nutricao: form,
        createdAt: new Date().toISOString(),
      };

      await createFormulario({
        reservaIds: idsParaUsar,
        tipoFormulario: 'nutricionista',
        tipoAtendimento: null,
        usuarioId: user.id,
        conteudo: payload,
      });

      success('Formulário de nutrição enviado com sucesso!');
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
        <SectionTitle><Scale size={16} /> Objetivo</SectionTitle>
        <Field>
          <Label>Qual seu objetivo?</Label>
          <TextArea
            value={form.objetivo}
            onChange={updateField('objetivo')}
            placeholder="Emagrecimento, ganho de massa, saúde, etc."
            required
          />
        </Field>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Utensils size={16} /> Alimentação</SectionTitle>
        <Grid>
          <Field>
            <Label>Quantas refeições faz por dia?</Label>
            <Select value={form.refeicoesPorDia} onChange={updateField('refeicoesPorDia')} required>
              <option value="">Selecione...</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6_ou_mais">6 ou mais</option>
            </Select>
          </Field>
          <Field>
            <Label>Consumo de água diário</Label>
            <Select value={form.aguaDiaria} onChange={updateField('aguaDiaria')} required>
              <option value="">Selecione...</option>
              <option value="menos_1l">Menos de 1L</option>
              <option value="1_2l">1–2L</option>
              <option value="2_3l">2–3L</option>
              <option value="mais_3l">Mais de 3L</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Restrições alimentares</Label>
            <Input
              value={form.restricoes}
              onChange={updateField('restricoes')}
              placeholder="Lactose, glúten, etc. (opcional)"
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Preferências ou aversões alimentares</Label>
            <TextArea
              value={form.preferenciasAversoes}
              onChange={updateField('preferenciasAversoes')}
              placeholder="Opcional"
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Activity size={16} /> Estilo de Vida</SectionTitle>
        <Grid>
          <Field>
            <Label>Prática de atividade física</Label>
            <Select value={form.atividadeFisica} onChange={updateField('atividadeFisica')}>
              <option value="">Selecione...</option>
              <option value="nao">Não pratico</option>
              <option value="1_2">1–2x por semana</option>
              <option value="3_4">3–4x por semana</option>
              <option value="5_ou_mais">5x ou mais</option>
            </Select>
          </Field>
          <Field>
            <Label>Rotina de trabalho</Label>
            <Select value={form.rotinaTrabalho} onChange={updateField('rotinaTrabalho')}>
              <option value="">Selecione...</option>
              <option value="sedentario">Sedentário</option>
              <option value="misto">Misto</option>
              <option value="ativo">Ativo</option>
            </Select>
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Horários de refeições</Label>
            <TextArea
              value={form.horariosRefeicoes}
              onChange={updateField('horariosRefeicoes')}
              placeholder="Ex: café 07:30, almoço 12:30, jantar 20:00"
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Dna size={16} /> Saúde e Metabolismo</SectionTitle>
        <Grid>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Problemas como diabetes, colesterol alto</Label>
            <TextArea
              value={form.problemasMetabolicos}
              onChange={updateField('problemasMetabolicos')}
              placeholder="Opcional"
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Exames recentes (se tiver)</Label>
            <TextArea
              value={form.examesRecentes}
              onChange={updateField('examesRecentes')}
              placeholder="Opcional"
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Uso de suplementos</Label>
            <Input
              value={form.suplementos}
              onChange={updateField('suplementos')}
              placeholder="Opcional"
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

export default Nutricao;
