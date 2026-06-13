import { useCallback, useEffect, useState } from 'react';
import { buscarPorCPF, createReserva } from '../api';

const useNovaReserva = (user, { success, warning, showError }, onSuccess) => {
  const [cpfUsuario, setCpfUsuario] = useState('');
  const [nomeReserva, setNomeReserva] = useState('');
  const [sobrenomeReserva, setSobrenomeReserva] = useState('');
  const [emailReserva, setEmailReserva] = useState('');
  const [telefoneReserva, setTelefoneReserva] = useState('');
  const [dataReserva, setDataReserva] = useState(new Date());
  const [horarioReserva, setHorarioReserva] = useState('');
  const [userId, setUserId] = useState(null);

  const resetPaciente = useCallback(() => {
    setNomeReserva(''); setSobrenomeReserva(''); setEmailReserva(''); setTelefoneReserva(''); setUserId(null);
  }, []);

  const buscarUsuarioPorCPF = useCallback(async (cpf) => {
    try {
      const { data } = await buscarPorCPF(cpf.replace(/\D/g, ''));
      setNomeReserva(data.nome); setSobrenomeReserva(data.sobrenome);
      setEmailReserva(data.email); setTelefoneReserva(data.telefone); setUserId(data.id);
    } catch (e) {
      if (e.response?.status === 404) showError('Usuário não encontrado.');
      else showError('Erro ao buscar usuário.');
      resetPaciente();
    }
  }, [showError, resetPaciente]);

  useEffect(() => {
    if (cpfUsuario && cpfUsuario.replace(/\D/g, '').length === 11) buscarUsuarioPorCPF(cpfUsuario);
    else if (cpfUsuario === '') resetPaciente();
  }, [cpfUsuario, buscarUsuarioPorCPF, resetPaciente]);

  const handleCreateReserva = async () => {
    if (!userId) { warning('Busque um usuário pelo CPF primeiro.'); return; }
    if (!dataReserva || !horarioReserva) { warning('Preencha data e horário.'); return; }
    try {
      const hFim = new Date(`1970-01-01T${horarioReserva}:00`);
      hFim.setTime(hFim.getTime() + 3600000);
      const d = dataReserva;
      await createReserva({
        nome: nomeReserva, sobrenome: sobrenomeReserva, email: emailReserva,
        dia: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        horario: horarioReserva,
        horarioFinal: `${String(hFim.getHours()).padStart(2, '0')}:${String(hFim.getMinutes()).padStart(2, '0')}`,
        qntd_pessoa: 1, telefone: telefoneReserva, usuario_id: userId, profissional_id: user.id, status: 'confirmado',
      });
      success('Consulta criada!');
      setNomeReserva(''); setSobrenomeReserva(''); setEmailReserva(''); setTelefoneReserva('');
      setDataReserva(new Date()); setHorarioReserva(''); setCpfUsuario(''); setUserId(null);
      if (onSuccess) onSuccess();
    } catch { showError('Erro ao criar consulta.'); }
  };

  return {
    cpfUsuario, setCpfUsuario, nomeReserva, sobrenomeReserva,
    emailReserva, telefoneReserva, dataReserva, setDataReserva,
    horarioReserva, setHorarioReserva, userId, handleCreateReserva,
  };
};

export default useNovaReserva;
