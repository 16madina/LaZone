import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom orange marker icon
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Country coordinates for centering the map
export const countryCoordinates: Record<string, { lat: number; lng: number; zoom: number }> = {
  'DZ': { lat: 28.0339, lng: 1.6596, zoom: 5 },
  'AO': { lat: -11.2027, lng: 17.8739, zoom: 5 },
  'BJ': { lat: 9.3077, lng: 2.3158, zoom: 7 },
  'BW': { lat: -22.3285, lng: 24.6849, zoom: 6 },
  'BF': { lat: 12.2383, lng: -1.5616, zoom: 6 },
  'BI': { lat: -3.3731, lng: 29.9189, zoom: 8 },
  'CM': { lat: 5.9631, lng: 10.1591, zoom: 6 },
  'CV': { lat: 16.5388, lng: -23.0418, zoom: 8 },
  'CF': { lat: 6.6111, lng: 20.9394, zoom: 6 },
  'TD': { lat: 15.4542, lng: 18.7322, zoom: 5 },
  'KM': { lat: -11.6455, lng: 43.3333, zoom: 9 },
  'CG': { lat: -0.2280, lng: 15.8277, zoom: 6 },
  'CD': { lat: -4.0383, lng: 21.7587, zoom: 5 },
  'CI': { lat: 7.5400, lng: -5.5471, zoom: 7 },
  'DJ': { lat: 11.5886, lng: 42.5903, zoom: 8 },
  'EG': { lat: 26.8206, lng: 30.8025, zoom: 5 },
  'GQ': { lat: 1.6508, lng: 10.2679, zoom: 8 },
  'ER': { lat: 15.1794, lng: 39.7823, zoom: 6 },
  'SZ': { lat: -26.5225, lng: 31.4659, zoom: 9 },
  'ET': { lat: 9.1450, lng: 40.4897, zoom: 5 },
  'GA': { lat: -0.8037, lng: 11.6094, zoom: 7 },
  'GM': { lat: 13.4432, lng: -15.3101, zoom: 8 },
  'GH': { lat: 7.9465, lng: -1.0232, zoom: 7 },
  'GN': { lat: 9.9456, lng: -9.6966, zoom: 7 },
  'GW': { lat: 11.8037, lng: -15.1804, zoom: 8 },
  'KE': { lat: -0.0236, lng: 37.9062, zoom: 6 },
  'LS': { lat: -29.6100, lng: 28.2336, zoom: 8 },
  'LR': { lat: 6.4281, lng: -9.4295, zoom: 7 },
  'LY': { lat: 26.3351, lng: 17.2283, zoom: 5 },
  'MG': { lat: -18.7669, lng: 46.8691, zoom: 5 },
  'MW': { lat: -13.2543, lng: 34.3015, zoom: 6 },
  'ML': { lat: 17.5707, lng: -3.9962, zoom: 5 },
  'MR': { lat: 21.0079, lng: -10.9408, zoom: 5 },
  'MU': { lat: -20.3484, lng: 57.5522, zoom: 9 },
  'MA': { lat: 31.7917, lng: -7.0926, zoom: 5 },
  'MZ': { lat: -18.6657, lng: 35.5296, zoom: 5 },
  'NA': { lat: -22.9576, lng: 18.4904, zoom: 5 },
  'NE': { lat: 17.6078, lng: 8.0817, zoom: 5 },
  'NG': { lat: 9.0820, lng: 8.6753, zoom: 6 },
  'RW': { lat: -1.9403, lng: 29.8739, zoom: 8 },
  'ST': { lat: 0.1864, lng: 6.6131, zoom: 9 },
  'SN': { lat: 14.4974, lng: -14.4524, zoom: 7 },
  'SC': { lat: -4.6796, lng: 55.4920, zoom: 9 },
  'SL': { lat: 8.4606, lng: -11.7799, zoom: 7 },
  'SO': { lat: 5.1521, lng: 46.1996, zoom: 5 },
  'ZA': { lat: -30.5595, lng: 22.9375, zoom: 5 },
  'SS': { lat: 6.8770, lng: 31.3070, zoom: 6 },
  'SD': { lat: 12.8628, lng: 30.2176, zoom: 5 },
  'TZ': { lat: -6.3690, lng: 34.8888, zoom: 5 },
  'TG': { lat: 8.6195, lng: 0.8248, zoom: 7 },
  'TN': { lat: 33.8869, lng: 9.5375, zoom: 6 },
  'UG': { lat: 1.3733, lng: 32.2903, zoom: 7 },
  'ZM': { lat: -13.1339, lng: 27.8493, zoom: 6 },
  'ZW': { lat: -19.0154, lng: 29.1549, zoom: 6 },
};

interface LocationMapPickerProps {
  position: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
  countryCode?: string;
}

// Component to handle map click events
function MapClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter map when country changes
function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Draggable marker component
function DraggableMarker({ position, onPositionChange }: { 
  position: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const newPos = marker.getLatLng();
        onPositionChange(newPos.lat, newPos.lng);
      }
    },
  };

  return (
    <Marker 
      position={[position.lat, position.lng]} 
      icon={orangeIcon}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}

export default function LocationMapPicker({ position, onPositionChange, countryCode }: LocationMapPickerProps) {
  const coords = countryCode ? countryCoordinates[countryCode] : { lat: 5.3600, lng: -4.0083, zoom: 12 };
  const center: [number, number] = [coords?.lat || 5.3600, coords?.lng || -4.0083];
  const zoom = coords?.zoom || 12;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPositionChange={onPositionChange} />
        <MapCenterUpdater center={center} zoom={zoom} />
        <DraggableMarker position={position} onPositionChange={onPositionChange} />
      </MapContainer>
    </div>
  );
}
