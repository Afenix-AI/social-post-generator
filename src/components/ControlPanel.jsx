import { LENGTHS, PLATFORMS, TONES, getTargetCharRange } from '../lib/constants';

export default function ControlPanel({
  topic,
  setTopic,
  platform,
  setPlatform,
  tone,
  setTone,
  postLength,
  setPostLength,
  includeEmojis,
  setIncludeEmojis,
  includeHashtags,
  setIncludeHashtags,
  onGenerate,
  isLoading,
  apiKeyInput,
  setApiKeyInput,
  onSaveApiKey,
  hasApiKey,
  onResetApiKey,
  onOpenSettings,
  ideaTopic,
  setIdeaTopic,
  ideas,
  onGenerateIdeas,
  onSelectIdea,
  onClearIdeas,
  ideasLoading,
}) {
  const config = PLATFORMS[platform];
  const [rangeMin, rangeMax] = getTargetCharRange(platform, postLength);
  const wordsMin = Math.round(rangeMin / 5.5);
  const wordsMax = Math.round(rangeMax / 5.5);

  return (
    <div className="control-panel">
      <div className="control-panel__header">
        <div>
          <h1>Generador de Posts</h1>
          <p>Crea contenido de valor para tus redes en segundos</p>
        </div>
        <button
          type="button"
          className="btn-icon btn-icon--settings"
          onClick={onOpenSettings}
          title="Configuración"
        >
          ⚙
        </button>
      </div>

      {!hasApiKey && (
        <div className="api-key-box">
          <label htmlFor="apiKey">API Key de NVIDIA AI (gratuita)</label>
          <input
            id="apiKey"
            type="password"
            placeholder="nvapi-..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
          <button type="button" className="btn btn--secondary" onClick={onSaveApiKey}>
            Guardar clave
          </button>
          <small>
            Se guarda solo en tu navegador (localStorage). Consíguela gratis en{' '}
            <a href="https://build.nvidia.com/settings/api-keys" target="_blank" rel="noreferrer">
              build.nvidia.com
            </a>
            . Sin tarjeta de crédito.
          </small>
        </div>
      )}

      {hasApiKey && (
        <button type="button" className="btn btn--ghost btn--reset-key" onClick={onResetApiKey}>
          Cambiar API Key
        </button>
      )}

      <div className="field">
        <label htmlFor="ideaTopic">Inspírate: genera ideas con gancho</label>
        <div className="field__row">
          <input
            id="ideaTopic"
            type="text"
            placeholder="Ej: Cobrar por horas vs por valor"
            value={ideaTopic}
            onChange={(e) => setIdeaTopic(e.target.value)}
          />
          <button
            type="button"
            className={`btn btn--secondary btn--sm ${ideasLoading ? 'btn--loading' : ''}`}
            onClick={onGenerateIdeas}
            disabled={ideasLoading || !ideaTopic.trim()}
          >
            {ideasLoading ? <span className="spinner-btn" /> : 'Generar'}
          </button>
        </div>
        {ideas.length > 0 && (
          <>
            <div className="ideas-header">
              <span className="ideas-header__label">Ideas generadas</span>
              <button type="button" className="ideas-header__clear" onClick={onClearIdeas}>
                Limpiar
              </button>
            </div>
            <div className="ideas-list">
              {ideas.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  className="idea-chip"
                  onClick={() => {
                    onSelectIdea(idea);
                    setIdeaTopic('');
                  }}
                >
                  {idea}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="field">
        <label htmlFor="topic">Idea o tema del post</label>
        <textarea
          id="topic"
          rows={4}
          placeholder="Ej: Por qué cobrar por horas es un error para un freelance..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Red social</label>
        <div className="pill-group">
          {Object.values(PLATFORMS).map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pill ${platform === p.id ? 'pill--active' : ''}`}
              style={platform === p.id ? { borderColor: p.color, color: p.color } : undefined}
              onClick={() => setPlatform(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Longitud del post</label>
        <div className="pill-group">
          {LENGTHS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`pill ${postLength === l.id ? 'pill--active' : ''}`}
              onClick={() => setPostLength(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="field__hint">
          {wordsMin}–{wordsMax} palabras ({rangeMin}–{rangeMax} caracteres)
          {platform === 'x' && ` · máx. ${config.maxChars} caracteres`}
          {platform !== 'x' && ` · mínimo ${config.minChars} caracteres`}
        </div>
      </div>

      <div className="field">
        <label>Tono</label>
        <div className="pill-group">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`pill ${tone === t.id ? 'pill--active' : ''}`}
              onClick={() => setTone(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field field--row">
        <label className="switch">
          <input
            type="checkbox"
            checked={includeEmojis}
            onChange={(e) => setIncludeEmojis(e.target.checked)}
          />
          <span>Incluir emojis</span>
        </label>
        <label className="switch">
          <input
            type="checkbox"
            checked={includeHashtags}
            onChange={(e) => setIncludeHashtags(e.target.checked)}
          />
          <span>Incluir hashtags</span>
        </label>
      </div>

      <button
        type="button"
        className={`btn btn--generate btn--full ${isLoading ? 'btn--loading' : ''}`}
        onClick={onGenerate}
        disabled={isLoading || !topic.trim()}
      >
        {isLoading ? <span className="spinner-btn spinner-btn--light" /> : 'Generar post'}
      </button>
    </div>
  );
}
