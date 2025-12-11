import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ManageSpeakers() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [speakers, setSpeakers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        organization: '',
        bio: '',
        photo_url: '',
        website: '',
        twitter: '',
        linkedin: '',
        is_keynote: false,
    });

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

            const speakersRes = await fetch(
                `/api/v1/conferences/${confData.id}/speakers`,
            );
            if (speakersRes.ok) {
                const speakersData = await speakersRes.json();
                setSpeakers(speakersData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `/api/v1/conferences/${conference.id}/speakers`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                },
            );

            if (response.ok) {
                await fetchData();
                setShowForm(false);
                setFormData({
                    name: '',
                    title: '',
                    organization: '',
                    bio: '',
                    photo_url: '',
                    website: '',
                    twitter: '',
                    linkedin: '',
                    is_keynote: false,
                });
            }
        } catch (error) {
            console.error('Error adding speaker:', error);
            alert('Failed to add speaker');
        }
    };

    const handleDelete = async (speakerId) => {
        if (!confirm('Are you sure you want to delete this speaker?')) return;

        try {
            const response = await fetch(
                `/api/v1/conferences/${conference.id}/speakers/${speakerId}`,
                { method: 'DELETE' },
            );

            if (response.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error('Error deleting speaker:', error);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <>
            <Head>
                <title>Manage Speakers - {conference?.title}</title>
            </Head>

            <div style={styles.container}>
                <div style={styles.header}>
                    <Link href={`/c/${slug}/manage`} style={styles.backLink}>
                        ← Back to Management
                    </Link>
                    <h1>Manage Speakers</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={styles.btnPrimary}
                    >
                        {showForm ? 'Cancel' : '+ Add Speaker'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <h3>Add New Speaker</h3>

                        <div style={styles.formGroup}>
                            <label>Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Title/Role</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="e.g., Professor, CEO"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Organization</label>
                            <input
                                type="text"
                                value={formData.organization}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        organization: e.target.value,
                                    })
                                }
                                placeholder="University or Company"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Biography</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        bio: e.target.value,
                                    })
                                }
                                rows={4}
                                style={styles.textarea}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Photo URL</label>
                            <input
                                type="url"
                                value={formData.photo_url}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        photo_url: e.target.value,
                                    })
                                }
                                placeholder="https://..."
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label>Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            website: e.target.value,
                                        })
                                    }
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label>Twitter Handle</label>
                                <input
                                    type="text"
                                    value={formData.twitter}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            twitter: e.target.value,
                                        })
                                    }
                                    placeholder="@username"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label>LinkedIn URL</label>
                            <input
                                type="url"
                                value={formData.linkedin}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        linkedin: e.target.value,
                                    })
                                }
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_keynote}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_keynote: e.target.checked,
                                        })
                                    }
                                />
                                <span>Keynote Speaker</span>
                            </label>
                        </div>

                        <button type="submit" style={styles.btnSubmit}>
                            Add Speaker
                        </button>
                    </form>
                )}

                {/* Speakers List */}
                <div style={styles.speakersList}>
                    <h3>Current Speakers ({speakers.length})</h3>

                    {speakers.length === 0 ? (
                        <p style={styles.empty}>No speakers added yet.</p>
                    ) : (
                        <div style={styles.grid}>
                            {speakers.map((speaker) => (
                                <div
                                    key={speaker.id}
                                    style={styles.speakerCard}
                                >
                                    {speaker.photo_url && (
                                        <img
                                            src={speaker.photo_url}
                                            alt={speaker.name}
                                            style={styles.photo}
                                        />
                                    )}
                                    <div style={styles.speakerInfo}>
                                        <h4>
                                            {speaker.name}
                                            {speaker.is_keynote && (
                                                <span style={styles.badge}>
                                                    Keynote
                                                </span>
                                            )}
                                        </h4>
                                        {speaker.title && (
                                            <p style={styles.title}>
                                                {speaker.title}
                                            </p>
                                        )}
                                        {speaker.organization && (
                                            <p style={styles.org}>
                                                {speaker.organization}
                                            </p>
                                        )}
                                        <button
                                            onClick={() =>
                                                handleDelete(speaker.id)
                                            }
                                            style={styles.btnDelete}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    backLink: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '500',
    },
    btnPrimary: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    form: {
        maxWidth: '800px',
        margin: '0 auto 3rem',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '1rem',
        marginTop: '0.5rem',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        marginTop: '0.5rem',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
    },
    btnSubmit: {
        padding: '0.75rem 2rem',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '1rem',
    },
    speakersList: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    empty: {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1. 5rem',
        marginTop: '1.5rem',
    },
    speakerCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    photo: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
    },
    speakerInfo: {
        padding: '1.5rem',
    },
    badge: {
        marginLeft: '0.5rem',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fef3c7',
        color: '#92400e',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    title: {
        color: '#667eea',
        fontSize: '0.875rem',
        marginTop: '0.5rem',
    },
    org: {
        color: '#6b7280',
        fontSize: '0.875rem',
    },
    btnDelete: {
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
};
