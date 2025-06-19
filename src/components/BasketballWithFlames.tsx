
import React from 'react';

interface BasketballWithFlamesProps {
  size?: number;
  className?: string;
}

const BasketballWithFlames = ({ size = 24, className = "" }: BasketballWithFlamesProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    className={className}
    fill="none"
  >
    <defs>
      {/* Basketball gradient */}
      <radialGradient id="basketballGrad" cx="0.3" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#ff8c42" />
        <stop offset="40%" stopColor="#e55100" />
        <stop offset="80%" stopColor="#d84315" />
        <stop offset="100%" stopColor="#bf360c" />
      </radialGradient>
      
      {/* Flame gradients */}
      <radialGradient id="flameGrad1" cx="0.5" cy="1" r="0.8">
        <stop offset="0%" stopColor="#ffff00" />
        <stop offset="30%" stopColor="#ff8c00" />
        <stop offset="70%" stopColor="#ff4500" />
        <stop offset="100%" stopColor="#dc143c" />
      </radialGradient>
      
      <radialGradient id="flameGrad2" cx="0.5" cy="1" r="0.6">
        <stop offset="0%" stopColor="#fff700" />
        <stop offset="50%" stopColor="#ff6600" />
        <stop offset="100%" stopColor="#ff0000" />
      </radialGradient>
      
      {/* Drop shadow filter */}
      <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5"/>
      </filter>
    </defs>
    
    {/* Flames behind basketball */}
    <path 
      d="M8 28 Q6 24 8 20 Q10 16 8 12 Q12 8 16 12 Q20 8 24 12 Q22 16 24 20 Q26 24 24 28" 
      fill="url(#flameGrad1)" 
      opacity="0.9"
      filter="url(#dropShadow)"
    />
    <path 
      d="M10 26 Q9 23 10 20 Q11 17 10 14 Q13 11 16 14 Q19 11 22 14 Q21 17 22 20 Q23 23 22 26" 
      fill="url(#flameGrad2)" 
      opacity="0.8"
    />
    <path 
      d="M12 24 Q11.5 22 12 20 Q12.5 18 12 16 Q14 14 16 16 Q18 14 20 16 Q19.5 18 20 20 Q20.5 22 20 24" 
      fill="#ffff00" 
      opacity="0.7"
    />
    
    {/* Basketball main body */}
    <circle 
      cx="16" 
      cy="18" 
      r="10" 
      fill="url(#basketballGrad)" 
      stroke="#8d4e00" 
      strokeWidth="0.5"
      filter="url(#dropShadow)"
    />
    
    {/* Basketball lines */}
    <path 
      d="M16 8 Q19.5 12.5 19.5 18 Q19.5 23.5 16 28" 
      stroke="#8d4e00" 
      strokeWidth="2" 
      fill="none"
      opacity="0.8"
    />
    <path 
      d="M16 8 Q12.5 12.5 12.5 18 Q12.5 23.5 16 28" 
      stroke="#8d4e00" 
      strokeWidth="2" 
      fill="none"
      opacity="0.8"
    />
    <path 
      d="M6 18 Q10.5 14.5 16 14.5 Q21.5 14.5 26 18" 
      stroke="#8d4e00" 
      strokeWidth="2" 
      fill="none"
      opacity="0.8"
    />
    <path 
      d="M6 18 Q10.5 21.5 16 21.5 Q21.5 21.5 26 18" 
      stroke="#8d4e00" 
      strokeWidth="2" 
      fill="none"
      opacity="0.8"
    />
    
    {/* Basketball highlight */}
    <ellipse 
      cx="12" 
      cy="13" 
      rx="3" 
      ry="2" 
      fill="#ffab70" 
      opacity="0.6"
      transform="rotate(-25 12 13)"
    />
    
    {/* Flame particles */}
    <circle cx="8" cy="12" r="1" fill="#ffff00" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="24" cy="14" r="0.8" fill="#ff6600" opacity="0.7">
      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="6" cy="16" r="0.6" fill="#ff0000" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="26" cy="18" r="0.7" fill="#ff8c00" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.5s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

export default BasketballWithFlames;
