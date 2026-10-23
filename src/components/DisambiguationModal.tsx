import React from 'react';
import { PlaceItem } from '../types/audit.js';
import { Building2, MapPin, Star, ArrowRight, X } from 'lucide-react';

interface DisambiguationModalProps {
  places: PlaceItem[];
  onSelect: (place: PlaceItem) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const DisambiguationModal: React.FC<DisambiguationModalProps> = ({
  places,
  onSelect,
  onCancel,
  isLoading,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Hemos encontrado varias coincidencias
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Selecciona tu ficha de Google para iniciar la auditoría exacta:
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {places.map((place) => {
            const name = place.displayName?.text || 'Negocio';
            const address = place.formattedAddress || 'Dirección no disponible';
            const category = place.primaryTypeDisplayName?.text || place.primaryType || 'Comercio';
            const rating = place.rating;
            const reviewCount = place.userRatingCount || 0;

            return (
              <div
                key={place.id}
                onClick={() => !isLoading && onSelect(place)}
                className="group p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {name}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                      {category}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{address}</span>
                  </div>

                  {rating !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="ml-1 font-bold text-slate-800">{rating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-400">·</span>
                      <span>{reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  className="sm:shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 group-hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                >
                  <span>Auditar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Volver a buscar
          </button>
        </div>
      </div>
    </div>
  );
};
