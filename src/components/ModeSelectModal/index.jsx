import { Stethoscope, UserCircle } from 'lucide-react';

const OptionCard = ({ onClick, icon, title, description, color }) => (
  <div
    onClick={onClick}
    style={{
      border: `2px solid ${color}`,
      borderRadius: '10px',
      padding: '16px',
      cursor: 'pointer',
      background: '#FAFAF8',
      transition: 'all 0.15s',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}
  >
    <div style={{
      width: '38px', height: '38px', borderRadius: '8px',
      background: color, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a', margin: '0 0 2px', fontFamily: 'Figtree, sans-serif' }}>
        {title}
      </p>
      <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: '1.4', fontFamily: 'Figtree, sans-serif' }}>
        {description}
      </p>
    </div>
  </div>
);

const ModeSelectModal = ({ show, onSelect }) => {
  if (!show) return null;

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
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ background: '#1B4D3E', padding: '24px', borderRadius: '12px 12px 0 0' }}>
          <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '700', margin: '0 0 6px', fontFamily: 'Figtree, sans-serif' }}>
            Como você quer entrar?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
            Sua conta tem acesso como paciente e como profissional.
          </p>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <OptionCard
            onClick={() => onSelect('paciente')}
            icon={<UserCircle size={20} />}
            title="Entrar como Paciente"
            description="Agende consultas e acompanhe seu histórico."
            color="#2563EB"
          />
          <OptionCard
            onClick={() => onSelect('profissional')}
            icon={<Stethoscope size={20} />}
            title="Entrar como Profissional"
            description="Gerencie sua agenda e atenda pacientes."
            color="#1B4D3E"
          />
        </div>
      </div>
    </div>
  );
};

export default ModeSelectModal;
