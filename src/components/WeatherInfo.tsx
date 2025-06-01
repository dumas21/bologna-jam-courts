
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react';

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
    if (condition.includes('Soleggiato') || condition.includes('Sun')) {
      return <Sun size={24} className="text-yellow-500" />;
    } else if (condition.includes('Pioggia') || condition.includes('Rain')) {
      return <CloudRain size={24} className="text-blue-500" />;
    } else if (condition.includes('Neve') || condition.includes('Snow')) {
      return <CloudSnow size={24} className="text-blue-300" />;
    } else {
      return <Cloud size={24} className="text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex items-center justify-center h-20">
          <p className="text-gray-500 text-sm">Caricamento meteo...</p>
        </div>
      </div>
    );
  }
  
  if (!weather) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex items-center justify-center h-20">
          <p className="text-red-500 text-sm">Errore nel caricamento meteo</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <h4 className="font-press-start text-xs mb-3 text-jam-purple flex items-center">
        {getWeatherIcon(weather.condition)}
        <span className="ml-2">Meteo a {playgroundName}</span>
      </h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-600">Temperatura</span>
          <span className="font-semibold text-lg text-jam-blue">{weather.temperature}°C</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-600">Condizioni</span>
          <span className="font-medium">{weather.condition}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-600">Umidità</span>
          <span className="font-medium">{weather.humidity}%</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-600">Vento</span>
          <span className="font-medium">{weather.windSpeed} km/h</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Dati meteo aggiornati per la zona di {location}
        </p>
      </div>
    </div>
  );
};

export default WeatherInfo;
