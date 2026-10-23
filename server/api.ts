import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { PlaceItem, AuditResult, ActionTask, CompetitorComparison, HealthBlock, WebsiteAnalysis } from '../src/types/audit.js';

export const apiRouter = express.Router();

// Places API Key resolution (prioritizing explicit GOOGLE_PLACES_API_KEY)
const PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAneKrkH6e6cWTyUAI0tDlGEWjuiW1G1wA';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// 24-hour in-memory cache by Place ID
interface CacheEntry {
  timestamp: number;
  data: AuditResult;
}
const auditCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// IP Rate Limiter: max 2 audits per IP per 24 hours
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const ipRateLimits = new Map<string, RateLimitEntry>();
const MAX_AUDITS_PER_DAY = 2;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRateLimits.set(ip, { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_AUDITS_PER_DAY, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= MAX_AUDITS_PER_DAY) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: MAX_AUDITS_PER_DAY - entry.count, resetAt: entry.resetAt };
}

function incrementRateLimit(ip: string): void {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function analyzeWebsite(url?: string): WebsiteAnalysis {
  if (!url || !url.trim()) {
    return {
      hasUrl: false,
      type: 'none',
      displayLabel: 'Sin página web registrada',
      seoAdvice:
        'Tu ficha no tiene página web enlazada. Los clientes no pueden consultar tus servicios ni comprar directamente, lo que beneficia a tu competencia con web.',
    };
  }

  let domain = '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    domain = url.toLowerCase();
  }

  if (domain.includes('instagram.com')) {
    return {
      hasUrl: true,
      rawUrl: url,
      domain,
      type: 'social_media',
      socialPlatform: 'Instagram',
      displayLabel: 'Perfil de Instagram (@...)',
      seoAdvice:
        'Tienes enlazado Instagram en lugar de una página web oficial. Aunque sirve de contacto, Google Maps favorece a fichas con dominio propio para posicionar en búsquedas locales.',
    };
  }

  if (domain.includes('facebook.com') || domain.includes('fb.me') || domain.includes('fb.com')) {
    return {
      hasUrl: true,
      rawUrl: url,
      domain,
      type: 'social_media',
      socialPlatform: 'Facebook',
      displayLabel: 'Página de Facebook',
      seoAdvice:
        'Tienes enlazada una página de Facebook. Muchos clientes no tienen cuenta o no pueden ver la carta. Una web propia te dará mucha más autoridad en Google.',
    };
  }

  if (domain.includes('tiktok.com')) {
    return {
      hasUrl: true,
      rawUrl: url,
      domain,
      type: 'social_media',
      socialPlatform: 'TikTok',
      displayLabel: 'Perfil de TikTok',
      seoAdvice:
        'Tienes enlazado TikTok. Para búsquedas comerciales en Google Maps, una página web propia genera mucha más confianza y reservas.',
    };
  }

  if (domain.includes('linktr.ee') || domain.includes('bio.link') || domain.includes('beacons.ai')) {
    return {
      hasUrl: true,
      rawUrl: url,
      domain,
      type: 'social_media',
      socialPlatform: 'Linktree',
      displayLabel: 'Agregador de enlaces (Linktree / Bio)',
      seoAdvice:
        'Usas un enlace tipo Linktree. Los clientes prefieren entrar directamente a una web clara con dirección, menú y horario.',
    };
  }

  if (domain.includes('wa.me') || domain.includes('whatsapp.com')) {
    return {
      hasUrl: true,
      rawUrl: url,
      domain,
      type: 'social_media',
      socialPlatform: 'WhatsApp',
      displayLabel: 'Enlace directo a WhatsApp',
      seoAdvice:
        'Tienes un enlace de chat de WhatsApp. Es práctico para mensajes rápidos, pero Google no puede indexar tu oferta comercial.',
    };
  }

  if (domain.includes('business.site') || domain.includes('google.com/site')) {
    return {
      hasUrl: true,
      rawUrl: url,
      domain,
      type: 'official_website',
      displayLabel: 'Sitio básico de Google Business Profile (descatalogado)',
      seoAdvice:
        'Google ha desactivado la mayoría de sitios .business.site. Es muy recomendable migrar a un dominio propio .com o .es.',
    };
  }

  return {
    hasUrl: true,
    rawUrl: url,
    domain,
    type: 'official_website',
    displayLabel: `Web oficial (${domain})`,
    seoAdvice:
      'Cuentas con una página web oficial con dominio propio. Esto otorga gran autoridad a tu ficha en el algoritmo local de Google Maps.',
  };
}

// 1. Config endpoint
apiRouter.get('/config', (req: Request, res: Response) => {
  res.json({
    ctaDiyUrl: process.env.CTA_DIY_URL || '',
    ctaDfyUrl: process.env.CTA_DFY_URL || '',
    hasCustomPlacesKey: Boolean(process.env.GOOGLE_PLACES_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. Search places by name + city (Places API New searchText)
apiRouter.post('/places/search', async (req: Request, res: Response) => {
  try {
    const { name, city } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del negocio es obligatorio.' });
    }

    const query = `${name.trim()} ${city ? city.trim() : ''}`.trim();

    // Call Google Places API (New) Text Search
    // Minimal FieldMask as requested:
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.types',
      'places.rating',
      'places.userRatingCount',
      'places.websiteUri',
      'places.nationalPhoneNumber',
      'places.regularOpeningHours',
      'places.photos',
      'places.businessStatus',
      'places.location',
    ].join(',');

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify({
        textQuery: query,
        pageSize: 5,
        languageCode: 'es',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Places API searchText error:', response.status, errText);
      return res.status(response.status).json({
        error: 'Error al consultar Google Places API.',
        status: response.status,
        details: errText,
      });
    }

    const data = (await response.json()) as { places?: PlaceItem[] };
    const places = data.places || [];

    // Return up to 3 matches for disambiguation if multiple
    res.json({
      query,
      places: places.slice(0, 3),
      totalFound: places.length,
    });
  } catch (error: any) {
    console.error('Search places exception:', error);
    res.status(500).json({ error: 'Error interno al buscar el negocio. Por favor, inténtalo de nuevo.' });
  }
});

// 3. Full Audit Endpoint
apiRouter.post('/audit', async (req: Request, res: Response) => {
  try {
    const { placeId, cityHint, businessQuery } = req.body;
    if (!placeId) {
      return res.status(400).json({ error: 'placeId es obligatorio.' });
    }

    const clientIp = getClientIp(req);

    // Check 24-hour cache first
    const cached = auditCache.get(placeId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({
        ...cached.data,
        fromCache: true,
      });
    }

    // Rate Limit Check
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message:
          'Has alcanzado el límite diario de 2 auditorías gratuitas por hoy para tu conexión. Vuelve mañana para seguir auditando o ponte en contacto con nosotros.',
      });
    }

    // Step 2) Place Details of chosen place
    // FieldMask requested: id, displayName, formattedAddress, primaryType, primaryTypeDisplayName, types, rating, userRatingCount, websiteUri, nationalPhoneNumber, regularOpeningHours, photos, businessStatus, location
    const detailsFieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'primaryType',
      'primaryTypeDisplayName',
      'types',
      'rating',
      'userRatingCount',
      'websiteUri',
      'nationalPhoneNumber',
      'regularOpeningHours',
      'photos',
      'businessStatus',
      'location',
    ].join(',');

    const detailsUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const detailsResponse = await fetch(detailsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': detailsFieldMask,
      },
    });

    if (!detailsResponse.ok) {
      const errText = await detailsResponse.text();
      console.error('Place Details error:', detailsResponse.status, errText);
      return res.status(detailsResponse.status).json({
        error: 'No se pudieron obtener los detalles del negocio desde Google Places.',
        details: errText,
      });
    }

    const targetPlace = (await detailsResponse.json()) as PlaceItem;

    // Step 3) Competitors search
    // "Text Search de competidores con 'primaryTypeDisplayName + ciudad', con locationBias de 5 km alrededor del negocio, máximo 5 resultados, excluyendo el propio negocio. Mismos campos, sin reseñas."
    const businessName = targetPlace.displayName?.text || businessQuery || 'Negocio';
    const primaryTypeStr =
      targetPlace.primaryTypeDisplayName?.text || targetPlace.primaryType || 'comercio';

    // Infer city from address if cityHint is not provided
    let searchCity = cityHint || '';
    if (!searchCity && targetPlace.formattedAddress) {
      const parts = targetPlace.formattedAddress.split(',');
      if (parts.length >= 2) {
        searchCity = parts[parts.length - 2].trim();
      }
    }

    const competitorQuery = `${primaryTypeStr} ${searchCity}`.trim();

    const competitorFieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.types',
      'places.rating',
      'places.userRatingCount',
      'places.websiteUri',
      'places.nationalPhoneNumber',
      'places.regularOpeningHours',
      'places.photos',
      'places.businessStatus',
      'places.location',
    ].join(',');

    const competitorRequestBody: any = {
      textQuery: competitorQuery,
      pageSize: 10,
      languageCode: 'es',
    };

    if (targetPlace.location?.latitude && targetPlace.location?.longitude) {
      competitorRequestBody.locationBias = {
        circle: {
          center: {
            latitude: targetPlace.location.latitude,
            longitude: targetPlace.location.longitude,
          },
          radius: 5000.0, // 5 km around business
        },
      };
    }

    const competitorResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': competitorFieldMask,
      },
      body: JSON.stringify(competitorRequestBody),
    });

    let rawCompetitorsList: PlaceItem[] = [];
    if (competitorResponse.ok) {
      const compData = (await competitorResponse.json()) as { places?: PlaceItem[] };
      rawCompetitorsList = compData.places || [];
    } else {
      console.warn('Competitors search failed, continuing with target details:', competitorResponse.status);
    }

    // Determine target place's rank in this category search
    const targetIndex = rawCompetitorsList.findIndex(
      (p) => p.id === targetPlace.id || p.displayName?.text?.toLowerCase() === businessName.toLowerCase()
    );
    const searchRank = targetIndex >= 0 ? targetIndex + 1 : 6;

    // Filter out target place and keep up to 5 competitors
    const filteredCompetitors = rawCompetitorsList
      .filter((p) => p.id !== targetPlace.id)
      .slice(0, 5);

    // Calculate competitor averages
    const compReviewCounts = filteredCompetitors.map((c) => c.userRatingCount || 0);
    const avgCompReviews =
      compReviewCounts.length > 0
        ? compReviewCounts.reduce((a, b) => a + b, 0) / compReviewCounts.length
        : 0;

    const compRatings = filteredCompetitors
      .map((c) => c.rating || 0)
      .filter((r) => r > 0);
    const avgCompRating =
      compRatings.length > 0
        ? compRatings.reduce((a, b) => a + b, 0) / compRatings.length
        : 0;

    // Target place metrics
    const targetRating = targetPlace.rating || 0;
    const targetReviews = targetPlace.userRatingCount || 0;
    const targetPhotosCount = targetPlace.photos?.length || 0;

    // Health Score (0 - 100) per requirements
    // 1. Reseñas (30 max):
    //    - número de reseñas comparado con la media de competidores (15)
    //    - nota media (15; 4,7 o más = completo)
    let reviewVolumeScore = 0;
    if (avgCompReviews > 0) {
      reviewVolumeScore = Math.min(15, Math.round((targetReviews / avgCompReviews) * 15));
    } else {
      reviewVolumeScore = targetReviews > 0 ? 15 : 7;
    }

    let ratingScore = 0;
    if (targetRating >= 4.7) {
      ratingScore = 15;
    } else if (targetRating > 0) {
      ratingScore = Math.max(0, Math.round((targetRating / 4.7) * 15));
    } else {
      ratingScore = 0;
    }
    const totalReviewsScore = reviewVolumeScore + ratingScore;

    const reviewsBlock: HealthBlock = {
      key: 'reviews',
      title: 'Reseñas y reputación',
      score: totalReviewsScore,
      maxScore: 30,
      status: totalReviewsScore >= 24 ? 'good' : totalReviewsScore >= 15 ? 'warning' : 'danger',
      summary: `Tienes ${targetReviews} reseñas con una nota media de ${targetRating ? targetRating.toFixed(1) : '0'}; tus competidores directos tienen ${Math.round(avgCompReviews)} reseñas de media con ${avgCompRating ? avgCompRating.toFixed(1) : '4.5'} estrellas.`,
      details: [
        {
          label: 'Total de reseñas',
          value: targetReviews,
          benchmark: `${Math.round(avgCompReviews)} de media en tu zona`,
        },
        {
          label: 'Nota media en Google',
          value: targetRating ? `${targetRating.toFixed(1)} ★` : 'Sin nota',
          benchmark: 'Meta ideal: 4.7 ★ o superior',
        },
      ],
      tip:
        targetReviews < avgCompReviews
          ? 'Tus competidores tienen más volumen de reseñas. Conseguir 10 opiniones nuevas de clientes satisfechos te ayudará a recortar distancia rápidamente.'
          : 'Mantén el buen ritmo solicitando reseñas con frecuencia y respondiendo a cada una.',
    };

    // 2. Información completa (25 max):
    //    - web oficial / presencia digital (6.25 max), teléfono (6.25), horario (6.25), operativo (6.25)
    const webAnalysis = analyzeWebsite(targetPlace.websiteUri);
    let webScore = 0;
    if (webAnalysis.type === 'official_website') {
      webScore = 6.25;
    } else if (webAnalysis.type === 'social_media') {
      webScore = 3.5; // Tiene enlace de contacto, pero carece de web propia con dominio
    } else {
      webScore = 0;
    }

    const hasPhone = Boolean(targetPlace.nationalPhoneNumber);
    const hasHours = Boolean(
      targetPlace.regularOpeningHours?.periods && targetPlace.regularOpeningHours.periods.length > 0
    );
    const isOperational =
      targetPlace.businessStatus === 'OPERATIONAL' || !targetPlace.businessStatus;

    let infoScoreSum = webScore;
    if (hasPhone) infoScoreSum += 6.25;
    if (hasHours) infoScoreSum += 6.25;
    if (isOperational) infoScoreSum += 6.25;
    const totalInfoScore = Math.round(infoScoreSum);

    const missingInfo: string[] = [];
    if (!webAnalysis.hasUrl) {
      missingInfo.push('página web registrada');
    } else if (webAnalysis.type === 'social_media') {
      missingInfo.push(`web propia (actualmente usa ${webAnalysis.socialPlatform || 'redes sociales'})`);
    }
    if (!hasPhone) missingInfo.push('teléfono');
    if (!hasHours) missingInfo.push('horario comercial');
    if (!isOperational) missingInfo.push('marcado como cerrado temporalmente');

    let infoSummaryText = '';
    if (webAnalysis.type === 'none') {
      infoSummaryText = `A tu ficha le falta página web registrada${missingInfo.length > 1 ? ` y ${missingInfo.filter((m) => !m.includes('web')).join(', ')}` : ''}, lo que provoca que clientes indecisos acudan a competidores con web.`;
    } else if (webAnalysis.type === 'social_media') {
      infoSummaryText = `En lugar de una página web oficial utilizas un perfil de ${webAnalysis.socialPlatform || 'redes sociales'}. Google premia a las empresas que tienen una web propia con su propio dominio.`;
    } else {
      infoSummaryText =
        missingInfo.length === 0
          ? `Tu perfil tiene todos los datos clave completos: web oficial propia (${webAnalysis.domain}), teléfono, horario y estado operativo.`
          : `Tienes web oficial (${webAnalysis.domain}), pero a tu ficha le falta ${missingInfo.join(' y ')}.`;
    }

    const infoBlock: HealthBlock = {
      key: 'info',
      title: 'Información y presencia web',
      score: totalInfoScore,
      maxScore: 25,
      status: totalInfoScore >= 20 ? 'good' : totalInfoScore >= 12 ? 'warning' : 'danger',
      summary: infoSummaryText,
      details: [
        {
          label: 'Página web / Presencia digital',
          value:
            webAnalysis.type === 'official_website'
              ? `Web oficial (${webAnalysis.domain}) ✓`
              : webAnalysis.type === 'social_media'
                ? `${webAnalysis.displayLabel} (Sin web propia) ⚠️`
                : 'Sin página web registrada ✗',
        },
        { label: 'Teléfono de contacto', value: hasPhone ? 'Visible ✓' : 'Sin teléfono ✗' },
        { label: 'Horarios de apertura', value: hasHours ? 'Completos ✓' : 'Incompletos o ausentes ✗' },
        { label: 'Estado del negocio', value: isOperational ? 'Operativo ✓' : 'No operativo ✗' },
      ],
      tip:
        webAnalysis.type === 'none'
          ? 'Crear una página web básica con tus servicios y carta multiplicará tus llamadas desde Google Maps.'
          : webAnalysis.type === 'social_media'
            ? 'Migrar a una web con dominio propio (.com / .es) te posicionará por delante de quienes solo usan redes sociales.'
            : '¡Excelente! Mantén los horarios y tu web siempre actualizados.',
    };

    // 3. Fotos (15 max):
    //    - 10 fotos o más = completo (15), proporcional por debajo
    const photosScore = Math.min(15, Math.round((targetPhotosCount / 10) * 15));
    const photosBlock: HealthBlock = {
      key: 'photos',
      title: 'Fotos y contenido visual',
      score: photosScore,
      maxScore: 15,
      status: photosScore >= 12 ? 'good' : photosScore >= 8 ? 'warning' : 'danger',
      summary:
        targetPhotosCount >= 10
          ? `Tienes ${targetPhotosCount} fotos registradas. Un catálogo visual completo transmite profesionalidad e impulsa las visitas.`
          : `Tienes ${targetPhotosCount} fotos registradas (se recomiendan al menos 10). Las fichas con fotos reales reciben hasta un 42% más de solicitudes de ruta.`,
      details: [
        {
          label: 'Fotos en tu ficha',
          value: targetPhotosCount,
          benchmark: 'Mínimo recomendado: 10 fotos',
        },
      ],
      tip:
        targetPhotosCount < 10
          ? 'Sube fotos bien iluminadas del exterior de tu local, de tus productos o servicios y de tu equipo trabajando.'
          : 'Continúa subiendo 1 o 2 fotos nuevas cada mes para demostrar que tu negocio está muy activo.',
    };

    // 4. Tipo de negocio (15 max):
    //    - tiene un tipo principal definido y coincide con lo que se busca
    const hasPrimaryType = Boolean(
      targetPlace.primaryTypeDisplayName?.text || targetPlace.primaryType
    );
    const categoryScore = hasPrimaryType ? 15 : 5;
    const categoryBlock: HealthBlock = {
      key: 'category',
      title: 'Categoría y tipo de negocio',
      score: categoryScore,
      maxScore: 15,
      status: categoryScore >= 15 ? 'good' : 'warning',
      summary: hasPrimaryType
        ? `Tu categoría principal es "${primaryTypeStr}", adecuada para que Google muestre tu negocio ante búsquedas locales relevantes.`
        : 'No tienes una categoría principal bien definida en Google, lo que perjudica gravemente tu visibilidad.',
      details: [
        {
          label: 'Categoría principal',
          value: primaryTypeStr,
        },
        {
          label: 'Categorías secundarias',
          value: targetPlace.types ? targetPlace.types.slice(0, 3).join(', ') : 'Ninguna',
        },
      ],
      tip: 'Añadir 2 o 3 categorías secundarias afines te ayuda a captar búsquedas adicionales de clientes.',
    };

    // 5. Posición frente a competidores (15 max):
    //    - según en qué lugar aparece al buscar su categoría en su ciudad
    let rankingScore = 1;
    if (searchRank === 1) rankingScore = 15;
    else if (searchRank === 2) rankingScore = 12;
    else if (searchRank === 3) rankingScore = 9;
    else if (searchRank === 4) rankingScore = 6;
    else if (searchRank === 5) rankingScore = 3;
    else rankingScore = 1;

    const rankingBlock: HealthBlock = {
      key: 'ranking',
      title: 'Posición frente a competidores',
      score: rankingScore,
      maxScore: 15,
      status: rankingScore >= 12 ? 'good' : rankingScore >= 6 ? 'warning' : 'danger',
      summary:
        searchRank <= 3
          ? `Apareces en el puesto #${searchRank} al buscar "${primaryTypeStr}" en ${searchCity || 'tu zona'}. Estás en el bloque visible de Google Maps.`
          : searchRank <= 5
            ? `Apareces en el puesto #${searchRank} en tu zona. Tus competidores por encima se llevan la mayor parte de las llamadas.`
            : `Apareces fuera de los 5 primeros puestos en tu zona para "${primaryTypeStr}". Casi ningún cliente hace scroll tan abajo.`,
      details: [
        {
          label: 'Puesto en el mapa local',
          value: searchRank <= 5 ? `#${searchRank}` : 'Detrás del top 5',
          benchmark: 'Meta: Estar entre los 3 primeros (Local Pack)',
        },
      ],
      tip: 'Mejorar tus reseñas, fotos y datos de contacto te impulsará hacia los 3 primeros puestos.',
    };

    // Total Health Score
    const totalHealthScore = Math.min(
      100,
      Math.max(
        0,
        reviewsBlock.score +
          infoBlock.score +
          photosBlock.score +
          categoryBlock.score +
          rankingBlock.score
      )
    );

    const trafficLight: 'red' | 'yellow' | 'green' =
      totalHealthScore >= 75 ? 'green' : totalHealthScore >= 50 ? 'yellow' : 'red';

    // Competitor comparison table data
    const competitorComparisons: CompetitorComparison[] = filteredCompetitors.map((comp) => {
      const compRating = comp.rating || 0;
      const compRevCount = comp.userRatingCount || 0;
      const compPhotoCount = comp.photos?.length || 0;

      let distanceKm: number | undefined;
      if (
        targetPlace.location?.latitude &&
        targetPlace.location?.longitude &&
        comp.location?.latitude &&
        comp.location?.longitude
      ) {
        distanceKm = haversineDistanceKm(
          targetPlace.location.latitude,
          targetPlace.location.longitude,
          comp.location.latitude,
          comp.location.longitude
        );
      }

      const ratingDiff = Math.round((compRating - targetRating) * 10) / 10;
      const reviewsDiff = compRevCount - targetReviews;
      const photosDiff = compPhotoCount - targetPhotosCount;

      return {
        id: comp.id,
        name: comp.displayName?.text || 'Competidor local',
        address: comp.formattedAddress || 'En tu zona',
        rating: compRating,
        ratingDifference: ratingDiff,
        userRatingCount: compRevCount,
        reviewsDifference: reviewsDiff,
        photoCount: compPhotoCount,
        photosDifference: photosDiff,
        isLeading: compRevCount > targetReviews || compRating > targetRating,
        websiteUri: comp.websiteUri,
        primaryType: comp.primaryTypeDisplayName?.text || comp.primaryType,
        distanceKm,
      };
    });

    // Step 4) Generate 3 High-Impact Tasks using Gemini API
    // "Con la API de Gemini, genera las 3 tareas con más impacto según los puntos perdidos, cada una con un título corto, por qué importa (1 frase), 3 pasos concretos y un tiempo estimado ("10 minutos"). Lenguaje para un dueño de negocio, sin jerga de SEO."
    let tasks: ActionTask[] = [];

    if (GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const promptText = `
Actúa como un asesor comercial y de captación de clientes para pequeños negocios.
Analiza la siguiente auditoría de la ficha de Google Maps de "${businessName}" en ${searchCity}:

- Nota total de salud: ${totalHealthScore}/100
- Bloque Reseñas: ${reviewsBlock.score}/30 (Tiene ${targetReviews} reseñas vs ${Math.round(avgCompReviews)} de media de los competidores. Nota: ${targetRating}★ vs ${avgCompRating.toFixed(1)}★)
- Bloque Información y web: ${infoBlock.score}/25 (Presencia web: ${webAnalysis.displayLabel}, Teléfono: ${hasPhone ? 'Sí' : 'NO'}, Horarios: ${hasHours ? 'Sí' : 'NO'})
- Bloque Fotos: ${photosBlock.score}/15 (Tiene ${targetPhotosCount} fotos registradas, meta: al menos 10)
- Bloque Categoría: ${categoryBlock.score}/15 (Categoría: "${primaryTypeStr}")
- Posición en el mapa: Puesto #${searchRank} de la zona

Genera EXACTAMENTE 3 tareas con el mayor impacto para conseguir más clientes rápidamente, priorizando las áreas donde más puntos ha perdido este negocio.
CADA TAREA DEBE TENER:
- Título corto y muy accionable (ejemplo: "Pide 5 reseñas por WhatsApp hoy mismo")
- Por qué importa (exactamente 1 frase sencilla y directa que convenza al dueño del negocio)
- 3 pasos concretos y fáciles de seguir paso a paso
- Un tiempo estimado realista (ejemplo: "10 minutos", "15 minutos")
- Nivel de impacto ("Crítico" o "Alto")

Usa un tono empático, claro, directo para un dueño de tienda, restaurante o profesional, SIN jerga técnica ni palabras de SEO.
        `;

        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                tasks: {
                  type: Type.ARRAY,
                  description: 'Las 3 tareas con más impacto',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      whyItMatters: { type: Type.STRING },
                      estimatedTime: { type: Type.STRING },
                      steps: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      impact: { type: Type.STRING },
                      categoryKey: { type: Type.STRING },
                    },
                    required: ['title', 'whyItMatters', 'estimatedTime', 'steps', 'impact'],
                  },
                },
              },
              required: ['tasks'],
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out after 6 seconds')), 6000)
        );

        const geminiResponse = (await Promise.race([geminiCall, timeoutPromise])) as any;
        const rawJson = geminiResponse.text?.trim() || '';
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed.tasks) && parsed.tasks.length >= 3) {
          tasks = parsed.tasks.slice(0, 3).map((t: any, index: number) => ({
            id: String(index + 1),
            title: t.title,
            whyItMatters: t.whyItMatters,
            estimatedTime: t.estimatedTime || '15 minutos',
            steps: Array.isArray(t.steps) ? t.steps.slice(0, 3) : [],
            impact: t.impact === 'Crítico' ? 'Crítico' : 'Alto',
            categoryKey: t.categoryKey || 'general',
          }));
        }
      } catch (geminiError) {
        console.warn('Gemini task generation failed, using intelligent fallback rules:', geminiError);
      }
    }

    // Smart Fallback Tasks if Gemini is unavailable or failed
    if (tasks.length === 0) {
      const candidateTasks: ActionTask[] = [];

      // If missing hours, web or contact
      if (!hasHours || webAnalysis.type !== 'official_website' || !hasPhone) {
        candidateTasks.push({
          id: '1',
          title:
            webAnalysis.type === 'none'
              ? 'Añade una página web y completa tus datos de contacto'
              : webAnalysis.type === 'social_media'
                ? `Crea una web oficial propia para sustituir ${webAnalysis.socialPlatform || 'redes'}`
                : 'Completa tu horario y datos de contacto en Google',
          whyItMatters:
            webAnalysis.type === 'none'
              ? 'Las fichas sin página web pierden hasta el 50% de clientes que buscan ver precios antes de acudir.'
              : webAnalysis.type === 'social_media'
                ? 'Google Maps premia mucho más a las empresas con dominio propio que a perfiles de redes sociales.'
                : 'Los clientes llaman o acuden a los negocios que muestran claramente si están abiertos ahora mismo.',
          estimatedTime: webAnalysis.type === 'none' ? '15 minutos' : '10 minutos',
          steps:
            webAnalysis.type === 'none'
              ? [
                  'Si ya tienes web o catálogo online, pulsa en "Editar perfil" en Google y añade la URL en el campo "Sitio web".',
                  'Si no tienes web, crea una página web sencilla de 1 página con tus servicios y teléfono.',
                  'Comprueba que el enlace funcione correctamente tanto en móviles como en ordenadores.',
                ]
              : [
                  'Entra en Google y busca el nombre de tu negocio para abrir el panel de administración.',
                  'Haz clic en "Editar perfil" y rellena tus horarios de lunes a domingo y días festivos.',
                  'Asegúrate de que tu número de teléfono y tu enlace web estén verificados y actualizados.',
                ],
          impact: 'Crítico',
          categoryKey: 'info',
        });
      }

      // If reviews are behind competitors
      if (targetReviews < avgCompReviews || targetRating < 4.7) {
        candidateTasks.push({
          id: '2',
          title: 'Pide 5 reseñas a tus clientes habituales por WhatsApp',
          whyItMatters: `Tus competidores tienen ${Math.round(avgCompReviews)} reseñas de media y los clientes compran siempre a quien tiene más opiniones recientes.`,
          estimatedTime: '10 minutos',
          steps: [
            'Copia tu enlace directo para dejar reseñas desde el botón "Solicitar opiniones" de tu perfil.',
            'Envíalo con un mensaje cariñoso a 5 clientes de confianza que hayan quedado muy contentos.',
            'Responde con educación a cada reseña en cuanto la recibas para que Google vea actividad.',
          ],
          impact: 'Crítico',
          categoryKey: 'reviews',
        });
      }

      // If photos < 10
      if (targetPhotosCount < 10) {
        candidateTasks.push({
          id: '3',
          title: 'Sube 8 fotos reales con buena luz de tu local y servicios',
          whyItMatters:
            'Los perfiles con fotos auténticas reciben el doble de clics y llamadas que los perfiles vacíos.',
          estimatedTime: '15 minutos',
          steps: [
            'Saca fotos con tu móvil de la fachada exterior para que los clientes te reconozcan en la calle.',
            'Fotografía tus mejores productos, tus instalaciones limpias o a ti trabajando.',
            'Súbelas directamente desde la aplicación de Google Maps pulsando en "Añadir foto".',
          ],
          impact: 'Alto',
          categoryKey: 'photos',
        });
      }

      // If ranking is low or general improvement
      if (searchRank > 2 || candidateTasks.length < 3) {
        candidateTasks.push({
          id: '4',
          title: 'Publica tu primera novedad o promoción de la semana',
          whyItMatters:
            'Google premia con mejores posiciones a los negocios que demuestran estar abiertos y activos cada semana.',
          estimatedTime: '10 minutos',
          steps: [
            'En el panel de tu negocio en Google, pulsa en el botón "Añadir actualización".',
            'Escribe un texto breve (2 líneas) explicando tu producto estrella o una oferta especial.',
            'Añade una foto atractiva y el botón de contacto "Llamar ahora".',
          ],
          impact: 'Alto',
          categoryKey: 'ranking',
        });
      }

      // Always have high-impact customer-getting tasks to guarantee at least 3 tasks
      if (candidateTasks.length < 3) {
        candidateTasks.push({
          id: '5',
          title: 'Responde a tus últimas 5 reseñas pendientes',
          whyItMatters:
            'Los clientes nuevos leen las respuestas del dueño para comprobar que el servicio es atento y de confianza.',
          estimatedTime: '10 minutos',
          steps: [
            'Abre la sección de reseñas en tu perfil de Google.',
            'Agradece a los clientes positivos destacando algún detalle del servicio.',
            'Si hay alguna queja, responde con empatía y ofrece solucionar el problema en privado.',
          ],
          impact: 'Alto',
          categoryKey: 'reviews',
        });
      }

      if (candidateTasks.length < 3) {
        candidateTasks.push({
          id: '6',
          title: 'Coloca un cartel con código QR para reseñas en tu local',
          whyItMatters:
            'Facilita que los clientes satisfechos opinen en caliente justo antes de marcharse de tu negocio.',
          estimatedTime: '15 minutos',
          steps: [
            'Genera un código QR gratuito que apunte directamente al enlace de reseñas de tu ficha.',
            'Imprímelo en tamaño tarjeta o pequeño sobremesa con el texto "Tu opinión nos ayuda a mejorar".',
            'Colócalo visible en el mostrador, recepción o junto a la cuenta.',
          ],
          impact: 'Alto',
          categoryKey: 'reviews',
        });
      }

      tasks = candidateTasks.slice(0, 3).map((t, idx) => ({ ...t, id: String(idx + 1) }));
    }

    const auditResult: AuditResult = {
      place: targetPlace,
      competitors: competitorComparisons,
      rawCompetitors: filteredCompetitors,
      healthScore: totalHealthScore,
      trafficLight,
      blocks: {
        reviews: reviewsBlock,
        info: infoBlock,
        photos: photosBlock,
        category: categoryBlock,
        ranking: rankingBlock,
      },
      tasks,
      searchRank,
      categoryQueryUsed: primaryTypeStr,
      cityQueryUsed: searchCity,
      cachedAt: Date.now(),
      websiteAnalysis: webAnalysis,
    };

    // Save in 24-hour cache
    auditCache.set(placeId, {
      timestamp: Date.now(),
      data: auditResult,
    });

    // Increment rate limit for this IP
    incrementRateLimit(clientIp);

    res.json(auditResult);
  } catch (error: any) {
    console.error('Audit generation error:', error);
    res.status(500).json({
      error: 'Ocurrió un error al generar la auditoría.',
      details: error?.message || 'Error desconocido',
    });
  }
});
