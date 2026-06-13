import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

const LocationPickerEdit = ({ onLocationSelect, initialLat, initialLng }) => {
  const [pos, setPos] = useState(initialLat && initialLng ? [initialLat, initialLng] : [-14.235, -51.925]);

  useEffect(() => {
    if (initialLat && initialLng) setPos([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  function MarkerPicker() {
    useMapEvents({
      click(e) { const { lat, lng } = e.latlng; setPos([lat, lng]); onLocationSelect(lat, lng); },
    });
    return pos ? <Marker position={pos} /> : null;
  }

  return (
    <MapContainer center={pos} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerPicker />
    </MapContainer>
  );
};

export default LocationPickerEdit;
