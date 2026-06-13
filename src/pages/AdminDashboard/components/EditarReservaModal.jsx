import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const btn = (bg, color, border) => ({
  flex: 1, padding: '10px', background: bg, color, border: border || 'none',
  borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
});

const EditarReservaModal = ({ show, onClose, editReservaData, setEditReservaData, editReservaHorario, setEditReservaHorario, handleUpdateReserva }) => {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: 'white', borderRadius: '14px', padding: '28px', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 20px', color: '#1a1a1a' }}>Editar Consulta</h3>

        <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#555' }}>Nova Data</label>
        <div style={{ marginBottom: '16px', border: '1px solid #E0DFD9', borderRadius: '8px', padding: '8px' }}>
          <DatePicker
            selected={editReservaData} onChange={d => d && setEditReservaData(d)}
            minDate={new Date()} dateFormat="dd/MM/yyyy" locale="pt-BR"
            showPopperArrow={false} required inline
          />
        </div>

        <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#555' }}>Novo Horário</label>
        <input
          type="text" value={editReservaHorario} onChange={e => setEditReservaHorario(e.target.value)}
          maxLength={5} placeholder="HH:MM"
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '20px' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleUpdateReserva('confirmado')} style={btn('#1B4D3E', 'white')}>Confirmar</button>
          <button onClick={() => handleUpdateReserva()} style={btn('#F7F7F4', '#333', '1px solid #E0DFD9')}>Sugerir horário</button>
          <button onClick={onClose} style={{ padding: '10px 14px', background: 'none', border: '1px solid #E0DFD9', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default EditarReservaModal;
