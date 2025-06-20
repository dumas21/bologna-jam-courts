
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaygroundFilters } from "@/types/playground";

interface PlaygroundFiltersProps {
  filters: PlaygroundFilters;
  onFiltersChange: (filters: PlaygroundFilters) => void;
}

const PlaygroundFiltersComponent: React.FC<PlaygroundFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleDistrictChange = (value: string) => {
    onFiltersChange({ ...filters, district: value });
  };

  const handleShadeChange = (value: string) => {
    onFiltersChange({ ...filters, shade: value });
  };

  const handleRefreshmentChange = (value: string) => {
    onFiltersChange({ ...filters, refreshment: value });
  };

  return (
    <div className="arcade-section p-4 mb-4">
      <h2 className="text-lg font-bold mb-4 arcade-heading">FILTRA I PLAYGROUND</h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Select value={filters.district} onValueChange={handleDistrictChange}>
            <SelectTrigger className="arcade-button h-12">
              <SelectValue placeholder="TUTTI I QUARTIERI" />
            </SelectTrigger>
            <SelectContent className="arcade-card bg-black border-2 border-orange-500">
              <SelectItem value="" className="text-white hover:bg-orange-500">TUTTI I QUARTIERI</SelectItem>
              <SelectItem value="centro" className="text-white hover:bg-orange-500">CENTRO</SelectItem>
              <SelectItem value="bolognina" className="text-white hover:bg-orange-500">BOLOGNINA</SelectItem>
              <SelectItem value="savena" className="text-white hover:bg-orange-500">SAVENA</SelectItem>
              <SelectItem value="san_donato" className="text-white hover:bg-orange-500">SAN DONATO</SelectItem>
              <SelectItem value="murri" className="text-white hover:bg-orange-500">MURRI</SelectItem>
              <SelectItem value="navile" className="text-white hover:bg-orange-500">NAVILE</SelectItem>
              <SelectItem value="mazzini" className="text-white hover:bg-orange-500">MAZZINI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <Select value={filters.shade} onValueChange={handleShadeChange}>
            <SelectTrigger className="arcade-button h-12">
              <SelectValue placeholder="OMBRA" />
            </SelectTrigger>
            <SelectContent className="arcade-card bg-black border-2 border-orange-500">
              <SelectItem value="" className="text-white hover:bg-orange-500">TUTTE</SelectItem>
              <SelectItem value="si" className="text-white hover:bg-orange-500">SÌ</SelectItem>
              <SelectItem value="no" className="text-white hover:bg-orange-500">NO</SelectItem>
              <SelectItem value="parziale" className="text-white hover:bg-orange-500">PARZIALE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <Select value={filters.refreshment} onValueChange={handleRefreshmentChange}>
            <SelectTrigger className="arcade-button h-12">
              <SelectValue placeholder="RISTORO" />
            </SelectTrigger>
            <SelectContent className="arcade-card bg-black border-2 border-orange-500">
              <SelectItem value="" className="text-white hover:bg-orange-500">TUTTI</SelectItem>
              <SelectItem value="interno" className="text-white hover:bg-orange-500">INTERNO</SelectItem>
              <SelectItem value="esterno" className="text-white hover:bg-orange-500">ESTERNO</SelectItem>
              <SelectItem value="no" className="text-white hover:bg-orange-500">NO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundFiltersComponent;
