import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const Container = styled.div`
  padding: 20px;
  text-align: center;
  background-color: rgb(227, 228, 222);
  flex-grow: 1;
`;

export const WelcomeCard = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto 20px auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.08);
  text-align: left;
`;

export const WelcomeTitle = styled.h2`
  margin: 0 0 10px 0;
  color: #333;
`;

export const WelcomeText = styled.p`
  margin: 0 0 14px 0;
  color: #444;
  line-height: 1.5;
`;

export const WelcomeList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: #444;
  line-height: 1.6;
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto; /* Adiciona rolagem horizontal */
  margin-top: 20px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: rgb(227, 228, 222);
  min-width: 600px; /* Impede que a tabela encolha demais */

  @media (max-width: 768px) {
    min-width: 100%; /* Ajusta a largura para telas pequenas */
    table-layout: auto; /* Ajusta automaticamente o tamanho das colunas */
  }
`;

export const Th = styled.th`
  border: 1px solid black;
  padding: 10px;
  text-align: left;
  white-space: nowrap; /* Impede a quebra de linha nas células do cabeçalho */
  background-color: #f1f1f1;
  position: sticky;
  top: 0;
  z-index: 1; /* Garante que o cabeçalho fique sobre o conteúdo */
`;

export const Td = styled.td`
  border: 1px solid black;
  padding: 10px;
  text-align: left;
  white-space: nowrap; /* Impede a quebra de linha nas células */
  background-color: #fff;

  &:first-child { /* Alvo da primeira coluna */
    position: sticky;
    left: 0;
    background-color: #fff; /* Para garantir que o fundo da célula seja visível */
    z-index: 2; /* Garante que o nome sobreponha outras células */
  }
`;

export const Button = styled.button`
  margin: 5px;
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    padding: 8px 15px;
    font-size: 0.9rem;
  }
`;

export const Button_2 = styled.button`
  padding: 10px 24px;
  background-color: #4caf50;
  color: #fff;
  margin: 0;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  width: auto;
  min-width: 160px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #45a049;
  }

  @media (max-width: 768px) {
    width: 95%;
  }
`;


export const DaysWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Exibe os dias em 2 por linha */
  gap: 10px;
  justify-content: center;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Em telas menores, coloca um dia por linha */
  }
`;

export const Day = styled.div`
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
  cursor: pointer; /* Adiciona a mãozinha ao passar o mouse */

  &:hover {
    background-color: #e0e0e0; /* Torna a cor mais clara ao passar o mouse */
  }

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background-color: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h3`
  margin-bottom: 20px;
`;

export const Input = styled.input`
  margin-bottom: 12px;
  padding: 10px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

export const Select = styled.select`
  margin-bottom: 12px;
  padding: 10px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
`;

export const DivInputContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

export const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

export const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  right: ${props => props.isOpen ? '0' : '-400px'};
  width: 400px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  transition: right 0.3s ease-in-out;
  overflow-y: auto;
  padding: 20px;
`;

export const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ccc;
`;

export const DrawerTitle = styled.h2`
  margin: 0;
  color: #333;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

export const DatePickerWrapper = styled.div`
  width: 100%;
  margin-bottom: 12px;
  
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container {
    width: 100%;
    
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
      font-family: 'Figtree', sans-serif;
    }
  }
`;
