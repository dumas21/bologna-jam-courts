
import React from 'react';
import { Playground } from '@/types/playground';
import { SignpostBig, Clock, Users, Droplets, TreePine, Lightbulb } from 'lucide-react';

interface PlaygroundInfoProps {
  playground: Playground;
  checkInCount: number;
}

const PlaygroundInfo: React.FC<PlaygroundInfoProps> = ({ playground, checkInCount }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 arcade-info">
        <SignpostBig size={16} className="text-orange-600 arcade-icon" />
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${playground.address}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors arcade-link"
        >
          {playground.address}
        </a>
      </div>
      <div className="flex items-center gap-2 arcade-info">
        <Clock size={16} className="text-blue-600 arcade-icon" />
        <span className="arcade-text">ORARIO: {playground.openHours || 'NON DISPONIBILE'}</span>
      </div>
      <div className="flex items-center gap-2 arcade-info">
        <Users size={16} className="text-green-500 arcade-icon" />
        <span className="arcade-text">
          {checkInCount} GIOCATORI CONNESSI
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 arcade-feature">
          {playground.hasFountain && <Droplets size={16} className="text-blue-400 arcade-icon" />}
          {playground.hasFountain && <span className="arcade-text">ACQUA POTABILE</span>}
        </div>
        <div className="flex items-center gap-2 arcade-feature">
          {playground.hasShade && <TreePine size={16} className="text-green-600 arcade-icon" />}
          {playground.hasShade && <span className="arcade-text">OMBRA DISPONIBILE</span>}
        </div>
        <div className="flex items-center gap-2 arcade-feature">
          {playground.hasLighting && <Lightbulb size={16} className="text-yellow-500 arcade-icon" />}
          {playground.hasLighting && <span className="arcade-text">ILLUMINAZIONE NOTTURNA</span>}
        </div>
      </div>
    </div>
  );
};

export default PlaygroundInfo;
