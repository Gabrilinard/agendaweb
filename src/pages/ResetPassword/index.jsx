import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import client from '../../api/client';
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
  width: 100%;
  max-width: 380px;
  margin: 0 16px;

  @media (max-width: 480px) {
    padding: 24px 20px;
  }
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
  width: 100%;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: #dc3545;
  font-size: 13px;
  text-align: center;
`;

const ResetPassword = () => {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError, warning } = useNotification();

  const token = searchParams.get('token');

  if (!token) {
    return (
      <PageWrapper>
        <FormWrapper>
          <h2>Link inválido</h2>
          <ErrorMsg>
            Este link de redefinição é inválido ou já foi utilizado.
            Solicite um novo link em "Esqueceu a senha?".
          </ErrorMsg>
        </FormWrapper>
      </PageWrapper>
    );
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      warning('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      warning('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await client.patch('/api/reset-password', { token, senha });
      success('Senha redefinida com sucesso!');
      navigate('/entrar');
    } catch (err) {
      const msg = err.response?.data?.error || 'Link inválido ou expirado. Solicite um novo.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <FormWrapper>
        <h2>Nova Senha</h2>
        <form onSubmit={handleResetPassword} style={{ width: '100%' }}>
          <Input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </Button>
        </form>
      </FormWrapper>
    </PageWrapper>
  );
};

export default ResetPassword;
