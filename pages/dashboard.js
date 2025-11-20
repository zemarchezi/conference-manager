import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [conferences, setConferences] = useState([]);
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch current user
      const userResponse = await fetch('/api/v1/users');
      if (!userResponse.ok) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }
      const userData = await userResponse.json();
      setUser(userData);

      // Fetch user's conferences (if organizer)
      const conferencesResponse = await fetch('/api/v1/conferences');
      if (conferencesResponse.ok) {
        const conferencesData = await conferencesResponse.json();
        setConferences(conferencesData.slice(0, 5)); // Show first 5
      }

      // Fetch user's abstracts
      const abstractsResponse = await fetch('/api/v1/abstracts');
      if (abstractsResponse.ok) {
        const abstractsData = await abstractsResponse.json();
        setAbstracts(abstractsData.slice(0, 5)); // Show first 5
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/sessions', { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Dashboard - Conference Manager</title>
      </Head>

      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1>Conference Manager</h1>
            <nav>
              <Link href="/">Home</Link>
              <Link href="/conferences">Conferences</Link>
              <Link href={`/profile/${user.username}`}>Profile</Link>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </nav>
          </div>
        </header>

        {/* Welcome Section */}
        <section className="welcome">
          <h2>Welcome back, {user.username}! 👋</h2>
          <p>Here's what's happening with your conferences and submissions.</p>
        </section>

        {/* Stats Cards */}
        <section className="stats">
          <div className="stat-card">
            <h3>{conferences.length}</h3>
            <p>My Conferences</p>
          </div>
          <div className="stat-card">
            <h3>{abstracts.length}</h3>
            <p>My Abstracts</p>
          </div>
          <div className="stat-card">
            <h3>0</h3>
            <p>Reviews Pending</p>
          </div>
        </section>

        {/* Recent Conferences */}
        <section className="section">
          <div className="section-header">
            <h2>My Conferences</h2>
            <Link href="/conferences" className="btn-link">View All</Link>
          </div>
          {conferences.length > 0 ? (
            <div className="card-grid">
              {conferences.map((conference) => (
                <div key={conference.id} className="card">
                  <h3>{conference.title}</h3>
                  <p className="meta">
                    📍 {conference.location} • 📅 {new Date(conference.start_date).toLocaleDateString()}
                  </p>
                  <p className="description">{conference.description?.substring(0, 100)}...</p>
                  <Link href={`/conferences/${conference.slug}`} className="btn-primary">
                    View Conference
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't created any conferences yet.</p>
              <Link href="/conferences" className="btn-primary">Browse Conferences</Link>
            </div>
          )}
        </section>

        {/* Recent Abstracts */}
        <section className="section">
          <div className="section-header">
            <h2>My Abstract Submissions</h2>
            <Link href="/abstracts" className="btn-link">View All</Link>
          </div>
          {abstracts.length > 0 ? (
            <div className="card-grid">
              {abstracts.map((abstract) => (
                <div key={abstract.id} className="card">
                  <h3>{abstract.title}</h3>
                  <p className="meta">
                    Status: <span className={`status status-${abstract.status}`}>
                      {abstract.status}
                    </span>
                  </p>
                  <p className="description">{abstract.content?.substring(0, 100)}...</p>
                  <div className="keywords">
                    {abstract.keywords?.slice(0, 3).map((keyword, idx) => (
                      <span key={idx} className="keyword">{keyword}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't submitted any abstracts yet.</p>
              <Link href="/conferences" className="btn-primary">Find Conferences</Link>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .dashboard {
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

        .btn-logout {
          background: transparent;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .btn-logout:hover {
          background: #fee;
          border-color: #f87171;
          color: #dc2626;
        }

        .welcome {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 2rem;
        }

        .welcome h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .welcome p {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .stats {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-card h3 {
          font-size: 2.5rem;
          color: #667eea;
          margin: 0 0 0.5rem 0;
        }

        .stat-card p {
          color: #6b7280;
          margin: 0;
        }

        .section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          margin: 0;
        }

        .btn-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .btn-link:hover {
          text-decoration: underline;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .card h3 {
          margin: 0 0 0.75rem 0;
          color: #111827;
        }

        .meta {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }

        .description {
          color: #4b5563;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-accepted {
          background: #d1fae5;
          color: #065f46;
        }

        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .keywords {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.75rem;
        }

        .keyword {
          background: #e0e7ff;
          color: #4338ca;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .btn-primary {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          margin-top: 0.75rem;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .empty-state {
          background: white;
          padding: 3rem;
          border-radius: 8px;
          text-align: center;
        }

        .empty-state p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          nav {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
