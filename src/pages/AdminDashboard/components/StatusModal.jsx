import { useState, useEffect } from 'react';

const opcaoStyle = (ativo) => ({
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
  border: ativo ? '1.5px solid #1B4D3E' : '1px solid #E0DFD9',
  background: ativo ? '#E8F5EF' : 'white',
  marginBottom: '10px',
});

const btn = (bg, color, border) => ({
  flex: 1, padding: '10px', background: bg, color, border: border || 'none',
  borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
});

const StatusModal = ({ show, onClose, aceitandoConsultas, onSalvar }) => {
  const [selecao, setSelecao] = useState(true);

  useEffect(() => {
    if (show) setSelecao(!!aceitandoConsultas);
  }, [show, aceitandoConsultas]);

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: 'white', borderRadius: '14px', padding: '28px', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px', color: '#1a1a1a' }}>Status de atendimento</h3>
        <p style={{ fontSize: '12.5px', color: '#888', margin: '0 0 18px', lineHeight: 1.4 }}>
          Enquanto pausado, você não aparece na lista de profissionais para os pacientes.
        </p>

        <button style={opcaoStyle(selecao === true)} onClick={() => setSelecao(true)}>
          <span style={{ fontSize: '16px' }}>●</span>
          <div>
            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '600', color: '#1a1a1a' }}>Aceitando consultas</p>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#888' }}>Visível para pacientes agendarem</p>
          </div>
        </button>

        <button style={opcaoStyle(selecao === false)} onClick={() => setSelecao(false)}>
          <span style={{ fontSize: '16px' }}>⏸</span>
          <div>
            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '600', color: '#1a1a1a' }}>Pausar atendimentos</p>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#888' }}>Some da lista até você reativar</p>
          </div>
        </button>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button onClick={() => onSalvar(selecao)} style={btn('#1B9E5C', 'white')}>Salvar</button>
          <button onClick={onClose} style={{ padding: '10px 14px', background: 'none', border: '1px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#888' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
