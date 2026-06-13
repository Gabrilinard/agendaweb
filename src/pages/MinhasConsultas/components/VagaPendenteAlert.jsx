import { Calendar } from 'lucide-react';

const VagaPendenteAlert = ({ notif, onAceitar, onRecusar, aceitando }) => (
  <div style={{
    background: '#FFF7F0', border: '1.5px solid #FED7B0', borderRadius: '12px',
    padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px',
    fontFamily: 'Figtree, sans-serif',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px', background: '#FFF3EE',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Calendar size={20} color="#E8611A" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#C2410C' }}>
        Uma vaga se abriu!
      </p>
      <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#7C2D12' }}>
        Dr. {notif.prof_nome} {notif.prof_sobrenome} · {notif.dia} às {notif.horario}
      </p>
    </div>
    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
      <button
        onClick={() => onRecusar(notif)}
        style={{
          padding: '8px 14px', background: 'none', border: '1.5px solid #FED7B0',
          borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#7C2D12',
          cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
        }}
      >
        Não, obrigado
      </button>
      <button
        onClick={() => onAceitar(notif)}
        disabled={aceitando}
        style={{
          padding: '8px 18px', background: '#E8611A', border: 'none', borderRadius: '8px',
          fontSize: '13px', fontWeight: '700', color: 'white', cursor: 'pointer',
          fontFamily: 'Figtree, sans-serif', opacity: aceitando ? 0.7 : 1,
        }}
      >
        {aceitando ? 'Aceitando…' : 'Aceitar vaga'}
      </button>
    </div>
  </div>
);

export default VagaPendenteAlert;
