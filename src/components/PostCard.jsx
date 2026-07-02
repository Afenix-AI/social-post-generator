import { useEffect, useRef, useState } from 'react';
import { PLATFORMS } from '../lib/constants';

export default function PostCard({ variantLabel, text, onChange, platform, profile }) {
  const config = PLATFORMS[platform];
  const [copied, setCopied] = useState(false);
  const editableRef = useRef(null);
  const isInternalEdit = useRef(false);

  const name = profile?.profileName || 'Tu Nombre';
  const username = profile?.profileUsername || '@tuusuario';
  const initials = profile?.profileInitials || name.charAt(0).toUpperCase();
  const title = profile?.profileTitle || '';

  const charCount = text.length;
  const isX = platform === 'x';
  const isOverMax = charCount > config.maxChars;
  const isUnderMin = !isX && charCount < config.minChars && charCount > 0;

  let counterClass = 'char-counter';
  if (isOverMax) counterClass += ' char-counter--error';
  else if (isUnderMin) counterClass += ' char-counter--warning';
  else if (charCount > 0) counterClass += ' char-counter--ok';

  useEffect(() => {
    if (isInternalEdit.current) {
      isInternalEdit.current = false;
      return;
    }
    if (editableRef.current && editableRef.current.innerText !== text) {
      editableRef.current.innerText = text;
    }
  }, [text]);

  const handleInput = (e) => {
    isInternalEdit.current = true;
    onChange(e.currentTarget.innerText);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('No se pudo copiar', err);
    }
  };

  return (
    <div className="post-card" style={{ '--accent': config.color }}>
      <div className="post-card__variant-label">{variantLabel}</div>
      <div className="post-card__platform-header">
        <div className="post-card__avatar">{initials}</div>
        <div className="post-card__identity">
          <div className="post-card__name">{name}</div>
          <div className="post-card__username">{username}</div>
          {title && <div className="post-card__title">{title}</div>}
        </div>
        <div className="post-card__platform-badge">{config.label}</div>
      </div>

      <div
        className="post-card__text"
        contentEditable
        suppressContentEditableWarning
        ref={editableRef}
        onInput={handleInput}
      />

      <div className="post-card__footer">
        <span className={counterClass}>
          {charCount} / {config.maxChars} caracteres
          {isUnderMin && ' · por debajo del mínimo recomendado'}
          {isOverMax && ' · supera el máximo'}
        </span>
        <button type="button" className="btn btn--copy" onClick={handleCopy}>
          {copied ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}
