import React, { useEffect, useRef } from 'react';

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
}) => {
  const fileInputRef = useRef();

  useEffect(() => {
    if (show) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setUrgenciaHorario(`${h}:${m}`);
    }
  }, [show]);

  if (!show) return null;

  const handleFileClick = () => fileInputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setUrgenciaArquivo(file);
  };

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
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>

        {/* Header laranja */}
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
              lineHeight: 1
            }}
          >×</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)', borderRadius: '8px',
              padding: '6px 10px', fontSize: '18px'
            }}>⚡</div>
            <span style={{
              color: 'rgba(255,255,255,0.85)', fontSize: '11px',
              fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px'
            }}>CONSULTA EMERGENTE</span>
          </div>

          <h2 style={{
            color: 'white', fontSize: '22px', fontWeight: '700',
            margin: '0 0 8px', fontFamily: 'Figtree, sans-serif'
          }}>
            Conte o que está acontecendo
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.85)', fontSize: '13px',
            margin: 0, lineHeight: '1.55'
          }}>
            Profissionais disponíveis vão receber sua solicitação. Você recebe retorno em até 1 hora — sem precisar ir à emergência.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} style={{ padding: '24px' }}>
          <h3 style={{
            fontSize: '17px', fontWeight: '600', margin: '0 0 4px',
            fontFamily: 'Figtree, sans-serif', color: '#1a1a1a'
          }}>
            Descreva sua situação
          </h3>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 18px', lineHeight: '1.5' }}>
            Quanto mais detalhes, mais rápido um profissional pode avaliar e responder.
          </p>

          <label style={{
            fontSize: '14px', fontWeight: '500', display: 'block',
            marginBottom: '8px', color: '#1a1a1a'
          }}>
            O que você está sentindo? <span style={{ color: '#E8611A' }}>*</span>
          </label>
          <textarea
            value={urgenciaDescricao}
            onChange={(e) => setUrgenciaDescricao(e.target.value)}
            placeholder="Ex: tenho febre alta há 24h, com dor no peito ao respirar fundo. Já tomei dipirona, alívio momentâneo."
            required
            style={{
              width: '100%', padding: '12px', borderRadius: '8px',
              border: '1px solid #ddd', minHeight: '110px', fontSize: '14px',
              resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.5',
              fontFamily: 'Figtree, sans-serif', color: '#333', outline: 'none'
            }}
          />

          {/* Upload */}
          <p style={{
            fontSize: '14px', fontWeight: '500', margin: '18px 0 8px', color: '#1a1a1a'
          }}>
            Anexar arquivos (opcional)
          </p>

          <div
            onClick={handleFileClick}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: '2px dashed #ddd', borderRadius: '10px',
              padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
              background: '#fafafa', transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E8611A'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
          >
            <div style={{ fontSize: '22px', marginBottom: '8px', color: '#888' }}>↑</div>
            <p style={{ fontWeight: '500', margin: '0 0 4px', fontSize: '14px', color: '#333' }}>
              {urgenciaArquivo ? urgenciaArquivo.name : 'Clique para enviar ou arraste arquivos'}
            </p>
            <p style={{ color: '#4CAF50', fontSize: '12px', margin: 0 }}>
              PNG, JPG, PDF até 10MB cada
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setUrgenciaArquivo(e.target.files[0])}
            accept="image/*,.pdf"
            style={{ display: 'none' }}
          />

          <div style={{ marginTop: '8px' }}>
            <button
              type="button"
              style={{
                background: 'none', border: 'none', color: '#4CAF50',
                fontSize: '13px', cursor: 'pointer', padding: '4px 0',
                textDecoration: 'none', fontWeight: '500'
              }}
            >
              + usar arquivos de exemplo
            </button>
            <p style={{ color: '#999', fontSize: '12px', margin: '2px 0 0' }}>
              Exames, fotos do sintoma, receitas, prontuário...
            </p>
          </div>

          {/* Aviso SAMU */}
          <div style={{
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            borderRadius: '8px', padding: '12px 14px',
            margin: '18px 0 24px', display: 'flex', gap: '10px', alignItems: 'flex-start'
          }}>
            <span style={{ color: '#3B82F6', fontSize: '15px', marginTop: '1px', flexShrink: 0 }}>ℹ</span>
            <p style={{ color: '#1D4ED8', fontSize: '13px', margin: 0, lineHeight: '1.55' }}>
              Em emergências com risco de vida, ligue <strong>192 (SAMU)</strong>. Esta funcionalidade é para casos urgentes mas não imediatos.
            </p>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none', border: 'none', fontSize: '14px',
                cursor: 'pointer', color: '#555', display: 'flex',
                alignItems: 'center', gap: '6px', fontFamily: 'Figtree, sans-serif'
              }}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E8611A';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#E8611A';
              }}
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
