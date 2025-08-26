import React from 'react';
import { 
  MapPin, 
  Rows, 
  Calendar, 
  TrendingUp, 
  Sprout, 
  Cloud, 
  Sun, 
  Droplets, 
  Leaf, 
  Tractor, 
  Wheat, 
  Apple, 
  Carrot, 
  Flower2
} from 'lucide-react';
import { getCurrentSeason } from '../utils/seasonTheme';

// Icon mapping for different seasons
const seasonalIcons = {
  spring: {
    plots: Flower2,
    rows: Sprout,
    calendar: Cloud,
    categories: Leaf
  },
  summer: {
    plots: Sun,
    rows: Wheat,
    calendar: Droplets,
    categories: Apple
  },
  fall: {
    plots: Apple,
    rows: Carrot,
    calendar: Leaf,
    categories: Wheat
  },
  winter: {
    plots: MapPin,
    rows: Tractor,
    calendar: Cloud,
    categories: Sprout
  }
};

// Default icons (fallback)
const defaultIcons = {
  plots: MapPin,
  rows: Rows,
  calendar: Calendar,
  categories: TrendingUp
};

interface FarmIconProps {
  type: 'plots' | 'rows' | 'calendar' | 'categories';
  className?: string;
  seasonal?: boolean;
}

export function FarmIcon({ type, className = "w-6 h-6", seasonal = true }: FarmIconProps) {
  // Get the current season
  const season = getCurrentSeason();
  
  // Get the appropriate icon based on season if seasonal is true
  const IconComponent = seasonal 
    ? seasonalIcons[season][type] || defaultIcons[type]
    : defaultIcons[type];
  
  return <IconComponent className={className} />;
}

interface FarmIconBgProps {
  type: 'plots' | 'rows' | 'calendar' | 'categories';
  className?: string;
  seasonal?: boolean;
}

export function FarmIconBg({ type, className = "", seasonal = true }: FarmIconBgProps) {
  return (
    <div className={`farm-icon-bg farm-icon-${type} ${className}`}>
      <FarmIcon type={type} seasonal={seasonal} className="w-5 h-5" />
    </div>
  );
}