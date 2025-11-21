import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedConferences();
  }, []);

  const fetchFeaturedConferences = async () => {
    try {
      const response = await fetch('/api/v1/conferences?limit=3&status=active');
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
        <title>Conference Manager - Manage Academic Conferences</title>
        <meta name="description" content="Platform for managing academic conferences, abstract submissions, and peer reviews" />
      </Head>

      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <h1>Conference Manager</h1>
          <p className="hero-subtitle">
            Streamline your academic conference organization, abstract submissions, and peer review process
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>📅 Conference Management</h3>
              <p>Create and manage conferences with ease. Set schedules, track submissions, and organize events.</p>
            </div>
            <div className="feature-card">
              <h3>📝 Abstract Submission</h3>
              <p>Streamlined abstract submission process with keyword tagging and status tracking.</p>
            </div>
            <div className="feature-card">
              <h3>⭐ Peer Review System</h3>
              <p>Comprehensive peer review workflow with scoring and recommendations.</p>
            </div>
            <div className="feature-card">
              <h3>👥 User Management</h3>
              <p>Role-based access control for organizers, reviewers, and authors.</p>
            </div>
          </div>
        </section>

        {/* Featured Conferences */}
        <section className="featured-conferences">
          <h2>Featured Conferences</h2>
          {loading ? (
            <p>Loading conferences...</p>
          ) : conferences.length > 0 ? (
            <div className="conference-grid">
              {conferences.map((conference) => (
                <div key={conference.id} className="conference-card">
                  <h3>{conference.title}</h3>
                  <p className="conference-date">
                    {new Date(conference.start_date).toLocaleDateString()} - {new Date(conference.end_date).toLocaleDateString()}
                  </p>
                  <p className="conference-location">📍 {conference.location}</p>
                  <Link href={`/c/${conference.slug}`} className="btn btn-small">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No conferences available at the moment.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/conferences" className="btn btn-secondary">
              View All Conferences
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>&copy; 2025 Conference Manager. All rights reserved.</p>
          <div className="footer-links">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .hero {
          text-align: center;
          padding: 4rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          margin-bottom: 3rem;
        }

        .hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          display: inline-block;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .btn-primary {
          background: white;
          color: #667eea;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: #667eea;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          background: #667eea;
          color: white;
        }

        .btn-small:hover {
          background: #5568d3;
        }

        .features {
          margin-bottom: 3rem;
        }

        .features h2 {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 2rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .feature-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .feature-card h3 {
          margin-bottom: 0.5rem;
          color: #667eea;
        }

        .featured-conferences {
          margin-bottom: 3rem;
        }

        .featured-conferences h2 {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 2rem;
        }

        .conference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .conference-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .conference-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .conference-card h3 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .conference-date {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .conference-location {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .footer {
          text-align: center;
          padding: 2rem 0;
          border-top: 1px solid #e0e0e0;
          margin-top: 3rem;
        }

        .footer-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .footer-links :global(a) {
          color: #667eea;
          text-decoration: none;
        }

        .footer-links :global(a):hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}