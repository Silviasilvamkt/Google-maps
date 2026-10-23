export interface PlaceLocation {
  latitude: number;
  longitude: number;
}

export interface PlacePhoto {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: Array<{
    displayName?: string;
    uri?: string;
  }>;
}

export interface OpeningPeriod {
  open: { day: number; hour: number; minute: number };
  close?: { day: number; hour: number; minute: number };
}

export interface PlaceItem {
  id: string;
  displayName?: {
    text: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  primaryType?: string;
  primaryTypeDisplayName?: {
    text: string;
    languageCode?: string;
  };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: OpeningPeriod[];
    weekdayDescriptions?: string[];
  };
  photos?: PlacePhoto[];
  businessStatus?: string;
  location?: PlaceLocation;
}

export interface HealthBlock {
  key: 'reviews' | 'info' | 'photos' | 'category' | 'ranking';
  title: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'danger';
  summary: string;
  details: {
    label: string;
    value: string | number;
    benchmark?: string | number;
  }[];
  tip: string;
}

export interface ActionTask {
  id: string;
  title: string;
  whyItMatters: string;
  estimatedTime: string;
  steps: string[];
  impact: 'Alto' | 'Medio' | 'Crítico';
  categoryKey: string;
}

export interface CompetitorComparison {
  id: string;
  name: string;
  address: string;
  rating: number;
  ratingDifference: number; // e.g. +0.4 or -0.2
  userRatingCount: number;
  reviewsDifference: number; // e.g. +45
  photoCount: number;
  photosDifference: number;
  isLeading: boolean;
  websiteUri?: string;
  primaryType?: string;
  distanceKm?: number;
}

export interface WebsiteAnalysis {
  hasUrl: boolean;
  rawUrl?: string;
  domain?: string;
  type: 'official_website' | 'social_media' | 'none';
  socialPlatform?: string;
  displayLabel: string;
  seoAdvice: string;
}

export interface AuditResult {
  place: PlaceItem;
  competitors: CompetitorComparison[];
  rawCompetitors: PlaceItem[];
  healthScore: number; // 0 - 100
  trafficLight: 'red' | 'yellow' | 'green';
  blocks: {
    reviews: HealthBlock;
    info: HealthBlock;
    photos: HealthBlock;
    category: HealthBlock;
    ranking: HealthBlock;
  };
  tasks: ActionTask[];
  searchRank: number; // position in local category search
  categoryQueryUsed: string;
  cityQueryUsed: string;
  cachedAt: number;
  fromCache?: boolean;
  websiteAnalysis?: WebsiteAnalysis;
}

export interface AppConfig {
  ctaDiyUrl?: string;
  ctaDfyUrl?: string;
  hasCustomPlacesKey: boolean;
  hasGeminiKey: boolean;
}
