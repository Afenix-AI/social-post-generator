import { PLATFORMS, getTargetCharRange } from './constants';

const API_KEY_STORAGE = 'spg_nvidia_api_key';
const MODEL = 'nvidia/llama-3.3-nemotron-super-49b-v1.5';
const API_URL = '/api/nvidia/v1/chat/completions';

export function getApiKey() {
  const stored = localStorage.getItem(API_KEY_STORAGE);
  if (stored) return stored;
  return import.meta.env.VITE_NVIDIA_API_KEY || '';
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
}

function buildSystemPrompt({ platformConfig, tone, includeEmojis, includeHashtags, length }) {
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

  const [targetMin, targetMax] = getTargetCharRange(platformConfig.id, length);
  const targetWordsMin = Math.round(targetMin / 5.5);
  const targetWordsMax = Math.round(targetMax / 5.5);

  const lengthRule =
    platformConfig.id === 'x'
      ? `El post debe tener como máximo ${platformConfig.maxChars} caracteres en total (incluyendo hashtags si los hay). Intenta que tenga alrededor de ${targetWordsMin}-${targetWordsMax} palabras. Sé directo y contundente.`
      : `El post debe tener aproximadamente ${targetWordsMin}-${targetWordsMax} palabras (unos ${targetMin}-${targetMax} caracteres, sin contar hashtags si van en línea aparte).`;

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
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const arrayMatch = candidate.match(/\[[\s\S]*?\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);
    const objMatch = candidate.match(/\{[\s\S]*?\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error('No JSON found');
  }
}

export async function generatePosts({ topic, platform, tone, includeEmojis, includeHashtags, length }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const platformConfig = PLATFORMS[platform];
  const systemPrompt = buildSystemPrompt({ platformConfig, tone, includeEmojis, includeHashtags, length });

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 0.95,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema o idea del post: "${topic}"` },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message = errBody?.error?.message || `Error ${response.status} al llamar a la API de NVIDIA`;
    throw new Error(message);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('La respuesta de NVIDIA no contiene contenido.');
  }

  let parsed;
  try {
    parsed = extractJson(content);
  } catch (err) {
    throw new Error('No se pudo interpretar la respuesta de NVIDIA como JSON.');
  }

  const variants = Array.isArray(parsed.variants) ? parsed.variants : [];
  if (variants.length < 2) {
    throw new Error('NVIDIA no devolvió las 2 variantes esperadas.');
  }

  return variants.slice(0, 2);
}

const IDEAS_PROMPT = `Eres un copywriter experto en redes sociales y personal branding.

Dado un tema, genera 5 ideas de post con gancho para LinkedIn/Instagram/X dirigidas a freelances, consultores y emprendedores.

Cada idea debe ser una frase corta con gancho (máximo 15 palabras) que enganche y deje claro el tema del post. Deben ser variadas y cubrir distintos ángulos del tema.

Responde EXCLUSIVAMENTE con un JSON válido, sin texto adicional, sin bloques de código, sin markdown, con esta forma exacta:
{"ideas":["idea 1 con gancho","idea 2 con gancho","idea 3 con gancho","idea 4 con gancho","idea 5 con gancho"]}`;

export async function generateIdeas({ topic }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.9,
      top_p: 0.95,
      messages: [
        { role: 'system', content: IDEAS_PROMPT },
        { role: 'user', content: `Tema: "${topic}"` },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message = errBody?.error?.message || `Error ${response.status} al llamar a la API de NVIDIA`;
    throw new Error(message);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('La respuesta no contiene contenido.');

  let parsed;
  try {
    parsed = extractJson(content);
  } catch (err) {
    throw new Error(`Error al interpretar respuesta: "${content.slice(0, 200)}..."`);
  }

  const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
  if (ideas.length < 3) throw new Error('No se generaron suficientes ideas.');
  return ideas.slice(0, 5);
}
