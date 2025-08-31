import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, ArrowUpDown, List, X } from 'lucide-react';

interface MapSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onShowFilters: () => void;
  onShowList: () => void;
}

export function MapSidebar({ 
  isOpen, 
  onClose, 
  sortBy, 
  onSortChange, 
  onShowFilters, 
  onShowList 
}: MapSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-64 bg-background/95 backdrop-blur-sm border-l border-border shadow-lg z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Options de carte</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 space-y-4">
          {/* Sort Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Trier par
            </label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full h-8 text-xs">
                <ArrowUpDown className="w-3 h-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Plus récent</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Actions
            </label>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onShowFilters}
                className="w-full h-8 text-xs justify-start"
              >
                <SlidersHorizontal className="w-3 h-3 mr-2" />
                Filtres avancés
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onShowList}
                className="w-full h-8 text-xs justify-start"
              >
                <List className="w-3 h-3 mr-2" />
                Affichage liste
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}