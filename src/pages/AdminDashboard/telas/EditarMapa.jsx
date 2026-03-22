import { Button, DrawerContainer, DrawerHeader, DrawerTitle, FormContainer, Input, Label } from '../style';

const EditarMapa = ({
  show,
  drawerRef,
  LocationPickerEdit,
  handleMapClick,
  editLatitude,
  editLongitude,
  editUfRegiao,
  editCidade,
  handleEditarMapa,
  onCancelar
}) => {
  return (
    <DrawerContainer isOpen={show} ref={drawerRef}>
      <DrawerHeader>
        <DrawerTitle>Editar Localização</DrawerTitle>
      </DrawerHeader>

      <FormContainer style={{ maxWidth: '100%', boxShadow: 'none', padding: 0 }}>
        <Label>Clique no mapa para selecionar sua localização:</Label>
        <div style={{ width: '100%', height: '400px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
          <LocationPickerEdit onLocationSelect={handleMapClick} initialLat={editLatitude} initialLng={editLongitude} />
        </div>

        {editLatitude && editLongitude && (
          <>
            <Input
              type="text"
              value={editUfRegiao}
              placeholder="UF/Região (preenchido automaticamente)"
              readOnly
              style={{ backgroundColor: '#f0f0f0', marginBottom: '10px' }}
            />
            <Input
              type="text"
              value={editCidade}
              placeholder="Cidade (preenchida automaticamente)"
              readOnly
              style={{ backgroundColor: '#f0f0f0', marginBottom: '10px' }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
              Localização selecionada: {editLatitude.toFixed(6)}, {editLongitude.toFixed(6)}
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={handleEditarMapa} style={{ backgroundColor: 'green', color: 'white' }}>
            Salvar Localização
          </Button>
          <Button onClick={onCancelar} style={{ backgroundColor: 'gray', color: 'white' }}>
            Cancelar
          </Button>
        </div>
      </FormContainer>
    </DrawerContainer>
  );
};

export default EditarMapa;

