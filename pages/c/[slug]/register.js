import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DynamicRegistrationForm from 'components/conference/DynamicRegistrationForm';

export default function ConferenceRegister() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (slug) {
            checkAuth();
            fetchConference();
        }
    }, [slug]);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/v1/users/me');
            setIsAuthenticated(response.ok);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    const fetchConference = async () => {
        try {
            const response = await fetch(`/api/v1/conferences/by-slug/${slug}`);
            if (response.ok) {
                const data = await response.json();
                setConference(data);
            }
        } catch (error) {
            console.error('Error fetching conference:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        alert('Registration successful!');
        router.push(`/c/${slug}`);
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (!conference) {
        return <div style={styles.error}>Conference not found</div>;
    }

    if (!isAuthenticated) {
        return (
            <>
                <Head>
                    <title>Register - {conference.title}</title>
                </Head>
                <div style={styles.authPrompt}>
                    <h2>Authentication Required</h2>
                    <p>
                        Please sign in or create an account to register for this
                        conference.
                    </p>
                    <div style={styles.authButtons}>
                        <Link
                            href={`/c/${slug}/login? redirect=/c/${slug}/register`}
                            style={styles.btnPrimary}
                        >
                            Sign In
                        </Link>
                        <Link
                            href={`/register? redirect=/c/${slug}/register`}
                            style={styles.btnSecondary}
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Register - {conference.title}</title>
            </Head>

            <div style={styles.container}>
                <div style={styles.header}>
                    <Link href={`/c/${slug}`} style={styles.backLink}>
                        ← Back to Conference
                    </Link>
                    <h1 style={styles.conferenceTitle}>{conference.title}</h1>
                    <p style={styles.conferenceDate}>
                        {new Date(conference.start_date).toLocaleDateString()} -{' '}
                        {new Date(conference.end_date).toLocaleDateString()}
                    </p>
                </div>

                <DynamicRegistrationForm
                    conferenceId={conference.id}
                    onSuccess={handleSuccess}
                />
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
        maxWidth: '700px',
        margin: '0 auto 2rem',
    },
    backLink: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '500',
        display: 'inline-block',
        marginBottom: '1rem',
    },
    conferenceTitle: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '0.5rem',
    },
    conferenceDate: {
        color: '#6b7280',
        fontSize: '1rem',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280',
    },
    error: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#ef4444',
    },
    authPrompt: {
        maxWidth: '500px',
        margin: '5rem auto',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    authButtons: {
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
        justifyContent: 'center',
    },
    btnPrimary: {
        padding: '0.75rem 2rem',
        backgroundColor: '#667eea',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '600',
    },
    btnSecondary: {
        padding: '0.75rem 2rem',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '600',
    },
};
