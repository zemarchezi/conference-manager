import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ManageSpeakers() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [speakers, setSpeakers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSpeaker, setEditingSpeaker] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        organization: '',
        bio: '',
        photo_url: '',
        website: '',
        twitter: '',
        linkedin: '',
        email: '',
        is_keynote: false,
        display_order: 0,
    });

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [slug]);

    const fetchData = async () => {
        try {
            const confResponse = await fetch(
                `/api/v1/conferences/by-slug/${slug}`,
            );
            if (!confResponse.ok) throw new Error('Conference not found');
            const confData = await confResponse.json();
            setConference(confData);

            const speakersResponse = await fetch(
                `/api/v1/conferences/${confData.id}/speakers`,
            );
            if (speakersResponse.ok) {
                const speakersData = await speakersResponse.json();
                setSpeakers(speakersData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingSpeaker
                ? `/api/v1/conferences/${conference.id}/speakers/${editingSpeaker.id}`
                : `/api/v1/conferences/${conference.id}/speakers`;

            const method = editingSpeaker ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save speaker');
            }

            alert(editingSpeaker ? 'Speaker updated!' : 'Speaker added!');
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Error saving speaker: ' + error.message);
        }
    };

    const handleEdit = (speaker) => {
        setEditingSpeaker(speaker);
        setFormData({
            name: speaker.name,
            title: speaker.title || '',
            organization: speaker.organization || '',
            bio: speaker.bio || '',
            photo_url: speaker.photo_url || '',
            website: speaker.website || '',
            twitter: speaker.twitter || '',
            linkedin: speaker.linkedin || '',
            email: speaker.email || '',
            is_keynote: speaker.is_keynote,
            display_order: speaker.display_order,
        });
        setShowModal(true);
    };

    const handleDelete = async (speakerId) => {
        if (!confirm('Are you sure you want to delete this speaker?')) return;

        try {
            const response = await fetch(
                `/api/v1/conferences/${conference.id}/speakers/${speakerId}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) throw new Error('Failed to delete speaker');

            alert('Speaker deleted! ');
            fetchData();
        } catch (error) {
            alert('Error deleting speaker: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            organization: '',
            bio: '',
            photo_url: '',
            website: '',
            twitter: '',
            linkedin: '',
            email: '',
            is_keynote: false,
            display_order: 0,
        });
        setEditingSpeaker(null);
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (!conference) {
        return <div style={styles.error}>Conference not found</div>;
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1>Manage Speakers - {conference.title}</h1>
                    <nav style={styles.nav}>
                        <Link href={`/c/${slug}`}>← Back to Conference</Link>
                        <Link href={`/c/${slug}/manage`}>Dashboard</Link>
                    </nav>
                </div>
            </header>

            <div style={styles.content}>
                <div style={styles.toolbar}>
                    <h2>Speakers ({speakers.length})</h2>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        style={styles.addButton}
                    >
                        + Add Speaker
                    </button>
                </div>

                {speakers.length === 0 ? (
                    <div style={styles.empty}>
                        <h3>No speakers yet</h3>
                        <p>Add speakers to showcase at your conference</p>
                    </div>
                ) : (
                    <div style={styles.speakersList}>
                        {speakers.map((speaker) => (
                            <div key={speaker.id} style={styles.speakerCard}>
                                {speaker.photo_url && (
                                    <img
                                        src={speaker.photo_url}
                                        alt={speaker.name}
                                        style={styles.speakerPhoto}
                                    />
                                )}
                                <div style={styles.speakerInfo}>
                                    <div>
                                        <h3 style={styles.speakerName}>
                                            {speaker.name}
                                            {speaker.is_keynote && (
                                                <span
                                                    style={styles.keynoteBadge}
                                                >
                                                    Keynote
                                                </span>
                                            )}
                                        </h3>
                                        {speaker.title && (
                                            <p style={styles.speakerTitle}>
                                                {speaker.title}
                                            </p>
                                        )}
                                        {speaker.organization && (
                                            <p style={styles.speakerOrg}>
                                                {speaker.organization}
                                            </p>
                                        )}
                                        {speaker.bio && (
                                            <p style={styles.speakerBio}>
                                                {speaker.bio.substring(0, 150)}
                                                ...
                                            </p>
                                        )}
                                    </div>
                                    <div style={styles.speakerActions}>
                                        <button
                                            onClick={() => handleEdit(speaker)}
                                            style={styles.editButton}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(speaker.id)
                                            }
                                            style={styles.deleteButton}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Speaker Modal */}
            {showModal && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={styles.modalHeader}>
                            <h2>
                                {editingSpeaker
                                    ? 'Edit Speaker'
                                    : 'Add Speaker'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Name *</label>
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
                                    <label style={styles.label}>Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., CEO, Professor"
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Organization</label>
                                <input
                                    type="text"
                                    value={formData.organization}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            organization: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., University, Company"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            bio: e.target.value,
                                        })
                                    }
                                    rows={4}
                                    placeholder="Brief biography"
                                    style={styles.textarea}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Photo URL</label>
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
                                    <label style={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Website</label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                website: e.target.value,
                                            })
                                        }
                                        placeholder="https://..."
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Twitter Handle
                                    </label>
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

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkedin}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                linkedin: e.target.value,
                                            })
                                        }
                                        placeholder="https://linkedin.com/in/..."
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_keynote}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    is_keynote:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Keynote Speaker
                                    </label>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                display_order: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                                <button type="submit" style={styles.submitBtn}>
                                    {editingSpeaker
                                        ? 'Update Speaker'
                                        : 'Add Speaker'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
    error: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#ef4444',
    },
    header: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 0',
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
    },
    nav: {
        display: 'flex',
        gap: '20px',
        marginTop: '10px',
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    addButton: {
        padding: '12px 24px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    empty: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
    },
    speakersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    speakerCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        gap: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    speakerPhoto: {
        width: '120px',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '8px',
    },
    speakerInfo: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    speakerName: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    keynoteBadge: {
        fontSize: '12px',
        padding: '4px 8px',
        backgroundColor: '#667eea',
        color: 'white',
        borderRadius: '4px',
    },
    speakerTitle: {
        fontSize: '14px',
        color: '#667eea',
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
    },
    speakerActions: {
        display: 'flex',
        gap: '10px',
    },
    editButton: {
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    deleteButton: {
        padding: '8px 16px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalHeader: {
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '32px',
        cursor: 'pointer',
        color: '#6b7280',
    },
    form: {
        padding: '20px',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: '#374151',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    },
    modalFooter: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
    },
    cancelBtn: {
        padding: '10px 20px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        background: 'white',
        cursor: 'pointer',
    },
    submitBtn: {
        padding: '10px 20px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};
