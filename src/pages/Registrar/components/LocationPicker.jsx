import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

const LocationPicker = ({ onLocationSelect, initialLat, initialLng }) => {
  const [position, setPosition] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : [-14.235, -51.9253]
  );

  useEffect(() => {
    if (initialLat && initialLng) setPosition([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  return (
    <MapContainer center={position} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
};

export default LocationPicker;
