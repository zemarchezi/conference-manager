export default function ConferenceOverview({ conference }) {
  return (
    <div className="conference-overview">
      <section className="description-section">
        <h2>About This Conference</h2>
        <p>{conference.description || 'No description available.'}</p>
      </section>

      <section className="details-section">
        <h2>Conference Details</h2>
        <div className="details-grid">
          <div className="detail-item">
            <strong>Location:</strong>
            <span>{conference.location}</span>
          </div>
          <div className="detail-item">
            <strong>Start Date:</strong>
            <span>{new Date(conference.start_date).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <strong>End Date:</strong>
            <span>{new Date(conference.end_date).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <strong>Status:</strong>
            <span className="status-badge">{conference.status}</span>
          </div>
          {conference.submission_deadline && (
            <div className="detail-item">
              <strong>Submission Deadline:</strong>
              <span>{new Date(conference.submission_deadline). toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .conference-overview {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        section {
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 8px;
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .description-section p {
          line-height: 1.6;
          color: #555;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        . detail-item strong {
          color: #666;
          font-size: 0.9rem;
        }

        .detail-item span {
          color: #333;
          font-size: 1rem;
        }

        . status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e7f5e7;
          color: #2e7d32;
          border-radius: 12px;
          text-transform: capitalize;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}