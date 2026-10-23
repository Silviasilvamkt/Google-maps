import React, { useState } from 'react';
import { Building2, MapPin, ArrowRight, Zap, CheckCircle2, ShieldCheck, Clock, Sparkles } from 'lucide-react';

interface SearchFormProps {
  onSearch: (name: string, city: string) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Por favor, introduce el nombre de tu negocio.');
      return;
    }
    setValidationError('');
    onSearch(name.trim(), city.trim());
  };

  const handleSuggestion = (suggestedName: string, suggestedCity: string) => {
    setName(suggestedName);
    setCity(suggestedCity);
    setValidationError('');
    onSearch(suggestedName, suggestedCity);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-14 px-4 sm:px-6">
      {/* Hero Badge: Amarillo + Celeste */}
      <div className="flex justify-center mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-300 text-amber-950 border border-amber-400 text-xs sm:text-sm font-extrabold shadow-sm">
          <Zap className="w-4 h-4 fill-amber-950 text-amber-950" />
          <span>Auditoría instantánea en menos de 30 segundos</span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-amber-800" />
          <span className="hidden sm:inline font-bold text-amber-900">2 consultas/día</span>
        </div>
      </div>

      {/* Hero Title & Subtitle: Azul + Celeste + Amarillo */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
          Descubre por qué tu competencia aparece antes que tú en{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-500 to-blue-600">
            Google Maps
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Escribe el nombre de tu negocio y tu ciudad. Analizaremos tu ficha frente a tus competidores locales y te daremos tu nota de 0 a 100 con las 3 tareas de mayor impacto.
        </p>

        {/* Quota reminder banner: Celeste & Amarillo */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Acceso gratuito limitado a <strong>2 consultas al día</strong> por dispositivo</span>
        </div>
      </div>

      {/* Main Search Card with Celeste border & Azul accents */}
      <div className="bg-white rounded-3xl shadow-xl shadow-sky-950/5 border-2 border-sky-100 p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
            {/* Business Name Field */}
            <div className="sm:col-span-7">
              <label
                htmlFor="business-name"
                className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5"
              >
                Nombre del negocio <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  id="business-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="Ej: Cafetería El Rincón, Taller Mecánico..."
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* City Field */}
            <div className="sm:col-span-5">
              <label
                htmlFor="business-city"
                className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5"
              >
                Ciudad o municipio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  id="business-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Madrid, Sevilla, Valencia..."
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm font-medium">
              {validationError}
            </div>
          )}

          {/* Submit Button: Azul + Celeste with subtle Amarillo accent */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-xl font-black text-white text-base sm:text-lg bg-gradient-to-r from-blue-700 via-sky-600 to-blue-700 hover:from-blue-800 hover:to-sky-700 active:scale-[0.99] transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-b-2 border-blue-900"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analizando ficha en Google...</span>
              </>
            ) : (
              <>
                <span>Ver mi auditoría gratis</span>
                <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-amber-950 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Suggestions */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2 font-medium">
            ¿Quieres probar con un ejemplo real?
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Restaurante Botín', city: 'Madrid' },
              { name: 'Clínica Baviera', city: 'Valencia' },
              { name: 'Peluquería Llongueras', city: 'Barcelona' },
            ].map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestion(example.name, example.city)}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-blue-900 font-semibold border border-sky-200 transition-colors cursor-pointer"
              >
                {example.name} ({example.city})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trust & Value Points: Celeste, Amarillo, Azul */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        {/* Card 1: Celeste */}
        <div className="flex items-center sm:items-start gap-3 p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80">
          <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-sky-950">Resultado en 30s</h4>
            <p className="text-xs text-sky-700/80">Sin esperas ni llamadas de comerciales</p>
          </div>
        </div>

        {/* Card 2: Amarillo */}
        <div className="flex items-center sm:items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
          <div className="p-2 rounded-xl bg-amber-400 text-amber-950 shrink-0 shadow-xs font-black">
            <Zap className="w-4 h-4 fill-amber-950 text-amber-950" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950">2 Consultas al Día</h4>
            <p className="text-xs text-amber-800">100% gratis por dispositivo</p>
          </div>
        </div>

        {/* Card 3: Azul */}
        <div className="flex items-center sm:items-start gap-3 p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
          <div className="p-2 rounded-xl bg-blue-700 text-white shrink-0 shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950">Plan de 3 Tareas</h4>
            <p className="text-xs text-blue-700">Sin jerga técnica: qué hacer y cómo</p>
          </div>
        </div>
      </div>
    </div>
  );
};
