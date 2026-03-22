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

const Odontologia = ({ nomeProfissional, reservaIds }) => {
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
    anticoagulantesDetalhe: ''
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

    if (!form.motivoConsulta.trim()) {
      showError('Preencha o motivo da consulta.');
      return;
    }

    if (!form.escovacaoFrequencia) {
      showError('Informe a frequência de escovação diária.');
      return;
    }

    if (!form.fioDental) {
      showError('Informe se você usa fio dental.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        profissional: nomeProfissional || null,
        tipoProfissional: 'dentista',
        reservaIds: reservaIdsNormalizados,
        paciente: {
          id: user.id,
          nome: user.nome,
          sobrenome: user.sobrenome,
          email: user.email,
          telefone: user.telefone
        },
        odontologia: form,
        createdAt: new Date().toISOString()
      };

      const storageKey = reservaIdsNormalizados.length
        ? `formulario:dentista:${reservaIdsNormalizados.join(',')}`
        : `formulario:dentista:sem_reserva:${Date.now()}`;
      sessionStorage.setItem(storageKey, JSON.stringify(payload));

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
      <SectionTitle>😬 Saúde bucal</SectionTitle>
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
          <Select value={form.dor} onChange={updateField('dor')}>
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </Select>
        </Field>
        <Field>
          <Label>Sangramento gengival?</Label>
          <Select value={form.sangramento} onChange={updateField('sangramento')}>
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </Select>
        </Field>

        <Field>
          <Label>Sensibilidade (frio/quente)?</Label>
          <Select value={form.sensibilidade} onChange={updateField('sensibilidade')}>
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

      <SectionTitle>🪥 Histórico odontológico</SectionTitle>
      <Grid>
        <Field>
          <Label>Última consulta ao dentista</Label>
          <Input
            type="date"
            value={form.ultimaConsulta}
            onChange={updateField('ultimaConsulta')}
          />
        </Field>
        <Field>
          <Label>Já fez tratamento de canal?</Label>
          <Select value={form.tratamentoCanal} onChange={updateField('tratamentoCanal')}>
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </Select>
        </Field>

        <Field>
          <Label>Uso de aparelho ortodôntico</Label>
          <Select value={form.aparelhoOrto} onChange={updateField('aparelhoOrto')}>
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </Select>
        </Field>
        <Field>
          <Label>Bruxismo (ranger os dentes)</Label>
          <Select value={form.bruxismo} onChange={updateField('bruxismo')}>
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </Select>
        </Field>
      </Grid>

      <SectionTitle>💉 Informações importantes</SectionTitle>
      <Grid>
        <Field>
          <Label>Alergia a anestesia?</Label>
          <Select value={form.alergiaAnestesia} onChange={updateField('alergiaAnestesia')}>
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
            placeholder="Opcional"
            disabled={form.alergiaAnestesia !== 'sim'}
          />
        </Field>

        <Field>
          <Label>Problemas cardíacos</Label>
          <Select value={form.problemasCardiacos} onChange={updateField('problemasCardiacos')}>
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </Select>
        </Field>
        <Field>
          <Label>Uso de medicamentos anticoagulantes</Label>
          <Select value={form.anticoagulantes} onChange={updateField('anticoagulantes')}>
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
            placeholder="Opcional"
            disabled={form.anticoagulantes !== 'sim'}
          />
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

export default Odontologia;

