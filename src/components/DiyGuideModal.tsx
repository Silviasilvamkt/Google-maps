import React, { useState } from 'react';
import { X, CheckSquare, Square, Copy, Check, MessageSquare, Camera, Clock, ExternalLink } from 'lucide-react';

interface DiyGuideModalProps {
  businessName: string;
  onClose: () => void;
  ctaUrl?: string;
}

export const DiyGuideModal: React.FC<DiyGuideModalProps> = ({ businessName, onClose, ctaUrl }) => {
  const [copiedReviewTemplate, setCopiedReviewTemplate] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const reviewTemplate = `¡Hola! Muchísimas gracias por confiar en ${businessName}. ¿Podrías dejarnos una breve reseña de 5 estrellas en Google? Nos ayuda un montón a que otros vecinos nos conozcan: [Pega aquí tu enlace de Google Maps]. ¡Solo te llevará 30 segundos!`;

  const handleCopyReviewTemplate = () => {
    navigator.clipboard.writeText(reviewTemplate);
    setCopiedReviewTemplate(true);
    setTimeout(() => setCopiedReviewTemplate(false), 2500);
  };

  if (ctaUrl) {
    // If external URL is configured, give user link option or redirect
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Guía Paso a Paso – Hazlo tú mismo
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Cómo optimizar la ficha de {businessName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sin pagar agencias ni contratar servicios: acciones directas que puedes aplicar hoy.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action 1: WhatsApp Review Script */}
        <div className="mt-6 space-y-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h4>Paso 1: Plantilla para pedir reseñas por WhatsApp</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Copia este mensaje y envíaselo a tus 5 últimos clientes satisfechos:
            </p>

            <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-mono relative">
              {reviewTemplate}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Tip: Envíalo dentro de las 2 horas posteriores a la compra o visita.
              </span>
              <button
                type="button"
                onClick={handleCopyReviewTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {copiedReviewTemplate ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar mensaje</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action 2: Photo Checklist */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <Camera className="w-5 h-5 text-indigo-600" />
              <h4>Paso 2: Las 5 fotos clave que debes subir</h4>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { id: 'p1', text: 'Fachada del local con el cartel legible (ayuda a la gente a llegar).' },
                { id: 'p2', text: 'Interior del local limpio y con buena luz natural o focos encendidos.' },
                { id: 'p3', text: 'Foto de tus 3 productos más vendidos o de tu servicio en acción.' },
                { id: 'p4', text: 'Foto del equipo o de ti sonriendo de cara al cliente.' },
                { id: 'p5', text: 'Carta de precios, menú o folleto de servicios actualizado.' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleStep(item.id)}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <button type="button" className="mt-0.5 text-indigo-600">
                    {completedSteps[item.id] ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <span
                    className={`text-xs sm:text-sm ${
                      completedSteps[item.id]
                        ? 'line-through text-slate-400'
                        : 'text-slate-700 font-medium'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action 3: Hours & Verification */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <Clock className="w-5 h-5 text-amber-600" />
              <h4>Paso 3: Horario exacto y teléfono directo</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Google Maps penaliza los perfiles con horarios genéricos. Si cierras a mediodía, indícalo claramente con los dos tramos (ej: 09:30-13:30 y 16:30-20:00).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Aplica estas 3 tareas hoy mismo y notarás más llamadas en 7 días.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {ctaUrl && (
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>Abrir recurso externo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              Entendido, voy a aplicarlo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
