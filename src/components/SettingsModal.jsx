import { useState } from 'react';
import { LENGTHS, PLATFORMS, TONES } from '../lib/constants';
import { saveSettings } from '../lib/storage';

export default function SettingsModal({ settings, onClose }) {
  const [form, setForm] = useState({ ...settings });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    saveSettings(form);
    onClose(form);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose(null);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal__header">
          <h2>Configuración</h2>
          <button type="button" className="modal__close" onClick={() => onClose(null)}>
            ✕
          </button>
        </div>

        <div className="modal__body">
          <div className="modal__section-label">Perfil</div>

          <div className="field">
            <label>Nombre</label>
            <input
              type="text"
              value={form.profileName}
              onChange={(e) => update('profileName', e.target.value)}
            />
          </div>

          <div className="field">
            <label>Usuario</label>
            <input
              type="text"
              value={form.profileUsername}
              onChange={(e) => update('profileUsername', e.target.value)}
              placeholder="@usuario"
            />
          </div>

          <div className="field">
            <label>Título o rol (LinkedIn)</label>
            <input
              type="text"
              value={form.profileTitle}
              onChange={(e) => update('profileTitle', e.target.value)}
              placeholder="Ej: Diseñador freelance"
            />
          </div>

          <div className="field">
            <label>Iniciales (avatar)</label>
            <input
              type="text"
              value={form.profileInitials}
              onChange={(e) => update('profileInitials', e.target.value)}
              placeholder="Ej: JM (máx 2 caracteres)"
              maxLength={2}
            />
          </div>

          <div className="modal__section-label">Valores por defecto</div>

          <div className="field">
            <label>Red social</label>
            <select
              value={form.defaultPlatform}
              onChange={(e) => update('defaultPlatform', e.target.value)}
            >
              {Object.values(PLATFORMS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Tono</label>
            <select value={form.defaultTone} onChange={(e) => update('defaultTone', e.target.value)}>
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Longitud</label>
            <select
              value={form.defaultLength}
              onChange={(e) => update('defaultLength', e.target.value)}
            >
              {LENGTHS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field field--row">
            <label className="switch">
              <input
                type="checkbox"
                checked={form.defaultEmojis}
                onChange={(e) => update('defaultEmojis', e.target.checked)}
              />
              <span>Emojis</span>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={form.defaultHashtags}
                onChange={(e) => update('defaultHashtags', e.target.checked)}
              />
              <span>Hashtags</span>
            </label>
          </div>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={() => onClose(null)}>
            Cancelar
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
