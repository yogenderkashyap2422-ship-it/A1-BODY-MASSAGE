import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Clock, Navigation } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const workerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LiveMapProps {
  workerLat?: number;
  workerLng?: number;
  customerLat: number;
  customerLng: number;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

export default function LiveMap({ workerLat, workerLng, customerLat, customerLng }: LiveMapProps) {
  const [center, setCenter] = useState<[number, number]>([customerLat, customerLng]);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (workerLat && workerLng) {
      setCenter([workerLat, workerLng]);
      setRoute([
        [workerLat, workerLng],
        [customerLat, customerLng]
      ]);
      
      const dist = calculateDistance(workerLat, workerLng, customerLat, customerLng);
      setDistance(dist);
      
      // Assume average speed of 20 km/h in city traffic
      const timeInHours = dist / 20;
      const timeInMinutes = Math.round(timeInHours * 60);
      setEta(timeInMinutes);
    }
  }, [workerLat, workerLng, customerLat, customerLng]);

  return (
    <div className="flex flex-col gap-2">
      {distance !== null && eta !== null && (
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm text-sm">
          <div className="flex items-center gap-2 text-stone-700">
            <Navigation className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{distance.toFixed(1)} km away</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="font-medium">ETA: {eta} min</span>
          </div>
        </div>
      )}
      <div className="h-64 w-full rounded-xl overflow-hidden shadow-sm border border-stone-200 z-0 relative">
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={center} zoom={14} />
          
          {workerLat && workerLng && (
            <>
              <Marker position={[workerLat, workerLng]} icon={workerIcon}>
                <Popup>Worker Location</Popup>
              </Marker>
              <Polyline positions={route} color="#d97706" weight={4} dashArray="10, 10" />
            </>
          )}
          
          <Marker position={[customerLat, customerLng]} icon={customerIcon}>
            <Popup>Customer Location</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
