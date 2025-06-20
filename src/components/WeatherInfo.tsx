
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
  
  // Stile ancora più aggressivo per forzare il bianco
  const forceAbsoluteWhite = {
    color: '#FFFFFF !important',
    textShadow: '2px 2px 4px rgba(0,0,0,1)',
    fontWeight: 'bold',
    letterSpacing: '1px',
    fontSize: 'inherit',
    WebkitTextFillColor: '#FFFFFF',
    textDecoration: 'none',
    outline: 'none'
  };
  
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#000000', 
        border: '4px solid #FF6B35', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '24px',
        color: '#FFFFFF'
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Zap size={24} className="text-orange-500 animate-bounce" />
            <p style={{
              ...forceAbsoluteWhite, 
              fontSize: '14px',
              margin: 0,
              padding: 0
            }}>
              LOADING WEATHER...
            </p>
            <Zap size={24} className="text-orange-500 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!weather) {
    return (
      <div style={{
        backgroundColor: '#000000', 
        border: '4px solid #FF6B35', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '24px',
        color: '#FFFFFF'
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96px'}}>
          <p style={{
            ...forceAbsoluteWhite, 
            fontSize: '14px',
            margin: 0,
            padding: 0
          }}>
            WEATHER ERROR!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: '#000000', 
      border: '4px solid #FF6B35', 
      borderRadius: '8px', 
      padding: '24px', 
      marginBottom: '24px',
      color: '#FFFFFF'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 12,
        color: '#FFFFFF'
      }}>
        {getWeatherIcon(weather.condition)}
        <span style={{
          color: '#FFFFFF !important',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,1)',
          fontSize: '18px',
          letterSpacing: '1px',
          WebkitTextFillColor: '#FFFFFF',
          margin: 0,
          padding: 0
        }}>
          {playgroundName}
        </span>
      </div>
      <p style={{
        ...forceAbsoluteWhite, 
        fontSize: '16px', 
        margin: '8px 0',
        padding: 0
      }}>
        Condizione: <span style={forceAbsoluteWhite}>{weather.condition}</span>
      </p>
      <p style={{
        ...forceAbsoluteWhite, 
        fontSize: '16px', 
        margin: '8px 0',
        padding: 0
      }}>
        Temperatura: <span style={forceAbsoluteWhite}>{weather.temperature}°C</span>
      </p>
      <p style={{
        ...forceAbsoluteWhite, 
        fontSize: '16px', 
        margin: '8px 0',
        padding: 0
      }}>
        Umidità: <span style={forceAbsoluteWhite}>{weather.humidity}%</span>
      </p>
      <p style={{
        ...forceAbsoluteWhite, 
        fontSize: '16px', 
        margin: '8px 0',
        padding: 0
      }}>
        Velocità vento: <span style={forceAbsoluteWhite}>{weather.windSpeed} km/h</span>
      </p>
    </div>
  );
};

export default WeatherInfo;
