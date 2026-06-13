import { Calendar, CalendarDays, CalendarPlus, ClipboardList, Clock, Home, LogOut, MapPin, Unlock, User, UserCircle, Zap } from 'lucide-react';

const navBtn = (activeScreen, key) => ({
  width: 'calc(100% - 16px)', margin: '1px 8px', padding: '10px 12px',
  background: activeScreen === key ? '#E8F5EF' : 'none',
  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
  gap: '10px', borderRadius: '8px',
  color: activeScreen === key ? '#1B4D3E' : '#555',
  fontWeight: activeScreen === key ? '600' : '400',
  fontSize: '14px', fontFamily: 'Figtree, sans-serif', textAlign: 'left',
});

const Sidebar = ({ user, av, initials, activeScreen, irPara, navigate, logout, pendentes, urgentes, vagasCount }) => {
  const navItems = [
    { key: 'home',         icon: <Home size={16} />,          label: 'Início' },
    { key: 'agenda',       icon: <Calendar size={16} />,      label: 'Agenda' },
    { key: 'horarios',     icon: <CalendarDays size={16} />,  label: 'Editar Horários' },
    { key: 'criar',        icon: <CalendarPlus size={16} />,  label: 'Criar Consulta' },
    { key: 'solicitacoes', icon: <ClipboardList size={16} />, label: 'Solicitações', badge: pendentes || null, badgeColor: '#1B4D3E' },
    { key: 'urgencias',    icon: <Zap size={16} />,           label: 'Urgências',    badge: urgentes || null,   badgeColor: '#E8611A' },
    { key: 'vagas',        icon: <Unlock size={16} />,        label: 'Vagas',        badge: vagasCount || null, badgeColor: '#7C3AED' },
    { key: 'historico',    icon: <Clock size={16} />,         label: 'Histórico' },
    { key: 'mapa',         icon: <MapPin size={16} />,        label: 'Editar Mapa' },
    { key: 'informacoes',  icon: <User size={16} />,          label: 'Informações' },
  ];

  return (
    <aside style={{ width: '260px', background: 'white', height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #F0EFE9', zIndex: 100 }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #F0EFE9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: '#1B4D3E', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>Aa</div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '13px', color: '#1a1a1a', margin: 0 }}>Agende Aqui</p>
            <p style={{ fontSize: '10px', color: '#888', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Saúde sob demanda</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EFE9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nome ? `Dr. ${user.nome} ${user.sobrenome || ''}` : 'Profissional'}
            </p>
            <p style={{ fontSize: '11px', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.tipoProfissional || 'Especialidade'}
            </p>
          </div>
        </div>
        <div style={{ background: '#D1FAE5', borderRadius: '6px', padding: '4px 10px', width: 'fit-content' }}>
          <span style={{ fontSize: '11px', color: '#065F46', fontWeight: '600' }}>● Aceitando consultas</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {navItems.map(item => (
          <button key={item.key} onClick={() => irPara(item.key)} style={navBtn(activeScreen, item.key)}>
            <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge ? (
              <span style={{ background: item.badgeColor, color: 'white', borderRadius: '10px', padding: '2px 7px', fontSize: '11px', fontWeight: '700' }}>{item.badge}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid #F0EFE9', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button onClick={() => navigate('/EmpresasProfissionais')} style={{ ...navBtn(activeScreen, '_'), color: '#555' }}>
          <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCircle size={16} /></span>
          <span>Modo paciente</span>
        </button>
        <button onClick={() => { logout(); navigate('/Entrar'); }} style={{ ...navBtn(activeScreen, '_'), color: '#EF4444' }}>
          <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut size={16} /></span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
