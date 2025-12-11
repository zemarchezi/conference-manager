import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Conferences() {
    const [conferences, setConferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    useEffect(() => {
        checkAuth();
        fetchConferences();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/v1/users/me');
            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    const fetchConferences = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/conferences');
            if (response.ok) {
                const data = await response.json();
                setConferences(data);
            }
        } catch (error) {
            console.error('Error fetching conferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (conferenceId) => {
        try {
            const response = await fetch(
                `/api/v1/conferences/${conferenceId}/delete`,
                {
                    method: 'DELETE',
                },
            );

            if (response.ok) {
                setConferences(
                    conferences.filter((c) => c.id !== conferenceId),
                );
                setDeleteConfirmId(null);
                alert('Conference deleted successfully! ');
            } else {
                const errorData = await response.json();
                alert(`Failed to delete: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting conference:', error);
            alert('Failed to delete conference');
        }
    };

    const isOwner = (conference) => {
        return currentUser && conference.organizer_id === currentUser.id;
    };

    return (
        <>
            <Head>
                <title>Conferences - Conference Manager</title>
            </Head>

            <div className="page">
                <header className="header">
                    <div className="header-content">
                        <h1>Conference Manager</h1>
                        <nav>
                            <Link href="/">Home</Link>
                            {isAuthenticated ? (
                                <>
                                    <Link href="/dashboard">Dashboard</Link>
                                    <Link
                                        href="/conferences/create"
                                        className="btn-create"
                                    >
                                        Create Conference
                                    </Link>
                                </>
                            ) : (
                                <Link href="/login">Login</Link>
                            )}
                        </nav>
                    </div>
                </header>

                <div className="page-header">
                    <h1>Conferences</h1>
                    <p>Discover and participate in academic conferences</p>
                </div>

                <div className="container">
                    {loading ? (
                        <div className="loading">Loading conferences...</div>
                    ) : conferences.length > 0 ? (
                        <div className="grid">
                            {conferences.map((conference) => (
                                <div key={conference.id} className="card">
                                    <div className="card-header">
                                        <div>
                                            <h2>{conference.title}</h2>
                                            <span className="date">
                                                {new Date(
                                                    conference.start_date,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        {isOwner(conference) && (
                                            <span className="owner-badge">
                                                Your Conference
                                            </span>
                                        )}
                                    </div>
                                    <p className="location">
                                        📍 {conference.location}
                                    </p>
                                    <p className="description">
                                        {conference.description?.substring(
                                            0,
                                            150,
                                        )}
                                        {conference.description?.length > 150
                                            ? '...'
                                            : ''}
                                    </p>
                                    <div className="card-footer">
                                        <Link
                                            href={`/c/${conference.slug}`}
                                            className="btn"
                                        >
                                            View Conference →
                                        </Link>
                                        {isOwner(conference) && (
                                            <>
                                                {deleteConfirmId ===
                                                conference.id ? (
                                                    <div className="delete-confirm">
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    conference.id,
                                                                )
                                                            }
                                                            className="btn-delete-confirm"
                                                        >
                                                            Confirm Delete
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteConfirmId(
                                                                    null,
                                                                )
                                                            }
                                                            className="btn-cancel"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setDeleteConfirmId(
                                                                conference.id,
                                                            )
                                                        }
                                                        className="btn-delete"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty">
                            <h3>No conferences found</h3>
                            <p>Check back later for upcoming conferences. </p>
                            {isAuthenticated && (
                                <Link
                                    href="/conferences/create"
                                    className="btn-primary"
                                >
                                    Create Your Conference
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .page {
                    min-height: 100vh;
                    background: #f9fafb;
                }

                .header {
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 1rem 0;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header h1 {
                    font-size: 1.5rem;
                    color: #667eea;
                    margin: 0;
                }

                nav {
                    display: flex;
                    gap: 1 5rem;
                    align-items: center;
                }

                .page-header {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 3rem 2rem 2rem;
                    text-align: center;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                }

                .page-header p {
                    color: #6b7280;
                    font-size: 1.1rem;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem 4rem;
                }

                . loading {
                    text-align: center;
                    padding: 4rem;
                    color: #6b7280;
                }

                . grid {
                    display: grid;
                    grid-template-columns: repeat(
                        auto-fill,
                        minmax(350px, 1fr)
                    );
                    gap: 2rem;
                }

                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s;
                }

                .card:hover {
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    transform: translateY(-4px);
                }

                . card-header {
                    margin-bottom: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .card h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                    color: #111827;
                }

                .date {
                    color: #667eea;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                . owner-badge {
                    background: #10b981;
                    color: white;
                    padding: 0 25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .location {
                    color: #6b7280;
                    margin-bottom: 1rem;
                }

                .description {
                    color: #4b5563;
                    line-height: 1.6;
                    margin-bottom: 1 5rem;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .btn {
                    display: inline-block;
                    background: #667eea;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s;
                }

                .btn:hover {
                    background: #5568d3;
                    transform: translateX(4px);
                }

                . btn-delete {
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.3s;
                }

                .btn-delete:hover {
                    background: #dc2626;
                }

                .delete-confirm {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-delete-confirm {
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .btn-cancel {
                    background: #6b7280;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                }

                .btn-primary {
                    display: inline-block;
                    background: #667eea;
                    color: white;
                    padding: 0 75rem 1.5rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .empty {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 12px;
                }

                .empty h3 {
                    color: #111827;
                    margin-bottom: 0 5rem;
                }

                .empty p {
                    color: #6b7280;
                    margin-bottom: 1 5rem;
                }

                @media (max-width: 768px) {
                    .header-content {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .grid {
                        grid-template-columns: 1fr;
                    }

                    .card-footer {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .delete-confirm {
                        flex-direction: column;
                    }
                }
            `}</style>

            <style jsx global>{`
                nav a {
                    color: #374151 !important;
                    text-decoration: none !important;
                    font-weight: 500;
                    transition: color 0.3s;
                }

                nav a:hover {
                    color: #667eea !important;
                }

                nav . btn-create {
                    background: #667eea !important;
                    color: white !important;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                }

                nav .btn-create:hover {
                    background: #5568d3 !important;
                }
            `}</style>
        </>
    );
}
