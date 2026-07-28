import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const formatarQuando = (isoString) => {
  const data = new Date(isoString);
  const diffMin = Math.round((Date.now() - data.getTime()) / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  return data.toLocaleDateString('pt-BR');
};

const NotificacoesBell = ({ notificacoes = [], count = 0, onAbrir }) => {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const handleAbrir = () => {
    const abrindo = !aberto;
    setAberto(abrindo);
    if (abrindo) onAbrir?.();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleAbrir}
        aria-label="Notificações"
        style={{
          position: 'relative', width: '38px', height: '38px', borderRadius: '8px',
          border: '1px solid #E0DFD9', background: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Bell size={17} color="#555" />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#2563EB', color: 'white', borderRadius: '10px',
            minWidth: '17px', height: '17px', fontSize: '10px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {aberto && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '340px',
          background: 'white', borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
          border: '1px solid #F0EFE9', zIndex: 1300, overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0EFE9', fontWeight: '700', fontSize: '13px', color: '#1a1a1a' }}>
            Notificações
          </div>
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notificacoes.length === 0 ? (
              <p style={{ margin: 0, padding: '24px 16px', textAlign: 'center', fontSize: '13px', color: '#aaa' }}>
                Nenhuma notificação por aqui ainda.
              </p>
            ) : notificacoes.map(n => (
              <div
                key={n.id}
                style={{
                  borderBottom: '1px solid #F5F5F2', background: n.lida ? 'white' : '#F0F9F5',
                  padding: '12px 16px',
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', color: '#1a1a1a', lineHeight: '1.5' }}>{n.mensagem}</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999' }}>{formatarQuando(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacoesBell;
