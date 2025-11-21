export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <>
      <div className="error-container" role="alert">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <p className="error-text">{message}</p>
          {onDismiss && (
            <button onClick={onDismiss} className="dismiss-button" aria-label="Dismiss">
              ✕
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .error-container {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .error-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .error-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .error-text {
          flex: 1;
          color: #991b1b;
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .dismiss-button {
          background: transparent;
          border: none;
          color: #991b1b;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s;
          flex-shrink: 0;
        }

        .dismiss-button:hover {
          background: rgba(153, 27, 27, 0.1);
        }
      `}</style>
    </>
  );
}