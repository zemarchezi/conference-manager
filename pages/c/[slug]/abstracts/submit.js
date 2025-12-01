import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function SubmitAbstract() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        keywords: '',
    });

    useEffect(() => {
        if (slug) {
            fetchConference();
        }
    }, [slug]);

    const fetchConference = async () => {
        try {
            const response = await fetch(`/api/v1/conferences/by-slug/${slug}`);
            if (response.ok) {
                const data = await response.json();
                setConference(data);
            } else {
                setError('Conference not found');
            }
        } catch (err) {
            setError('Error loading conference');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const keywords = formData.keywords
                .split(',')
                .map((k) => k.trim())
                .filter((k) => k);

            const response = await fetch('/api/v1/abstracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conference_id: conference.id,
                    title: formData.title,
                    content: formData.content,
                    keywords,
                }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/c/${slug}/abstracts/my-abstracts`);
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to submit abstract');
            }
        } catch (err) {
            setError('An error occurred while submitting');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (!conference)
        return <div style={styles.error}>Conference not found</div>;

    return (
        <>
            <Head>
                <title>Submit Abstract - {conference.title}</title>
            </Head>

            <div style={styles.container}>
                <header style={styles.header}>
                    <Link href={`/c/${slug}`} style={styles.backLink}>
                        ← Back to Conference
                    </Link>
                    <h1 style={styles.title}>Submit Abstract</h1>
                    <p style={styles.subtitle}>{conference.title}</p>
                </header>

                {success ? (
                    <div style={styles.successBox}>
                        <h2>✅ Abstract Submitted Successfully!</h2>
                        <p>Redirecting to your abstracts... </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {error && <div style={styles.errorBox}>{error}</div>}

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                required
                                maxLength={200}
                                style={styles.input}
                                placeholder="Enter your abstract title"
                            />
                            <small style={styles.hint}>
                                {formData.title.length}/200 characters
                            </small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Abstract Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        content: e.target.value,
                                    })
                                }
                                required
                                rows={12}
                                maxLength={3000}
                                style={styles.textarea}
                                placeholder="Enter your abstract content (max 3000 characters)"
                            />
                            <small style={styles.hint}>
                                {formData.content.length}/3000 characters
                            </small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Keywords</label>
                            <input
                                type="text"
                                value={formData.keywords}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        keywords: e.target.value,
                                    })
                                }
                                style={styles.input}
                                placeholder="machine learning, AI, neural networks (comma-separated)"
                            />
                            <small style={styles.hint}>
                                Separate keywords with commas
                            </small>
                        </div>

                        <div style={styles.actions}>
                            <button
                                type="button"
                                onClick={() => router.push(`/c/${slug}`)}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    ...styles.submitButton,
                                    ...(submitting
                                        ? styles.submitButtonDisabled
                                        : {}),
                                }}
                            >
                                {submitting
                                    ? 'Submitting...'
                                    : 'Submit Abstract'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
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
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    subtitle: {
        color: '#666',
        fontSize: '16px',
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
    successBox: {
        background: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        padding: '30px',
        textAlign: 'center',
    },
    errorBox: {
        background: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        color: '#721c24',
    },
    form: {
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '30px',
    },
    formGroup: {
        marginBottom: '25px',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '8px',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    hint: {
        display: 'block',
        marginTop: '5px',
        color: '#666',
        fontSize: '12px',
    },
    actions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
        marginTop: '30px',
    },
    cancelButton: {
        padding: '12px 24px',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
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
    submitButtonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
};
