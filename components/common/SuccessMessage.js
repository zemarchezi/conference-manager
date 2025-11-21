export default function SuccessMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <>
      <div className="success-container" role="alert">
        <div className="success-content">
          <span className="success-icon">✓</span>
          <p className="success-text">{message}</p>
          {onDismiss && (
            <button onClick={onDismiss} className="dismiss-button" aria-label="Dismiss">
              ✕
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .success-container {
          background: #dcfce7;
          border: 1px solid #86efac;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .success-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .success-icon {
          font-size: 1.25rem;
          font-weight: bold;
          color: #166534;
          flex-shrink: 0;
        }

        .success-text {
          flex: 1;
          color: #166534;
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .dismiss-button {
          background: transparent;
          border: none;
          color: #166534;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s;
          flex-shrink: 0;
        }

        .dismiss-button:hover {
          background: rgba(22, 101, 52, 0.1);
        }
      `}</style>
    </>
  );
}