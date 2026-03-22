import styled from 'styled-components';

export const PageWrapper = styled.div`
  background-color: rgb(227, 228, 222);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px;
`;

export const Card = styled.div`
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h2`
  margin: 0 0 10px 0;
  color: #333;
  text-align: center;
  font-family: 'Figtree', sans-serif;
`;

export const Subtitle = styled.p`
  margin: 0 0 20px 0;
  color: #666;
  text-align: center;
  font-family: 'Figtree', sans-serif;
`;

export const SectionTitle = styled.h3`
  margin: 22px 0 10px 0;
  color: #333;
  font-family: 'Figtree', sans-serif;
  border-bottom: 2px solid #4caf50;
  padding-bottom: 8px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-weight: 700;
  color: #333;
  font-family: 'Figtree', sans-serif;
`;

export const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Figtree', sans-serif;
`;

export const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Figtree', sans-serif;
  min-height: 90px;
  resize: vertical;
`;

export const Select = styled.select`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Figtree', sans-serif;
  background: white;
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  flex-wrap: wrap;
`;

export const Button = styled.button`
  background-color: ${({ color }) => color || '#4caf50'};
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Figtree', sans-serif;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`;

