import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import RegistrationFormBuilder from 'components/conference/RegistrationFormBuilder';

export default function ManageRegistrationForm() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);

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
            }
        } catch (error) {
            console.error('Error fetching conference:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (!conference) {
        return <div>Conference not found</div>;
    }

    return (
        <>
            <Head>
                <title>Manage Registration Form - {conference.title}</title>
            </Head>

            <div style={styles.container}>
                <div style={styles.header}>
                    <Link href={`/c/${slug}`} style={styles.backLink}>
                        ← Back to Conference
                    </Link>
                    <h1>{conference.title}</h1>
                    <p>Manage Registration Form</p>
                </div>

                <RegistrationFormBuilder conferenceId={conference.id} />

                <div style={styles.previewSection}>
                    <h3>Preview Registration URL</h3>
                    <p>
                        <Link
                            href={`/c/${slug}/register`}
                            target="_blank"
                            style={styles.previewLink}
                        >
                            {typeof window !== 'undefined' &&
                                `${window.location.origin}/c/${slug}/register`}
                        </Link>
                    </p>
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
    previewSection: {
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '1. 5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
    },
    previewLink: {
        color: '#667eea',
        fontWeight: '500',
    },
};
