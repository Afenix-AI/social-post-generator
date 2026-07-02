import { PLATFORMS } from '../lib/constants';

export default function HistoryPanel({ history, onLoad, onRemove, onClearAll }) {
  if (history.length === 0) {
    return (
      <div className="history-panel history-panel--empty">
        <h2>Historial</h2>
        <p>Todavía no has generado ningún post. Tus últimas 10 creaciones aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-panel__header">
        <h2>Historial ({history.length}/10)</h2>
        <button type="button" className="btn btn--ghost" onClick={onClearAll}>
          Borrar todo
        </button>
      </div>
      <ul className="history-list">
        {history.map((item) => {
          const config = PLATFORMS[item.platform];
          return (
            <li key={item.id} className="history-item">
              <button
                type="button"
                className="history-item__main"
                onClick={() => onLoad(item)}
                title="Cargar este post"
              >
                <span
                  className="history-item__dot"
                  style={{ backgroundColor: config?.color || '#888' }}
                />
                <span className="history-item__topic">{item.topic}</span>
                <span className="history-item__meta">
                  {config?.label} · {new Date(item.timestamp).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </button>
              <button
                type="button"
                className="history-item__remove"
                onClick={() => onRemove(item.id)}
                title="Eliminar del historial"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
