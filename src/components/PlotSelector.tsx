import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { plotService } from '../services/plotService';
import type { Plot } from '../types/database';

interface PlotSelectorProps {
  selectedPlotId?: string;
  onPlotSelect: (plotId: string | undefined) => void;
  categoryId?: string;
}

export function PlotSelector({ selectedPlotId, onPlotSelect, categoryId }: PlotSelectorProps) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlots();
  }, [categoryId]);

  const loadPlots = async () => {
    try {
      const data = categoryId 
        ? await plotService.getPlotsByCategory(categoryId)
        : await plotService.getPlots();
      setPlots(data);
    } catch (error) {
      console.error('Error loading plots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlot = plots.find(plot => plot.id === selectedPlotId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors"
        disabled={isLoading}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className={selectedPlot ? 'text-gray-900' : 'text-gray-500'}>
            {isLoading ? 'Loading...' : selectedPlot?.name || 'Select a plot'}
          </span>
          {selectedPlot?.category && (
            <span
              className="px-2 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: selectedPlot.category.color }}
            >
              {selectedPlot.category.name}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onPlotSelect(undefined);
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <span className="text-gray-500">No plot selected</span>
          </button>
          
          {plots.map((plot) => (
            <button
              key={plot.id}
              onClick={() => {
                onPlotSelect(plot.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                selectedPlotId === plot.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{plot.name}</div>
                  {plot.description && (
                    <div className="text-sm text-gray-600">{plot.description}</div>
                  )}
                </div>
                {plot.category && (
                  <span
                    className="px-2 py-1 text-xs rounded-full text-white ml-2"
                    style={{ backgroundColor: plot.category.color }}
                  >
                    {plot.category.name}
                  </span>
                )}
              </div>
            </button>
          ))}
          
          {plots.length === 0 && !isLoading && (
            <div className="px-3 py-2 text-gray-500 text-center">
              No plots available
            </div>
          )}
        </div>
      )}
    </div>
  );
}