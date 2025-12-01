import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AbstractDetail() {
    const router = useRouter();
    const { slug, id } = router.query;
    const [conference, setConference] = useState(null);
    const [abstract, setAbstract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAuthor, setIsAuthor] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        if (slug && id) {
            fetchData();
        }
    }, [slug, id]);

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

            // Fetch abstract
            const abstractResponse = await fetch(
                `/api/v1/conferences/${confData.id}/abstracts/${id}`,
            );

            if (abstractResponse.ok) {
                const abstractData = await abstractResponse.json();
                setAbstract(abstractData);
                setIsAuthor(abstractData.is_author);
                setIsOrganizer(abstractData.is_organizer);
            } else if (abstractResponse.status === 404) {
                setError('Abstract not found');
            } else if (abstractResponse.status === 403) {
                setError('You do not have permission to view this abstract');
            } else {
                setError('Failed to load abstract');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        if (!confirm(`Are you sure you want to ${newStatus} this abstract?`)) {
            return;
        }

        setStatusUpdating(true);
        try {
            const response = await fetch(
                `/api/v1/conferences/${conference.id}/abstracts/${id}/status`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                },
            );

            if (response.ok) {
                const updatedAbstract = await response.json();
                setAbstract(updatedAbstract);
                alert(`Abstract ${newStatus} successfully!`);
            } else {
                const data = await response.json();
                alert(data.error || `Failed to ${newStatus} abstract`);
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setStatusUpdating(false);
        }
    };

    const deleteAbstract = async () => {
        if (
            !confirm(
                'Are you sure you want to delete this abstract?  This cannot be undone.',
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/conferences/${conference.id}/abstracts/${id}`,
                { method: 'DELETE' },
            );

            if (response.ok) {
                alert('Abstract deleted successfully');
                router.push(`/c/${slug}/abstracts/my-abstracts`);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete abstract');
            }
        } catch (error) {
            alert('An error occurred while deleting');
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
                text: '✓ Accepted',
            },
            rejected: {
                background: '#f8d7da',
                color: '#721c24',
                text: '✗ Rejected',
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
    if (!abstract) return <div style={styles.error}>Abstract not found</div>;

    return (
        <>
            <Head>
                <title>
                    {abstract.title} - {conference?.title}
                </title>
            </Head>

            <div style={styles.container}>
                <header style={styles.header}>
                    <Link
                        href={`/c/${slug}/abstracts/my-abstracts`}
                        style={styles.backLink}
                    >
                        ← Back to My Abstracts
                    </Link>
                </header>

                <div style={styles.card}>
                    {/* Header with status */}
                    <div style={styles.cardHeader}>
                        <div>
                            <h1 style={styles.title}>{abstract.title}</h1>
                            <p style={styles.meta}>
                                Submitted by{' '}
                                <strong>{abstract.author_username}</strong> on{' '}
                                {new Date(
                                    abstract.created_at,
                                ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        {getStatusBadge(abstract.status)}
                    </div>

                    {/* Keywords */}
                    {abstract.keywords && abstract.keywords.length > 0 && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Keywords</h3>
                            <div style={styles.keywords}>
                                {abstract.keywords.map((keyword, idx) => (
                                    <span key={idx} style={styles.keyword}>
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Abstract Content */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Abstract</h3>
                        <div style={styles.content}>{abstract.content}</div>
                    </div>

                    {/* Metadata */}
                    <div style={styles.metadata}>
                        <div style={styles.metadataItem}>
                            <strong>Conference:</strong>{' '}
                            {abstract.conference_title}
                        </div>
                        <div style={styles.metadataItem}>
                            <strong>Submitted:</strong>{' '}
                            {new Date(abstract.created_at).toLocaleString()}
                        </div>
                        <div style={styles.metadataItem}>
                            <strong>Last Updated:</strong>{' '}
                            {new Date(abstract.updated_at).toLocaleString()}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                        {/* Author actions */}
                        {isAuthor && abstract.status === 'submitted' && (
                            <div style={styles.actionGroup}>
                                <h4 style={styles.actionTitle}>Your Actions</h4>
                                <div style={styles.buttonGroup}>
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/c/${slug}/abstracts/${id}/edit`,
                                            )
                                        }
                                        style={styles.editButton}
                                    >
                                        ✏️ Edit Abstract
                                    </button>
                                    <button
                                        onClick={deleteAbstract}
                                        style={styles.deleteButton}
                                    >
                                        🗑️ Delete Abstract
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Organizer actions */}
                        {isOrganizer && abstract.status === 'submitted' && (
                            <div style={styles.actionGroup}>
                                <h4 style={styles.actionTitle}>
                                    Organizer Actions
                                </h4>
                                <div style={styles.buttonGroup}>
                                    <button
                                        onClick={() => updateStatus('accepted')}
                                        disabled={statusUpdating}
                                        style={styles.acceptButton}
                                    >
                                        ✓ Accept
                                    </button>
                                    <button
                                        onClick={() => updateStatus('rejected')}
                                        disabled={statusUpdating}
                                        style={styles.rejectButton}
                                    >
                                        ✗ Reject
                                    </button>
                                    <button
                                        onClick={() => updateStatus('revision')}
                                        disabled={statusUpdating}
                                        style={styles.revisionButton}
                                    >
                                        📝 Request Revision
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    header: {
        marginBottom: '30px',
    },
    backLink: {
        color: '#0070f3',
        textDecoration: 'none',
        fontSize: '14px',
        display: 'inline-block',
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
        fontSize: '18px',
    },
    card: {
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '40px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #eee',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '10px',
        lineHeight: '1.3',
    },
    meta: {
        color: '#666',
        fontSize: '14px',
    },
    badge: {
        padding: '8px 16px',
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    section: {
        marginBottom: '30px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
    },
    keywords: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    keyword: {
        background: '#e9ecef',
        padding: '6px 14px',
        borderRadius: '16px',
        fontSize: '14px',
        color: '#495057',
    },
    content: {
        fontSize: '16px',
        lineHeight: '1.8',
        color: '#333',
        whiteSpace: 'pre-wrap',
    },
    metadata: {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
    },
    metadataItem: {
        padding: '8px 0',
        fontSize: '14px',
        color: '#495057',
    },
    actions: {
        borderTop: '2px solid #eee',
        paddingTop: '30px',
    },
    actionGroup: {
        marginBottom: '20px',
    },
    actionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    editButton: {
        padding: '10px 20px',
        background: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    deleteButton: {
        padding: '10px 20px',
        background: '#fff',
        color: '#dc3545',
        border: '1px solid #dc3545',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    acceptButton: {
        padding: '10px 20px',
        background: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    rejectButton: {
        padding: '10px 20px',
        background: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    revisionButton: {
        padding: '10px 20px',
        background: '#ffc107',
        color: '#000',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
};
