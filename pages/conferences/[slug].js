import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function ConferenceDetails() {
  const router = useRouter();
  const { slug } = router.query;
  const [conference, setConference] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchConferenceDetails();
    }
  }, [slug]);

  const fetchConferenceDetails = async () => {
    setLoading(true);
    try {
      // Fetch conference details
      const response = await fetch(`/api/v1/conferences/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setConference(data);

        // Fetch schedule if available
        if (data.id) {
          const scheduleResponse = await fetch(`/api/v1/schedules?conference_id=${data.id}`);
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            setSchedule(scheduleData);
          }
        }
      } else {
        setError('Conference not found');
      }
    } catch (err) {
      console.error('Error fetching conference:', err);
      setError('Failed to load conference details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading conference details...</p>
      </div>
    );
  }

  if (error || !conference) {
    return (
      <>
        <div className="error-container">
          <h1>Conference Not Found</h1>
          <p>{error || 'The conference you are looking for does not exist.'}</p>
          <Link href="/conferences" className="btn">← Back to Conferences</Link>
        </div>
        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
          }
          .btn {
            background: #667eea;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 1rem;
          }
        `}</style>
      </>
    );
  }

  const startDate = new Date(conference.start_date);
  const endDate = new Date(conference.end_date);
  const isUpcoming = startDate > new Date();
  const isPast = endDate < new Date();

  return (
    <>
      <Head>
        <title>{conference.title} - Conference Manager</title>
        <meta name="description" content={conference.description} />
      </Head>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1>Conference Manager</h1>
            <nav>
              <Link href="/">Home</Link>
              <Link href="/conferences">Conferences</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </div>
        </header>

        {/* Conference Hero */}
        <div className="hero">
          <div className="hero-content">
            <div className="breadcrumb">
              <Link href="/conferences">Conferences</Link> / {conference.title}
            </div>
            <h1>{conference.title}</h1>
            <div className="hero-meta">
              <span className="meta-item">
                📍 {conference.location}
              </span>
              <span className="meta-item">
                📅 {startDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
                {endDate.getTime() !== startDate.getTime() && 
                  ` - ${endDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}`
                }
              </span>
              <span className={`status ${isPast ? 'past' : isUpcoming ? 'upcoming' : 'ongoing'}`}>
                {isPast ? 'Past Event' : isUpcoming ? 'Upcoming' : 'Ongoing'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container">
          <div className="main-content">
            {/* About Section */}
            <section className="section">
              <h2>About This Conference</h2>
              <p className="description">{conference.description}</p>
            </section>

            {/* Important Dates */}
            <section className="section">
              <h2>Important Dates</h2>
              <div className="dates-grid">
                <div className="date-item">
                  <strong>Conference Start</strong>
                  <p>{startDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="date-item">
                  <strong>Conference End</strong>
                  <p>{endDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</p>
                </div>
                {conference.submission_deadline && (
                  <div className="date-item">
                    <strong>Submission Deadline</strong>
                    <p>{new Date(conference.submission_deadline).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Schedule */}
            {schedule.length > 0 && (
              <section className="section">
                <h2>Schedule</h2>
                <div className="schedule-list">
                  {schedule.map((item) => (
                    <div key={item.id} className="schedule-item">
                      <div className="schedule-time">
                        {new Date(item.start_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="schedule-details">
                        <h3>{item.title}</h3>
                        {item.speaker && <p className="speaker">👤 {item.speaker}</p>}
                        {item.location && <p className="venue">📍 {item.location}</p>}
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Abstract Submission */}
            {isUpcoming && (
              <section className="section action-section">
                <h2>Submit Your Abstract</h2>
                <p>Interested in presenting at this conference? Submit your abstract now!</p>
                <Link href={`/conferences/${slug}/abstracts`} className="btn btn-primary">
                  View Abstracts & Submit
                </Link>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <h3>Quick Actions</h3>
              <Link href={`/conferences/${slug}/abstracts`} className="sidebar-btn">
                📝 View Abstracts
              </Link>
              {isUpcoming && (
                <Link href={`/conferences/${slug}/submit`} className="sidebar-btn">
                  ➕ Submit Abstract
                </Link>
              )}
              <Link href="/conferences" className="sidebar-btn secondary">
                ← Back to Conferences
              </Link>
            </div>

            {conference.website && (
              <div className="sidebar-card">
                <h3>External Links</h3>
                <a href={conference.website} target="_blank" rel="noopener noreferrer" className="sidebar-btn">
                  🌐 Official Website ↗
                </a>
              </div>
            )}

            <div className="sidebar-card">
              <h3>Organizer</h3>
              <p>{conference.organizer || 'Conference Organizer'}</p>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .page {
          min-height: 100vh;
          background: #f9fafb;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h1 {
          font-size: 1.5rem;
          color: #667eea;
          margin: 0;
        }

        nav {
          display: flex;
          gap: 1.5rem;
        }

        nav :global(a) {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        nav :global(a):hover {
          color: #667eea;
        }

        .hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 0;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .breadcrumb {
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .breadcrumb :global(a) {
          color: white;
          text-decoration: none;
        }

        .breadcrumb :global(a):hover {
          text-decoration: underline;
        }

        .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .hero-meta {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .meta-item {
          opacity: 0.95;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status.upcoming {
          background: rgba(16, 185, 129, 0.2);
          color: #d1fae5;
        }

        .status.ongoing {
          background: rgba(251, 191, 36, 0.2);
          color: #fef3c7;
        }

        .status.past {
          background: rgba(107, 114, 128, 0.2);
          color: #e5e7eb;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 3rem;
        }

        .main-content {
          min-width: 0;
        }

        .section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section h2 {
          margin-top: 0;
          color: #111827;
          margin-bottom: 1.5rem;
        }

        .description {
          color: #4b5563;
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .dates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .date-item {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .date-item strong {
          display: block;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .date-item p {
          margin: 0;
          color: #374151;
        }

        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .schedule-item {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .schedule-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .schedule-time {
          color: #667eea;
          font-weight: 600;
        }

        .schedule-details h3 {
          margin: 0 0 0.5rem 0;
          color: #111827;
        }

        .schedule-details p {
          margin: 0.25rem 0;
          color: #6b7280;
        }

        .speaker, .venue {
          font-size: 0.9rem;
        }

        .action-section {
          background: linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%);
          border: 2px solid #667eea;
        }

        .btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }

        .sidebar {
          position: sticky;
          top: 2rem;
          align-self: start;
        }

        .sidebar-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        .sidebar-card h3 {
          margin: 0 0 1rem 0;
          color: #111827;
        }

        .sidebar-card p {
          margin: 0;
          color: #6b7280;
        }

        .sidebar-btn {
          display: block;
          padding: 0.75rem 1rem;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          font-weight: 600;
          text-align: center;
          transition: all 0.3s;
        }

        .sidebar-btn:hover {
          background: #5568d3;
        }

        .sidebar-btn.secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .sidebar-btn.secondary:hover {
          background: #e5e7eb;
        }

        .sidebar-btn:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 968px) {
          .container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
          }

          .hero h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
}
