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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchConferenceData();
      checkAuthentication();
    }
  }, [slug]);

  useEffect(() => {
    if (conference && isAuthenticated) {
      checkRegistrationStatus();
    }
  }, [conference, isAuthenticated]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/v1/users/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  const fetchConferenceData = async () => {
    try {
      const conferenceResponse = await fetch(`/api/v1/conferences/by-slug/${slug}`);
      if (! conferenceResponse.ok) {
        throw new Error('Conference not found');
      }
      const conferenceData = await conferenceResponse.json();
      setConference(conferenceData);

      const settingsResponse = await fetch(`/api/v1/conferences/${conferenceData.id}/settings`);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }
    } catch (err) {
      setError(err. message);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch(`/api/v1/conferences/${conference.id}/registrations/my-registration`);
      if (response. ok) {
        const registrationData = await response.json();
        setRegistration(registrationData);
      }
    } catch (err) {
      // User not registered - this is fine
      setRegistration(null);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/c/${slug}`);
      return;
    }

    setRegistrationLoading(true);
    try {
      const response = await fetch(`/api/v1/conferences/${conference.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_type: 'regular',
        }),
      });

      if (! response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      const newRegistration = await response.json();
      setRegistration(newRegistration);
      alert('✅ Registration successful! Check your email for confirmation.');
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (! confirm('Are you sure you want to cancel your registration?')) {
      return;
    }

    setRegistrationLoading(true);
    try {
      const response = await fetch(`/api/v1/conferences/${conference.id}/registrations/my-registration`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel registration');
      }

      setRegistration(null);
      alert('Registration cancelled successfully');
    } catch (err) {
      alert(`Failed to cancel: ${err.message}`);
    } finally {
      setRegistrationLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading conference...</div>;
  }

  if (error || !conference) {
    return (
      <div style={styles. error}>
        <h1>Conference Not Found</h1>
        <p>{error || 'The conference you are looking for does not exist.'}</p>
        <Link href="/">Return Home</Link>
      </div>
    );
  }

  const primaryColor = settings?.primary_color || '#3b82f6';
  const secondaryColor = settings?.secondary_color || '#1e40af';
  const isOrganizer = currentUser && conference.organizer_id === currentUser.id;

  return (
    <>
      <Head>
        <title>{conference.title} - Conference</title>
        <meta name="description" content={conference.description} />
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <header style={{ ... styles.header, backgroundColor: primaryColor }}>
          <div style={styles.headerContent}>
            {settings?. logo_url && (
              <img src={settings.logo_url} alt="Logo" style={styles.logo} />
            )}
            <h1 style={styles.title}>{conference.title}</h1>
            <nav style={styles.nav}>
              <Link href={`/c/${slug}`} style={styles.navLink}>Home</Link>
              <Link href={`/c/${slug}/schedule`} style={styles.navLink}>Schedule</Link>
              <Link href={`/c/${slug}/abstracts`} style={styles.navLink}>Abstracts</Link>
              <Link href={`/c/${slug}/submit`} style={styles.navLink}>Submit</Link>
              {isOrganizer && (
                <Link href={`/c/${slug}/manage`} style={styles.navLink}>Manage</Link>
              )}
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>{conference.title}</h2>
            <p style={styles. heroSubtitle}>{conference.description}</p>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <span style={styles.infoIcon}>📅</span>
                <div>
                  <div style={styles.infoLabel}>Date</div>
                  <div style={styles.infoValue}>
                    {new Date(conference.start_date).toLocaleDateString()} - {new Date(conference. end_date).toLocaleDateString()}
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
                    <div style={styles. infoValue}>
                      {new Date(conference.submission_deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Status & CTA */}
            <div style={styles.ctaButtons}>
              {registration ?  (
                <div style={styles.registrationBadge}>
                  <div style={styles.registeredInfo}>
                    <span style={styles.checkmark}>✓</span>
                    <div>
                      <div style={styles.registeredText}>You're registered!</div>
                      <div style={styles.confirmationCode}>
                        Confirmation: {registration.confirmation_code}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleCancelRegistration}
                    disabled={registrationLoading}
                    style={styles.cancelButton}
                  >
                    {registrationLoading ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registrationLoading}
                  style={{ ...styles.registerButton, backgroundColor: primaryColor }}
                >
                  {registrationLoading ? 'Registering...' : '🎟️ Register for Conference'}
                </button>
              )}

              {settings?.enable_abstract_submission && (
                <Link href={`/c/${slug}/submit`} style={{ ...styles.ctaButtonSecondary, borderColor: 'white' }}>
                  Submit Abstract
                </Link>
              )}
              
              <Link href={`/c/${slug}/schedule`} style={{ ...styles.ctaButtonSecondary, borderColor: 'white' }}>
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
                  <span style={styles.dateValue}>{new Date(conference.submission_deadline). toLocaleDateString()}</span>
                </div>
              )}
              <div style={styles.dateItem}>
                <span style={styles. dateLabel}>Conference Start:</span>
                <span style={styles.dateValue}>{new Date(conference.start_date). toLocaleDateString()}</span>
              </div>
              <div style={styles.dateItem}>
                <span style={styles. dateLabel}>Conference End:</span>
                <span style={styles. dateValue}>{new Date(conference.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles. footer}>
          <p>© {new Date().getFullYear()} {conference.title}.  Powered by Conference Manager.</p>
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

// Styles (keeping existing + adding new ones)
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
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    alignItems: 'center',
  },
  registerButton: {
    padding: '15px 40px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '18px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  registrationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '20px 30px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  registeredInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: '32px',
    color: '#10b981',
  },
  registeredText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#10b981',
  },
  confirmationCode: {
    fontSize: '14px',
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  cancelButton: {
    padding: '8px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  ctaButtonSecondary: {
    padding: '15px 40px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    backgroundColor: 'transparent',
    border: '2px solid white',
    color: 'white',
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