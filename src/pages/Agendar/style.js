import styled from 'styled-components';

export const ContainerGeral = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const Container = styled.div`
  flex: 1;
  padding: 28px 24px;
  background-color: #ECEAE3;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FormularioReserva = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
`;

export const DataHorarioMapaContainer = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const DataHorarioWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  min-width: 200px;
  position: relative;
  z-index: 1000;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
`;

export const Button = styled.button`
  background-color: ${({ color }) => color || '#007bff'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin: 5px;

  &:hover {
    opacity: 0.8;
  }
`;

export const DaysWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 50px;
  gap: 10px;
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    align-items: center;
  }
`;

export const Day = styled.div`
  background-color: ${({ isUserDay }) => (isUserDay ? 'green' : '#f1f1f1')}; /* Alterando a cor para verde caso seja o dia do usuário */
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${({ isUserDay }) => (isUserDay ? 'darkgreen' : '#e0e0e0')}; /* Tom mais escuro para quando hover em um dia do usuário */
  }

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

export const MensagemStatus = styled.div`
  font-size: 1rem;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 10px;
  color: ${({ status }) => {
    if (status === 'confirmado') return 'green';
    if (status === 'negado') return 'red';
    return 'orange';
  }};
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 5px;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
`;


export const Reserva_2 = styled.div`
  display: flex;
  flex-wrap: wrap; /* Permite que os itens se movam para a linha seguinte quando não houver mais espaço */
  gap: 10px; /* Espaçamento entre os itens */
  justify-content: center; /* Alinha os itens ao centro */
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 100%; /* Garante que o container ocupe toda a largura disponível */
  width: 100%;
  text-align: left;
  margin-top: 20px;
`;

export const ReservasContainer = styled.div`
  flex-wrap: wrap; /* Permite que os itens se movam para a linha seguinte quando não houver mais espaço */
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 100%; /* Garante que o container ocupe toda a largura disponível */
  width: 100%;
  margin-top: 20px;

  h3 {
    margin-top: 10px; /* Adicionando o margin-top de 5px ao h3 */
  }
`;

export const ReservaItem = styled.div`
  background: #fefefe;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;


export const Selecao = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);


  @media (max-width: 768px) {
    margin-top: 15px;
  }
`;

export const H3 = styled.h3`
  font-size: 1.6rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
`;

export const Div = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Div_2 = styled.div`
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
`;

export const Paragrafo = styled.p`
  font-size: 1.2rem;
  color: #555;
  font-weight: 600;
  margin-bottom: 12px;
`;

export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Linha = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #d4d4d4;
  }

  span {
    font-weight: bold;
  }
`;

export const Button_geral = styled.div`
  display: flex;
  gap: 10px;
`;

export const Container_Important = styled.div`
  display: flex;
  align-items: stretch;
  gap: 20px;
  width: 100%;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const MapWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  height: 300px;
  min-height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  flex: 1;
  min-width: 300px;
  position: relative;
  z-index: 0;

  .leaflet-container {
    height: 100% !important;
    width: 100% !important;
    min-height: 300px;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    min-width: 100%;
    margin-top: 0;
  }
`;

export const MapaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 300px;
`;

export const ContainerEdicao = styled.div`
  margin-top: 15px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f5f5;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

export const Label = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
`;

export const TituloAgendamento = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  font-family: 'Figtree', sans-serif;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const DatePickerWrapper = styled.div`
  width: 100%;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    width: 100%;

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 1rem;
    }
  }

  .react-datepicker-popper {
    z-index: 9999 !important;
  }

`;

export const InfoProfissionalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  min-width: 300px;

  @media (max-width: 768px) {
    max-width: 100%;
    min-width: 100%;
  }
`;

export const InfoTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  font-family: 'Figtree', sans-serif;
  border-bottom: 2px solid #4caf50;
  padding-bottom: 10px;
`;

export const InfoSection = styled.div`
  margin-bottom: 15px;
`;

export const InfoLabel = styled.strong`
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
  font-family: 'Figtree', sans-serif;
`;

export const InfoValue = styled.p`
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  font-family: 'Figtree', sans-serif;
`;

export const InfoDescription = styled.p`
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  font-family: 'Figtree', sans-serif;
  text-align: justify;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
`;

export const ModalidadeTag = styled.span`
  display: inline-block;
  background-color: #4caf50;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  margin-right: 8px;
  margin-top: 5px;
  font-family: 'Figtree', sans-serif;
`;

export const AgendamentoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  min-width: 400px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;




/*Olá, {{name}}

Você recebeu uma nova notificação!

Solicitações novas: {{message}}

Faltas Agendadas: {{faltas}}

Edições Agendadas: {{edicoes}}

Atenciosamente, {{name}}

Nós recebemos uma solicitação para resetar a senha para sua conta. Para proceder, estamos enviando seu id para você inserir no campo solicitado e assim criar uma nova senha. 

{{userId}}
Se você não solicitou sua senha resetada, por favor ignore esse email or nós vamos saber imediatamente. Sua conta continua segura.

Atenciosamente,
[FisioPilates] Time




          <div>
            <h3>Criar Reserva</h3>
            <input
              type="text"
              value={nomeReserva}
              onChange={(e) => setNomeReserva(e.target.value)}
              placeholder="Nome do Usuário"
            />
            <input
              type="email"
              value={emailReserva}
              onChange={(e) => setEmailReserva(e.target.value)}
              placeholder="Email do Usuário"
            />
            <input
              type="text"
              value={formatarTelefone(telefoneReserva)} // Aplica a formatação ao exibir
              onChange={(e) => setTelefoneReserva(e.target.value)} // Atualiza conforme o usuário digita
              placeholder="Telefone do Usuário"
            />
            <select
              value={diaReserva}
              onChange={(e) => setDiaReserva(e.target.value)}
            >
              <option value="">Selecione o dia</option>
              {diasDaSemana.map((dia, index) => (
                <option key={index} value={dia}>
                  {dia}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={horarioReserva}
              onChange={(e) => setHorarioReserva(e.target.value)}
            />
            <input
              type="number"
              value={qntdPessoas}
              onChange={(e) => setQntdPessoas(e.target.value)}
              placeholder="Quantidade de Pessoas"
            />
            <Button onClick={handleCreateReserva}>Criar Reserva</Button>
          </div>

Eu quero que tenha apenas 12 notificações dos horários pares de um dia, e eu quero que apenas mande o email se tiver alguma nova atualização de solicitações, edições ou faltas. No momento, está enviando apenas se tiver no intervalo de 10 horas, 12 horas... Eu não quero isso, eu quero que envie uma notificação apenas as 10 horas e depois outra apenas as 12 horas em ponto, sem contar intervalo e somente envie o email nesse horário se tiver alguma atualização nas solicitções, edições ou faltas.

*/