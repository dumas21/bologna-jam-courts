
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Zap } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherInfoProps {
  playgroundName: string;
  location: string;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({ playgroundName, location }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate weather API call with realistic data for Bologna area
    const fetchWeather = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate realistic weather data for Bologna
      const conditions = ['Soleggiato', 'Nuvoloso', 'Parzialmente nuvoloso', 'Pioggia leggera'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const mockWeather: WeatherData = {
        temperature: Math.floor(Math.random() * 20) + 5, // 5-25°C
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 15) + 5 // 5-20 km/h
      };
      
      setWeather(mockWeather);
      setLoading(false);
    };
    
    fetchWeather();
  }, [location]);
  
  const getWeatherIcon = (condition: string) => {
    const iconProps = { size: 32, className: "animate-neon-glow" };
    
    if (condition.includes('Soleggiato') || condition.includes('Sun')) {
      return <Sun {...iconProps} className="text-yellow-400 animate-neon-glow" />;
    } else if (condition.includes('Pioggia') || condition.includes('Rain')) {
      return <CloudRain {...iconProps} className="text-blue-400 animate-neon-glow" />;
    } else if (condition.includes('Neve') || condition.includes('Snow')) {
      return <CloudSnow {...iconProps} className="text-blue-300 animate-neon-glow" />;
    } else {
      return <Cloud {...iconProps} className="text-gray-400 animate-neon-glow" />;
    }
  };
  
  if (loading) {
    return (
      <div className="weather-cartoon p-6 mb-6 relative bg-white rounded-lg border-4 border-orange-500">
        <div className="relative z-10 flex items-center justify-center h-24">
          <div className="flex items-center space-x-2">
            <Zap size={24} className="text-orange-500 animate-bounce" />
            <p className="text-orange-500 text-sm font-bold" style={{textShadow: '1px 1px 0px #000', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '2px'}}>LOADING WEATHER...</p>
            <Zap size={24} className="text-orange-500 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!weather) {
    return (
      <div className="weather-cartoon p-6 mb-6 relative bg-white rounded-lg border-4 border-red-500">
        <div className="relative z-10 flex items-center justify-center h-24">
          <p className="text-red-600 text-sm font-bold" style={{textShadow: '1px 1px 0px #000', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '2px'}}>WEATHER ERROR!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="weather-cartoon p-6 mb-6 relative bg-white rounded-lg border-4 border-orange-500">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-orange-500 text-sm font-bold flex items-center" style={{textShadow: '1px 1px 0px #000', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '2px'}}>
            {getWeatherIcon(weather.condition)}
            <span className="ml-3">METEO {playgroundName.toUpperCase()}</span>
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
            <div className="text-orange-500 text-xs font-bold mb-1" style={{textShadow: '1px 1px 0px #000', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px'}}>TEMP</div>
            <div className="text-blue-600 text-2xl font-black font-orbitron">{weather.temperature}°C</div>
          </div>
          
          <div className="text-center bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
            <div className="text-orange-500 text-xs font-bold mb-1" style={{textShadow: '1px 1px 0px #000', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px'}}>STATO</div>
            <div className="text-blue-600 text-xs font-black font-orbitron">{weather.condition.toUpperCase()}</div>
          </div>
          
          <div className="text-center bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
            <div className="text-orange-500 text-xs font-bold mb-1" style={{textShadow: '1px 1px 0px #000', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px'}}>UMIDITÀ</div>
            <div className="text-blue-600 text-lg font-black font-orbitron">{weather.humidity}%</div>
          </div>
          
          <div className="text-center bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
            <div className="text-orange-500 text-xs font-bold mb-1" style={{textShadow: '1px 1px 0px #000', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px'}}>VENTO</div>
            <div className="text-blue-600 text-lg font-black font-orbitron">{weather.windSpeed} KM/H</div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t-2 border-gray-300">
          <p className="text-orange-500 text-xs font-bold text-center" style={{textShadow: '1px 1px 0px #000', fontFamily: 'ITC Machine, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '2px'}}>
            📍 {location.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
