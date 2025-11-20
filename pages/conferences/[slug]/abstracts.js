import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function ConferenceAbstracts() {
  const router = useRouter();
  const { slug } = router.query;
  const [conference, setConference] = useState(null);
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, accepted, pending, rejected

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch conference
      const confResponse = await fetch(`/api/v1/conferences/${slug}`);
      if (confResponse.ok) {
        const confData = await confResponse.json();
        setConference(confData);

        // Fetch abstracts for this conference
        let url = `/api/v1/abstracts?conference_id=${confData.id}`;
        if (filter !== 'all') {
          url += `&status=${filter}`;
        }

        const absResponse = await fetch(url);
        if (absResponse.ok) {
          const absData = await absResponse.json();
          setAbstracts(absData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !conference) {
    return (
      <div className="loading-container">
        <p>Loading abstracts...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Abstracts - {conference.title}</title>
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

        {/* Page Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <Link href="/conferences">Conferences</Link> / 
            <Link href={`/conferences/${slug}`}> {conference.title}</Link> / 
            Abstracts
          </div>
          <h1>Conference Abstracts</h1>
          <p>{conference.title}</p>
        </div>

        {/* Filters */}
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Abstracts
          </button>
          <button 
            className={filter === 'accepted' ? 'active' : ''} 
            onClick={() => setFilter('accepted')}
          >
            Accepted
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending Review
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''} 
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>

        {/* Abstracts List */}
        <div className="container">
          {abstracts.length > 0 ? (
            <div className="abstracts-list">
              {abstracts.map((abstract) => (
                <div key={abstract.id} className="abstract-card">
                  <div className="abstract-header">
                    <h2>{abstract.title}</h2>
                    <span className={`status status-${abstract.status}`}>
                      {abstract.status}
                    </span>
                  </div>
                  
                  <div className="abstract-meta">
                    <span>👤 {abstract.author_name || 'Anonymous'}</span>
                    <span>📅 {new Date(abstract.created_at).toLocaleDateString()}</span>
                  </div>

                  <p className="abstract-content">
                    {abstract.content?.substring(0, 300)}
                    {abstract.content?.length > 300 ? '...' : ''}
                  </p>

                  {abstract.keywords && abstract.keywords.length > 0 && (
                    <div className="keywords">
                      {abstract.keywords.map((keyword, idx) => (
                        <span key={idx} className="keyword">{keyword}</span>
                      ))}
                    </div>
                  )}

                  <div className="abstract-footer">
                    <button className="btn-view">View Full Abstract</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>No abstracts found</h3>
              <p>
                {filter === 'all' 
                  ? 'No abstracts have been submitted for this conference yet.'
                  : `No ${filter} abstracts found.`}
              </p>
              <Link href={`/conferences/${slug}`} className="btn">
                ← Back to Conference
              </Link>
            </div>
          )}
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

        .page-header {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 2rem 1rem;
        }

        .breadcrumb {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .breadcrumb :global(a) {
          color: #667eea;
          text-decoration: none;
        }

        .breadcrumb :global(a):hover {
          text-decoration: underline;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #6b7280;
        }

        .filters {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem 2rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filters button {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .filters button:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filters button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 4rem;
        }

        .abstracts-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .abstract-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .abstract-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .abstract-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .abstract-header h2 {
          margin: 0;
          color: #111827;
          font-size: 1.5rem;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
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

        .abstract-meta {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .abstract-content {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .keywords {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .keyword {
          background: #e0e7ff;
          color: #4338ca;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .abstract-footer {
          display: flex;
          justify-content: flex-end;
        }

        .btn-view {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-view:hover {
          background: #5568d3;
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

        .btn {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }

        .btn:hover {
          background: #5568d3;
        }

        @media (max-width: 768px) {
          .abstract-header {
            flex-direction: column;
          }

          .filters {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
