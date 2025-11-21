export default function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizes = {
    small: '24px',
    medium: '40px',
    large: '60px',
  };

  return (
    <>
      <div className="spinner-container">
        <div className="spinner"></div>
        {text && <p className="loading-text">{text}</p>}
      </div>

      <style jsx>{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
        }

        .spinner {
          width: ${sizes[size]};
          height: ${sizes[size]};
          border: 4px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-text {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}