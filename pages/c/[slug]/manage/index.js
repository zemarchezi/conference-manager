import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ConferenceManageDashboard() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [slug]);

    const fetchData = async () => {
        try {
            const confRes = await fetch(`/api/v1/conferences/by-slug/${slug}`);
            const confData = await confRes.json();
            setConference(confData);

            const statsRes = await fetch(
                `/api/v1/conferences/${confData.id}/registrations/stats`,
            );
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <>
            <Head>
                <title>Manage Conference - {conference?.title}</title>
            </Head>

            <div style={styles.container}>
                <div style={styles.header}>
                    <Link href={`/c/${slug}`} style={styles.backLink}>
                        ← Back to Conference Page
                    </Link>
                    <h1>Manage: {conference?.title}</h1>
                </div>

                <div style={styles.grid}>
                    {/* Stats Cards */}
                    {stats && (
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>
                                    {stats.total_registrations || 0}
                                </div>
                                <div style={styles.statLabel}>
                                    Total Registrations
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>
                                    {stats.confirmed || 0}
                                </div>
                                <div style={styles.statLabel}>Confirmed</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>
                                    {stats.pending || 0}
                                </div>
                                <div style={styles.statLabel}>Pending</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>
                                    {stats.paid || 0}
                                </div>
                                <div style={styles.statLabel}>Paid</div>
                            </div>
                        </div>
                    )}

                    {/* Management Links */}
                    <div style={styles.linksGrid}>
                        <Link
                            href={`/c/${slug}/manage/settings`}
                            style={styles.linkCard}
                        >
                            <span style={styles.linkIcon}>⚙️</span>
                            <div>
                                <h3>Conference Settings</h3>
                                <p>
                                    Manage appearance, content, and
                                    configuration
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={`/c/${slug}/manage/registration-form`}
                            style={styles.linkCard}
                        >
                            <span style={styles.linkIcon}>📋</span>
                            <div>
                                <h3>Registration Form</h3>
                                <p>
                                    Customize registration fields and questions
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={`/c/${slug}/manage/speakers`}
                            style={styles.linkCard}
                        >
                            <span style={styles.linkIcon}>🎤</span>
                            <div>
                                <h3>Speakers</h3>
                                <p>
                                    Add and manage keynote and session speakers
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={`/c/${slug}/manage/registrations`}
                            style={styles.linkCard}
                        >
                            <span style={styles.linkIcon}>👥</span>
                            <div>
                                <h3>View Registrations</h3>
                                <p>
                                    See all attendee registrations and details
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={`/c/${slug}/manage/schedule`}
                            style={styles.linkCard}
                        >
                            <span style={styles.linkIcon}>📅</span>
                            <div>
                                <h3>Schedule</h3>
                                <p>Manage conference schedule and sessions</p>
                            </div>
                        </Link>

                        <Link
                            href={`/c/${slug}/manage/abstracts`}
                            style={styles.linkCard}
                        >
                            <span style={styles.linkIcon}>📄</span>
                            <div>
                                <h3>Abstracts</h3>
                                <p>Review and manage submitted abstracts</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '2rem',
    },
    header: {
        maxWidth: '1200px',
        margin: '0 auto 2rem',
    },
    backLink: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '500',
        display: 'inline-block',
        marginBottom: '1rem',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
    grid: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#667eea',
        marginBottom: '0.5rem',
    },
    statLabel: {
        fontSize: '0.875rem',
        color: '#6b7280',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    linksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    linkCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
    },
    linkIcon: {
        fontSize: '2rem',
    },
};
