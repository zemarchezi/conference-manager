import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Conferences() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchConferences();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/users/me');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchConferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/conferences?status=active');
      if (response.ok) {
        const data = await response.json();
        setConferences(data);
      }
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Conferences - Conference Manager</title>
      </Head>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1>Conference Manager</h1>
            <nav>
              <Link href="/">Home</Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/conferences/create" className="btn-create">Create Conference</Link>
                </>
              ) : (
                <Link href="/login">Login</Link>
              )}
            </nav>
          </div>
        </header>

        {/* Page Header */}
        <div className="page-header">
          <h1>Conferences</h1>
          <p>Discover and participate in academic conferences</p>
        </div>

        {/* Conferences Grid */}
        <div className="container">
          {loading ? (
            <div className="loading">Loading conferences...</div>
          ) : conferences.length > 0 ? (
            <div className="grid">
              {conferences.map((conference) => (
                <div key={conference.id} className="card">
                  <div className="card-header">
                    <h2>{conference.title}</h2>
                    <span className="date">
                      {new Date(conference.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="location">📍 {conference.location}</p>
                  <p className="description">
                    {conference.description?.substring(0, 150)}
                    {conference.description?.length > 150 ? '...' : ''}
                  </p>
                  <div className="card-footer">
                    <Link href={`/c/${conference.slug}`} className="btn">
                      View Conference →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>No conferences found</h3>
              <p>Check back later for upcoming conferences.</p>
              {isAuthenticated && (
                <Link href="/conferences/create" className="btn-primary">
                  Create Your Conference
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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
          align-items: center;
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

        nav :global(.btn-create) {
          background: #667eea;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }

        nav :global(.btn-create):hover {
          background: #5568d3;
        }

        .page-header {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 2rem;
          text-align: center;
        }

        .page-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 4rem;
        }

        .loading {
          text-align: center;
          padding: 4rem;
          color: #6b7280;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .card:hover {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
        }

        .card-header {
          margin-bottom: 1rem;
        }

        .card h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          color: #111827;
        }

        .date {
          color: #667eea;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .location {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .description {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .card-footer {
          display: flex;
          justify-content: flex-end;
        }

        .btn {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn:hover {
          background: #5568d3;
          transform: translateX(4px);
        }

        .btn-primary {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 1rem;
        }

        .empty {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
        }

        .empty h3 {
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .empty p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}