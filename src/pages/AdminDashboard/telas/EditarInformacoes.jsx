import { updateInformacoes } from '../api';
import { MapPin, MonitorPlay, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';

const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };
const inputS = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #E0DFD9',
  borderRadius: '8px', fontSize: '14px', fontFamily: 'Figtree, sans-serif',
  outline: 'none', color: '#1a1a1a', background: 'white', boxSizing: 'border-box',
};
const labelS = { fontSize: '13px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '6px' };

const PUBLICOS = ['Crianças', 'Adolescentes', 'Adultos', 'Idosos', 'Gestantes'];
const ESPECIALIDADES = [
  'Clínico Geral','Cardiologista','Dermatologista','Endocrinologista','Fisioterapeuta',
  'Fonoaudiólogo','Gastroenterologista','Geriatra','Ginecologista','Neurologista',
  'Nutricionista','Oftalmologista','Ortopedista','Otorrinolaringologista','Pediatra',
  'Psiquiatra','Psicólogo','Reumatologista','Urologista','Outro',
];

const Toggle = ({ checked, onChange }) => (
  <div onClick={() => onChange(!checked)} style={{
    width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
    background: checked ? '#1B4D3E' : '#D1D5DB', cursor: 'pointer',
    position: 'relative', transition: 'background 0.2s',
  }}>
    <div style={{
      position: 'absolute', top: '3px',
      left: checked ? '23px' : '3px',
      width: '18px', height: '18px', borderRadius: '50%',
      background: 'white', transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    }} />
  </div>
);

const MOD_ICONS = {
  presencial: Users,
  online: MonitorPlay,
  domiciliar: MapPin,
};

const ModalIcon = ({ type, active }) => {
  const Icon = MOD_ICONS[type] || Users;
  return (
    <div style={{
      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
      background: active ? '#1B4D3E' : '#E8E8E2',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: active ? 'white' : '#888',
    }}>
      <Icon size={17} />
    </div>
  );
};

const EditarInformacoes = ({
  editTipoProfissional,
  editNumeroConselho,
  editDescricao, setEditDescricao,
  editPublicoAtendido, setEditPublicoAtendido,
  editModalidade, setEditModalidade,
  editValorConsulta, setEditValorConsulta,
  diasSemana, editDiasAtendimento, editHorariosAtendimento,
  handleEditDiaChange, handleEditHorarioChange, handleEditRemoveHorario, handleEditAddHorario,
  handleEditarInformacoes,
  user,
}) => {
  const { success, error: showError } = useNotification();

  // ── Local state ───────────────────────────────────────────
  const [nomeCompleto, setNomeCompleto] = useState(`${user?.nome || ''} ${user?.sobrenome || ''}`.trim());
  const [especialidade, setEspecialidade] = useState(editTipoProfissional || user?.tipoProfissional || '');
  const [registro, setRegistro] = useState(user?.registroProfissional || '');
  const [sobre, setSobre] = useState(editDescricao || '');
  const [aceitarEmergentes, setAceitarEmergentes] = useState(true);

  // Público atendido (multi-toggle)
  const [publicoSel, setPublicoSel] = useState(() => {
    if (!editPublicoAtendido) return [];
    return editPublicoAtendido.split(',').map(s => s.trim()).filter(Boolean);
  });

  // Modalidades
  const [modalidades, setModalidades] = useState(() => {
    const mods = String(editModalidade || '').split(',').map(s => s.trim());
    return {
      presencial: { active: mods.includes('presencial'), valor: '', duracao: '30' },
      online:     { active: mods.includes('online'),     valor: '', duracao: '30' },
      domiciliar: { active: mods.includes('domiciliar'), valor: '', duracao: '60' },
    };
  });

  // Formações (local only)
  const [formacoes, setFormacoes] = useState([
    { id: 1, titulo: '', instituicao: '', periodo: '', editing: false },
  ]);

  useEffect(() => { if (editTipoProfissional) setEspecialidade(editTipoProfissional); }, [editTipoProfissional]);
  useEffect(() => { setSobre(editDescricao || ''); }, [editDescricao]);

  const togglePublico = (p) =>
    setPublicoSel(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const toggleMod = (key) =>
    setModalidades(prev => ({ ...prev, [key]: { ...prev[key], active: !prev[key].active } }));

  const setModValor = (key, val) =>
    setModalidades(prev => ({ ...prev, [key]: { ...prev[key], valor: val } }));

  const handleSalvar = async () => {
    const activeMods = Object.entries(modalidades).filter(([, v]) => v.active).map(([k]) => k);
    const modalStr = activeMods.join(',');
    const valorStr = modalidades.presencial.valor || modalidades.online.valor || editValorConsulta || '';

    setEditDescricao(sobre);
    setEditPublicoAtendido(publicoSel.join(','));
    setEditModalidade(modalStr);
    setEditValorConsulta(valorStr);

    try {
      await updateInformacoes(user?.id, {
        tipoProfissional: especialidade,
        descricao: sobre,
        publicoAtendido: publicoSel.join(','),
        modalidade: modalStr,
        valorConsulta: valorStr,
        diasAtendimento: editDiasAtendimento,
        horariosAtendimento: editHorariosAtendimento,
      });
      success('Informações salvas com sucesso!');
    } catch (e) { showError(e?.response?.data?.error || 'Erro ao salvar informações.'); }
  };

  const handleDescartar = () => {
    setSobre(editDescricao || '');
    setNomeCompleto(`${user?.nome || ''} ${user?.sobrenome || ''}`.trim());
    setEspecialidade(user?.tipoProfissional || '');
    setRegistro(user?.registroProfissional || '');
    setPublicoSel(editPublicoAtendido ? editPublicoAtendido.split(',').map(s => s.trim()).filter(Boolean) : []);
  };

  const addFormacao = () => setFormacoes(prev => [...prev, { id: Date.now(), titulo: '', instituicao: '', periodo: '', editing: true }]);
  const removeFormacao = (id) => setFormacoes(prev => prev.filter(f => f.id !== id));
  const updateFormacao = (id, field, val) => setFormacoes(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f));
  const toggleEditFormacao = (id) => setFormacoes(prev => prev.map(f => f.id === id ? { ...f, editing: !f.editing } : f));

  const initials = nomeCompleto.trim().split(' ').filter(Boolean).reduce((acc, w, i, arr) => i === 0 || i === arr.length - 1 ? acc + w[0].toUpperCase() : acc, '');
  const MOD_LABELS = { presencial: 'Presencial', online: 'Online', domiciliar: 'Visita domiciliar' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Figtree, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Informações do perfil</h1>
        <p style={{ color: '#888', fontSize: '14px', margin: '6px 0 24px', maxWidth: '480px' }}>
          Atualize seus dados públicos, modalidades e valores. O que estiver aqui é o que pacientes veem.
        </p>
      </div>

      {/* Two-column body */}
      <div style={{ flex: 1, padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'flex-start', paddingBottom: '90px' }}>
        {/* ── Left: Perfil público ── */}
        <div style={CARD}>
          <div style={{ padding: '22px 26px 0', borderBottom: '1px solid #F0EFE9', paddingBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Perfil público</h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#888' }}>Como você aparece no perfil para pacientes.</p>
          </div>
          <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FCDBB5', color: '#7A4100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', flexShrink: 0 }}>
                {initials || '?'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>{nomeCompleto || 'Profissional'}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{especialidade || 'Especialidade'}</p>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label style={labelS}>Nome completo</label>
              <input type="text" value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} style={inputS} placeholder="Seu nome" />
            </div>

            {/* Especialidade + Registro */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelS}>Especialidade</label>
                {editTipoProfissional && editTipoProfissional !== especialidade && (
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888' }}>
                    Salvo: <strong style={{ color: '#1B4D3E' }}>{editTipoProfissional}</strong>
                  </p>
                )}
                <select value={especialidade} onChange={e => setEspecialidade(e.target.value)} style={{ ...inputS, cursor: 'pointer' }}>
                  <option value="">Selecione...</option>
                  {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label style={labelS}>Número do conselho</label>
                {editNumeroConselho ? (
                  <div style={{ padding: '10px 14px', background: '#F7F7F4', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#1B4D3E', fontSize: '13px' }}>✓</span>
                    {editNumeroConselho}
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#aaa', fontWeight: '400' }}>cadastrado no registro</span>
                  </div>
                ) : (
                  <div style={{ padding: '10px 14px', background: '#F7F7F4', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '13px', color: '#aaa' }}>
                    Não informado no cadastro
                  </div>
                )}
              </div>
            </div>

            {/* Sobre você */}
            <div>
              <label style={labelS}>Sobre você</label>
              <textarea
                value={sobre}
                onChange={e => setSobre(e.target.value)}
                placeholder="Descreva sua experiência e abordagem..."
                rows={4}
                style={{ ...inputS, resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>

            {/* Público atendido */}
            <div>
              <label style={labelS}>Público atendido</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PUBLICOS.map(p => {
                  const active = publicoSel.includes(p);
                  return (
                    <button key={p} onClick={() => togglePublico(p)} style={{
                      padding: '9px 18px', borderRadius: '20px', border: '1.5px solid',
                      borderColor: active ? '#1B4D3E' : '#E0DFD9',
                      background: active ? '#1B4D3E' : 'white',
                      color: active ? 'white' : '#555',
                      fontSize: '14px', fontWeight: active ? '600' : '400',
                      cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
                      transition: 'all 0.15s',
                    }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Modalidades & valores */}
          <div style={CARD}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F0EFE9' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>Modalidades & valores</h2>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#888' }}>Configure presencial, online e preços.</p>
            </div>
            <div style={{ padding: '10px 0' }}>
              {Object.entries(modalidades).map(([key, mod]) => (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px', borderBottom: '1px solid #F7F7F4',
                  opacity: mod.active ? 1 : 0.55,
                }}>
                  <ModalIcon type={key} active={mod.active} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>{MOD_LABELS[key]}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ fontSize: '12px', color: '#888' }}>R$</span>
                      <input
                        type="number" min="0"
                        value={mod.valor}
                        onChange={e => setModValor(key, e.target.value)}
                        placeholder="—"
                        style={{ width: '64px', padding: '3px 6px', border: '1px solid #E0DFD9', borderRadius: '5px', fontSize: '12px', fontFamily: 'Figtree, sans-serif', background: 'white' }}
                      />
                      <span style={{ fontSize: '12px', color: '#888' }}>· {mod.duracao}min</span>
                    </div>
                  </div>
                  <Toggle checked={mod.active} onChange={() => toggleMod(key)} />
                </div>
              ))}

              {/* Aceitar emergentes */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 20px', margin: '6px 10px 0',
                background: aceitarEmergentes ? '#FFFBEB' : '#F7F7F4',
                borderRadius: '10px', border: `1.5px solid ${aceitarEmergentes ? '#FDE68A' : '#E0DFD9'}`,
                cursor: 'pointer',
              }}>
                <input type="checkbox" checked={aceitarEmergentes} onChange={e => setAceitarEmergentes(e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: '#E8611A', marginTop: '2px', cursor: 'pointer', flexShrink: 0 }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: aceitarEmergentes ? '#E8611A' : '#555' }}>
                    Aceitar consultas emergentes
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>
                    Receba notificação para casos urgentes (até 1h de janela)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Formação & certificações */}
          <div style={CARD}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F0EFE9' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>Formação & certificações</h2>
            </div>
            <div style={{ padding: '8px 0' }}>
              {formacoes.map(f => (
                <div key={f.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F7F7F4' }}>
                  {f.editing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="text" placeholder="Ex: Medicina, Residência..." value={f.titulo} onChange={e => updateFormacao(f.id, 'titulo', e.target.value)} style={{ ...inputS, padding: '7px 10px', fontSize: '13px' }} />
                      <input type="text" placeholder="Instituição" value={f.instituicao} onChange={e => updateFormacao(f.id, 'instituicao', e.target.value)} style={{ ...inputS, padding: '7px 10px', fontSize: '13px' }} />
                      <input type="text" placeholder="Período (ex: 2008-2014)" value={f.periodo} onChange={e => updateFormacao(f.id, 'periodo', e.target.value)} style={{ ...inputS, padding: '7px 10px', fontSize: '13px' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => toggleEditFormacao(f.id)} style={{ padding: '6px 14px', background: '#1B4D3E', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>Salvar</button>
                        <button onClick={() => removeFormacao(f.id)} style={{ padding: '6px 12px', background: 'none', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>Remover</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#E8F5EF', color: '#1B4D3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>○</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>{f.titulo || 'Sem título'}</p>
                        {f.instituicao && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{f.instituicao}</p>}
                        {f.periodo && <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#aaa' }}>{f.periodo}</p>}
                      </div>
                      <button onClick={() => toggleEditFormacao(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '14px', padding: '2px 4px', flexShrink: 0 }}>✏</button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addFormacao} style={{ width: '100%', padding: '12px 20px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#1B4D3E', cursor: 'pointer', fontFamily: 'Figtree, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                + Adicionar formação
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '260px', right: 0,
        background: 'white', borderTop: '1px solid #F0EFE9',
        padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px',
        zIndex: 50, fontFamily: 'Figtree, sans-serif',
      }}>
        <button onClick={handleDescartar} style={{ padding: '10px 22px', background: 'none', border: '1.5px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', color: '#555', cursor: 'pointer', fontFamily: 'Figtree, sans-serif', fontWeight: '500' }}>
          Descartar mudanças
        </button>
        <button onClick={handleSalvar} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 26px', background: '#1B4D3E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif' }}>
          ✓ Salvar tudo
        </button>
      </div>
    </div>
  );
};

export default EditarInformacoes;
