
import React from 'react';
import { RouteOption } from '../types';
import { Icons } from '../constants';

interface RouteCardProps {
  route: RouteOption;
  isSelected: boolean;
  onSelect: (route: RouteOption) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, isSelected, onSelect }) => {
  const getComfortColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div 
      onClick={() => onSelect(route)}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer mb-3 bg-white ${
        isSelected ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-slate-800">{route.name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>{route.duration}</span>
            <span className="text-slate-300">•</span>
            <span>{route.distance}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 ${getComfortColor(route.comfortScore)}`}>
          <Icons.Safety />
          {route.comfortScore}%
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {route.tags.map(tag => (
          <span key={tag} className="text-[10px] font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-slate-50 animate-fade-in">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-tight">Key Landmarks</p>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {route.landmarks.map(landmark => (
              <div key={landmark} className="flex-shrink-0 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-100 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                {landmark}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteCard;
