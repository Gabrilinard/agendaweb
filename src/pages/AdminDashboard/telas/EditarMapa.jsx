const CARD = { background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' };
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #E0DFD9',
  borderRadius: '8px', fontSize: '14px', fontFamily: 'Figtree, sans-serif',
  boxSizing: 'border-box', color: '#1a1a1a', background: '#F7F7F4',
};

const EditarMapa = ({
  LocationPickerEdit, handleMapClick,
  editLatitude, editLongitude,
  editUfRegiao, editCidade, setEditCidade, setEditUfRegiao,
  handleEditarMapa,
}) => {
  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Figtree, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Editar Localização</h1>
        <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0' }}>Clique no mapa para definir sua localização de atendimento</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'flex-start' }}>
        {/* Map */}
        <div style={{ ...CARD, overflow: 'hidden' }}>
          <div style={{ height: '480px', width: '100%' }}>
            <LocationPickerEdit
              onLocationSelect={handleMapClick}
              initialLat={editLatitude}
              initialLng={editLongitude}
            />
          </div>
        </div>

        {/* Side form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={CARD}>
            <div style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 14px' }}>Localização selecionada</h3>

              {editLatitude && editLongitude ? (
                <div style={{ padding: '10px 14px', background: '#E8F5EF', borderRadius: '8px', marginBottom: '14px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#1B4D3E', fontWeight: '600' }}>Coordenadas</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1B4D3E' }}>
                    {editLatitude.toFixed(5)}, {editLongitude.toFixed(5)}
                  </p>
                </div>
              ) : (
                <div style={{ padding: '14px', background: '#F7F7F4', borderRadius: '8px', textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '14px' }}>
                  Nenhuma localização selecionada.<br />Clique no mapa ao lado.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UF / Estado</label>
                  <input
                    type="text"
                    value={editUfRegiao}
                    onChange={e => setEditUfRegiao(e.target.value)}
                    placeholder="Preenchido automaticamente"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cidade</label>
                  <input
                    type="text"
                    value={editCidade}
                    onChange={e => setEditCidade(e.target.value)}
                    placeholder="Preenchido automaticamente"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleEditarMapa}
            style={{
              padding: '13px', background: '#1B4D3E', color: 'white',
              border: 'none', borderRadius: '10px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer', fontFamily: 'Figtree, sans-serif',
            }}
          >
            Salvar localização
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarMapa;
