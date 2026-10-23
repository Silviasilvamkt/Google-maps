import React, { useEffect, useState } from 'react';
import { Search, MapPin, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoadingAuditProps {
  businessName: string;
}

const STAGES = [
  {
    icon: Search,
    title: 'Consultando Google Places API (New)...',
    subtitle: 'Localizando ficha y extrayendo identificador único de tu negocio.',
  },
  {
    icon: MapPin,
    title: 'Analizando fotos, horarios y datos de contacto...',
    subtitle: 'Comprobando si tu perfil tiene la información que Google premia.',
  },
  {
    icon: Users,
    title: 'Examinando a tus 5 competidores en un radio de 5 km...',
    subtitle: 'Comparando número de reseñas, nota media y posicionamiento local.',
  },
  {
    icon: Sparkles,
    title: 'Calculando nota de salud y generando tus 3 tareas con Gemini...',
    subtitle: 'Detectando los puntos perdidos para darte acciones sin jerga SEO.',
  },
];

export const LoadingAudit: React.FC<LoadingAuditProps> = ({ businessName }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 sm:px-6 animate-fade-in text-center">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
        {/* Animated Pulse Indicator */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            {React.createElement(STAGES[currentStage].icon, { className: 'w-8 h-8 animate-pulse' })}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Auditando &quot;{businessName}&quot;
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Tu informe estará listo en menos de 30 segundos
        </p>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 my-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-2.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((currentStage + 1) / STAGES.length) * 92}%` }}
          />
        </div>

        {/* Step by step checklist */}
        <div className="space-y-3 text-left mt-6">
          {STAGES.map((stage, idx) => {
            const isDone = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                    : isDone
                      ? 'bg-slate-50 border-slate-200/60 opacity-80'
                      : 'border-transparent opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isCurrent ? 'text-blue-900' : isDone ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {stage.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {stage.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Friendly Owner Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Consultando datos en tiempo real de Google Maps. No cierres esta ventana.
        </div>
      </div>
    </div>
  );
};
