import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Playground } from '@/types/playground';

interface LeafletMapProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
  getPlayerCount: (id: string) => number;
  getFieldStatus: (id: string) => { label: string; color: string };
  getRatingAvg: (id: string) => number | null;
}

const LeafletMap = ({
  playgrounds,
  selectedPlayground,
  onSelectPlayground,
  getPlayerCount,
  getFieldStatus,
  getRatingAvg,
}: LeafletMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Bologna center
    const map = L.map(containerRef.current, {
      center: [44.4949, 11.3426],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    playgrounds.forEach(pg => {
      if (!pg.latitude || !pg.longitude) return;

      const count = getPlayerCount(pg.id);
      const status = getFieldStatus(pg.id);
      const rating = getRatingAvg(pg.id);
      const isSelected = selectedPlayground?.id === pg.id;

      // Custom icon with player count
      const iconHtml = `
        <div style="
          background: ${count > 0 ? (count >= 10 ? '#ef4444' : '#f59e0b') : '#22c55e'};
          border: 3px solid ${isSelected ? '#FFD700' : '#FF6B35'};
          border-radius: 50%;
          width: ${isSelected ? '48px' : '40px'};
          height: ${isSelected ? '48px' : '40px'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Press Start 2P', monospace;
          font-size: ${isSelected ? '14px' : '11px'};
          color: white;
          text-shadow: 1px 1px 2px black;
          box-shadow: 0 0 ${isSelected ? '15px' : '8px'} ${isSelected ? '#FFD700' : 'rgba(255,107,53,0.5)'};
          cursor: pointer;
          transition: all 0.2s;
        ">🏀</div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        iconSize: [isSelected ? 48 : 40, isSelected ? 48 : 40],
        iconAnchor: [isSelected ? 24 : 20, isSelected ? 24 : 20],
        className: '',
      });

      const ratingStr = rating ? `⭐ ${rating.toFixed(1)}` : 'Nessuna valutazione';

      const popup = L.popup({ className: 'arcade-popup' }).setContent(`
        <div style="font-family: 'Press Start 2P', monospace; background: #000; color: #fff; padding: 12px; border-radius: 8px; border: 2px solid #FF6B35; min-width: 180px;">
          <div style="color: #FF6B35; font-size: 10px; margin-bottom: 8px; text-transform: uppercase;">${pg.name}</div>
          <div style="font-size: 8px; margin-bottom: 4px; color: ${status.color.replace('text-', '').replace('-400', '')};">
            ${status.label}
          </div>
          <div style="font-size: 8px; color: #FFD700;">${ratingStr}</div>
          <div style="font-size: 7px; margin-top: 6px; color: #aaa;">${pg.address}</div>
        </div>
      `);

      const marker = L.marker([pg.latitude, pg.longitude], { icon })
        .addTo(map)
        .bindPopup(popup);

      marker.on('click', () => {
        onSelectPlayground(pg);
      });

      markersRef.current.push(marker);
    });
  }, [playgrounds, selectedPlayground, getPlayerCount, getFieldStatus, getRatingAvg, onSelectPlayground]);

  // Pan to selected playground
  useEffect(() => {
    if (selectedPlayground?.latitude && selectedPlayground?.longitude && mapRef.current) {
      mapRef.current.flyTo([selectedPlayground.latitude, selectedPlayground.longitude], 15, {
        duration: 0.5,
      });
    }
  }, [selectedPlayground]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border-2 border-jam-neon-orange" style={{ boxShadow: '0 0 15px rgba(255,107,53,0.4)' }}>
      <div ref={containerRef} style={{ height: '450px', width: '100%' }} />
    </div>
  );
};

export default LeafletMap;
