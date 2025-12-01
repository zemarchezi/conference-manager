import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DefaultLayout from 'components/layout/DefaultLayout';
import ConferenceOverview from 'components/conference/ConferenceOverview';
import ConferenceSchedule from 'components/conference/ConferenceSchedule';
import ConferenceSpeakers from 'components/conference/ConferenceSpeakers';
import ConferenceSubmissions from 'components/conference/ConferenceSubmissions';
import ConferenceRegistration from 'components/conference/ConferenceRegistration';

export default function ConferencePage() {
    const router = useRouter();
    const { slug } = router.query;
    const [conference, setConference] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const fetchConference = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/v1/conferences/${slug}`);

                if (!response.ok) {
                    throw new Error('Conference not found');
                }

                const data = await response.json();
                setConference(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConference();
    }, [slug]);

    const handleRegistration = async (role) => {
        try {
            const response = await fetch(
                `/api/v1/conferences/${slug}/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ role }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            setIsRegistered(true);
            alert('Successfully registered for the conference!');
        } catch (err) {
            alert(`Registration failed: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <DefaultLayout>
                <div className="loading-container">
                    <p>Loading conference...</p>
                </div>
            </DefaultLayout>
        );
    }

    if (error) {
        return (
            <DefaultLayout>
                <div className="error-container">
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </DefaultLayout>
        );
    }

    if (!conference) {
        return (
            <DefaultLayout>
                <div className="error-container">
                    <h1>Conference not found</h1>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <Head>
                <title>{conference.name} | Conference Manager</title>
                <meta name="description" content={conference.description} />
            </Head>

            <div className="conference-page">
                <div className="conference-header">
                    <h1>{conference.name}</h1>
                    <div className="conference-meta">
                        <span className="location">{conference.location}</span>
                        <span className="dates">
                            {new Date(
                                conference.start_date,
                            ).toLocaleDateString()}{' '}
                            -{' '}
                            {new Date(conference.end_date).toLocaleDateString()}
                        </span>
                        <span className={`status status-${conference.status}`}>
                            {conference.status}
                        </span>
                    </div>
                </div>

                <nav className="conference-nav">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={activeTab === 'schedule' ? 'active' : ''}
                        onClick={() => setActiveTab('schedule')}
                    >
                        Schedule
                    </button>
                    <button
                        className={activeTab === 'speakers' ? 'active' : ''}
                        onClick={() => setActiveTab('speakers')}
                    >
                        Speakers
                    </button>
                    <button
                        className={activeTab === 'submissions' ? 'active' : ''}
                        onClick={() => setActiveTab('submissions')}
                    >
                        Submissions
                    </button>
                    <button
                        className={activeTab === 'register' ? 'active' : ''}
                        onClick={() => setActiveTab('register')}
                    >
                        Register
                    </button>
                </nav>

                <div className="conference-content">
                    {activeTab === 'overview' && (
                        <ConferenceOverview conference={conference} />
                    )}
                    {activeTab === 'schedule' && (
                        <ConferenceSchedule conferenceSlug={slug} />
                    )}
                    {activeTab === 'speakers' && (
                        <ConferenceSpeakers conferenceSlug={slug} />
                    )}
                    {activeTab === 'submissions' && (
                        <ConferenceSubmissions conferenceSlug={slug} />
                    )}
                    {activeTab === 'register' && (
                        <ConferenceRegistration
                            conferenceSlug={slug}
                            onRegister={handleRegistration}
                            isRegistered={isRegistered}
                        />
                    )}
                </div>
            </div>

            <style jsx>{`
                .conference-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                . conference-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #e0e0e0;
                }

                .conference-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .conference-meta {
                    display: flex;
                    gap: 1 5rem;
                    flex-wrap: wrap;
                    color: #666;
                    font-size: 0.95rem;
                }

                . conference-meta span {
                    display: flex;
                    align-items: center;
                }

                . status {
                    padding: 0 25rem 0.75rem;
                    border-radius: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .status-published {
                    background-color: #e7f5e7;
                    color: #2e7d32;
                }

                .status-draft {
                    background-color: #fff3e0;
                    color: #f57c00;
                }

                .status-archived {
                    background-color: #f5f5f5;
                    color: #757575;
                }

                . conference-nav {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #e0e0e0;
                }

                .conference-nav button {
                    padding: 0.75rem 1.5rem;
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    font-size: 1rem;
                    color: #666;
                    transition: all 0.2s;
                }

                .conference-nav button:hover {
                    color: #333;
                    background-color: #f5f5f5;
                }

                .conference-nav button.active {
                    color: #1976d2;
                    border-bottom-color: #1976d2;
                }

                . conference-content {
                    background: white;
                    border-radius: 8px;
                    padding: 2rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .loading-container,
                .error-container {
                    text-align: center;
                    padding: 4rem 2rem;
                }

                .error-container h1 {
                    color: #d32f2f;
                    margin-bottom: 1rem;
                }
            `}</style>
        </DefaultLayout>
    );
}
