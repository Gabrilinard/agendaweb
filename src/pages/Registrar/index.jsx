import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { DIAS_SEMANA, ESPECIALIDADES_MEDICAS } from './utils/constantes';
import HorariosSetup from './components/HorariosSetup';
import LocationPicker from './components/LocationPicker';
import useRegistro from './hooks/useRegistro';
import {
  Button, Container, Content, EyeIcon, FieldError,
  Form, Input, InputWrapper, LoginButton, MapWrapper,
  PasswordHint, RadioGroup, RadioInput, RadioLabel, Select,
} from './style';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Registro = () => {
  const navigate = useNavigate();
  const r = useRegistro();

  return (
    <Container>
      <Header />
      <Content>
        <Form onSubmit={r.handleRegister}>
          <h2>Registrar-se</h2>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', textAlign: 'left', fontWeight: 'bold' }}>Tipo de Usuário:</label>
            <RadioGroup>
              <RadioLabel>
                <RadioInput type="radio" name="tipoUsuario" value="paciente" checked={r.tipoUsuario === 'paciente'} onChange={e => r.setTipoUsuario(e.target.value)} />
                Paciente
              </RadioLabel>
              <RadioLabel>
                <RadioInput type="radio" name="tipoUsuario" value="profissional" checked={r.tipoUsuario === 'profissional'} onChange={e => r.setTipoUsuario(e.target.value)} />
                Profissional
              </RadioLabel>
            </RadioGroup>
          </div>

          <Input type="text" placeholder="Nome" value={r.nome} onChange={e => r.setNome(e.target.value)} required />
          <Input type="text" placeholder="Sobrenome" value={r.sobrenome} onChange={e => r.setSobrenome(e.target.value)} required />

          <div style={{ width: '100%' }}>
            <Input type="text" placeholder="CPF" value={r.cpf} maxLength={14} required
              onChange={e => { r.handleCPFChange(e); r.clearFieldError('cpf'); }}
              style={r.fieldErrors.cpf ? { borderColor: '#dc3545' } : {}} />
            {r.fieldErrors.cpf && <FieldError>{r.fieldErrors.cpf}</FieldError>}
          </div>

          <Input type="text" placeholder="Telefone" value={r.telefone} onChange={r.handleTelefoneChange} maxLength="15" required />

          <div style={{ width: '100%' }}>
            <Input type="email" placeholder="Email" value={r.email} required
              onChange={e => { r.setEmail(e.target.value); r.clearFieldError('email'); }}
              style={r.fieldErrors.email ? { borderColor: '#dc3545' } : {}} />
            {r.fieldErrors.email && <FieldError>{r.fieldErrors.email}</FieldError>}
          </div>

          <div style={{ width: '100%' }}>
            <InputWrapper>
              <Input type={r.showPassword ? 'text' : 'password'} placeholder="Senha" value={r.senha} required
                onChange={e => { r.setSenha(e.target.value); r.clearFieldError('senha'); }}
                style={r.fieldErrors.senha ? { borderColor: '#dc3545' } : {}} />
              <EyeIcon onClick={r.togglePasswordVisibility}>{r.showPassword ? <FaEyeSlash /> : <FaEye />}</EyeIcon>
            </InputWrapper>
            {r.senha && (() => {
              const forca = r.getSenhaForca(r.senha);
              const msgs = { forte: '✓ Senha forte', media: 'Adicione pelo menos 1 maiúscula e 1 número', fraca: 'Mín. 8 caracteres, 1 maiúscula e 1 número' };
              return <PasswordHint $forca={forca}>{msgs[forca]}</PasswordHint>;
            })()}
            {r.fieldErrors.senha && <FieldError>{r.fieldErrors.senha}</FieldError>}
          </div>

          <InputWrapper>
            <Input type={r.showConfirmPassword ? 'text' : 'password'} placeholder="Confirmar Senha" value={r.confirmarSenha} onChange={r.handleConfirmPasswordChange} required />
            <EyeIcon onClick={r.toggleConfirmPasswordVisibility}>{r.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</EyeIcon>
          </InputWrapper>
          {!r.passwordsMatch && <p style={{ color: 'red' }}>As senhas não coincidem.</p>}

          {r.tipoUsuario === 'profissional' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '16px', textAlign: 'left', fontWeight: 'bold' }}>Tipo de Profissional:</label>
                <Select value={r.tipoProfissional} required onChange={e => {
                  r.setTipoProfissional(e.target.value);
                  if (e.target.value !== 'outros') r.setProfissaoCustomizada('');
                  if (e.target.value !== 'medico') r.setEspecialidadeMedica('');
                }}>
                  <option value="">Selecione...</option>
                  <option value="medico">Médico</option>
                  <option value="dentista">Dentista</option>
                  <option value="nutricionista">Nutricionista</option>
                  <option value="fisioterapeuta">Fisioterapeuta</option>
                  <option value="fonoaudiologo">Fonoaudiólogo</option>
                  <option value="psicologo">Psicólogo</option>
                  <option value="outros">Outros</option>
                </Select>
              </div>

              {r.tipoProfissional === 'medico' && (
                <div>
                  <label style={{ fontWeight: 'bold' }}>Especialidade Médica:</label>
                  <Select value={r.especialidadeMedica} onChange={e => r.setEspecialidadeMedica(e.target.value)} required>
                    <option value="">Selecione sua especialidade...</option>
                    {ESPECIALIDADES_MEDICAS.map(e => <option key={e} value={e}>{e}</option>)}
                  </Select>
                </div>
              )}

              {r.tipoProfissional === 'outros' && (
                <Input type="text" placeholder="Digite sua profissão" value={r.profissaoCustomizada} onChange={e => r.setProfissaoCustomizada(e.target.value)} required />
              )}

              {r.tipoProfissional === 'psicologo' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 'bold' }}>Abordagem Terapêutica:</label>
                    <Select value={r.abordagemTerapeutica} onChange={e => r.setAbordagemTerapeutica(e.target.value)} required>
                      <option value="">Selecione sua abordagem...</option>
                      <option value="Cognitivo-Comportamental (TCC)">Cognitivo-Comportamental (TCC)</option>
                      <option value="Psicanálise">Psicanálise</option>
                      <option value="Psicodinâmica">Psicodinâmica</option>
                      <option value="Humanista / Centrada na Pessoa">Humanista / Centrada na Pessoa</option>
                      <option value="Gestalt">Gestalt</option>
                      <option value="Sistêmica">Sistêmica</option>
                      <option value="EMDR">EMDR</option>
                      <option value="Terapia de Aceitação e Compromisso (ACT)">Terapia de Aceitação e Compromisso (ACT)</option>
                      <option value="Terapia Comportamental Dialética (DBT)">Terapia Comportamental Dialética (DBT)</option>
                      <option value="Análise do Comportamento (ABA)">Análise do Comportamento (ABA)</option>
                      <option value="Outras">Outras</option>
                    </Select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', textAlign: 'left', fontWeight: 'bold' }}>Área de Atuação:</label>
                    <Select value={r.areaAtuacaoPsi} onChange={e => r.setAreaAtuacaoPsi(e.target.value)} required>
                      <option value="">Selecione a área principal...</option>
                      <option value="Clínica Geral">Clínica Geral</option>
                      <option value="Ansiedade e Depressão">Ansiedade e Depressão</option>
                      <option value="Transtornos Alimentares">Transtornos Alimentares</option>
                      <option value="Dependência Química">Dependência Química</option>
                      <option value="Relacionamentos e Família">Relacionamentos e Família</option>
                      <option value="Trauma e TEPT">Trauma e TEPT</option>
                      <option value="Psicologia Infantil e Adolescente">Psicologia Infantil e Adolescente</option>
                      <option value="Neuropsicologia">Neuropsicologia</option>
                      <option value="Psicologia do Trabalho">Psicologia do Trabalho</option>
                      <option value="Psicologia Escolar">Psicologia Escolar</option>
                      <option value="Saúde da Mulher">Saúde da Mulher</option>
                      <option value="LGBTQIA+">LGBTQIA+</option>
                      <option value="Luto e Perdas">Luto e Perdas</option>
                    </Select>
                  </div>
                </>
              )}

              <Input type="text" value={r.numeroConselho} onChange={r.handleNumeroConselhoChange} required
                placeholder={
                  r.tipoProfissional === 'medico' ? 'CRM 123456' : r.tipoProfissional === 'dentista' ? 'CRO 123456' :
                  r.tipoProfissional === 'nutricionista' ? 'CRN 12345' : r.tipoProfissional === 'fisioterapeuta' ? 'CREFITO 123456' :
                  r.tipoProfissional === 'fonoaudiologo' ? 'CRFa 12345' : r.tipoProfissional === 'psicologo' ? 'CRP 06/12345' : 'Número do Conselho'
                }
                maxLength={
                  r.tipoProfissional === 'psicologo' ? 12 : r.tipoProfissional === 'fisioterapeuta' ? 14 :
                  ['medico','dentista'].includes(r.tipoProfissional) ? 11 :
                  ['nutricionista','fonoaudiologo'].includes(r.tipoProfissional) ? 10 : 15
                }
              />

              {r.numeroConselho?.trim() && (
                <>
                  <label style={{ fontWeight: 'bold' }}>Local do seu atendimento</label>
                  <MapWrapper>
                    <LocationPicker onLocationSelect={r.handleMapClick} />
                  </MapWrapper>
                </>
              )}

              {r.latitude && r.longitude && (
                <>
                  <Input type="text" value={r.ufRegiao} placeholder="UF/Região (preenchido automaticamente)" readOnly style={{ backgroundColor: '#f0f0f0' }} />
                  <Input type="text" value={r.cidade} placeholder="Cidade (preenchida automaticamente)" readOnly style={{ backgroundColor: '#f0f0f0' }} />
                  <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                    Localização selecionada: {r.latitude.toFixed(6)}, {r.longitude.toFixed(6)}
                  </p>
                </>
              )}

              <label style={{ display: 'block', marginBottom: '2px', textAlign: 'left', fontWeight: 'bold' }}>Descrição:</label>
              <textarea placeholder="Descreva sua experiência e especialidades..." value={r.descricao} onChange={e => r.setDescricao(e.target.value)} required
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', minHeight: '100px', fontFamily: 'Figtree, sans-serif', resize: 'vertical' }} />

              <label style={{ display: 'block', marginBottom: '2px', textAlign: 'left', fontWeight: 'bold' }}>Público Atendido:</label>
              <Select value={r.publicoAtendido} onChange={e => r.setPublicoAtendido(e.target.value)} required>
                <option value="">Selecione...</option>
                {['Adultos','Crianças','Idosos','Adultos e Crianças','Adultos e Idosos','Crianças e Idosos','Todos'].map(v => <option key={v} value={v}>{v}</option>)}
              </Select>

              <label style={{ display: 'block', marginBottom: '2px', textAlign: 'left', fontWeight: 'bold' }}>Modalidade:</label>
              <Select value={r.modalidade} onChange={e => r.setModalidade(e.target.value)} required>
                <option value="">Selecione...</option>
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
                <option value="domiciliar">Domiciliar</option>
                <option value="presencial,online">Presencial e Online</option>
                <option value="presencial,domiciliar">Presencial e Domiciliar</option>
                <option value="online,domiciliar">Online e Domiciliar</option>
                <option value="presencial,online,domiciliar">Presencial, Online e Domiciliar</option>
              </Select>

              <label style={{ display: 'block', marginBottom: '2px', textAlign: 'left', fontWeight: 'bold' }}>Valor da Consulta:</label>
              <div style={{ marginBottom: '15px' }}>
                <Select value={r.valorConsulta === 'A negociar' ? 'A negociar' : 'Definir valor'} style={{ marginBottom: '10px' }}
                  onChange={e => r.setValorConsulta(e.target.value === 'A negociar' ? 'A negociar' : '')}>
                  <option value="Definir valor">Definir valor (R$)</option>
                  <option value="A negociar">Valor a negociar</option>
                </Select>
                {r.valorConsulta !== 'A negociar' && (
                  <Input type="number" placeholder="Ex: 150.00" value={r.valorConsulta} min="0" step="0.01"
                    required={r.valorConsulta !== 'A negociar'} onChange={e => r.setValorConsulta(e.target.value)} />
                )}
              </div>

              <HorariosSetup
                diasSemana={DIAS_SEMANA}
                diasAtendimento={r.diasAtendimento} setDiasAtendimento={r.setDiasAtendimento}
                horariosAtendimento={r.horariosAtendimento} setHorariosAtendimento={r.setHorariosAtendimento}
                handleDiaChange={r.handleDiaChange} handleHorarioChange={r.handleHorarioChange}
                handleAddHorario={r.handleAddHorario} handleRemoveHorario={r.handleRemoveHorario}
                formatarHorarioInput={r.formatarHorarioInput} normalizarHorario24h={r.normalizarHorario24h}
                ordenarHorariosDia={r.ordenarHorariosDia}
              />
            </>
          )}

          <Button type="submit">Criar Conta</Button>
          <LoginButton type="button" onClick={() => navigate('/Entrar')}>Já tem uma conta? Faça o Login</LoginButton>
        </Form>
      </Content>
      <Footer />
    </Container>
  );
};

export default Registro;
