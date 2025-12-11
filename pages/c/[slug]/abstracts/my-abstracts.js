import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function MyAbstracts() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [abstracts, setAbstracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [slug]);

    const fetchData = async () => {
        try {
            // Fetch conference
            const confResponse = await fetch(
                `/api/v1/conferences/by-slug/${slug}`,
            );
            if (!confResponse.ok) {
                setError('Conference not found');
                setLoading(false);
                return;
            }
            const confData = await confResponse.json();
            setConference(confData);

            // Fetch user's abstracts - let the backend filter by current user
            const abstractsResponse = await fetch(
                `/api/v1/conferences/${confData.id}/abstracts/my-abstracts`,
            );

            if (abstractsResponse.ok) {
                const abstractsData = await abstractsResponse.json();
                setAbstracts(abstractsData);
            } else if (abstractsResponse.status === 401) {
                // Not logged in - redirect to login
                router.push(
                    `/login?redirect=/c/${slug}/abstracts/my-abstracts`,
                );
            } else {
                console.error('Failed to fetch abstracts');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            submitted: {
                background: '#fff3cd',
                color: '#856404',
                text: 'Submitted',
            },
            pending: {
                background: '#fff3cd',
                color: '#856404',
                text: 'Pending Review',
            },
            accepted: {
                background: '#d4edda',
                color: '#155724',
                text: 'Accepted',
            },
            rejected: {
                background: '#f8d7da',
                color: '#721c24',
                text: 'Rejected',
            },
            revision: {
                background: '#d1ecf1',
                color: '#0c5460',
                text: 'Needs Revision',
            },
        };

        const style = statusStyles[status] || statusStyles.pending;

        return (
            <span
                style={{
                    ...styles.badge,
                    background: style.background,
                    color: style.color,
                }}
            >
                {style.text}
            </span>
        );
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (error) return <div style={styles.error}>{error}</div>;
    if (!conference) return <div>Conference not found</div>;

    return (
        <>
            <Head>
                <title>My Abstracts - {conference.title}</title>
            </Head>

            <div style={styles.container}>
                <header style={styles.header}>
                    <Link href={`/c/${slug}`} style={styles.backLink}>
                        ← Back to Conference
                    </Link>
                    <div style={styles.headerContent}>
                        <div>
                            <h1 style={styles.title}>My Abstracts</h1>
                            <p style={styles.subtitle}>{conference.title}</p>
                        </div>
                        <Link href={`/c/${slug}/abstracts/submit`}>
                            <button style={styles.submitButton}>
                                + Submit New Abstract
                            </button>
                        </Link>
                    </div>
                </header>

                {abstracts.length === 0 ? (
                    <div style={styles.empty}>
                        <h2>No Abstracts Yet</h2>
                        <p>
                            You haven't submitted any abstracts for this
                            conference.{' '}
                        </p>
                        <Link href={`/c/${slug}/abstracts/submit`}>
                            <button style={styles.submitButton}>
                                Submit Your First Abstract
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div style={styles.abstractsList}>
                        {abstracts.map((abstract) => (
                            <div key={abstract.id} style={styles.abstractCard}>
                                <div style={styles.abstractHeader}>
                                    <h3 style={styles.abstractTitle}>
                                        {abstract.title}
                                    </h3>
                                    {getStatusBadge(abstract.status)}
                                </div>
                                <p style={styles.abstractContent}>
                                    {abstract.content.substring(0, 200)}
                                    {abstract.content.length > 200 ? '...' : ''}
                                </p>
                                {abstract.keywords &&
                                    abstract.keywords.length > 0 && (
                                        <div style={styles.keywords}>
                                            {abstract.keywords.map(
                                                (keyword, idx) => (
                                                    <span
                                                        key={idx}
                                                        style={styles.keyword}
                                                    >
                                                        {keyword}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    )}
                                <div style={styles.abstractFooter}>
                                    <small style={styles.date}>
                                        Submitted:{' '}
                                        {new Date(
                                            abstract.created_at,
                                        ).toLocaleDateString()}
                                    </small>
                                    <div style={styles.actions}>
                                        <Link
                                            href={`/c/${slug}/abstracts/${abstract.id}`}
                                        >
                                            <button style={styles.viewButton}>
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    header: {
        marginBottom: '40px',
    },
    backLink: {
        color: '#0070f3',
        textDecoration: 'none',
        fontSize: '14px',
        marginBottom: '20px',
        display: 'inline-block',
    },
    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    subtitle: {
        color: '#666',
        fontSize: '16px',
    },
    submitButton: {
        padding: '12px 24px',
        background: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    loading: {
        textAlign: 'center',
        padding: '100px 20px',
        fontSize: '18px',
    },
    error: {
        textAlign: 'center',
        padding: '100px 20px',
        color: '#e00',
    },
    empty: {
        textAlign: 'center',
        padding: '60px 20px',
        background: '#f9f9f9',
        borderRadius: '8px',
    },
    abstractsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    abstractCard: {
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '24px',
    },
    abstractHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px',
    },
    abstractTitle: {
        fontSize: '20px',
        fontWeight: '600',
        margin: 0,
        flex: 1,
    },
    badge: {
        padding: '6px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        marginLeft: '15px',
    },
    abstractContent: {
        color: '#333',
        lineHeight: '1.6',
        marginBottom: '15px',
    },
    keywords: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '15px',
    },
    keyword: {
        background: '#e9ecef',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        color: '#495057',
    },
    abstractFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #eee',
        paddingTop: '15px',
    },
    date: {
        color: '#666',
        fontSize: '13px',
    },
    actions: {
        display: 'flex',
        gap: '10px',
    },
    viewButton: {
        padding: '8px 16px',
        background: '#fff',
        border: '1px solid #0070f3',
        color: '#0070f3',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
    },
};
