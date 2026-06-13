import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useNotification } from '../../contexts/NotificationContext';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: rgb(227, 228, 222);
`;

const FormWrapper = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 350px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 15px;
`;

const Button = styled.button`
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const ResetPassword = () => {
  const [senha, setSenha] = useState('');
  const [id, setId] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const navigate = useNavigate();
  const { success, error: showError, warning } = useNotification();

  const handleResetPassword = async (e) => {
    e.preventDefault();
  
    if (senha !== confirmarSenha) {
      warning('As senhas não coincidem.');
      return;
    }
  
    console.log(`ID: ${id}, Senha: ${senha}`);
  
    const response = await fetch(`http://localhost:3000/api/reset-password/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    });
  
    if (response.ok) {
      success('Senha redefinida com sucesso.');
      navigate('/entrar');
    } else {
      showError('Erro ao redefinir senha.');
    }
  };
  

  return (
    <PageWrapper>
      <FormWrapper>
        <h2>Nova Senha</h2>
        <form onSubmit={handleResetPassword}>
        <Input
            type="number"
            placeholder="Seu Id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
          <Button type="submit" onClick={handleResetPassword}>Redefinir Senha</Button>
        </form>
      </FormWrapper>
    </PageWrapper>
  );
};

export default ResetPassword;
