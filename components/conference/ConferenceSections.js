import { useState } from 'react';
import Link from 'next/link';

export default function ConferenceSections({ conference, settings }) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div style={styles.container}>
            {/* Hero Banner */}
            <section style={styles.hero}>
                {settings?.banner_url && (
                    <div
                        style={{
                            ...styles.heroBanner,
                            backgroundImage: `url(${settings.banner_url})`,
                        }}
                    >
                        <div style={styles.heroOverlay}></div>
                    </div>
                )}
                <div style={styles.heroContent}>
                    {settings?.logo_url && (
                        <img
                            src={settings.logo_url}
                            alt="Logo"
                            style={styles.heroLogo}
                        />
                    )}
                    <h1 style={styles.heroTitle}>{conference.title}</h1>
                    <p style={styles.heroSubtitle}>{conference.description}</p>

                    {/* Key Info Cards */}
                    <div style={styles.infoCards}>
                        <div style={styles.infoCard}>
                            <span style={styles.infoIcon}>📅</span>
                            <div>
                                <div style={styles.infoLabel}>Date</div>
                                <div style={styles.infoValue}>
                                    {new Date(
                                        conference.start_date,
                                    ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                    {' - '}
                                    {new Date(
                                        conference.end_date,
                                    ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <span style={styles.infoIcon}>📍</span>
                            <div>
                                <div style={styles.infoLabel}>Location</div>
                                <div style={styles.infoValue}>
                                    {conference.location || 'TBA'}
                                </div>
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <span style={styles.infoIcon}>👥</span>
                            <div>
                                <div style={styles.infoLabel}>Format</div>
                                <div style={styles.infoValue}>
                                    {settings?.conference_format || 'In-Person'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div style={styles.ctaButtons}>
                        <Link
                            href={`/c/${conference.slug}/register`}
                            style={styles.btnPrimary}
                        >
                            Register Now
                        </Link>
                        <Link
                            href={`/c/${conference.slug}/submit`}
                            style={styles.btnSecondary}
                        >
                            Submit Abstract
                        </Link>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            <nav style={styles.tabs}>
                <button
                    style={
                        activeTab === 'overview' ? styles.tabActive : styles.tab
                    }
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    style={
                        activeTab === 'schedule' ? styles.tabActive : styles.tab
                    }
                    onClick={() => setActiveTab('schedule')}
                >
                    Schedule
                </button>
                <button
                    style={
                        activeTab === 'speakers' ? styles.tabActive : styles.tab
                    }
                    onClick={() => setActiveTab('speakers')}
                >
                    Speakers
                </button>
                <button
                    style={
                        activeTab === 'venue' ? styles.tabActive : styles.tab
                    }
                    onClick={() => setActiveTab('venue')}
                >
                    Venue
                </button>
                <button
                    style={
                        activeTab === 'submissions'
                            ? styles.tabActive
                            : styles.tab
                    }
                    onClick={() => setActiveTab('submissions')}
                >
                    Submissions
                </button>
            </nav>

            {/* Tab Content */}
            <div style={styles.content}>
                {activeTab === 'overview' && (
                    <OverviewSection
                        conference={conference}
                        settings={settings}
                    />
                )}
                {activeTab === 'schedule' && (
                    <ScheduleSection conference={conference} />
                )}
                {activeTab === 'speakers' && (
                    <SpeakersSection conference={conference} />
                )}
                {activeTab === 'venue' && (
                    <VenueSection conference={conference} settings={settings} />
                )}
                {activeTab === 'submissions' && (
                    <SubmissionsSection
                        conference={conference}
                        settings={settings}
                    />
                )}
            </div>
        </div>
    );
}

// Overview Section Component
function OverviewSection({ conference, settings }) {
    return (
        <div style={styles.section}>
            <h2 style={styles.sectionTitle}>About the Conference</h2>
            <div style={styles.sectionContent}>
                <p style={styles.description}>{conference.description}</p>

                {settings?.about_text && (
                    <div style={styles.aboutText}>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: settings.about_text,
                            }}
                        />
                    </div>
                )}

                {/* Important Dates */}
                <div style={styles.subsection}>
                    <h3 style={styles.subsectionTitle}>Important Dates</h3>
                    <div style={styles.datesList}>
                        {settings?.important_dates ? (
                            JSON.parse(settings.important_dates).map(
                                (date, idx) => (
                                    <div key={idx} style={styles.dateItem}>
                                        <span style={styles.dateLabel}>
                                            {date.label}:
                                        </span>
                                        <span style={styles.dateValue}>
                                            {new Date(
                                                date.date,
                                            ).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                ),
                            )
                        ) : (
                            <div style={styles.dateItem}>
                                <span style={styles.dateLabel}>
                                    Conference Start:
                                </span>
                                <span style={styles.dateValue}>
                                    {new Date(
                                        conference.start_date,
                                    ).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Topics */}
                {settings?.topics && (
                    <div style={styles.subsection}>
                        <h3 style={styles.subsectionTitle}>
                            Conference Topics
                        </h3>
                        <div style={styles.topicsList}>
                            {JSON.parse(settings.topics).map((topic, idx) => (
                                <div key={idx} style={styles.topicItem}>
                                    <span style={styles.topicIcon}>•</span>
                                    {topic}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sponsors */}
                {settings?.sponsors && (
                    <div style={styles.subsection}>
                        <h3 style={styles.subsectionTitle}>Our Sponsors</h3>
                        <div style={styles.sponsorsGrid}>
                            {JSON.parse(settings.sponsors).map(
                                (sponsor, idx) => (
                                    <div key={idx} style={styles.sponsorCard}>
                                        {sponsor.logo && (
                                            <img
                                                src={sponsor.logo}
                                                alt={sponsor.name}
                                                style={styles.sponsorLogo}
                                            />
                                        )}
                                        <div style={styles.sponsorName}>
                                            {sponsor.name}
                                        </div>
                                        <div style={styles.sponsorTier}>
                                            {sponsor.tier}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Schedule Section Component
function ScheduleSection({ conference }) {
    return (
        <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Conference Schedule</h2>
            <div style={styles.sectionContent}>
                <p>
                    View the full conference schedule with sessions, workshops,
                    and keynotes.{' '}
                </p>
                <Link
                    href={`/c/${conference.slug}/schedule`}
                    style={styles.linkButton}
                >
                    View Full Schedule →
                </Link>
            </div>
        </div>
    );
}

// Speakers Section Component
function SpeakersSection({ conference }) {
    const [speakers, setSpeakers] = useState([]);

    // In a real implementation, fetch speakers from API
    // useEffect(() => { fetchSpeakers(); }, []);

    return (
        <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Keynote Speakers</h2>
            <div style={styles.sectionContent}>
                {speakers.length === 0 ? (
                    <p style={styles.emptyState}>
                        Speakers will be announced soon.
                    </p>
                ) : (
                    <div style={styles.speakersGrid}>
                        {speakers.map((speaker) => (
                            <div key={speaker.id} style={styles.speakerCard}>
                                {speaker.photo && (
                                    <img
                                        src={speaker.photo}
                                        alt={speaker.name}
                                        style={styles.speakerPhoto}
                                    />
                                )}
                                <h3 style={styles.speakerName}>
                                    {speaker.name}
                                </h3>
                                <p style={styles.speakerTitle}>
                                    {speaker.title}
                                </p>
                                <p style={styles.speakerAffiliation}>
                                    {speaker.affiliation}
                                </p>
                                {speaker.bio && (
                                    <p style={styles.speakerBio}>
                                        {speaker.bio}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Venue Section Component
function VenueSection({ conference, settings }) {
    return (
        <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Venue & Location</h2>
            <div style={styles.sectionContent}>
                <div style={styles.venueInfo}>
                    <h3>{settings?.venue_name || conference.location}</h3>
                    {settings?.venue_address && (
                        <p style={styles.address}>{settings.venue_address}</p>
                    )}

                    {settings?.venue_description && (
                        <p style={styles.venueDescription}>
                            {settings.venue_description}
                        </p>
                    )}

                    {/* Map */}
                    {settings?.venue_coordinates && (
                        <div style={styles.mapContainer}>
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place? key=YOUR_API_KEY&q=${settings.venue_coordinates}`}
                                style={styles.map}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                    )}

                    {/* Accommodation */}
                    {settings?.accommodation_info && (
                        <div style={styles.subsection}>
                            <h3 style={styles.subsectionTitle}>
                                Accommodation
                            </h3>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: settings.accommodation_info,
                                }}
                            />
                        </div>
                    )}

                    {/* Travel Info */}
                    {settings?.travel_info && (
                        <div style={styles.subsection}>
                            <h3 style={styles.subsectionTitle}>
                                Getting There
                            </h3>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: settings.travel_info,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Submissions Section Component
function SubmissionsSection({ conference, settings }) {
    return (
        <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Call for Abstracts</h2>
            <div style={styles.sectionContent}>
                {settings?.submission_guidelines && (
                    <div style={styles.guidelines}>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: settings.submission_guidelines,
                            }}
                        />
                    </div>
                )}

                <div style={styles.submissionInfo}>
                    <div style={styles.infoBox}>
                        <h4>Submission Deadline</h4>
                        <p style={styles.deadline}>
                            {settings?.submission_deadline
                                ? new Date(
                                      settings.submission_deadline,
                                  ).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                  })
                                : 'TBA'}
                        </p>
                    </div>

                    <div style={styles.infoBox}>
                        <h4>Notification Date</h4>
                        <p style={styles.deadline}>
                            {settings?.notification_date
                                ? new Date(
                                      settings.notification_date,
                                  ).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                  })
                                : 'TBA'}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/c/${conference.slug}/submit`}
                    style={styles.btnPrimary}
                >
                    Submit Your Abstract
                </Link>

                <div style={styles.subsection}>
                    <h3 style={styles.subsectionTitle}>Accepted Abstracts</h3>
                    <Link
                        href={`/c/${conference.slug}/abstracts`}
                        style={styles.linkButton}
                    >
                        View Accepted Abstracts →
                    </Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
    },
    hero: {
        position: 'relative',
        backgroundColor: '#667eea',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
    },
    heroBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(102, 126, 234, 0.85)',
    },
    heroContent: {
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
    },
    heroLogo: {
        height: '80px',
        marginBottom: '1rem',
    },
    heroTitle: {
        fontSize: '3rem',
        fontWeight: '700',
        marginBottom: '1rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    heroSubtitle: {
        fontSize: '1.25rem',
        marginBottom: '2rem',
        opacity: 0.95,
        maxWidth: '800px',
        margin: '0 auto 2rem',
    },
    infoCards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        maxWidth: '900px',
        margin: '2rem auto',
    },
    infoCard: {
        backgroundColor: 'white',
        color: '#111827',
        padding: '1.5rem',
        borderRadius: '12px',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    infoIcon: {
        fontSize: '2rem',
    },
    infoLabel: {
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '0.25rem',
    },
    infoValue: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#111827',
    },
    ctaButtons: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginTop: '2rem',
        flexWrap: 'wrap',
    },
    btnPrimary: {
        padding: '1rem 2.5rem',
        backgroundColor: 'white',
        color: '#667eea',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '1.125rem',
        transition: 'transform 0.2s',
        display: 'inline-block',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    btnSecondary: {
        padding: '1rem 2.5rem',
        backgroundColor: 'transparent',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '1.125rem',
        border: '2px solid white',
        transition: 'all 0.2s',
        display: 'inline-block',
    },
    tabs: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0 2rem',
        flexWrap: 'wrap',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    tab: {
        padding: '1rem 1.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        color: '#6b7280',
        transition: 'all 0.3s',
    },
    tabActive: {
        padding: '1rem 1.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid #667eea',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#667eea',
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '1. 5rem',
        color: '#111827',
    },
    sectionContent: {
        color: '#374151',
        lineHeight: '1.75',
    },
    description: {
        fontSize: '1.125rem',
        marginBottom: '2rem',
    },
    subsection: {
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid #e5e7eb',
    },
    subsectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#111827',
    },
    datesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    dateItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
    },
    dateLabel: {
        fontWeight: '600',
        color: '#374151',
    },
    dateValue: {
        color: '#6b7280',
    },
    topicsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '0.75rem',
    },
    topicItem: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-start',
        padding: '0.5rem',
    },
    topicIcon: {
        color: '#667eea',
        fontWeight: 'bold',
    },
    sponsorsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        marginTop: '1. 5rem',
    },
    sponsorCard: {
        textAlign: 'center',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
    },
    sponsorLogo: {
        height: '80px',
        objectFit: 'contain',
        marginBottom: '1rem',
    },
    sponsorName: {
        fontWeight: '600',
        marginBottom: '0.5rem',
    },
    sponsorTier: {
        fontSize: '0.875rem',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    linkButton: {
        display: 'inline-block',
        marginTop: '1rem',
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '1. 125rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
    },
    speakersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
    },
    speakerCard: {
        textAlign: 'center',
        padding: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
    },
    speakerPhoto: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginBottom: '1rem',
    },
    speakerName: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
    },
    speakerTitle: {
        color: '#6b7280',
        marginBottom: '0.25rem',
    },
    speakerAffiliation: {
        color: '#9ca3af',
        fontSize: '0.875rem',
        marginBottom: '1rem',
    },
    speakerBio: {
        fontSize: '0.9rem',
        lineHeight: '1.6',
        color: '#4b5563',
    },
    venueInfo: {
        lineHeight: '1.75',
    },
    address: {
        color: '#6b7280',
        marginBottom: '1rem',
    },
    venueDescription: {
        marginBottom: '2rem',
    },
    mapContainer: {
        marginTop: '2rem',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '400px',
    },
    map: {
        width: '100%',
        height: '100%',
        border: 'none',
    },
    guidelines: {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        borderLeft: '4px solid #667eea',
    },
    submissionInfo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    infoBox: {
        padding: '1.5rem',
        backgroundColor: '#f0f4ff',
        borderRadius: '8px',
        textAlign: 'center',
    },
    deadline: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#667eea',
        marginTop: '0.5rem',
    },
    aboutText: {
        marginBottom: '2rem',
    },
};
