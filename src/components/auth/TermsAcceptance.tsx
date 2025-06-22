
import { Checkbox } from "@/components/ui/checkbox";
import { Info, Check } from "lucide-react";

interface TermsAcceptanceProps {
  acceptedTerms: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
}

const TermsAcceptance = ({ acceptedTerms, onAcceptedTermsChange }: TermsAcceptanceProps) => {
  return (
    <div className="arcade-section" style={{
      background: 'rgba(0, 0, 0, 0.8)',
      border: '2px solid #ff00ff',
      borderRadius: '10px',
      padding: '15px',
      marginTop: '15px'
    }}>
      <div className="flex items-start space-x-3 mb-3">
        <div className="relative">
          <Checkbox
            id="accept-terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => onAcceptedTermsChange(checked as boolean)}
            className="w-6 h-6"
            style={{
              borderColor: '#00ffff',
              backgroundColor: acceptedTerms ? '#00ffff' : 'transparent',
              borderWidth: '2px'
            }}
          />
          {acceptedTerms && (
            <Check 
              size={16} 
              className="absolute top-1 left-1 text-black font-bold animate-pulse" 
            />
          )}
        </div>
        <label 
          htmlFor="accept-terms" 
          className="text-sm cursor-pointer flex-1"
          style={{ 
            color: '#00ffff', 
            fontSize: '8px',
            fontFamily: 'Press Start 2P, monospace',
            lineHeight: '1.4',
            textShadow: '1px 1px 0px #000'
          }}
        >
          Accetto il regolamento e le condizioni d'uso *
        </label>
      </div>
      
      <div className="flex items-start space-x-3">
        <Info size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <div className="font-bold mb-2" style={{ 
            color: '#ffcc00', 
            fontSize: '10px',
            fontFamily: 'Press Start 2P, monospace',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '1px 1px 0px #000'
          }}>
            REGOLE ARCADE
          </div>
          <div style={{ 
            color: '#00ffff', 
            fontSize: '8px',
            fontFamily: 'Press Start 2P, monospace',
            lineHeight: '1.4',
            textShadow: '1px 1px 0px #000'
          }}>
            Accedendo, accetti che la tua email sia usata per la newsletter. Le chat si azzerano ogni 72h. Puoi inviare al massimo 2 messaggi ogni 24h per playground.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptance;
