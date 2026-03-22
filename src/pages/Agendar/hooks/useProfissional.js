import { useState, useEffect } from 'react';
import axios from 'axios';
import { agendarService } from '../services/api';

export const useProfissional = (nomeProfissional) => {
  const [profissionalInfo, setProfissionalInfo] = useState(null);
  const [profissionalLocation, setProfissionalLocation] = useState(null);
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [reservasProfissional, setReservasProfissional] = useState([]);

  useEffect(() => {
    if (!nomeProfissional) return;

    const fetchProfissional = async () => {
      try {
        const response = await agendarService.getProfissionais();
        const partes = nomeProfissional.trim().split(' ');
        const nomeProf = partes[0] || '';
        const sobrenomeProf = partes.slice(1).join(' ') || '';

        const profissional = response.data.find(p => 
          p.nomeCompleto === nomeProfissional || 
          (p.nome === nomeProf && p.sobrenome === sobrenomeProf)
        );

        if (profissional && profissional.id) {
          const profResponse = await agendarService.getProfissionalById(profissional.id);
          const profData = profResponse.data;
          
          let diasAtendimento = [];
          try {
            diasAtendimento = typeof profData.diasAtendimento === 'string' 
              ? JSON.parse(profData.diasAtendimento) 
              : profData.diasAtendimento || [];
          } catch (e) {
            diasAtendimento = profData.diasAtendimento ? [profData.diasAtendimento] : [];
          }

          let horariosAtendimento = {};
          try {
            horariosAtendimento = typeof profData.horariosAtendimento === 'string'
              ? JSON.parse(profData.horariosAtendimento)
              : profData.horariosAtendimento || {};
          } catch (e) {
            console.error('Erro ao parsear horariosAtendimento:', e);
          }

          setProfissionalInfo({
            id: profissional.id,
            tipoProfissional: profissional.tipoProfissional,
            nome: profData.nome,
            sobrenome: profData.sobrenome,
            descricao: profData.descricao,
            publicoAtendido: profData.publicoAtendido,
            modalidade: profData.modalidade,
            cidade: profData.cidade,
            ufRegiao: profData.ufRegiao,
            valorConsulta: profData.valorConsulta,
            diasAtendimento: diasAtendimento,
            horariosAtendimento: horariosAtendimento
          });

          // Fetch reservations
          try {
            const resReservas = await agendarService.getReservasProfissional(profissional.id);
            setReservasProfissional(resReservas.data);
          } catch (err) {
            console.error('Erro ao buscar reservas do profissional:', err);
          }

          // Handle Location
          if (profData.latitude && profData.longitude) {
            const lat = parseFloat(profData.latitude);
            const lng = parseFloat(profData.longitude);
            
            setProfissionalLocation({
              lat: lat,
              lng: lng,
              cidade: profData.cidade,
              ufRegiao: profData.ufRegiao
            });

            try {
              const geoResponse = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`
              );
              const data = geoResponse.data;
              if (data && data.address) {
                const endereco = [];
                if (data.address.road) endereco.push(data.address.road);
                if (data.address.house_number) endereco.push(data.address.house_number);
                if (data.address.neighbourhood) endereco.push(data.address.neighbourhood);
                if (data.address.city || data.address.town || data.address.village) {
                  endereco.push(data.address.city || data.address.town || data.address.village);
                }
                if (data.address.state) endereco.push(data.address.state);
                if (data.address.postcode) endereco.push(`CEP: ${data.address.postcode}`);
                
                setEnderecoCompleto(endereco.length > 0 ? endereco.join(', ') : data.display_name || '');
              } else {
                setEnderecoCompleto('');
              }
            } catch (error) {
              console.error('Erro ao buscar endereço:', error);
              setEnderecoCompleto('');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar informações do profissional:', error);
      }
    };

    fetchProfissional();
  }, [nomeProfissional]);

  return { 
    profissionalInfo, 
    profissionalLocation, 
    enderecoCompleto,
    reservasProfissional 
  };
};
