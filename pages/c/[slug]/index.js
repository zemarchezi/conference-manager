import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ConferenceHome() {
  const router = useRouter();
  const { slug } = router.query;
  const [conference, setConference] = useState(null);
  const [settings, setSettings] = useState(null);
  const [speakers, setSpeakers] = useState([]);
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
      if (!conferenceResponse.ok) {
        throw new Error('Conference not found');
      }
      const conferenceData = await conferenceResponse.json();
      setConference(conferenceData);

      // Fetch settings
      const settingsResponse = await fetch(`/api/v1/conferences/${conferenceData.id}/settings`);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }

      // Fetch speakers
      const speakersResponse = await fetch(`/api/v1/conferences/${conferenceData.id}/speakers`);
      if (speakersResponse.ok) {
        const speakersData = await speakersResponse.json();
        setSpeakers(speakersData);
      }
    } catch (err) {
      setError(err.message);
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
    return <div style={styles.loading}>Loading conference... </div>;
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

  const keynoteSpeakers = speakers.filter(s => s.is_keynote);
  const regularSpeakers = speakers.filter(s => !s.is_keynote);

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
              <a href="#home" style={styles.navLink}>Home</a>
              <a href="#about" style={styles.navLink}>About</a>
              {speakers.length > 0 && <a href="#speakers" style={styles.navLink}>Speakers</a>}
              <Link href={`/c/${slug}/schedule`} style={styles.navLink}>Schedule</Link>
              <Link href={`/c/${slug}/abstracts`} style={styles.navLink}>Abstracts</Link>
              {settings?.venue_name && <a href="#venue" style={styles.navLink}>Venue</a>}
              <a href="#contact" style={styles.navLink}>Contact</a>
              {isOrganizer && (
                <Link href={`/c/${slug}/manage`} style={styles.navLink}>Manage</Link>
              )}
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" style={styles.hero}>
          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>{conference.title}</h2>
            <p style={styles. heroSubtitle}>{conference.description}</p>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <span style={styles.infoIcon}>📅</span>
                <div>
                  <div style={styles.infoLabel}>Date</div>
                  <div style={styles.infoValue}>
                    {new Date(conference.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(conference.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                      {new Date(conference.submission_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
        <section id="about" style={styles.section}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>About the Conference</h2>
            <p style={styles.sectionText}>{conference.description}</p>
          </div>
        </section>

        {/* Keynote Speakers Section */}
        {keynoteSpeakers.length > 0 && (
          <section id="keynote-speakers" style={{ ...styles.section, backgroundColor: '#f9fafb' }}>
            <div style={styles.sectionContent}>
              <h2 style={styles.sectionTitle}>Keynote Speakers</h2>
              <div style={styles.speakersGrid}>
                {keynoteSpeakers.map(speaker => (
                  <SpeakerCard key={speaker. id} speaker={speaker} isKeynote={true} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Regular Speakers Section */}
        {regularSpeakers.length > 0 && (
          <section id="speakers" style={styles.section}>
            <div style={styles.sectionContent}>
              <h2 style={styles.sectionTitle}>Speakers</h2>
              <div style={styles.speakersGrid}>
                {regularSpeakers.map(speaker => (
                  <SpeakerCard key={speaker.id} speaker={speaker} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Venue Section */}
        {settings?.venue_name && (
          <section id="venue" style={{ ...styles.section, backgroundColor: '#f9fafb' }}>
            <div style={styles. sectionContent}>
              <h2 style={styles.sectionTitle}>Venue</h2>
              <div style={styles.venueContainer}>
                <div style={styles.venueInfo}>
                  <h3 style={styles.venueName}>{settings.venue_name}</h3>
                  {settings.venue_address && (
                    <p style={styles.venueAddress}>
                      <span style={styles.venueIcon}>📍</span>
                      {settings.venue_address}
                      {settings.venue_city && `, ${settings.venue_city}`}
                      {settings.venue_country && `, ${settings.venue_country}`}
                    </p>
                  )}
                  {settings.venue_directions && (
                    <div style={styles.venueDirections}>
                      <h4>Getting There</h4>
                      <p>{settings.venue_directions}</p>
                    </div>
                  )}
                </div>
                {settings.venue_map_url && (
                  <div style={styles.venueMap}>
                    <iframe
                      src={settings.venue_map_url}
                      width="100%"
                      height="400"
                      style={{ border: 0, borderRadius: '12px' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Important Dates */}
        <section style={styles.section}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle}>Important Dates</h2>
            <div style={styles.datesList}>
              {conference.submission_deadline && (
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>Abstract Submission Deadline:</span>
                  <span style={styles.dateValue}>{new Date(conference.submission_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              <div style={styles.dateItem}>
                <span style={styles. dateLabel}>Conference Start:</span>
                <span style={styles.dateValue}>{new Date(conference.start_date). toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div style={styles.dateItem}>
                <span style={styles. dateLabel}>Conference End:</span>
                <span style={styles. dateValue}>{new Date(conference.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" style={{ ...styles.section, backgroundColor: '#f9fafb' }}>
          <div style={styles. sectionContent}>
            <h2 style={styles.sectionTitle}>Contact</h2>
            <div style={styles.contactGrid}>
              {settings?.contact_email && (
                <div style={styles.contactItem}>
                  <span style={styles.contactIcon}>📧</span>
                  <div>
                    <div style={styles.contactLabel}>Email</div>
                    <a href={`mailto:${settings. contact_email}`} style={styles.contactValue}>
                      {settings.contact_email}
                    </a>
                  </div>
                </div>
              )}
              {settings?.contact_phone && (
                <div style={styles.contactItem}>
                  <span style={styles. contactIcon}>📞</span>
                  <div>
                    <div style={styles.contactLabel}>Phone</div>
                    <div style={styles.contactValue}>{settings.contact_phone}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Social Media Links */}
            {(settings?.social_twitter || settings?.social_linkedin || settings?.social_facebook) && (
              <div style={styles.socialLinks}>
                {settings?.social_twitter && (
                  <a href={`https://twitter.com/${settings.social_twitter}`} target="_blank" rel="noopener noreferrer" style={styles. socialLink}>
                    🐦 Twitter
                  </a>
                )}
                {settings?.social_linkedin && (
                  <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                    💼 LinkedIn
                  </a>
                )}
                {settings?.social_facebook && (
                  <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                    📘 Facebook
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
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

// Speaker Card Component
function SpeakerCard({ speaker, isKeynote = false }) {
  return (
    <div style={isKeynote ? styles.keynoteSpeakerCard : styles.speakerCard}>
      {speaker.photo_url && (
        <img src={speaker.photo_url} alt={speaker.name} style={styles.speakerPhoto} />
      )}
      <div style={styles.speakerInfo}>
        <h3 style={styles.speakerName}>{speaker.name}</h3>
        {speaker.title && <p style={styles.speakerTitle}>{speaker.title}</p>}
        {speaker.organization && <p style={styles.speakerOrg}>{speaker. organization}</p>}
        {speaker.bio && <p style={styles.speakerBio}>{speaker.bio}</p>}
        
        <div style={styles.speakerSocial}>
          {speaker. website && (
            <a href={speaker.website} target="_blank" rel="noopener noreferrer" style={styles.speakerLink}>
              🌐 Website
            </a>
          )}
          {speaker.twitter && (
            <a href={`https://twitter.com/${speaker. twitter}`} target="_blank" rel="noopener noreferrer" style={styles.speakerLink}>
              🐦 Twitter
            </a>
          )}
          {speaker.linkedin && (
            <a href={speaker. linkedin} target="_blank" rel="noopener noreferrer" style={styles.speakerLink}>
              💼 LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
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
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
    cursor: 'pointer',
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
    marginBottom: '30px',
    color: '#1f2937',
    textAlign: 'center',
  },
  sectionText: {
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#4b5563',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto',
  },
  speakersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    marginTop: '30px',
  },
  speakerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  keynoteSpeakerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    border: '2px solid #667eea',
    transition: 'transform 0. 3s, box-shadow 0.3s',
  },
  speakerPhoto: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  speakerInfo: {
    textAlign: 'center',
  },
  speakerName: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#1f2937',
  },
  speakerTitle: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    marginBottom: '3px',
  },
  speakerOrg: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '10px',
  },
  speakerBio: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginTop: '10px',
  },
  speakerSocial: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '15px',
    flexWrap: 'wrap',
  },
  speakerLink: {
    fontSize: '12px',
    color: '#667eea',
    textDecoration: 'none',
    padding: '5px 10px',
    border: '1px solid #667eea',
    borderRadius: '4px',
    transition: 'background 0.3s',
  },
  venueContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
    marginTop: '30px',
  },
  venueInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  venueName: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '10px',
  },
  venueAddress: {
    fontSize: '16px',
    color: '#4b5563',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  venueIcon: {
    fontSize: '20px',
  },
  venueDirections: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  venueMap: {
    borderRadius: '12px',
    overflow: 'hidden',
  },
  datesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxWidth: '800px',
    margin: '0 auto',
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
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  contactItem: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: '32px',
  },
  contactLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '5px',
  },
  contactValue: {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500',
  },
  socialLinks: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  socialLink: {
    padding: '10px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#667eea',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
  },
  footer: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center',
  },
};