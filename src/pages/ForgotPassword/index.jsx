import { useState } from 'react';
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
  width: 100%;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const Info = styled.p`
  font-size: 13px;
  color: #666;
  text-align: center;
  margin-bottom: 16px;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { success, error: showError, warning } = useNotification();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      warning('Por favor, insira seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      await client.post('/api/forgot-password', { email });
      setSent(true);
      success('E-mail enviado! Verifique sua caixa de entrada.');
    } catch {
      showError('Erro ao enviar o e-mail. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <FormWrapper>
        <h2>Redefinir Senha</h2>
        {sent ? (
          <Info>
            Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve.
            Verifique também a pasta de spam.
          </Info>
        ) : (
          <form onSubmit={handleForgotPassword} style={{ width: '100%' }}>
            <Info>Digite seu e-mail cadastrado e enviaremos um link de redefinição.</Info>
            <Input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
            </Button>
          </form>
        )}
      </FormWrapper>
    </PageWrapper>
  );
};

export default ForgotPassword;
