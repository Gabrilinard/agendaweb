import { createFormulario, createReserva } from '../api';
import { Activity, Dna, Paperclip, Scale, Send, Utensils } from 'lucide-react';
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
  { key: 'objetivo', label: 'seu objetivo' },
  { key: 'refeicoesPorDia', label: 'quantas refeições faz por dia' },
  { key: 'aguaDiaria', label: 'seu consumo diário de água' },
  { key: 'restricoes', label: 'suas restrições alimentares' },
  { key: 'preferenciasAversoes', label: 'suas preferências ou aversões alimentares' },
  { key: 'atividadeFisica', label: 'sua prática de atividade física' },
  { key: 'rotinaTrabalho', label: 'sua rotina de trabalho' },
  { key: 'horariosRefeicoes', label: 'seus horários de refeições' },
  { key: 'problemasMetabolicos', label: 'problemas metabólicos, se houver' },
  { key: 'suplementos', label: 'se usa suplementos' },
  { key: 'pesoAtual', label: 'seu peso atual' },
  { key: 'altura', label: 'sua altura' },
];

const Nutricao = ({ nomeProfissional, profissionalId, reservaIds, pendingReservas }) => {
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
    suplementos: '',
    pesoAtual: '',
    altura: '',
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

    const pesoNum = Number(form.pesoAtual);
    if (!Number.isFinite(pesoNum) || pesoNum <= 0 || pesoNum > 300) {
      showError('Informe um peso válido, entre 1 e 300 kg.');
      return;
    }

    const alturaNum = Number(form.altura);
    if (!Number.isFinite(alturaNum) || alturaNum < 30 || alturaNum > 300) {
      showError('Informe uma altura válida, entre 30 e 300 cm.');
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
        tipoProfissional: 'nutricionista',
        reservaIds: idsParaUsar,
        paciente: {
          id: user.id, nome: user.nome, sobrenome: user.sobrenome,
          email: user.email, telefone: user.telefone,
        },
        nutricao: form,
        createdAt: new Date().toISOString(),
      };

      if (examesArquivo) {
        const formData = new FormData();
        formData.append('reservaIds', JSON.stringify(idsParaUsar));
        formData.append('tipoFormulario', 'nutricionista');
        formData.append('usuarioId', user.id);
        formData.append('conteudo', JSON.stringify(payload));
        formData.append('exame_anexo', examesArquivo);
        await createFormulario(formData);
      } else {
        await createFormulario({
          reservaIds: idsParaUsar,
          tipoFormulario: 'nutricionista',
          tipoAtendimento: null,
          usuarioId: user.id,
          conteudo: payload,
        });
      }

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
              placeholder="Lactose, glúten, etc. Se não houver, informe 'nenhuma'."
              required
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Preferências ou aversões alimentares</Label>
            <TextArea
              value={form.preferenciasAversoes}
              onChange={updateField('preferenciasAversoes')}
              required
            />
          </Field>
        </Grid>
      </SectionBlock>

      <SectionBlock>
        <SectionTitle><Activity size={16} /> Estilo de Vida</SectionTitle>
        <Grid>
          <Field>
            <Label>Prática de atividade física</Label>
            <Select value={form.atividadeFisica} onChange={updateField('atividadeFisica')} required>
              <option value="">Selecione...</option>
              <option value="nao">Não pratico</option>
              <option value="1_2">1–2x por semana</option>
              <option value="3_4">3–4x por semana</option>
              <option value="5_ou_mais">5x ou mais</option>
            </Select>
          </Field>
          <Field>
            <Label>Rotina de trabalho</Label>
            <Select value={form.rotinaTrabalho} onChange={updateField('rotinaTrabalho')} required>
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
              required
            />
          </Field>
          <Field>
            <Label>Peso atual, em kg</Label>
            <Input
              type="number"
              step="0.1"
              min="1"
              max="300"
              value={form.pesoAtual}
              onChange={updateField('pesoAtual')}
              placeholder="Ex: 68.5"
              required
            />
          </Field>
          <Field>
            <Label>Altura, em cm</Label>
            <Input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={form.altura}
              onChange={updateField('altura')}
              placeholder="Ex: 170"
              required
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
              placeholder="Se não houver, informe 'nenhum'."
              required
            />
          </Field>
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Exames recentes (opcional)</Label>
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
          <Field style={{ gridColumn: '1 / -1' }}>
            <Label>Uso de suplementos</Label>
            <Input
              value={form.suplementos}
              onChange={updateField('suplementos')}
              placeholder="Se não usar, informe 'nenhum'."
              required
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
