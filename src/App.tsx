import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { SearchForm } from './components/SearchForm.js';
import { DisambiguationModal } from './components/DisambiguationModal.js';
import { LoadingAudit } from './components/LoadingAudit.js';
import { AuditResultView } from './components/AuditResultView.js';
import { PlaceItem, AuditResult, AppConfig } from './types/audit.js';
import { AlertCircle, Clock, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<AppConfig>({
    ctaDiyUrl: '',
    ctaDfyUrl: '',
    hasCustomPlacesKey: false,
    hasGeminiKey: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingBusinessName, setLoadingBusinessName] = useState('');
  const [disambiguationPlaces, setDisambiguationPlaces] = useState<PlaceItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [cityQuery, setCityQuery] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Errors & Protections
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [hasQuotaExceeded, setHasQuotaExceeded] = useState(false);

  // Load config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setConfig((prev) => ({ ...prev, ...data })))
      .catch((err) => console.warn('Failed to load app config:', err));

    // Listen to Google Maps quota exceeded event per GMP Skill
    const handleQuotaExceeded = () => setHasQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Handle Initial Search (Text Search)
  const handleSearch = async (name: string, city: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsRateLimited(false);
    setDisambiguationPlaces([]);
    setSelectedPlace(null);
    setAuditResult(null);
    setLoadingBusinessName(name);
    setCityQuery(city);

    try {
      const response = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json();
          setIsRateLimited(true);
          setErrorMessage(
            errData.message ||
              'Has alcanzado el límite diario de 2 auditorías gratuitas por hoy para tu conexión. Vuelve mañana para seguir auditando o ponte en contacto con nosotros.'
          );
          setIsLoading(false);
          return;
        }

        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            'No se pudo conectar con Google Places. Verifica el nombre del negocio y la ciudad.'
        );
      }

      const data = await response.json();
      const places: PlaceItem[] = data.places || [];

      if (places.length === 0) {
        setErrorMessage(
          `No se encontró ningún negocio en Google Maps con el nombre "${name}" ${city ? `en ${city}` : ''}. Comprueba que el nombre coincida con tu ficha registrada.`
        );
        setIsLoading(false);
        return;
      }

      if (places.length > 1) {
        // Disambiguation required (up to 3 matches)
        setDisambiguationPlaces(places.slice(0, 3));
        setIsLoading(false);
      } else {
        // Exactly 1 match found -> proceed directly to audit
        const singlePlace = places[0];
        setSelectedPlace(singlePlace);
        await runAudit(singlePlace.id, singlePlace.displayName?.text || name, city);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage(
        err.message || 'Error al buscar el negocio. Por favor, inténtalo de nuevo en unos momentos.'
      );
      setIsLoading(false);
    }
  };

  // Run full audit on selected place
  const runAudit = async (placeId: string, bName: string, cityHint: string) => {
    setIsLoading(true);
    setLoadingBusinessName(bName);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, cityHint, businessQuery: bName }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          `Respuesta no válida del servidor (${response.status}). Por favor, vuelve a intentarlo.`
        );
      }

      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json();
          setIsRateLimited(true);
          setErrorMessage(
            errData.message ||
              'Has alcanzado el límite diario de 2 auditorías gratuitas por hoy para tu conexión. Vuelve mañana para seguir auditando o ponte en contacto con nosotros.'
          );
          setIsLoading(false);
          return;
        }

        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || 'No se pudo completar la auditoría para este negocio en Google Places.'
        );
      }

      const auditData: AuditResult = await response.json();
      setAuditResult(auditData);
      setDisambiguationPlaces([]);
    } catch (err: any) {
      console.error('Audit execution error:', err);
      setErrorMessage(
        err.message || 'Ocurrió un fallo al auditar la ficha. No se han gastado más consultas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlace = (place: PlaceItem) => {
    setSelectedPlace(place);
    runAudit(place.id, place.displayName?.text || loadingBusinessName, cityQuery);
  };

  const handleReset = () => {
    setAuditResult(null);
    setDisambiguationPlaces([]);
    setSelectedPlace(null);
    setErrorMessage(null);
    setIsRateLimited(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Client-Side Quota Defense Banner (GMP Skill) */}
      {hasQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Main Header */}
      <Header onReset={handleReset} showReset={Boolean(auditResult || disambiguationPlaces.length > 0)} />

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col justify-center">
        {/* Rate Limit Protection Banner */}
        {isRateLimited && (
          <div className="w-full max-w-xl mx-auto my-6 px-4">
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-amber-900">Límite diario alcanzado</h3>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed max-w-md mx-auto">
                {errorMessage}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-amber-900 text-white text-xs font-bold hover:bg-amber-800 transition-colors cursor-pointer"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Error Message Banner */}
        {!isRateLimited && errorMessage && (
          <div className="w-full max-w-xl mx-auto my-6 px-4">
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-rose-800 font-bold text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Atención</span>
              </div>
              <p className="text-xs sm:text-sm text-rose-700">{errorMessage}</p>
              <button
                onClick={handleReset}
                className="mt-2 text-xs font-bold text-rose-800 underline hover:text-rose-900 cursor-pointer"
              >
                Intentar con otro nombre
              </button>
            </div>
          </div>
        )}

        {/* 1. Loading State */}
        {isLoading && <LoadingAudit businessName={loadingBusinessName} />}

        {/* 2. Disambiguation Modal */}
        {!isLoading && disambiguationPlaces.length > 0 && (
          <DisambiguationModal
            places={disambiguationPlaces}
            onSelect={handleSelectPlace}
            onCancel={handleReset}
            isLoading={isLoading}
          />
        )}

        {/* 3. Audit Result Screen */}
        {!isLoading && auditResult && (
          <AuditResultView audit={auditResult} config={config} onReset={handleReset} />
        )}

        {/* 4. Default Search Home Screen */}
        {!isLoading && !auditResult && disambiguationPlaces.length === 0 && (
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-500 px-4 print:hidden">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Plan Más Clientes – Auditoría gratis para negocios locales.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Places API (New)</span>
            <span>·</span>
            <span>Protección 24h en caché</span>
            <span>·</span>
            <span>Límite de 2 consultas/día</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
