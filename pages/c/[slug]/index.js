import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ConferenceHome() {
  const router = useRouter();
  const { slug } = router.query;
  const [conference, setConference] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchConferenceData();
    }
  }, [slug]);

  const fetchConferenceData = async () => {
    try {
      // Fetch conference by slug
      const conferenceResponse = await fetch(`/api/v1/conferences/by-slug/${slug}`);
      if (!conferenceResponse.ok) {
        throw new Error('Conference not found');
      }
      const conferenceData = await conferenceResponse.json();
      setConference(conferenceData);

      // Fetch conference settings
      const settingsResponse = await fetch(`/api/v1/conferences/${conferenceData.id}/settings`);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading conference...</div>;
  }

  if (error || !conference) {
    return (
      <div style={styles.error}>
        <h1>Conference Not Found</h1>
        <p>{error || 'The conference you are looking for does not exist.'}</p>
        <Link href="/">Return Home</Link>
      </div>
    );
  }

  const primaryColor = settings?.primary_color || '#3b82f6';
  const secondaryColor = settings?.secondary_color || '#1e40af';

  return (
    <>
      <Head>
        <title>{conference.title} - Conference</title>
        <meta name="description" content={conference.description} />
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <header style={{ ...styles.header, backgroundColor: primaryColor }}>
          <div style={styles.headerContent}>
            {settings?.logo_url && (
              <img src={settings.logo_url} alt="Logo" style={styles.logo} />
            )}
            <h1 style={styles.title}>{conference.title}</h1>
            <nav style={styles.nav}>
              <Link href={`/c/${slug}`} style={styles.navLink}>Home</Link>
              <Link href={`/c/${slug}/schedule`} style={styles.navLink}>Schedule</Link>
              <Link href={`/c/${slug}/abstracts`} style={styles.navLink}>Abstracts</Link>
              <Link href={`/c/${slug}/submit`} style={styles.navLink}>Submit</Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>{conference.title}</h2>
            <p style={styles.heroSubtitle}>{conference.description}</p>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <span style={styles.infoIcon}>📅</span>
                <div>
                  <div style={styles.infoLabel}>Date</div>
                  <div style={styles.infoValue}>
                    {new Date(conference.start_date).toLocaleDateString()} - {new Date(conference.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoIcon}>📍</span>
                <div>
                  <div style={styles.infoLabel}>Location</div>
                  <div style={styles.infoValue}>{conference.location || 'TBA'}</div>
                </div>
              </div>

              {conference.submission_deadline && (
                <div style={styles.infoCard}>
                  <span style={styles.infoIcon}>⏰</span>
                  <div>
                    <div style={styles.infoLabel}>Submission Deadline</div>
                    <div style={styles.infoValue}>
                      {new Date(conference.submission_deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.ctaButtons}>
              {settings?.enable_abstract_submission && (
                <Link href={`/c/${slug}/submit`} style={{ ...styles.ctaButton, backgroundColor: primaryColor }}>
                  Submit Abstract
                </Link>
              )}
              <Link href={`/c/${slug}/schedule`} style={{ ...styles.ctaButtonSecondary, borderColor: primaryColor, color: primaryColor }}>
                View Schedule
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section style={styles.section}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>About the Conference</h2>
            <p style={styles.sectionText}>{conference.description}</p>
          </div>
        </section>

        {/* Important Dates */}
        <section style={{ ...styles.section, backgroundColor: '#f9fafb' }}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>Important Dates</h2>
            <div style={styles.datesList}>
              {conference.submission_deadline && (
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>Abstract Submission Deadline:</span>
                  <span style={styles.dateValue}>{new Date(conference.submission_deadline).toLocaleDateString()}</span>
                </div>
              )}
              <div style={styles.dateItem}>
                <span style={styles.dateLabel}>Conference Start:</span>
                <span style={styles.dateValue}>{new Date(conference.start_date).toLocaleDateString()}</span>
              </div>
              <div style={styles.dateItem}>
                <span style={styles.dateLabel}>Conference End:</span>
                <span style={styles.dateValue}>{new Date(conference.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} {conference.title}. Powered by Conference Manager.</p>
        </footer>
      </div>

      <style jsx>{`
        a {
          text-decoration: none;
        }
      `}</style>
    </>
  );
}

// Styles
const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '20px',
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
  },
  header: {
    padding: '20px 0',
    color: 'white',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  logo: {
    height: '60px',
    objectFit: 'contain',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    gap: '30px',
  },
  navLink: {
    color: 'white',
    fontWeight: '500',
    transition: 'opacity 0.3s',
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '80px 20px',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  heroSubtitle: {
    fontSize: '20px',
    marginBottom: '40px',
    opacity: 0.95,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: '32px',
  },
  infoLabel: {
    fontSize: '14px',
    opacity: 0.9,
    marginBottom: '5px',
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: '600',
  },
  ctaButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaButton: {
    padding: '15px 40px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  ctaButtonSecondary: {
    padding: '15px 40px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    backgroundColor: 'transparent',
    border: '2px solid white',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  section: {
    padding: '60px 20px',
  },
  sectionContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1f2937',
  },
  sectionText: {
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#4b5563',
  },
  datesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  dateItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  dateLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  dateValue: {
    color: '#6b7280',
  },
  footer: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center',
  },
};