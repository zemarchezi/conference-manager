import Link from 'next/link';

export default function ConferenceCard({ conference }) {
  const startDate = new Date(conference.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const endDate = new Date(conference.end_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="conference-card">
        <div className="card-header">
          <h3 className="card-title">{conference.title}</h3>
          <span className="status-badge">{conference.status || 'Active'}</span>
        </div>

        <div className="card-content">
          <div className="info-row">
            <span className="icon">📅</span>
            <span className="info-text">
              {startDate} - {endDate}
            </span>
          </div>

          {conference.location && (
            <div className="info-row">
              <span className="icon">📍</span>
              <span className="info-text">{conference.location}</span>
            </div>
          )}

          <p className="description">
            {conference.description?.substring(0, 120)}
            {conference.description?.length > 120 ? '...' : ''}
          </p>
        </div>

        <div className="card-footer">
          <Link href={`/c/${conference.slug}`} className="btn-view">
            View Details →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .conference-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .conference-card:hover {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
          border-color: #667eea;
        }

        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .card-title {
          margin: 0;
          font-size: 1.25rem;
          color: #111827;
          font-weight: 600;
          line-height: 1.4;
          flex: 1;
        }

        .status-badge {
          background: #dcfce7;
          color: #166534;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .card-content {
          padding: 1.5rem;
          flex: 1;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .icon {
          font-size: 1rem;
        }

        .info-text {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .description {
          color: #4b5563;
          line-height: 1.6;
          margin: 1rem 0 0;
          font-size: 0.95rem;
        }

        .card-footer {
          padding: 1.5rem;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .btn-view {
          display: inline-flex;
          align-items: center;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .btn-view:hover {
          color: #5568d3;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .card-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
}