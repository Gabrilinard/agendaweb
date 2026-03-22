import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Container, EmpresaCard, EmpresaInfo, EmpresaNome, EmpresasGrid, EmpresasSection, InscreverButton, SearchContainer, SearchInput, TabButton, TabContainer, VerMaisButton, WelcomeText } from '../Home/style';

const FilterButton = styled.button`
  padding: 12px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 10px;
  white-space: nowrap;
  transition: background-color 0.3s ease;
  font-family: 'Figtree', sans-serif;

  &:hover {
    background-color: #45a049;
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9rem;
    margin-left: 5px;
  }
`;

const FilterContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  z-index: 1000;

  @media (max-width: 768px) {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    min-width: 200px;
    padding: 15px;
  }
`;

const SearchContainerWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin: 20px 0;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 20px;
  }
`;

const FilterLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  font-family: 'Figtree', sans-serif;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  background-color: white;
  font-family: 'Figtree', sans-serif;
  cursor: pointer;

  &:focus {
    border-color: #4caf50;
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
`;

const ClearFilterButton = styled.button`
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-family: 'Figtree', sans-serif;

  &:hover {
    background-color: #da190b;
  }
`;

const EmpresasProfissionais = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { warning } = useNotification();
    const categorias = ['medico', 'dentista', 'nutricionista', 'fisioterapeuta', 'fonoaudiologo'];
    const categoriasLabels = {
        'medico': 'Médicos',
        'dentista': 'Dentistas',
        'nutricionista': 'Nutricionistas',
        'fisioterapeuta': 'Fisioterapeutas',
        'fonoaudiologo': 'Fonoaudiólogos'
    };
    const categoriasLabelsSingulares = {
        'medico': 'Médico',
        'dentista': 'Dentista',
        'nutricionista': 'Nutricionista',
        'fisioterapeuta': 'Fisioterapeuta',
        'fonoaudiologo': 'Fonoaudiólogo'
    };
    const [profissionaisPorCategoria, setProfissionaisPorCategoria] = useState({});
    const [profissionaisExibidos, setProfissionaisExibidos] = useState({});
    const [categoriaAtiva, setCategoriaAtiva] = useState('medico');
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const filterRef = useRef(null);

    useEffect(() => {
        const buscarProfissionaisPorCategoria = async () => {
            const profissionais = {};
            const exibidos = {};
            
            for (const categoria of categorias) {
                try {
                    const response = await axios.get(`http://localhost:3000/profissionais/${categoria}`);
                    console.log(`Dados recebidos para ${categoria}:`, response.data);
                    profissionais[categoria] = response.data;
                    exibidos[categoria] = 10;
                } catch (error) {
                    console.error(`Erro ao buscar ${categoria}:`, error);
                    profissionais[categoria] = [];
                    exibidos[categoria] = 10;
                }
            }
            
            setProfissionaisPorCategoria(profissionais);
            setProfissionaisExibidos(exibidos);
        };
        buscarProfissionaisPorCategoria();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setMostrarFiltros(false);
            }
        };

        if (mostrarFiltros) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mostrarFiltros]);

    const handleVerMais = () => {
        setProfissionaisExibidos(prev => ({
            ...prev,
            [categoriaAtiva]: (prev[categoriaAtiva] || 10) + 10
        }));
    };

    const handleInscrever = (profissional) => {
        if (!user) {
            warning('Você precisa estar logado para agendar.');
            navigate('/Entrar');
            return;
        }
        navigate('/Agendar', { 
            state: { 
                nome: profissional.nomeCompleto, 
                tipo: profissional.tipoProfissional,
                categoria: categoriaAtiva
            } 
        });
    };

    const profissionaisAtuais = profissionaisPorCategoria[categoriaAtiva] || [];
    
    const profissionaisFiltrados = profissionaisAtuais.filter(profissional => {
        const matchTermo = !termoPesquisa || 
            profissional.nomeCompleto.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
            profissional.tipoProfissional.toLowerCase().includes(termoPesquisa.toLowerCase());
        
        const matchEstado = !filtroEstado || 
            profissional.ufRegiao?.toUpperCase() === filtroEstado.toUpperCase();
        
        return matchTermo && matchEstado;
    });
    
    const profissionaisParaExibir = profissionaisFiltrados.slice(0, profissionaisExibidos[categoriaAtiva] || 10);
    const temMaisProfissionais = profissionaisFiltrados.length > (profissionaisExibidos[categoriaAtiva] || 10);

    return (
        <Container>
            <Header />
            
            <EmpresasSection>
                <TabContainer>
                    {categorias.map((categoria) => (
                        <TabButton 
                            key={categoria}
                            active={categoriaAtiva === categoria} 
                            onClick={() => setCategoriaAtiva(categoria)}
                        >
                            {categoriasLabels[categoria]}
                        </TabButton>
                    ))}
                </TabContainer>

                <SearchContainerWrapper ref={filterRef}>
                    <SearchContainer>
                        <SearchInput
                            type="text"
                            placeholder="Pesquisar por nome ou especialidade..."
                            value={termoPesquisa}
                            onChange={(e) => setTermoPesquisa(e.target.value)}
                        />
                        <FilterButton onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                            Filtros {filtroEstado && `(${filtroEstado})`}
                        </FilterButton>
                    </SearchContainer>
                    
                    {mostrarFiltros && (
                        <FilterContainer>
                            <FilterLabel>Filtrar por Estado:</FilterLabel>
                            <FilterSelect
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <option value="">Todos os estados</option>
                                <option value="AC">Acre</option>
                                <option value="AL">Alagoas</option>
                                <option value="AP">Amapá</option>
                                <option value="AM">Amazonas</option>
                                <option value="BA">Bahia</option>
                                <option value="CE">Ceará</option>
                                <option value="DF">Distrito Federal</option>
                                <option value="ES">Espírito Santo</option>
                                <option value="GO">Goiás</option>
                                <option value="MA">Maranhão</option>
                                <option value="MT">Mato Grosso</option>
                                <option value="MS">Mato Grosso do Sul</option>
                                <option value="MG">Minas Gerais</option>
                                <option value="PA">Pará</option>
                                <option value="PB">Paraíba</option>
                                <option value="PR">Paraná</option>
                                <option value="PE">Pernambuco</option>
                                <option value="PI">Piauí</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="RN">Rio Grande do Norte</option>
                                <option value="RS">Rio Grande do Sul</option>
                                <option value="RO">Rondônia</option>
                                <option value="RR">Roraima</option>
                                <option value="SC">Santa Catarina</option>
                                <option value="SP">São Paulo</option>
                                <option value="SE">Sergipe</option>
                                <option value="TO">Tocantins</option>
                            </FilterSelect>
                            {filtroEstado && (
                                <ClearFilterButton onClick={() => setFiltroEstado('')}>
                                    Limpar Filtro
                                </ClearFilterButton>
                            )}
                        </FilterContainer>
                    )}
                </SearchContainerWrapper>

                {profissionaisFiltrados.length > 0 ? (
                    <>
                        <EmpresasGrid>
                            {profissionaisParaExibir.map((profissional, index) => {
                                const temCidade = profissional.cidade && profissional.cidade.trim() !== '';
                                const temUF = profissional.ufRegiao && profissional.ufRegiao.trim() !== '';
                                
                                return (
                                    <EmpresaCard key={index}>
                                        <EmpresaNome>{profissional.nomeCompleto}</EmpresaNome>
                                        <EmpresaInfo>
                                            {temCidade || temUF ? (
                                                <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                                                    {temCidade && temUF ? (
                                                        `${profissional.cidade}, ${profissional.ufRegiao}`
                                                    ) : temCidade ? (
                                                        profissional.cidade
                                                    ) : (
                                                        profissional.ufRegiao
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic', marginTop: '8px' }}>
                                                    Localização não informada
                                                </div>
                                            )}
                                        </EmpresaInfo>
                                        <InscreverButton onClick={() => handleInscrever(profissional)}>
                                            Agende Agora
                                        </InscreverButton>
                                    </EmpresaCard>
                                );
                            })}
                        </EmpresasGrid>
                        {temMaisProfissionais && (
                            <VerMaisButton onClick={handleVerMais}>
                                Ver Mais
                            </VerMaisButton>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '40px', width: '100%' }}>
                        <WelcomeText style={{ textAlign: 'center', margin: '0 auto' }}>
                            {termoPesquisa 
                                ? `Nenhum resultado encontrado para "${termoPesquisa}".`
                                : `Nenhum ${categoriasLabelsSingulares[categoriaAtiva].toLowerCase()} cadastrado no momento.`
                            }
                        </WelcomeText>
                    </div>
                )}
            </EmpresasSection>
            
            <Footer />
        </Container>
    );
};

export default EmpresasProfissionais;
