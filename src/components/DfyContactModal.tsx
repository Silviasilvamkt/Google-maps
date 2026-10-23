import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Send,
  Phone,
  Mail,
  User,
  Shield,
  Sparkles,
  Zap,
  Star,
  Camera,
  Check,
  TrendingUp,
  Award,
  ExternalLink,
} from 'lucide-react';

interface DfyContactModalProps {
  businessName: string;
  score: number;
  onClose: () => void;
  ctaUrl?: string;
}

export const DfyContactModal: React.FC<DfyContactModalProps> = ({
  businessName,
  score,
  onClose,
  ctaUrl,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-sky-100 overflow-hidden my-6">
        {/* Top Visual Header: Deep Azul & Vibrant Celeste with Golden Amarillo */}
        <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-sky-700 p-6 sm:p-8 text-white">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Golden Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-300 text-amber-950 text-xs font-black shadow-md shadow-amber-950/20 mb-3 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
            <span>Plan Llave en Mano · Cero Complicaciones</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            Nosotros nos encargamos de todo para conseguirte más clientes
          </h3>
          <p className="text-xs sm:text-sm text-sky-100/90 mt-2 leading-relaxed max-w-lg">
            Olvídate de la parte técnica. Un especialista local optimizará la ficha de tu negocio en Google Maps para superar a tus competidores directos.
          </p>

          {/* Live Business Pill */}
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-sky-200">Negocio analizado:</span>
              <span className="font-extrabold text-white text-sm bg-white/15 px-2.5 py-0.5 rounded-lg">
                {businessName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sky-200">Nota actual:</span>
              <span
                className={`font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs ${
                  score >= 75
                    ? 'bg-emerald-400 text-emerald-950'
                    : score >= 50
                      ? 'bg-amber-300 text-amber-950'
                      : 'bg-rose-400 text-rose-950'
                }`}
              >
                {score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {submitted ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              ¡Solicitud recibida con éxito!
            </h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Un consultor especialista en posicionamiento local revisará el diagnóstico de{' '}
              <strong>{businessName}</strong> y te contactará en menos de 24 horas para darte tu plan personalizado sin ningún compromiso.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-colors cursor-pointer shadow-md shadow-blue-700/20"
              >
                Volver a la auditoría
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            {/* 3 Pillars Included */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                ¿Qué incluye nuestro servicio llave en mano?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-500 text-white shrink-0 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Estrategia Reseñas</h5>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Adelanta el volumen de tu competencia.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-400 text-amber-950 shrink-0 mt-0.5 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Top en tu Zona</h5>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Subir posiciones en el mapa de tu ciudad.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-700 text-white shrink-0 mt-0.5">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Fotos & Contenido</h5>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Perfil visual impecable que atrae llamadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom URL Redirection or Direct Booking Form */}
            {ctaUrl ? (
              <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-200/80 space-y-4 text-center sm:text-left">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Hemos preparado una pasarela directa para que inicies la optimización de tu negocio ahora mismo:
                </p>
                <a
                  href={ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl font-black text-amber-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30 text-sm sm:text-base border border-amber-300"
                >
                  <span>Continuar a la gestión del servicio</span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tu nombre y apellidos <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Carmen Silvia"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-blue-600 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono o WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej: 612 345 678"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-blue-600 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo electrónico <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ej: contacto@tunegocio.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-blue-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Primary Action Button: Vibrant Amarillo + Azul */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl font-black text-amber-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.99] transition-all shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base border border-amber-300"
                  >
                    <span>Quiero que lo hagan por mí</span>
                    <span className="w-6 h-6 rounded-full bg-amber-950 flex items-center justify-center text-amber-300 shrink-0">
                      <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* Trust and Safety Badges */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-y-1 gap-x-4 text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Sin compromiso ni coste inicial
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Respuesta en menos de 24 horas
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                100% Confidencial
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
