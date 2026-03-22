import { Button, DrawerContainer, DrawerHeader, DrawerTitle, FormContainer, Input, Label, Select } from '../style';

const EditarInformacoes = ({
  show,
  drawerRef,
  editDescricao,
  setEditDescricao,
  editPublicoAtendido,
  setEditPublicoAtendido,
  editModalidade,
  setEditModalidade,
  editValorConsulta,
  setEditValorConsulta,
  diasSemana,
  editDiasAtendimento,
  editHorariosAtendimento,
  handleEditDiaChange,
  handleEditHorarioChange,
  handleEditRemoveHorario,
  handleEditAddHorario,
  handleEditarInformacoes,
  onCancelar
}) => {
  return (
    <DrawerContainer isOpen={show} ref={drawerRef}>
      <DrawerHeader>
        <DrawerTitle>Editar Informações</DrawerTitle>
      </DrawerHeader>

      <FormContainer style={{ maxWidth: '100%', boxShadow: 'none', padding: 0 }}>
        <Label>Descrição:</Label>
        <textarea
          value={editDescricao}
          onChange={(e) => setEditDescricao(e.target.value)}
          placeholder="Descreva sua experiência e especialidades..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minHeight: '100px',
            fontFamily: 'Figtree, sans-serif',
            resize: 'vertical',
            marginBottom: '15px',
            boxSizing: 'border-box'
          }}
        />

        <Label>Público Atendido:</Label>
        <Select value={editPublicoAtendido} onChange={(e) => setEditPublicoAtendido(e.target.value)} style={{ marginBottom: '15px' }}>
          <option value="">Selecione...</option>
          <option value="Adultos">Adultos</option>
          <option value="Crianças">Crianças</option>
          <option value="Idosos">Idosos</option>
          <option value="Adultos e Crianças">Adultos e Crianças</option>
          <option value="Adultos e Idosos">Adultos e Idosos</option>
          <option value="Crianças e Idosos">Crianças e Idosos</option>
          <option value="Todos">Todos</option>
        </Select>

        <Label>Modalidade:</Label>
        <Select value={editModalidade} onChange={(e) => setEditModalidade(e.target.value)} style={{ marginBottom: '15px' }}>
          <option value="">Selecione...</option>
          <option value="presencial">Presencial</option>
          <option value="online">Online</option>
          <option value="domiciliar">Domiciliar</option>
          <option value="presencial,online">Presencial e Online</option>
          <option value="presencial,domiciliar">Presencial e Domiciliar</option>
          <option value="online,domiciliar">Online e Domiciliar</option>
          <option value="presencial,online,domiciliar">Presencial, Online e Domiciliar</option>
        </Select>

        <Label>Valor da Consulta:</Label>
        <div style={{ marginBottom: '15px' }}>
          <Select
            value={editValorConsulta === 'A negociar' ? 'A negociar' : 'Definir valor'}
            onChange={(e) => {
              if (e.target.value === 'A negociar') {
                setEditValorConsulta('A negociar');
              } else {
                setEditValorConsulta('');
              }
            }}
            style={{ marginBottom: '10px' }}
          >
            <option value="Definir valor">Definir valor (R$)</option>
            <option value="A negociar">Valor a negociar</option>
          </Select>

          {editValorConsulta !== 'A negociar' && (
            <Input
              type="number"
              placeholder="Ex: 150.00"
              value={editValorConsulta}
              onChange={(e) => setEditValorConsulta(e.target.value)}
              min="0"
              step="0.01"
            />
          )}
        </div>

        <Label>Dias de Atendimento:</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
          <Select onChange={handleEditDiaChange} value="">
            <option value="" disabled>
              Adicionar dia...
            </option>
            <option value="Todos os dias">Todos os dias</option>
            {diasSemana.map((dia) => (
              <option key={dia} value={dia} disabled={editDiasAtendimento.includes(dia)}>
                {dia}
              </option>
            ))}
          </Select>

          {editDiasAtendimento.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {editDiasAtendimento.map((dia) => (
                <span
                  key={dia}
                  style={{
                    background: '#e0e0e0',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '14px'
                  }}
                >
                  {dia}
                  <button
                    type="button"
                    onClick={() => handleEditDiaChange({ target: { value: dia } })}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: '#ff4444',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {editDiasAtendimento.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <Label>Horários por Dia:</Label>
            {editDiasAtendimento.map((dia) => (
              <div key={dia} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{dia}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {editHorariosAtendimento[dia]?.map((horario, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Input
                        type="time"
                        value={horario}
                        onChange={(e) => handleEditHorarioChange(dia, index, e.target.value)}
                        required
                        style={{ width: '110px' }}
                      />
                      {editHorariosAtendimento[dia].length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEditRemoveHorario(dia, index)}
                          style={{
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                          title="Remover horário"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleEditAddHorario(dia)}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    + Adicionar Horário
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={handleEditarInformacoes} style={{ backgroundColor: 'green', color: 'white' }}>
            Salvar Informações
          </Button>
          <Button onClick={onCancelar} style={{ backgroundColor: 'gray', color: 'white' }}>
            Cancelar
          </Button>
        </div>
      </FormContainer>
    </DrawerContainer>
  );
};

export default EditarInformacoes;

