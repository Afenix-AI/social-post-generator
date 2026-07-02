import { PLATFORMS } from './constants';

const API_KEY_STORAGE = 'spg_anthropic_api_key';
const MODEL = 'claude-sonnet-5'; // Use currently available Claude Sonnet 5
const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export function getApiKey() {
  const stored = localStorage.getItem(API_KEY_STORAGE);
  if (stored) return stored;
  return import.meta.env.VITE_ANTHROPIC_API_KEY || '';
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
}

function buildSystemPrompt({ platformConfig, tone, includeEmojis, includeHashtags }) {
  const toneInstructions = {
    profesional: 'Tono profesional, claro y creíble, sin sonar corporativo ni acartonado.',
    cercano: 'Tono cercano y conversacional, como si hablaras con un amigo o colega de confianza.',
    motivacional: 'Tono motivacional e inspirador, que empuje a la acción sin caer en frases vacías.',
    controversial: 'Tono controversial y provocador, con una opinión fuerte que genere debate, sin ser ofensivo ni faltar el respeto.',
  };

  const emojiRule = includeEmojis
    ? 'Incluye emojis relevantes de forma natural, sin abusar (máximo unos pocos, bien distribuidos).'
    : 'No uses ningún emoji.';

  const hashtagRule = includeHashtags
    ? platformConfig.id === 'instagram'
      ? 'Añade entre 5 y 10 hashtags relevantes al final del post, después de un salto de línea.'
      : platformConfig.id === 'x'
      ? 'Añade entre 1 y 3 hashtags relevantes, integrados de forma natural o al final. Cuentan dentro del límite de 280 caracteres.'
      : 'Añade entre 3 y 5 hashtags relevantes al final del post.'
    : 'No incluyas ningún hashtag.';

  const lengthRule =
    platformConfig.id === 'x'
      ? `El post debe tener como máximo ${platformConfig.maxChars} caracteres en total (incluyendo hashtags si los hay). Sé directo y contundente.`
      : `El post debe tener entre ${platformConfig.minChars} y ${platformConfig.maxChars} caracteres (sin contar hashtags si van en línea aparte).`;

  const hookRule = platformConfig.hookRequired
    ? 'La primera línea debe ser un gancho potente que enganche al lector y le dé ganas de seguir leyendo (evita empezar con generalidades).'
    : '';

  return `Eres un copywriter experto en redes sociales especializado en ${platformConfig.label}, personal branding y en escribir para freelances, consultores y emprendedores.

Genera contenido para ${platformConfig.label} en ESPAÑOL siguiendo estas reglas estrictas:
- ${lengthRule}
${hookRule ? `- ${hookRule}` : ''}
- ${toneInstructions[tone] || toneInstructions.profesional}
- ${emojiRule}
- ${hashtagRule}
- El post debe aportar valor real (una idea, aprendizaje, reflexión o consejo), no ser genérico ni sonar a plantilla.
- No uses comillas envolviendo todo el post.
- No mencione que eres una IA ni expliques lo que estás haciendo.

Debes generar SIEMPRE 2 variantes distintas del mismo tema, con enfoques o ángulos diferentes entre sí.

Responde EXCLUSIVAMENTE con un JSON válido, sin texto adicional antes ni después, sin bloques de código markdown, con esta forma exacta:
{"variants": ["texto de la variante 1", "texto de la variante 2"]}`;
}

function extractJson(rawText) {
  const trimmed = rawText.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  return JSON.parse(candidate);
}

export async function generatePosts({ topic, platform, tone, includeEmojis, includeHashtags }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const platformConfig = PLATFORMS[platform];
  const systemPrompt = buildSystemPrompt({ platformConfig, tone, includeEmojis, includeHashtags });

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Tema o idea del post: "${topic}"` }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message = errBody?.error?.message || `Error ${response.status} al llamar a la API de Anthropic`;
    throw new Error(message);
  }

  const data = await response.json();
  const textBlock = data?.content?.find((block) => block.type === 'text');
  const content = textBlock?.text;
  if (!content) {
    throw new Error('La respuesta de Claude no contiene contenido.');
  }

  let parsed;
  try {
    parsed = extractJson(content);
  } catch (err) {
    throw new Error('No se pudo interpretar la respuesta de Claude como JSON.');
  }

  const variants = Array.isArray(parsed.variants) ? parsed.variants : [];
  if (variants.length < 2) {
    throw new Error('Claude no devolvió las 2 variantes esperadas.');
  }

  return variants.slice(0, 2);
}
