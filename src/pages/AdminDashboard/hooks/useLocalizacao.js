import { useState } from 'react';
import { updateLocalizacao } from '../api';

const ESTADOS = {
  acre:'AC', alagoas:'AL', 'amapá':'AP', amazonas:'AM', bahia:'BA', 'ceará':'CE',
  'distrito federal':'DF', 'espírito santo':'ES', 'goiás':'GO', 'maranhão':'MA',
  'mato grosso':'MT', 'mato grosso do sul':'MS', 'minas gerais':'MG', 'pará':'PA',
  'paraíba':'PB', 'paraná':'PR', pernambuco:'PE', 'piauí':'PI', 'rio de janeiro':'RJ',
  'rio grande do norte':'RN', 'rio grande do sul':'RS', 'rondônia':'RO', roraima:'RR',
  'santa catarina':'SC', 'são paulo':'SP', sergipe:'SE', tocantins:'TO',
};

const converterEstado = (nome) => {
  if (!nome) return null;
  const n = nome.toLowerCase().trim();
  if (ESTADOS[n]) return ESTADOS[n];
  if (nome.length === 2) return nome.toUpperCase();
  return null;
};

const useLocalizacao = ({ success, warning, showError }) => {
  const [editLatitude, setEditLatitude] = useState(null);
  const [editLongitude, setEditLongitude] = useState(null);
  const [editCidade, setEditCidade] = useState('');
  const [editUfRegiao, setEditUfRegiao] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);

  const carregarDados = (data, userId) => {
    setEditingUserId(userId);
    setEditLatitude(data.latitude ? parseFloat(data.latitude) : null);
    setEditLongitude(data.longitude ? parseFloat(data.longitude) : null);
    if (data.cidade) setEditCidade(data.cidade);
    if (data.ufRegiao) setEditUfRegiao(data.ufRegiao);
  };

  const buscarLocalizacao = async (lat, lng) => {
    try {
      const { address } = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`
      ).then(r => r.json());
      if (address) {
        let uf = address.state_code || address.state;
        if (uf) {
          let u = uf.replace(/^[A-Z]{2}-/, '').toUpperCase();
          if (u.length > 2) { const s = converterEstado(u); if (s) u = s; }
          setEditUfRegiao(u);
        }
        const cidade = address.city || address.town || address.village || address.municipality || address.county || '';
        if (cidade) setEditCidade(cidade);
      }
    } catch (e) { console.error(e); }
  };

  const handleMapClick = (lat, lng) => {
    setEditLatitude(lat); setEditLongitude(lng); buscarLocalizacao(lat, lng);
  };

  const handleEditarMapa = async () => {
    if (!editingUserId || !editLatitude || !editLongitude) { warning('Selecione uma localização.'); return; }
    try {
      await updateLocalizacao(editingUserId, { latitude: editLatitude, longitude: editLongitude, cidade: editCidade, ufRegiao: editUfRegiao });
      success('Localização atualizada!');
    } catch { showError('Erro ao atualizar localização.'); }
  };

  return {
    editLatitude, editLongitude, editCidade, editUfRegiao, editingUserId,
    setEditCidade, setEditUfRegiao, setEditingUserId,
    carregarDados, handleMapClick, handleEditarMapa,
  };
};

export default useLocalizacao;
