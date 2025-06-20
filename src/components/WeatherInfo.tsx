
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
    const fetchWeather = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const conditions = ['Soleggiato', 'Nuvoloso', 'Parzialmente nuvoloso', 'Pioggia leggera'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const mockWeather: WeatherData = {
        temperature: Math.floor(Math.random() * 20) + 5,
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 15) + 5
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
  
  const forceWhiteText = {
    color: '#FFFFFF',
    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
    fontWeight: 'bold',
    letterSpacing: '1px',
    fontSize: 'inherit'
  };
  
  if (loading) {
    return (
      <div style={{backgroundColor: '#000000', border: '4px solid #FF6B35', borderRadius: '8px', padding: '24px', marginBottom: '24px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Zap size={24} className="text-orange-500 animate-bounce" />
            <p style={{...forceWhiteText, fontSize: '14px'}}>LOADING WEATHER...</p>
            <Zap size={24} className="text-orange-500 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!weather) {
    return (
      <div style={{backgroundColor: '#000000', border: '4px solid #FF6B35', borderRadius: '8px', padding: '24px', marginBottom: '24px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96px'}}>
          <p style={{...forceWhiteText, fontSize: '14px'}}>WEATHER ERROR!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{backgroundColor: '#000000', border: '4px solid #FF6B35', borderRadius: '8px', padding: '24px', marginBottom: '24px'}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {getWeatherIcon(weather.condition)}
        <span style={{
          color: '#FFFFFF',
          fontWeight: 'bold',
          textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
          fontSize: '18px',
          letterSpacing: '1px'
        }}>
          {playgroundName}
        </span>
      </div>
      <p style={{...forceWhiteText, fontSize: '16px', margin: '8px 0'}}>
        Condizione: {weather.condition}
      </p>
      <p style={{...forceWhiteText, fontSize: '16px', margin: '8px 0'}}>
        Temperatura: {weather.temperature}°C
      </p>
      <p style={{...forceWhiteText, fontSize: '16px', margin: '8px 0'}}>
        Umidità: {weather.humidity}%
      </p>
      <p style={{...forceWhiteText, fontSize: '16px', margin: '8px 0'}}>
        Velocità vento: {weather.windSpeed} km/h
      </p>
    </div>
  );
};

export default WeatherInfo;
