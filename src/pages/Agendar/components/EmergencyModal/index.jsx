import React, { useRef } from 'react';

const OptionCard = ({ selected, onClick, icon, title, description }) => (
  <div
    onClick={onClick}
    style={{
      flex: 1,
      border: selected ? '2px solid #E8611A' : '2px solid #E5E0DA',
      borderRadius: '10px',
      padding: '14px',
      cursor: 'pointer',
      background: selected ? '#FFF7F0' : '#FAFAF8',
      transition: 'all 0.15s',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ fontWeight: '700', fontSize: '13px', color: selected ? '#C2410C' : '#333', fontFamily: 'Figtree, sans-serif' }}>
        {title}
      </span>
    </div>
    <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: '1.45', fontFamily: 'Figtree, sans-serif' }}>
      {description}
    </p>
  </div>
);

const Chip = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: '6px 13px',
      borderRadius: '99px',
      border: selected ? '1.5px solid #E8611A' : '1.5px solid #E0DFD9',
      background: selected ? '#FFF7F0' : 'white',
      color: selected ? '#C2410C' : '#555',
      fontSize: '12px',
      fontWeight: selected ? '600' : '400',
      cursor: 'pointer',
      fontFamily: 'Figtree, sans-serif',
      transition: 'all 0.12s',
    }}
  >
    {label}
  </button>
);

const TURNOS = [
  { key: 'manha', label: 'Manhã (6h–12h)' },
  { key: 'tarde', label: 'Tarde (12h–18h)' },
  { key: 'noite', label: 'Noite (18h–22h)' },
];

const DIAS = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
];

const EmergencyModal = ({
  show,
  onClose,
  onSubmit,
  urgenciaDescricao,
  setUrgenciaDescricao,
  urgenciaArquivo,
  setUrgenciaArquivo,
  urgenciaHorario,
  setUrgenciaHorario,
  urgenciaModalidade,
  setUrgenciaModalidade,
  urgenciaDia,
  setUrgenciaDia,
  urgenciaTurno,
  urgenciaDias,
  toggleTurno,
  toggleDia,
}) => {
  const fileInputRef = useRef();

  if (!show) return null;

  const handleFileClick = () => fileInputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setUrgenciaArquivo(file);
  };

  const pacienteEscolhe = urgenciaModalidade === 'paciente_escolhe';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>

        {/* Header */}
        <div style={{
          background: '#E8611A',
          padding: '24px',
          borderRadius: '12px 12px 0 0',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '14px', right: '16px',
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: 'white', fontSize: '18px', cursor: 'pointer',
              borderRadius: '6px', width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px 10px', fontSize: '18px' }}>⚡</div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              CONSULTA EMERGENTE
            </span>
          </div>
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 8px', fontFamily: 'Figtree, sans-serif' }}>
            Conte o que está acontecendo
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, lineHeight: '1.55' }}>
            Profissionais disponíveis vão receber sua solicitação. Você recebe retorno em até 1 hora.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} style={{ padding: '24px' }}>

          {/* Scheduling options */}
          <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 10px', color: '#1a1a1a', fontFamily: 'Figtree, sans-serif' }}>
            Quando você quer ser atendido?
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <OptionCard
              selected={!pacienteEscolhe}
              onClick={() => setUrgenciaModalidade('profissional_escolhe')}
              icon="🩺"
              title="Profissional encaixa"
              description="Informe sua disponibilidade e o profissional encontra o melhor horário."
            />
            <OptionCard
              selected={pacienteEscolhe}
              onClick={() => setUrgenciaModalidade('paciente_escolhe')}
              icon="📅"
              title="Eu escolho o dia"
              description="Prefiro um dia específico. O profissional confirma o horário."
            />
          </div>

          {/* Option 1: turno + dias */}
          {!pacienteEscolhe && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 8px', color: '#1a1a1a', fontFamily: 'Figtree, sans-serif' }}>
                Turno preferencial <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span>
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {TURNOS.map(t => (
                  <Chip
                    key={t.key}
                    label={t.label}
                    selected={urgenciaTurno.includes(t.key)}
                    onClick={() => toggleTurno(t.key)}
                  />
                ))}
              </div>

              <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 8px', color: '#1a1a1a', fontFamily: 'Figtree, sans-serif' }}>
                Melhores dias <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span>
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DIAS.map(d => (
                  <Chip
                    key={d.key}
                    label={d.label}
                    selected={urgenciaDias.includes(d.key)}
                    onClick={() => toggleDia(d.key)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Option 2: date + optional time */}
          {pacienteEscolhe && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px', color: '#1a1a1a' }}>
                Dia preferencial <span style={{ color: '#E8611A' }}>*</span>
              </label>
              <input
                type="date"
                value={urgenciaDia}
                onChange={(e) => setUrgenciaDia(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required={pacienteEscolhe}
                style={{
                  width: '100%', padding: '11px 12px', borderRadius: '8px',
                  border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
                  fontFamily: 'Figtree, sans-serif', outline: 'none', color: '#333'
                }}
              />
              <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', margin: '12px 0 8px', color: '#1a1a1a' }}>
                Horário preferencial <span style={{ color: '#999', fontWeight: 400 }}>(opcional)</span>
              </label>
              <input
                type="time"
                value={urgenciaHorario}
                onChange={(e) => setUrgenciaHorario(e.target.value)}
                style={{
                  width: '100%', padding: '11px 12px', borderRadius: '8px',
                  border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
                  fontFamily: 'Figtree, sans-serif', outline: 'none', color: '#333'
                }}
              />
            </div>
          )}

          {/* Description */}
          <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px', fontFamily: 'Figtree, sans-serif', color: '#1a1a1a' }}>
            Descreva sua situação
          </h3>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.5' }}>
            Quanto mais detalhes, mais rápido um profissional pode avaliar e responder.
          </p>
          <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px', color: '#1a1a1a' }}>
            O que você está sentindo? <span style={{ color: '#E8611A' }}>*</span>
          </label>
          <textarea
            value={urgenciaDescricao}
            onChange={(e) => setUrgenciaDescricao(e.target.value)}
            placeholder="Ex: tenho febre alta há 24h, com dor no peito ao respirar fundo. Já tomei dipirona, alívio momentâneo."
            required
            style={{
              width: '100%', padding: '12px', borderRadius: '8px',
              border: '1px solid #ddd', minHeight: '100px', fontSize: '14px',
              resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.5',
              fontFamily: 'Figtree, sans-serif', color: '#333', outline: 'none'
            }}
          />

          {/* Upload */}
          <p style={{ fontSize: '14px', fontWeight: '500', margin: '16px 0 8px', color: '#1a1a1a' }}>
            Anexar arquivos (opcional)
          </p>
          <div
            onClick={handleFileClick}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: '2px dashed #ddd', borderRadius: '10px',
              padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
              background: '#fafafa', transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E8611A'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
          >
            <div style={{ fontSize: '20px', marginBottom: '6px', color: '#888' }}>↑</div>
            <p style={{ fontWeight: '500', margin: '0 0 4px', fontSize: '13px', color: '#333' }}>
              {urgenciaArquivo ? urgenciaArquivo.name : 'Clique para enviar ou arraste arquivos'}
            </p>
            <p style={{ color: '#4CAF50', fontSize: '12px', margin: 0 }}>PNG, JPG, PDF até 10MB</p>
          </div>
          <input ref={fileInputRef} type="file" onChange={(e) => setUrgenciaArquivo(e.target.files[0])} accept="image/*,.pdf" style={{ display: 'none' }} />
          <p style={{ color: '#999', fontSize: '12px', margin: '4px 0 0' }}>
            Exames, fotos do sintoma, receitas, prontuário...
          </p>

          {/* SAMU */}
          <div style={{
            background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px',
            padding: '12px 14px', margin: '16px 0 20px', display: 'flex', gap: '10px', alignItems: 'flex-start'
          }}>
            <span style={{ color: '#3B82F6', fontSize: '15px', marginTop: '1px', flexShrink: 0 }}>ℹ</span>
            <p style={{ color: '#1D4ED8', fontSize: '13px', margin: 0, lineHeight: '1.55' }}>
              Em emergências com risco de vida, ligue <strong>192 (SAMU)</strong>. Esta funcionalidade é para casos urgentes mas não imediatos.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Figtree, sans-serif' }}
            >
              ← Voltar
            </button>
            <button
              type="submit"
              style={{
                background: 'none', border: '1.5px solid #E8611A',
                color: '#E8611A', padding: '10px 20px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'Figtree, sans-serif', transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E8611A'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#E8611A'; }}
            >
              ⚡ Enviar urgência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyModal;
