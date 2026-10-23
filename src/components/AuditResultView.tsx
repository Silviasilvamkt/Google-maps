import React, { useState } from 'react';
import {
  AuditResult,
  ActionTask,
  HealthBlock,
  CompetitorComparison,
  AppConfig,
} from '../types/audit.js';
import {
  Star,
  Building2,
  MapPin,
  Phone,
  Globe,
  Camera,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Users,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { DiyGuideModal } from './DiyGuideModal.js';
import { DfyContactModal } from './DfyContactModal.js';

interface AuditResultViewProps {
  audit: AuditResult;
  config: AppConfig;
  onReset: () => void;
}

export const AuditResultView: React.FC<AuditResultViewProps> = ({ audit, config, onReset }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(audit.tasks[0]?.id || null);
  const [showDiyModal, setShowDiyModal] = useState(false);
  const [showDfyModal, setShowDfyModal] = useState(false);

  const businessName = audit.place.displayName?.text || 'Tu negocio';
  const categoryName =
    audit.place.primaryTypeDisplayName?.text || audit.place.primaryType || 'Comercio local';
  const address = audit.place.formattedAddress || 'Dirección registrada en Google';
  const phone = audit.place.nationalPhoneNumber;
  const website = audit.place.websiteUri;
  const rating = audit.place.rating;
  const reviewCount = audit.place.userRatingCount || 0;
  const photoCount = audit.place.photos?.length || 0;

  const score = audit.healthScore;
  const trafficLight = audit.trafficLight;

  // Semáforo configuration:
  // Red: < 50
  // Yellow: 50 - 74
  // Green: >= 75
  const semaforoConfig = {
    red: {
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-700',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      label: 'Salud Crítica – Pierdes clientes cada día',
      subtitle:
        'Tu ficha tiene carencias importantes que hacen que Google prefiera mostrar a tus competidores locales.',
      gradient: 'from-rose-500 to-red-600',
      shadow: 'shadow-rose-500/20',
      ringColor: 'stroke-rose-500',
    },
    yellow: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      label: 'Salud Media – Con margen claro de mejora',
      subtitle:
        'Tienes una base correcta pero tus competidores te superan en detalles clave como reseñas o fotos.',
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      ringColor: 'stroke-amber-500',
    },
    green: {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      label: 'Buena Salud – Perfil muy competitivo',
      subtitle:
        'Tu ficha de Google Maps está bien cuidada. Ajustando un par de detalles puedes liderar tu zona.',
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      ringColor: 'stroke-emerald-500',
    },
  }[trafficLight];

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDiyClick = () => {
    if (config.ctaDiyUrl && config.ctaDiyUrl.trim()) {
      window.location.href = config.ctaDiyUrl;
    } else {
      setShowDiyModal(true);
    }
  };

  const handleDfyClick = () => {
    if (config.ctaDfyUrl && config.ctaDfyUrl.trim()) {
      window.location.href = config.ctaDfyUrl;
    } else {
      setShowDfyModal(true);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8 animate-fade-in print:p-0">
      {/* 1. Header Bar with Business Summary */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
              {categoryName}
            </span>
            {audit.fromCache && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                Auditoría verificada (24h)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {businessName}
          </h1>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{address}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{phone}</span>
              </div>
            )}

            {/* Presencia web: Web oficial vs Redes sociales vs Sin web */}
            {audit.websiteAnalysis?.type === 'official_website' ? (
              <a
                href={audit.websiteAnalysis.rawUrl || website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors"
                title="Página web oficial"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Web: {audit.websiteAnalysis.domain || 'Oficial'}</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                  Oficial ✓
                </span>
              </a>
            ) : audit.websiteAnalysis?.type === 'social_media' ? (
              <a
                href={audit.websiteAnalysis.rawUrl || website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-950 bg-amber-50 border border-amber-300 hover:bg-amber-100 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors"
                title="Perfil de red social en lugar de página web propia"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{audit.websiteAnalysis.displayLabel}</span>
                <span className="text-[10px] text-amber-900 bg-amber-200/90 px-1.5 py-0.2 rounded font-black">
                  Red Social ⚠️
                </span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Sin página web registrada ✗</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (Print, New audit) */}
        <div className="flex items-center gap-2 shrink-0 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Imprimir informe"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Auditar otro negocio
          </button>
        </div>
      </div>

      {/* 2. Big Score Card with Semáforo */}
      <div
        className={`rounded-3xl p-6 sm:p-9 border shadow-lg ${semaforoConfig.bgColor} ${semaforoConfig.borderColor} ${semaforoConfig.shadow}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Circular Score Gauge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="stroke-slate-200/80"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className={`${semaforoConfig.ringColor} transition-all duration-1000 ease-out`}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - score / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter">
                  {score}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  de 100
                </span>
              </div>
            </div>

            {/* Semáforo 3-Lights Visual */}
            <div className="mt-4 flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Semáforo:</span>
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  trafficLight === 'red'
                    ? 'bg-rose-500 ring-2 ring-rose-400 ring-offset-1'
                    : 'bg-rose-200'
                }`}
                title="Rojo: Menos de 50"
              />
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  trafficLight === 'yellow'
                    ? 'bg-amber-400 ring-2 ring-amber-300 ring-offset-1'
                    : 'bg-amber-200'
                }`}
                title="Amarillo: 50 a 74"
              />
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  trafficLight === 'green'
                    ? 'bg-emerald-500 ring-2 ring-emerald-400 ring-offset-1'
                    : 'bg-emerald-200'
                }`}
                title="Verde: 75 o más"
              />
            </div>
          </div>

          {/* Score Diagnosis Explanation */}
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider">
              <span>{semaforoConfig.label}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {score >= 75
                ? '¡Buen trabajo! Tu ficha está activa y genera visitas.'
                : score >= 50
                  ? 'Estás perdiendo llamadas y visitas frente a tus vecinos.'
                  : 'Google Maps está favoreciendo a tu competencia directa.'}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {semaforoConfig.subtitle}
            </p>

            {/* Quick Metrics Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/80 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">Reseñas en Google</p>
                <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {reviewCount} {rating ? `(${rating.toFixed(1)} ★)` : ''}
                </p>
              </div>

              <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/80 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">Fotos subidas</p>
                <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {photoCount} {photoCount >= 10 ? '✓' : '/ 10 recomendadas'}
                </p>
              </div>

              <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
                <p className="text-[11px] font-medium text-slate-500">Posición en la zona</p>
                <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {audit.searchRank <= 3 ? `Puesto #${audit.searchRank} (Visible)` : `Puesto #${audit.searchRank}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Las 3 Tareas de Mayor Impacto (Cards) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Tus 3 tareas de mayor impacto
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generadas con IA según los puntos que has perdido. Fáciles de aplicar y sin tecnicismos.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
            Tiempo total: ~30-40 minutos
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {audit.tasks.map((task, index) => {
            const isExpanded = expandedTask === task.id;
            const isCompletedAll = task.steps.every((_, sIdx) => completedSteps[`${task.id}-${sIdx}`]);

            return (
              <div
                key={task.id}
                className={`rounded-2xl border transition-all ${
                  isCompletedAll
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isExpanded
                      ? 'bg-white border-blue-400 shadow-md ring-2 ring-blue-50'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Task Header */}
                <div
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isCompletedAll
                          ? 'bg-emerald-600 text-white'
                          : task.impact === 'Crítico'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isCompletedAll ? <CheckCircle2 className="w-5 h-5" /> : `#${index + 1}`}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                            task.impact === 'Crítico'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          Impacto {task.impact}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.estimatedTime}</span>
                        </div>
                      </div>

                      <h4
                        className={`text-base sm:text-lg font-bold text-slate-900 ${
                          isCompletedAll ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5 line-clamp-1 sm:line-clamp-none">
                        {task.whyItMatters}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded Steps */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pasos concretos a seguir (haz clic para marcar):
                    </p>

                    <div className="space-y-2">
                      {task.steps.map((step, stepIndex) => {
                        const stepKey = `${task.id}-${stepIndex}`;
                        const isDone = completedSteps[stepKey];

                        return (
                          <div
                            key={stepIndex}
                            onClick={() => toggleStep(stepKey)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <button
                              type="button"
                              className="mt-0.5 text-slate-400 hover:text-blue-600 shrink-0"
                            >
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <span
                              className={`text-xs sm:text-sm leading-relaxed ${
                                isDone ? 'line-through text-slate-500' : 'font-medium'
                              }`}
                            >
                              <strong>Paso {stepIndex + 1}:</strong> {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Desglose por Bloques (Health Blocks) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Desglose de tu nota por bloques
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revisión punto por punto de los 5 factores que determinan tu visibilidad en Google Maps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(audit.blocks).map((block: HealthBlock) => {
            const percentage = Math.round((block.score / block.maxScore) * 100);
            const statusBadge = {
              good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              warning: 'bg-amber-100 text-amber-800 border-amber-200',
              danger: 'bg-rose-100 text-rose-800 border-rose-200',
            }[block.status];

            const barColor = {
              good: 'bg-emerald-500',
              warning: 'bg-amber-500',
              danger: 'bg-rose-500',
            }[block.status];

            return (
              <div
                key={block.key}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-slate-900 text-base">{block.title}</h4>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${statusBadge} shrink-0`}
                    >
                      {block.score} / {block.maxScore} pts
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${barColor} transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed">
                    {block.summary}
                  </p>
                </div>

                {/* Details Breakdown */}
                {block.details && block.details.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    {block.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-500">{detail.label}:</span>
                        <span className="font-semibold text-slate-800">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tip */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] sm:text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>{block.tip}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Tabla "Quién te gana": Competidores */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quién te gana en {audit.cityQueryUsed || 'tu zona'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Los 5 competidores directos analizados en tu radio local, comparados con tus métricas.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Negocio</th>
                  <th className="py-3.5 px-4 text-center">Nota Media</th>
                  <th className="py-3.5 px-4 text-center">Nº Reseñas</th>
                  <th className="py-3.5 px-4 text-center">Fotos</th>
                  <th className="py-3.5 px-4 text-right">Distancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Your Own Business Row for Benchmark */}
                <tr className="bg-blue-50/40 font-semibold border-b-2 border-blue-200">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-blue-900 font-bold">{businessName} (Tú)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                        Tu ficha
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {rating ? rating.toFixed(1) : 'S/N'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {reviewCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {photoCount}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">Punto central</td>
                </tr>

                {audit.competitors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                      No se detectaron competidores directos en un radio cercano de 5 km.
                    </td>
                  </tr>
                ) : (
                  audit.competitors.map((comp, idx) => {
                    const beatsRating = comp.ratingDifference > 0;
                    const beatsReviews = comp.reviewsDifference > 0;
                    const beatsPhotos = comp.photosDifference > 0;

                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{comp.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{comp.address}</div>
                        </td>

                        {/* Rating Column */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {comp.rating ? comp.rating.toFixed(1) : '-'}
                            </span>
                            {beatsRating && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded mt-0.5">
                                +{comp.ratingDifference.toFixed(1)} ★
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Reviews Column */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-slate-800">{comp.userRatingCount}</span>
                            {beatsReviews && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded mt-0.5">
                                +{comp.reviewsDifference} reseñas
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Photos Column */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-slate-800">{comp.photoCount}</span>
                            {beatsPhotos && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-0.5">
                                +{comp.photosDifference} fotos
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Distance Column */}
                        <td className="py-3.5 px-4 text-right text-slate-500">
                          {comp.distanceKm !== undefined ? `${comp.distanceKm} km` : 'En tu zona'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Action CTAs: "Quiero hacerlo yo" & "Prefiero que lo hagan por mí" */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6 print:hidden">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/20">
            ¿Cómo quieres resolver esto?
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Elige cómo quieres conseguir más clientes
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Puedes aplicar los pasos tú mismo con nuestra guía gratuita o delegar todo el trabajo en un equipo especialista.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Button 1: Quiero hacerlo yo */}
          <button
            type="button"
            onClick={handleDiyClick}
            className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all text-left group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  Opción 1: Gratis
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-lg font-bold text-white mt-2">Quiero hacerlo yo</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Abre la guía práctica con los pasos exactos, plantillas de WhatsApp para pedir reseñas y trucos rápidos.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs font-bold text-blue-200 flex items-center gap-1">
              <span>Abrir guía de acción</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Button 2: Prefiero que lo hagan por mí (Featured Hero Card) */}
          <button
            type="button"
            onClick={handleDfyClick}
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-sky-700 hover:from-blue-950 hover:to-sky-800 border-2 border-amber-300 transition-all text-left group flex flex-col justify-between shadow-2xl shadow-sky-950/40 cursor-pointer relative overflow-hidden ring-4 ring-amber-300/20"
          >
            {/* Top Right Floating Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-[11px] font-black px-3.5 py-1 rounded-bl-2xl uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-950 text-amber-950" />
              <span>Recomendado</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                  Opción Llave en Mano
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Prefiero que lo hagan por mí
              </h4>
              <p className="text-xs sm:text-sm text-sky-100 mt-1.5 leading-relaxed">
                Nos encargamos de todo: optimizamos tus datos, tus fotos y ponemos en marcha la estrategia para adelantar a tus competidores.
              </p>

              {/* High-value bullets */}
              <div className="mt-4 space-y-2 text-xs text-sky-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Optimizamos tu ficha para el Top 3 local</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Estrategia activa para conseguir más reseñas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Sin permanencia y con asesor personal</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
              <span className="text-[11px] text-sky-200 font-medium">Sin coste inicial</span>
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-md shadow-amber-950/20 transition-all group-hover:translate-x-0.5">
                <span>Solicitar optimización</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Modals for DIY & DFY */}
      {showDiyModal && (
        <DiyGuideModal
          businessName={businessName}
          onClose={() => setShowDiyModal(false)}
          ctaUrl={config.ctaDiyUrl}
        />
      )}

      {showDfyModal && (
        <DfyContactModal
          businessName={businessName}
          score={score}
          onClose={() => setShowDfyModal(false)}
          ctaUrl={config.ctaDfyUrl}
        />
      )}
    </div>
  );
};
