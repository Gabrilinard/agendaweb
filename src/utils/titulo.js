export const OPCOES_GENERO = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'nao_binario', label: 'Não binário' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_informar', label: 'Prefiro não informar' },
];

export const getTratamento = (genero) => {
  if (genero === 'masculino') return 'Dr.';
  if (genero === 'feminino') return 'Dra.';
  return '';
};

export const getNomeComTitulo = (genero, nome) => {
  const tratamento = getTratamento(genero);
  return tratamento ? `${tratamento} ${nome}` : nome;
};
