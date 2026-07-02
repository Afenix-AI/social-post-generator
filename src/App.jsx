import { useCallback, useEffect, useState } from 'react';
import ControlPanel from './components/ControlPanel';
import PostCard from './components/PostCard';
import HistoryPanel from './components/HistoryPanel';
import SettingsModal from './components/SettingsModal';
import { PLATFORMS } from './lib/constants';
import { generatePosts, generateIdeas, getApiKey, setApiKey } from './lib/nvidia';
import { addToHistory, clearHistory, getHistory, getSettings, removeFromHistory } from './lib/storage';
import './App.css';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [tone, setTone] = useState('profesional');
  const [postLength, setPostLength] = useState('medio');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  const [variants, setVariants] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);
  const [hasApiKey, setHasApiKey] = useState(Boolean(getApiKey()));
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [settings, setSettings] = useState(getSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [ideaTopic, setIdeaTopic] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    const s = getSettings();
    setSettings(s);
    setPlatform(s.defaultPlatform);
    setTone(s.defaultTone);
    setPostLength(s.defaultLength);
    setIncludeEmojis(s.defaultEmojis);
    setIncludeHashtags(s.defaultHashtags);
  }, []);

  const handleOpenSettings = () => setShowSettings(true);

  const handleSaveSettings = (newSettings) => {
    if (newSettings) {
      setSettings(newSettings);
      setPlatform(newSettings.defaultPlatform);
      setTone(newSettings.defaultTone);
      setPostLength(newSettings.defaultLength);
      setIncludeEmojis(newSettings.defaultEmojis);
      setIncludeHashtags(newSettings.defaultHashtags);
    }
    setShowSettings(false);
  };

  const handleGenerateIdeas = async () => {
    if (!ideaTopic.trim()) return;
    setIdeasLoading(true);
    setError('');
    try {
      const result = await generateIdeas({ topic: ideaTopic.trim() });
      setIdeas(result);
    } catch (err) {
      setError(err.message || 'Error al generar ideas');
    } finally {
      setIdeasLoading(false);
    }
  };

  const handleSelectIdea = (idea) => {
    setTopic(idea);
    setIdeas([]);
    setIdeaTopic('');
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    setApiKey(apiKeyInput.trim());
    setHasApiKey(true);
    setApiKeyInput('');
    setError('');
  };

  const handleResetApiKey = () => {
    setApiKey('');
    setHasApiKey(false);
    setApiKeyInput('');
  };

  const runGeneration = async () => {
    setError('');
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const result = await generatePosts({
        topic: topic.trim(),
        platform,
        tone,
        length: postLength,
        includeEmojis,
        includeHashtags,
      });
      setVariants(result);

      const entry = {
        id: makeId(),
        timestamp: Date.now(),
        topic: topic.trim(),
        platform,
        tone,
        length: postLength,
        includeEmojis,
        includeHashtags,
        variants: result,
      };
      const updated = addToHistory(entry);
      setHistory(updated);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        setHasApiKey(false);
        setError('Introduce tu API Key de NVIDIA AI para poder generar posts.');
      } else {
        setError(err.message || 'Ha ocurrido un error al generar el post.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryItem = (item) => {
    setTopic(item.topic);
    setPlatform(item.platform);
    setTone(item.tone);
    setPostLength(item.length || 'medio');
    setIncludeEmojis(item.includeEmojis);
    setIncludeHashtags(item.includeHashtags);
    setVariants(item.variants);
    setError('');
  };

  const handleRemoveHistoryItem = (id) => {
    setHistory(removeFromHistory(id));
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
  };

  const updateVariant = (index, newText) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = newText;
      return next;
    });
  };

  const config = PLATFORMS[platform];
  const hasVariants = variants.some((v) => v && v.trim().length > 0);

  return (
    <div className="app" style={{ '--platform-color': config.color }}>
      <aside className="app__sidebar">
        <ControlPanel
          topic={topic}
          setTopic={setTopic}
          platform={platform}
          setPlatform={setPlatform}
          tone={tone}
          setTone={setTone}
          postLength={postLength}
          setPostLength={setPostLength}
          includeEmojis={includeEmojis}
          setIncludeEmojis={setIncludeEmojis}
          includeHashtags={includeHashtags}
          setIncludeHashtags={setIncludeHashtags}
          onGenerate={runGeneration}
          isLoading={isLoading}
          apiKeyInput={apiKeyInput}
          setApiKeyInput={setApiKeyInput}
          onSaveApiKey={handleSaveApiKey}
          hasApiKey={hasApiKey}
          onResetApiKey={handleResetApiKey}
          onOpenSettings={handleOpenSettings}
          ideaTopic={ideaTopic}
          setIdeaTopic={setIdeaTopic}
          ideas={ideas}
          onGenerateIdeas={handleGenerateIdeas}
          onSelectIdea={handleSelectIdea}
          ideasLoading={ideasLoading}
        />
        <HistoryPanel
          history={history}
          onLoad={handleLoadHistoryItem}
          onRemove={handleRemoveHistoryItem}
          onClearAll={handleClearHistory}
        />
      </aside>

      <main className="app__preview">
        {error && <div className="alert alert--error">{error}</div>}

        {!hasVariants && !isLoading && (
          <div className="empty-state">
            <h2>Tu preview aparecerá aquí</h2>
            <p>
              Escribe una idea, elige red social y tono, y pulsa "Generar post" para ver 2
              variantes listas para publicar.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="empty-state">
            <div className="spinner" />
            <p>Generando variantes con IA...</p>
          </div>
        )}

        {hasVariants && !isLoading && (
          <>
            <div className="preview-grid">
              {variants.map((text, index) => (
                <PostCard
                  key={index}
                  variantLabel={`Variante ${index + 1}`}
                  text={text}
                  platform={platform}
                  profile={settings}
                  onChange={(newText) => updateVariant(index, newText)}
                />
              ))}
            </div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={runGeneration}
              disabled={isLoading}
            >
              Regenerar variantes
            </button>
          </>
        )}
      </main>

      {showSettings && (
        <SettingsModal settings={settings} onClose={handleSaveSettings} />
      )}
    </div>
  );
}
