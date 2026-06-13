import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { register } from '../api';
import { DIAS_SEMANA } from '../utils/constantes';
import {
  converterEstadoParaSigla, formatarCPF, formatarHorarioInput,
  formatarNumeroConselho, normalizarHorario24h, validarCPF, validarNumeroConselho,
} from '../utils/formatters';

const useRegistro = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: showError } = useNotification();

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('paciente');
  const [tipoProfissional, setTipoProfissional] = useState('');
  const [especialidadeMedica, setEspecialidadeMedica] = useState('');
  const [profissaoCustomizada, setProfissaoCustomizada] = useState('');
  const [numeroConselho, setNumeroConselho] = useState('');
  const [ufRegiao, setUfRegiao] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [cidade, setCidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [publicoAtendido, setPublicoAtendido] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [valorConsulta, setValorConsulta] = useState('');
  const [diasAtendimento, setDiasAtendimento] = useState([]);
  const [horariosAtendimento, setHorariosAtendimento] = useState({});
  const [cpf, setCpf] = useState('');
  const [abordagemTerapeutica, setAbordagemTerapeutica] = useState('');
  const [areaAtuacaoPsi, setAreaAtuacaoPsi] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ cpf: '', email: '', senha: '', numeroConselho: '' });

  const setFieldError = (field, msg) => setFieldErrors(prev => ({ ...prev, [field]: msg }));
  const clearFieldError = (field) => setFieldErrors(prev => ({ ...prev, [field]: '' }));

  const getSenhaForca = (s) => {
    if (!s) return null;
    if (s.length >= 8 && /[A-Z]/.test(s) && /\d/.test(s)) return 'forte';
    if (s.length >= 6) return 'media';
    return 'fraca';
  };

  const buscarLocalizacao = async (lat, lng) => {
    try {
      const data = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`
      ).then(r => r.json());
      if (data?.address) {
        let uf = data.address.state_code || data.address.state;
        if (uf) {
          let u = uf.replace(/^[A-Z]{2}-/, '').toUpperCase();
          if (u.length > 2) { const s = converterEstadoParaSigla(u); if (s) u = s; }
          setUfRegiao(u);
        }
        const c = data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county || '';
        if (c) setCidade(c);
      }
    } catch (e) { console.error(e); }
  };

  const handleMapClick = (lat, lng) => { setLatitude(lat); setLongitude(lng); buscarLocalizacao(lat, lng); };

  const handleCPFChange = (e) => setCpf(formatarCPF(e.target.value));
  const handleNumeroConselhoChange = (e) => {
    clearFieldError('numeroConselho');
    setNumeroConselho(formatarNumeroConselho(e.target.value, tipoProfissional));
  };

  const handleDiaChange = (e) => {
    const dia = e.target.value;
    if (dia === 'Todos os dias') {
      const all = DIAS_SEMANA.every(d => diasAtendimento.includes(d));
      if (all) { setDiasAtendimento([]); setHorariosAtendimento({}); }
      else {
        setDiasAtendimento([...DIAS_SEMANA]);
        const h = {}; DIAS_SEMANA.forEach(d => { h[d] = horariosAtendimento[d] || ['08:00']; });
        setHorariosAtendimento(h);
      }
    } else {
      if (diasAtendimento.includes(dia)) {
        setDiasAtendimento(diasAtendimento.filter(d => d !== dia));
        const h = { ...horariosAtendimento }; delete h[dia]; setHorariosAtendimento(h);
      } else {
        setDiasAtendimento([...diasAtendimento, dia]);
        setHorariosAtendimento({ ...horariosAtendimento, [dia]: ['08:00'] });
      }
    }
  };

  const handleAddHorario = (dia) =>
    setHorariosAtendimento(prev => ({ ...prev, [dia]: [...(prev[dia] || []), ''] }));

  const handleRemoveHorario = (dia, index) =>
    setHorariosAtendimento(prev => { const h = [...prev[dia]]; h.splice(index, 1); return { ...prev, [dia]: h }; });

  const handleHorarioChange = (dia, index, valor) =>
    setHorariosAtendimento(prev => { const h = [...prev[dia]]; h[index] = valor; return { ...prev, [dia]: h }; });

  const ordenarHorariosDia = (dia) => {
    setHorariosAtendimento(prev => {
      const reg = /^([01]\d|2[0-3]):[0-5]\d$/;
      const sorted = [...(prev[dia] || [])].map((v, idx) => {
        const txt = String(v || '').trim();
        const ok = reg.test(txt);
        const min = ok ? parseInt(txt.slice(0,2)) * 60 + parseInt(txt.slice(3,5)) : Infinity;
        return { v, idx, ok, min };
      }).sort((a, b) => a.ok !== b.ok ? (a.ok ? -1 : 1) : a.min !== b.min ? a.min - b.min : a.idx - b.idx);
      return { ...prev, [dia]: sorted.map(i => i.v) };
    });
  };

  const handleConfirmPasswordChange = (e) => { setConfirmarSenha(e.target.value); setPasswordsMatch(e.target.value === senha); };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 7) v = `${v.slice(0,2)} ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `${v.slice(0,2)} ${v.slice(2)}`;
    setTelefone(v);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    let hasErrors = false;

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha)) { setFieldError('senha', 'Mínimo 8 caracteres, pelo menos 1 maiúscula e 1 número.'); hasErrors = true; }
    if (senha !== confirmarSenha) { showError('As senhas não coincidem!'); hasErrors = true; }
    if (!cpf?.trim()) { setFieldError('cpf', 'Por favor, informe o CPF.'); hasErrors = true; }
    else if (!validarCPF(cpf)) { setFieldError('cpf', 'CPF inválido. Verifique o número informado.'); hasErrors = true; }
    if (hasErrors) return;

    if (tipoUsuario === 'profissional') {
      if (!tipoProfissional) { showError('Por favor, selecione o tipo de profissional.'); return; }
      if (tipoProfissional === 'medico' && !especialidadeMedica) { showError('Por favor, selecione sua especialidade médica.'); return; }
      if (tipoProfissional === 'outros' && !profissaoCustomizada.trim()) { showError('Por favor, informe sua profissão.'); return; }
      if (!numeroConselho?.trim()) { showError('Por favor, informe o número do conselho.'); return; }
      if (!validarNumeroConselho(numeroConselho, tipoProfissional)) {
        const msgs = {
          medico:         'CRM/PI 425041',
          dentista:       'CRO/SP 12345',
          nutricionista:  'CRN-3 12345',
          fisioterapeuta: 'CREFITO-8/123456-F (ou -T para Terapia Ocupacional)',
          fonoaudiologo:  'CRFa/SP 12345',
          psicologo:      'CRP 06/12345',
        };
        showError(`Número do conselho inválido. Formato esperado: ${msgs[tipoProfissional] || 'entre 3 e 20 caracteres'}`);
        return;
      }
      if (!latitude || !longitude) { showError('Por favor, selecione sua localização no mapa.'); return; }
      if (!ufRegiao?.trim()) { showError('Por favor, selecione a UF/Região no mapa.'); return; }
      if (!cidade?.trim()) { showError('Por favor, selecione sua cidade no mapa.'); return; }
      if (!descricao?.trim()) { showError('Por favor, preencha a descrição.'); return; }
      if (!publicoAtendido?.trim()) { showError('Por favor, selecione o público atendido.'); return; }
      if (!modalidade?.trim()) { showError('Por favor, selecione a modalidade.'); return; }
    }

    try {
      const dados = {
        nome, sobrenome, telefone, email, senha,
        cpf: cpf.replace(/\D/g, ''),
        tipoUsuario: tipoUsuario || 'paciente',
        ...(tipoUsuario === 'profissional' && {
          tipoProfissional: tipoProfissional === 'outros' ? profissaoCustomizada : tipoProfissional,
          ...(tipoProfissional === 'psicologo' && { abordagemTerapeutica: abordagemTerapeutica.trim(), areaAtuacaoPsi: areaAtuacaoPsi.trim() }),
          especialidadeMedica: tipoProfissional === 'medico' ? especialidadeMedica : null,
          profissaoCustomizada: tipoProfissional === 'outros' ? profissaoCustomizada : null,
          numeroConselho: numeroConselho.trim(), ufRegiao: ufRegiao.trim(),
          latitude, longitude, cidade: cidade.trim(),
          descricao: descricao.trim(), publicoAtendido: publicoAtendido.trim(),
          modalidade, valorConsulta, diasAtendimento, horariosAtendimento,
        }),
      };
      await register(dados);
      success('Usuário cadastrado com sucesso!');
      await new Promise(r => setTimeout(r, 500));
      const userData = await login(email, senha);
      navigate(userData && tipoUsuario === 'profissional' ? '/AdminDashboard' : userData ? '/' : '/Entrar');
    } catch (err) {
      const data = err.response?.data;
      if (data?.field) { setFieldError(data.field, data.error); showError(data.error); }
      else showError(data?.error || 'Erro ao registrar. Tente novamente.');
    }
  };

  return {
    nome, setNome, sobrenome, setSobrenome, telefone, email, setEmail,
    senha, setSenha, confirmarSenha, showPassword, showConfirmPassword,
    passwordsMatch, tipoUsuario, setTipoUsuario, tipoProfissional, setTipoProfissional,
    especialidadeMedica, setEspecialidadeMedica, profissaoCustomizada, setProfissaoCustomizada,
    numeroConselho, ufRegiao, latitude, longitude, cidade, descricao, setDescricao,
    publicoAtendido, setPublicoAtendido, modalidade, setModalidade,
    valorConsulta, setValorConsulta, diasAtendimento, setDiasAtendimento,
    horariosAtendimento, setHorariosAtendimento, cpf, abordagemTerapeutica, setAbordagemTerapeutica,
    areaAtuacaoPsi, setAreaAtuacaoPsi, fieldErrors,
    getSenhaForca, clearFieldError, handleMapClick,
    handleCPFChange, handleNumeroConselhoChange, handleDiaChange,
    handleAddHorario, handleRemoveHorario, handleHorarioChange, ordenarHorariosDia,
    handleRegister, handleConfirmPasswordChange, handleTelefoneChange,
    togglePasswordVisibility: () => setShowPassword(p => !p),
    toggleConfirmPasswordVisibility: () => setShowConfirmPassword(p => !p),
    formatarHorarioInput, normalizarHorario24h,
  };
};

export default useRegistro;
