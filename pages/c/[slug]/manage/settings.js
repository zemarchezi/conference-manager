import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ManageConferenceSettings() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

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

            const settingsRes = await fetch(
                `/api/v1/conferences/${confData.id}/settings`,
            );
            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                setSettings(settingsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(
                `/api/v1/conferences/${conference.id}/settings`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings),
                },
            );

            if (response.ok) {
                alert('Settings saved successfully!');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings({ ...settings, [key]: value });
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <>
            <Head>
                <title>Conference Settings - {conference?.title}</title>
            </Head>

            <div style={styles.container}>
                <div style={styles.header}>
                    <Link href={`/c/${slug}`} style={styles.backLink}>
                        ← Back to Conference
                    </Link>
                    <h1>Conference Settings</h1>
                </div>

                <div style={styles.content}>
                    {/* Tabs */}
                    <nav style={styles.tabs}>
                        <button
                            style={
                                activeTab === 'general'
                                    ? styles.tabActive
                                    : styles.tab
                            }
                            onClick={() => setActiveTab('general')}
                        >
                            General
                        </button>
                        <button
                            style={
                                activeTab === 'content'
                                    ? styles.tabActive
                                    : styles.tab
                            }
                            onClick={() => setActiveTab('content')}
                        >
                            Content
                        </button>
                        <button
                            style={
                                activeTab === 'venue'
                                    ? styles.tabActive
                                    : styles.tab
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
                    <div style={styles.tabContent}>
                        {activeTab === 'general' && (
                            <div style={styles.section}>
                                <h3>Visual Settings</h3>

                                <div style={styles.formGroup}>
                                    <label>Logo URL</label>
                                    <input
                                        type="url"
                                        value={settings.logo_url || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'logo_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://example.com/logo.png"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>Banner Image URL</label>
                                    <input
                                        type="url"
                                        value={settings.banner_url || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'banner_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://example.com/banner.jpg"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>Conference Format</label>
                                    <select
                                        value={
                                            settings.conference_format ||
                                            'In-Person'
                                        }
                                        onChange={(e) =>
                                            updateSetting(
                                                'conference_format',
                                                e.target.value,
                                            )
                                        }
                                        style={styles.input}
                                    >
                                        <option value="In-Person">
                                            In-Person
                                        </option>
                                        <option value="Virtual">Virtual</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label>Maximum Registrations</label>
                                    <input
                                        type="number"
                                        value={settings.max_registrations || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'max_registrations',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        placeholder="Leave empty for unlimited"
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div style={styles.section}>
                                <h3>Conference Content</h3>

                                <div style={styles.formGroup}>
                                    <label>About Text (HTML supported)</label>
                                    <textarea
                                        value={settings.about_text || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'about_text',
                                                e.target.value,
                                            )
                                        }
                                        rows={6}
                                        style={styles.textarea}
                                        placeholder="Detailed description about your conference..."
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>
                                        Conference Topics (JSON array)
                                    </label>
                                    <textarea
                                        value={settings.topics || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'topics',
                                                e.target.value,
                                            )
                                        }
                                        rows={4}
                                        style={styles.textarea}
                                        placeholder='["Topic 1", "Topic 2", "Topic 3"]'
                                    />
                                    <small style={styles.hint}>
                                        Enter topics as JSON array
                                    </small>
                                </div>

                                <div style={styles.formGroup}>
                                    <label>Important Dates (JSON array)</label>
                                    <textarea
                                        value={settings.important_dates || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'important_dates',
                                                e.target.value,
                                            )
                                        }
                                        rows={5}
                                        style={styles.textarea}
                                        placeholder='[{"label": "Abstract Deadline", "date": "2024-06-01"}]'
                                    />
                                    <small style={styles.hint}>
                                        Format:{' '}
                                        {`[{"label": "Event", "date": "YYYY-MM-DD"}]`}
                                    </small>
                                </div>
                            </div>
                        )}

                        {activeTab === 'venue' && (
                            <div style={styles.section}>
                                <h3>Venue Information</h3>

                                <div style={styles.formGroup}>
                                    <label>Venue Name</label>
                                    <input
                                        type="text"
                                        value={settings.venue_name || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'venue_name',
                                                e.target.value,
                                            )
                                        }
                                        style={styles.input}
                                        placeholder="Convention Center Name"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>Venue Address</label>
                                    <textarea
                                        value={settings.venue_address || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'venue_address',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        style={styles.textarea}
                                        placeholder="Full address with postal code"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>Venue Description</label>
                                    <textarea
                                        value={settings.venue_description || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'venue_description',
                                                e.target.value,
                                            )
                                        }
                                        rows={4}
                                        style={styles.textarea}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>
                                        Accommodation Info (HTML supported)
                                    </label>
                                    <textarea
                                        value={
                                            settings.accommodation_info || ''
                                        }
                                        onChange={(e) =>
                                            updateSetting(
                                                'accommodation_info',
                                                e.target.value,
                                            )
                                        }
                                        rows={5}
                                        style={styles.textarea}
                                        placeholder="Hotel recommendations, booking links, etc."
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>
                                        Travel Information (HTML supported)
                                    </label>
                                    <textarea
                                        value={settings.travel_info || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'travel_info',
                                                e.target.value,
                                            )
                                        }
                                        rows={5}
                                        style={styles.textarea}
                                        placeholder="How to get there, parking, public transport..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'submissions' && (
                            <div style={styles.section}>
                                <h3>Abstract Submissions</h3>

                                <div style={styles.formGroup}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                settings.enable_abstract_submission !==
                                                false
                                            }
                                            onChange={(e) =>
                                                updateSetting(
                                                    'enable_abstract_submission',
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span>Enable Abstract Submissions</span>
                                    </label>
                                </div>

                                <div style={styles.formGroup}>
                                    <label>Submission Deadline</label>
                                    <input
                                        type="datetime-local"
                                        value={
                                            settings.submission_deadline || ''
                                        }
                                        onChange={(e) =>
                                            updateSetting(
                                                'submission_deadline',
                                                e.target.value,
                                            )
                                        }
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>Notification Date</label>
                                    <input
                                        type="datetime-local"
                                        value={settings.notification_date || ''}
                                        onChange={(e) =>
                                            updateSetting(
                                                'notification_date',
                                                e.target.value,
                                            )
                                        }
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label>
                                        Submission Guidelines (HTML supported)
                                    </label>
                                    <textarea
                                        value={
                                            settings.submission_guidelines || ''
                                        }
                                        onChange={(e) =>
                                            updateSetting(
                                                'submission_guidelines',
                                                e.target.value,
                                            )
                                        }
                                        rows={8}
                                        style={styles.textarea}
                                        placeholder="Instructions for abstract submission, formatting, requirements..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div style={styles.actions}>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={styles.btnSave}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
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
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem',
    },
    tab: {
        padding: '1rem 1. 5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        cursor: 'pointer',
        fontWeight: '500',
        color: '#6b7280',
    },
    tabActive: {
        padding: '1rem 1.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '2px solid #667eea',
        cursor: 'pointer',
        fontWeight: '600',
        color: '#667eea',
    },
    tabContent: {
        padding: '2rem',
    },
    section: {
        maxWidth: '800px',
    },
    formGroup: {
        marginBottom: '1.5rem',
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
    hint: {
        display: 'block',
        marginTop: '0.5rem',
        fontSize: '0.875rem',
        color: '#6b7280',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
    },
    actions: {
        padding: '2rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    btnSave: {
        padding: '0.75rem 2rem',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
};
