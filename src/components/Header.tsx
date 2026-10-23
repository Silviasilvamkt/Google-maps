import React from 'react';
import { Sparkles, BarChart3, RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  showReset?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo badge: Azul + Celeste */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-950 tracking-tight text-lg sm:text-xl">
                Plan Más Clientes
              </span>
              {/* Amarillo Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-300 text-amber-950 border border-amber-400 shadow-2xs">
                <Zap className="w-3 h-3 fill-amber-900 text-amber-900" />
                <span>Auditoría gratis</span>
              </span>
            </div>
            <p className="text-xs text-sky-800/70 hidden sm:block">
              Diagnóstico de tu ficha de Google Maps en menos de 30 segundos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge: Celeste + Amarillo */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-blue-900 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="font-semibold text-blue-800">2 consultas/día</span>
            <span className="text-sky-400">·</span>
            <span className="text-slate-600">Places API & Gemini</span>
          </div>

          {showReset && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-blue-900 bg-sky-100/70 hover:bg-sky-200/80 border border-sky-300/60 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
              <span>Nueva auditoría</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
