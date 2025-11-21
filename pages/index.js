import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import ConferenceCard from '../components/common/ConferenceCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';

export default function Home() {
  const [conferences, setConferences] = useState([]);
  const [filteredConferences, setFilteredConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeaturedConferences();
  }, []);

  const fetchFeaturedConferences = async () => {
    try {
      const response = await fetch('/api/v1/conferences?limit=6&status=active');
      if (response.ok) {
        const data = await response.json();
        setConferences(data);
        setFilteredConferences(data);
      }
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredConferences(conferences);
      return;
    }

    const filtered = conferences.filter((conf) =>
      conf.title.toLowerCase().includes(term.toLowerCase()) ||
      conf.description?.toLowerCase().includes(term.toLowerCase()) ||
      conf.location?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredConferences(filtered);
  };

  return (
    <Layout
      title="Conference Manager - Manage Academic Conferences"
      description="Streamline your academic conference organization, abstract submissions, and peer review process"
    >
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Streamline Your <span className="highlight">Academic Conferences</span>
          </h1>
          <p className="hero-subtitle">
            A comprehensive platform for organizing conferences, managing abstract submissions,
            and conducting peer reviews with ease.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-hero-primary">
              <span>Get Started Free</span>
              <span className="arrow">→</span>
            </Link>
            <Link href="/conferences" className="btn btn-hero-secondary">
              Explore Conferences
            </Link>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Conferences</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Abstracts</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Researchers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">
              Powerful features to manage every aspect of your academic conference
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">Conference Management</h3>
              <p className="feature-description">
                Create and manage multiple conferences with customizable settings,
                deadlines, and scheduling tools.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Abstract Submission</h3>
              <p className="feature-description">
                Streamlined submission process with keyword tagging, status tracking,
                and automated notifications.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3 className="feature-title">Peer Review System</h3>
              <p className="feature-description">
                Comprehensive peer review workflow with scoring, recommendations,
                and reviewer assignments.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">User Management</h3>
              <p className="feature-description">
                Role-based access control for organizers, reviewers, authors,
                and attendees.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Analytics & Reports</h3>
              <p className="feature-description">
                Track submissions, reviews, and conference metrics with detailed
                analytics and reports.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3 className="feature-title">Notifications</h3>
              <p className="feature-description">
                Automated email notifications for submissions, reviews, and
                important conference updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Conferences Section */}
      <section className="conferences-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Conferences</h2>
            <p className="section-subtitle">
              Discover upcoming academic conferences and submit your research
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-wrapper">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search conferences by title, location, or description..."
            />
          </div>

          {loading ? (
            <LoadingSpinner size="large" text="Loading conferences..." />
          ) : filteredConferences.length > 0 ? (
            <>
              <div className="conferences-grid">
                {filteredConferences.map((conference) => (
                  <ConferenceCard key={conference.id} conference={conference} />
                ))}
              </div>

              <div className="view-all-wrapper">
                <Link href="/conferences" className="btn btn-secondary btn-large">
                  View All Conferences
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No conferences found</h3>
              <p>
                {searchTerm
                  ? `No conferences match "${searchTerm}". Try different keywords.`
                  : 'No conferences available at the moment. Check back soon!'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Get started in three simple steps
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Create Your Account</h3>
              <p className="step-description">
                Sign up for free and set up your profile in minutes
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Browse Conferences</h3>
              <p className="step-description">
                Explore conferences or create your own event
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Submit & Review</h3>
              <p className="step-description">
                Submit abstracts and participate in peer review
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Join thousands of researchers and organizers using Conference Manager
            </p>
            <div className="cta-actions">
              <Link href="/register" className="btn btn-cta-primary">
                Create Free Account
              </Link>
              <Link href="/contact" className="btn btn-cta-secondary">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Hero Section */
        .hero {
          position: relative;
          min-height: 600px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 4rem 2rem;
          text-align: center;
          color: white;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          color: white;
        }

        .highlight {
          color: #fbbf24;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          opacity: 0.95;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .btn-hero-primary {
          background: white;
          color: #667eea;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }

        .btn-hero-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        }

        .arrow {
          transition: transform 0.3s;
        }

        .btn-hero-primary:hover .arrow {
          transform: translateX(4px);
        }

        .btn-hero-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s;
        }

        .btn-hero-secondary:hover {
          background: white;
          color: #667eea;
        }

        .stats {
          display: flex;
          justify-content: center;
          gap: 4rem;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #fbbf24;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 1rem;
          opacity: 0.9;
        }

        /* Features Section */
        .features-section {
          padding: 5rem 0;
          background: #f9fafb;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #111827;
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #111827;
        }

        .feature-description {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* Conferences Section */
        .conferences-section {
          padding: 5rem 0;
          background: white;
        }

        .search-wrapper {
          max-width: 600px;
          margin: 0 auto 3rem;
        }

        .conferences-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .view-all-wrapper {
          text-align: center;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #f9fafb;
          border-radius: 16px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
        }

        /* How It Works Section */
        .how-it-works-section {
          padding: 5rem 0;
          background: #f9fafb;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .step-card {
          text-align: center;
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 auto 1.5rem;
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #111827;
        }

        .step-description {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* CTA Section */
        .cta-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
        }

        .cta-description {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.95;
        }

        .cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-cta-primary {
          background: white;
          color: #667eea;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .btn-cta-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        }

        .btn-cta-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .btn-cta-secondary:hover {
          background: white;
          color: #667eea;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .conferences-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 500px;
          }

          .hero-content {
            padding: 3rem 1.5rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .stats {
            gap: 2rem;
          }

          .stat-number {
            font-size: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .features-grid,
          .conferences-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .steps-grid {
            gap: 2rem;
          }

          .cta-title {
            font-size: 2rem;
          }

          .cta-description {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
          }

          .btn-hero-primary,
          .btn-hero-secondary {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}