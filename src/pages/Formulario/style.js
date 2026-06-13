import styled from 'styled-components';

const G = '#1B4D3E';
const GA = '#4caf50';
const GM = '#E8F2EF';
const BD = '#E2E8E5';
const BG = '#F7F9F8';
const TX = '#1a1a1a';
const TM = '#5a6872';

export const PageWrapper = styled.div`
  background-color: #EEF0EB;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 32px 20px;
`;

export const Card = styled.div`
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 24px 18px;
  }
`;

export const Title = styled.h2`
  margin: 0 0 4px 0;
  color: ${G};
  text-align: center;
  font-family: 'Figtree', sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
`;

export const Subtitle = styled.p`
  margin: 0 0 24px 0;
  color: ${TM};
  text-align: center;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
`;

export const SectionBlock = styled.div`
  background: ${BG};
  border: 1px solid ${BD};
  border-radius: 12px;
  padding: 18px 20px 20px;
  margin-top: 14px;
`;

export const SectionTitle = styled.h3`
  margin: 0 0 14px 0;
  color: ${G};
  font-family: 'Figtree', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 7px;

  svg {
    color: ${GA};
    flex-shrink: 0;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 12.5px;
  color: ${TX};
  font-family: 'Figtree', sans-serif;
`;

export const Input = styled.input`
  padding: 10px 13px;
  border: 1.5px solid ${BD};
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Figtree', sans-serif;
  color: ${TX};
  background: white;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: ${GA};
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.12);
  }

  &:disabled {
    background: #f0f0f0;
    color: #b0b8b4;
    cursor: not-allowed;
    border-color: ${BD};
  }

  &::placeholder {
    color: #b8c4be;
  }
`;

export const TextArea = styled.textarea`
  padding: 10px 13px;
  border: 1.5px solid ${BD};
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Figtree', sans-serif;
  color: ${TX};
  background: white;
  outline: none;
  min-height: 88px;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: ${GA};
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.12);
  }

  &:disabled {
    background: #f0f0f0;
    color: #b0b8b4;
    cursor: not-allowed;
    border-color: ${BD};
  }

  &::placeholder {
    color: #b8c4be;
  }
`;

export const Select = styled.select`
  padding: 10px 36px 10px 13px;
  border: 1.5px solid ${BD};
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Figtree', sans-serif;
  color: ${TX};
  background-color: white;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235a6872' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: ${GA};
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.12);
  }

  &:disabled {
    background-color: #f0f0f0;
    color: #b0b8b4;
    cursor: not-allowed;
    border-color: ${BD};
  }
`;

export const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 8px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  border: 1.5px solid ${BD};
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  font-size: 13.5px;
  color: ${TX};
  background: white;
  user-select: none;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  input[type='checkbox'] {
    width: 15px;
    height: 15px;
    accent-color: ${GA};
    cursor: pointer;
    flex-shrink: 0;
  }

  &:has(input:checked) {
    border-color: ${GA};
    background: ${GM};
    color: ${G};
    font-weight: 600;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${BD};
  flex-wrap: wrap;
`;

export const Button = styled.button`
  background-color: ${({ color }) => color || G};
  color: white;
  border: none;
  padding: 11px 24px;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  font-weight: 600;
  font-family: 'Figtree', sans-serif;
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  gap: 7px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: opacity 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;
