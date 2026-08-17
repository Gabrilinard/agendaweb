import styled from 'styled-components';
import { getAvaliacoesByProfissional, getMediaByProfissional } from '../../api';
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

const CardOuter = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  font-family: Figtree, sans-serif;
  flex-shrink: 0;
  overflow: hidden;
  border: 1.5px solid #F0EFE9;
  align-self: flex-start;

  @media (max-width: 768px) {
    max-width: 100%;
    flex-shrink: 1;
  }
`;

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
    getMediaByProfissional(profissionalInfo.id)
      .then(r => setAvalMedia({ ...r.data, media: parseFloat(r.data.media) || 0 })).catch(() => {});
    getAvaliacoesByProfissional(profissionalInfo.id)
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

  const publicos = (() => {
    const raw = profissionalInfo.publicoAtendido;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.filter(Boolean); } catch {}
    return String(raw).split(',').map(s => s.trim()).filter(Boolean);
  })();

  const horarioEntries = (() => {
    const raw = profissionalInfo.horariosAtendimento;
    if (!raw) return [];
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Object.entries(obj)
        .map(([dia, horas]) => {
          const arr = Array.isArray(horas) ? horas.filter(Boolean) : [];
          if (!arr.length) return null;
          const abrev = dia.slice(0, 3);
          return arr.length === 1
            ? `${abrev}: ${arr[0]}`
            : `${abrev}: ${arr[0]} – ${arr[arr.length - 1]}`;
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  })();

  return (
    <CardOuter>
      <div style={{
        background: `linear-gradient(135deg, ${av.bg} 0%, ${av.bg}cc 100%)`,
        padding: '24px 24px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '14px',
          background: 'white', color: av.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '800', fontSize: '20px', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '800', fontSize: '17px', color: '#1a1a1a', lineHeight: 1.2 }}>{nomeCompleto}</span>
            <span style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#2563EB', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>✓</span>
            </span>
          </div>
          {profissionalInfo.tipoProfissional && (
            <p style={{ color: '#444', fontSize: '13px', margin: '4px 0 0', fontWeight: '500' }}>
              {profissionalInfo.tipoProfissional}
            </p>
          )}
          <p style={{ color: '#555', fontSize: '12px', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <StarRating media={avalMedia.media} />
            <span style={{ fontWeight: '600' }}>{avalMedia.media > 0 ? avalMedia.media.toFixed(1) : '—'}</span>
            <span style={{ color: '#888' }}>· {avalMedia.total} avalia{avalMedia.total !== 1 ? 'ções' : 'ção'}</span>
          </p>
        </div>
      </div>

      {/* Corpo do card */}
      <div style={{ padding: '20px 24px 24px' }}>

      <div style={divider} />

      {/* Modalidades + Valores separados */}
      {modalidades.length > 0 && (
        <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '12px', marginBottom: '4px' }}>
          <p style={{ ...sectionLabel, textAlign: 'center' }}>Modalidades e valores</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {modalidades.map((mod, i) => {
              const key = String(mod).trim().toLowerCase();
              const valorField = key === 'presencial' ? profissionalInfo.valorPresencial
                : key === 'online' ? profissionalInfo.valorOnline
                : key === 'domiciliar' ? profissionalInfo.valorDomiciliar
                : null;
              const valor = valorField || profissionalInfo.valorConsulta;
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'white', border: '1px solid #D1FAE5', borderRadius: '6px',
                  padding: '6px 12px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#065F46' }}>{label}</span>
                  {valor && valor !== 'A negociar' && Number(valor) > 0 ? (
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a1a' }}>
                      R$ {Number(valor).toFixed(0)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>A negociar</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Público atendido */}
      {publicos.length > 0 && (
        <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '12px', marginBottom: '4px' }}>
          <p style={{ ...sectionLabel, textAlign: 'center' }}>Público atendido</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
            {publicos.map((pub, i) => (
              <span key={i} style={{
                display: 'inline-block', background: 'white',
                border: '1px solid #BFDBFE', color: '#1E40AF',
                borderRadius: '6px', padding: '4px 10px',
                fontSize: '13px', fontWeight: '500', width: 'fit-content',
              }}>
                {pub}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Horários de atendimento */}
      {horarioEntries.length > 0 && (
        <div style={{ background: '#F7F7F4', borderRadius: '10px', padding: '12px', marginBottom: '4px' }}>
          <p style={{ ...sectionLabel, textAlign: 'center' }}>Horários de atendimento</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
            {horarioEntries.map((entry, i) => (
              <span key={i} style={{
                display: 'inline-block', background: 'white',
                border: '1px solid #D1FAE5', color: '#065F46',
                borderRadius: '6px', padding: '4px 10px',
                fontSize: '12.5px', fontWeight: '600', width: 'fit-content',
              }}>
                {entry}
              </span>
            ))}
          </div>
        </div>
      )}

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
    </CardOuter>
  );
};

export default ProfessionalInfo;
