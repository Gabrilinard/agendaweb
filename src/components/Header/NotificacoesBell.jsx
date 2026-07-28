import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotificacoesPaciente, marcarNotificacoesPacienteLidas } from '../../api/notificacoesPaciente';
import { BellBtn, NotifBadge } from './style';

const REFRESH_INTERVAL_MS = 20000;

const formatarQuando = (isoString) => {
  const data = new Date(isoString);
  const diffMin = Math.round((Date.now() - data.getTime()) / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  return data.toLocaleDateString('pt-BR');
};

const NotificacoesBell = ({ usuarioId }) => {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  useEffect(() => {
    if (!usuarioId) return;
    const carregar = async () => {
      try {
        const { data } = await getNotificacoesPaciente(usuarioId);
        setNotificacoes(data);
      } catch { /* sino não é crítico para o restante da página */ }
    };
    carregar();
    const interval = setInterval(carregar, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [usuarioId]);

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
    if (abrindo && naoLidas > 0) {
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: 1 })));
      marcarNotificacoesPacienteLidas(usuarioId).catch(() => {});
    }
  };

  const handleClickNotificacao = () => {
    setAberto(false);
    navigate('/minhas-consultas');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <BellBtn onClick={handleAbrir} aria-label="Notificações">
        <Bell size={19} />
        {naoLidas > 0 && <NotifBadge />}
      </BellBtn>

      {aberto && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '320px',
          background: 'white', borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
          border: '1px solid #E5E0DA', zIndex: 300, overflow: 'hidden',
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
              <button
                key={n.id}
                onClick={handleClickNotificacao}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', border: 'none',
                  borderBottom: '1px solid #F5F5F2', background: n.lida ? 'white' : '#F0F9F5',
                  padding: '12px 16px', cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', color: '#1a1a1a', lineHeight: '1.5' }}>{n.mensagem}</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999' }}>{formatarQuando(n.created_at)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacoesBell;
