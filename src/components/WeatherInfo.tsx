
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
  
  // STILE BIANCO ASSOLUTO - MASSIMA PRIORITÀ
  const forceWhiteText = {
    color: '#FFFFFF',
    textShadow: '1px 1px 3px #000',
    fontWeight: 'bold',
    letterSpacing: '1px',
    fontSize: 'inherit'
  };
  
  if (loading) {
    return (
      <div className="weather-section" style={{backgroundColor: '#000000', border: '4px solid #FF6B35', borderRadius: '8px', padding: '24px', marginBottom: '24px'}}>
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
      <div className="weather-section" style={{backgroundColor: '#000000', border: '4px solid #FF6B35', borderRadius: '8px', padding: '24px', marginBottom: '24px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96px'}}>
          <p style={{...forceWhiteText, fontSize: '14px'}}>WEATHER ERROR!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="weather-section" style={{backgroundColor: '#000000', border: '4px solid #FF6B35', borderRadius: '8px', padding: '24px', marginBottom: '24px'}}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {getWeatherIcon(weather.condition)}
          <span
            style={{
              color: '#fff',
              fontWeight: 'bold',
              textShadow: '1px 1px 3px #000',
              fontSize: '18px',
              letterSpacing: '1px'
            }}
          >
            METEO {playgroundName.toUpperCase()}
          </span>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div style={{textAlign: 'center', backgroundColor: '#000000', borderRadius: '8px', padding: '12px', border: '2px solid #FF6B35'}}>
            <div style={{...forceWhiteText, fontSize: '12px', marginBottom: '4px'}}>TEMP</div>
            <div style={{...forceWhiteText, fontSize: '24px'}}>{weather.temperature}°C</div>
          </div>
          
          <div style={{textAlign: 'center', backgroundColor: '#000000', borderRadius: '8px', padding: '12px', border: '2px solid #FF6B35'}}>
            <div style={{...forceWhiteText, fontSize: '12px', marginBottom: '4px'}}>STATO</div>
            <div style={{...forceWhiteText, fontSize: '12px'}}>{weather.condition.toUpperCase()}</div>
          </div>
          
          <div style={{textAlign: 'center', backgroundColor: '#000000', borderRadius: '8px', padding: '12px', border: '2px solid #FF6B35'}}>
            <div style={{...forceWhiteText, fontSize: '12px', marginBottom: '4px'}}>UMIDITÀ</div>
            <div style={{...forceWhiteText, fontSize: '18px'}}>{weather.humidity}%</div>
          </div>
          
          <div style={{textAlign: 'center', backgroundColor: '#000000', borderRadius: '8px', padding: '12px', border: '2px solid #FF6B35'}}>
            <div style={{...forceWhiteText, fontSize: '12px', marginBottom: '4px'}}>VENTO</div>
            <div style={{...forceWhiteText, fontSize: '18px'}}>{weather.windSpeed} KM/H</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
