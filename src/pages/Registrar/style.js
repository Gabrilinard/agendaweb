import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: rgb(227, 228, 222);
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  padding-top: 40px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
`;

export const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  background-color: white;
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  cursor: pointer;
`;

export const EyeIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

export const FieldError = styled.p`
  color: #dc3545;
  font-size: 12px;
  margin: 4px 0 0;
  text-align: left;
`;

export const PasswordHint = styled.p`
  font-size: 12px;
  margin: 4px 0 0;
  text-align: left;
  color: ${({ $forca }) =>
    $forca === 'forte' ? '#28a745' :
    $forca === 'media' ? '#e67e22' :
    '#dc3545'};
`;

export const Button = styled.button`
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background-color: #218838; }
`;

export const LoginButton = styled.button`
  padding: 12px;
  background-color: rgb(143, 142, 142);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background-color: rgb(82, 83, 84); }
`;

export const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  margin: 15px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;

  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;
