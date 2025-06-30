
import React from 'react';
import ProjectExporter from '@/components/ProjectExporter';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Export = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-6 text-white hover:text-purple-300 transition-colors"
        >
          <ArrowLeft size={20} />
          Torna indietro
        </button>
        
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            ESPORTA PROGETTO
          </h1>
          
          <div className="text-center space-y-6">
            <p className="text-gray-300 text-lg">
              Scarica tutto il codice del progetto Playground Jam Bologna
            </p>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cosa include:</h2>
              <ul className="text-gray-300 space-y-2 text-left">
                <li>• Tutti i file sorgente TypeScript/React</li>
                <li>• Configurazioni Vite e Tailwind</li>
                <li>• Dati dei playground di Bologna</li>
                <li>• Componenti UI e stili</li>
                <li>• Package.json con tutte le dipendenze</li>
                <li>• README con istruzioni</li>
              </ul>
            </div>
            
            <ProjectExporter />
            
            <div className="mt-8 p-4 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-500">
              <p className="text-yellow-200 text-sm">
                <strong>Nota:</strong> Dopo il download, esegui <code>npm install</code> per installare le dipendenze.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
