export const PLATFORMS = {
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    minChars: 800,
    maxChars: 1300,
    hookRequired: true,
    description: 'Publicación larga tipo LinkedIn con gancho en la primera línea',
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    minChars: 150,
    maxChars: 300,
    hookRequired: false,
    description: 'Caption corta de Instagram, hashtags al final',
  },
  x: {
    id: 'x',
    label: 'X / Twitter',
    color: '#000000',
    minChars: 0,
    maxChars: 280,
    hookRequired: false,
    description: 'Tweet corto y directo, máximo 280 caracteres',
  },
};

export const LENGTHS = [
  { id: 'corto', label: 'Corto' },
  { id: 'medio', label: 'Medio' },
  { id: 'largo', label: 'Largo' },
];

export function getTargetCharRange(platformId, lengthId) {
  const p = PLATFORMS[platformId];
  if (!p) return [0, 280];
  const { minChars, maxChars } = p;
  const range = maxChars - minChars;
  switch (lengthId) {
    case 'corto':
      return [minChars, minChars + Math.round(range * 0.35)];
    case 'largo':
      return [minChars + Math.round(range * 0.65), maxChars];
    default:
      return [minChars + Math.round(range * 0.25), minChars + Math.round(range * 0.75)];
  }
}

export const TONES = [
  { id: 'profesional', label: 'Profesional' },
  { id: 'cercano', label: 'Cercano' },
  { id: 'motivacional', label: 'Motivacional' },
  { id: 'controversial', label: 'Controversial' },
];

export const DEFAULT_PROFILE = {
  name: 'Tu Nombre',
  username: '@tuusuario',
  avatarInitial: 'T',
};

export const HISTORY_KEY = 'spg_history_v1';
export const MAX_HISTORY = 10;
export const SETTINGS_KEY = 'spg_settings_v1';

export const DEFAULT_SETTINGS = {
  profileName: 'Tu Nombre',
  profileUsername: '@tuusuario',
  profileTitle: '',
  profileInitials: '',
  defaultPlatform: 'linkedin',
  defaultTone: 'profesional',
  defaultLength: 'medio',
  defaultEmojis: true,
  defaultHashtags: true,
};
