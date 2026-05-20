import axios from 'axios';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AVATAR_PALETTES = [
  { bg: '#CCEDE8', color: '#1A5C54' },
  { bg: '#D6E8FF', color: '#1A3F6F' },
  { bg: '#F5D6FF', color: '#5C1A7A' },
  { bg: '#FFE8CC', color: '#7A3D1A' },
  { bg: '#D6FFE8', color: '#1A5C35' },
];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

const getInitials = (name) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const sectionLabel = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: '10px',
  fontFamily: 'Figtree, sans-serif',
};

const divider = {
  height: '1px',
  background: '#F0EFE9',
  margin: '16px 0',
};

const StarRating = ({ media }) => {
  const stars = [1,2,3,4,5];
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {stars.map(n => (
        <span key={n} style={{ color: n <= Math.round(media) ? '#F59E0B' : '#D1D5DB', fontSize: '14px' }}>★</span>
      ))}
    </span>
  );
};

const ProfessionalInfo = ({ profissionalInfo, location, endereco }) => {
  if (!profissionalInfo) return null;

  const [avalMedia, setAvalMedia] = useState({ media: 0, total: 0 });
  const [avaliacoes, setAvaliacoes] = useState([]);

  useEffect(() => {
    if (!profissionalInfo?.id) return;
    axios.get(`http://localhost:3000/avaliacoes/media/${profissionalInfo.id}`)
      .then(r => setAvalMedia(r.data)).catch(() => {});
    axios.get(`http://localhost:3000/avaliacoes?profissional_id=${profissionalInfo.id}`)
      .then(r => setAvaliacoes(r.data || [])).catch(() => {});
  }, [profissionalInfo?.id]);

  const nomeCompleto = `${profissionalInfo.nome || ''} ${profissionalInfo.sobrenome || ''}`.trim();
  const av = getAvatarColor(nomeCompleto);
  const initials = getInitials(nomeCompleto);

  const modalidades = (() => {
    const raw = profissionalInfo.modalidade;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.filter(Boolean); } catch {}
    return String(raw).split(',').map(s => s.trim()).filter(Boolean);
  })();

  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      padding: '24px',
      width: '340px',
      minWidth: '300px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      fontFamily: 'Figtree, sans-serif',
      flexShrink: 0,
    }}>
      {/* Avatar + Nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: av.bg, color: av.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '18px', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '700', fontSize: '17px', color: '#1a1a1a' }}>{nomeCompleto}</span>
            <span style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#2563EB', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>✓</span>
            </span>
          </div>
          {profissionalInfo.tipoProfissional && (
            <p style={{ color: '#666', fontSize: '13px', margin: '2px 0 0' }}>
              {profissionalInfo.tipoProfissional}
            </p>
          )}
          <p style={{ color: '#888', fontSize: '12px', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <StarRating media={avalMedia.media} />
            <span>{avalMedia.media > 0 ? avalMedia.media.toFixed(1) : '—'} · {avalMedia.total} avalia{avalMedia.total !== 1 ? 'ções' : 'ção'}</span>
          </p>
        </div>
      </div>

      <div style={divider} />

      {/* Modalidade + Valor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '4px' }}>
        {modalidades.length > 0 && (
          <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '12px' }}>
            <p style={{ ...sectionLabel, textAlign: 'center' }}>Modalidade</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {modalidades.map((mod, i) => (
                <span key={i} style={{
                  display: 'inline-block', background: 'white',
                  border: '1px solid #D1FAE5', color: '#065F46',
                  borderRadius: '6px', padding: '4px 10px',
                  fontSize: '13px', fontWeight: '500', width: 'fit-content',
                }}>
                  {mod}
                </span>
              ))}
            </div>
          </div>
        )}
        <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: '90px' }}>
          <p style={{ ...sectionLabel, textAlign: 'center' }}>Valor</p>
          {profissionalInfo.valorConsulta && Number(profissionalInfo.valorConsulta) > 0 ? (
            <p style={{ fontWeight: '800', fontSize: '22px', color: '#1a1a1a', margin: 0, whiteSpace: 'nowrap' }}>
              R$ {Number(profissionalInfo.valorConsulta).toFixed(0)}
            </p>
          ) : (
            <p style={{ fontWeight: '600', fontSize: '13px', color: '#666', margin: 0, textAlign: 'center' }}>
              A negociar
            </p>
          )}
        </div>
      </div>

      {/* Sobre */}
      {profissionalInfo.descricao && (
        <>
          <div style={divider} />
          <p style={sectionLabel}>Sobre</p>
          <p style={{ color: '#444', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            {profissionalInfo.descricao}
          </p>
        </>
      )}

      {/* Localização */}
      {location && (
        <>
          <div style={divider} />
          <p style={sectionLabel}>Localização</p>
          <div style={{
            borderRadius: '10px', overflow: 'hidden',
            height: '160px', marginBottom: '8px',
            position: 'relative', zIndex: 0,
          }}>
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={[location.lat, location.lng]} />
            </MapContainer>
          </div>
          {endereco && (
            <p style={{ fontSize: '12px', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📍</span> {endereco}
            </p>
          )}
        </>
      )}

      {avaliacoes.length > 0 && (
        <>
          <div style={divider} />
          <p style={sectionLabel}>Avaliações ({avalMedia.total})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
            {avaliacoes.map(av => (
              <div key={av.id} style={{ background: '#F7F7F4', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}>
                    {av.paciente_nome} {av.paciente_sobrenome}
                  </span>
                  <span style={{ display: 'flex', gap: '1px' }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ color: n <= av.nota ? '#F59E0B' : '#D1D5DB', fontSize: '13px' }}>★</span>
                    ))}
                  </span>
                </div>
                {av.comentario && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{av.comentario}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfessionalInfo;
