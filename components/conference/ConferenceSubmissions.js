import { useState, useEffect } from 'react';

export default function ConferenceSubmissions({
    conferenceId,
    conferenceSlug,
}) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const identifier = conferenceSlug || conferenceId;
                const response = await fetch(
                    `/api/v1/conferences/${identifier}/sections?section=submissions`,
                );
                const data = await response.json();
                setSubmissions(data.submissions || []);
            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [conferenceId, conferenceSlug]);

    if (loading) return <p>Loading submissions...</p>;

    if (submissions.length === 0) {
        return (
            <div>
                <p>No submissions available yet.</p>
                <p>Be the first to submit an abstract!</p>
            </div>
        );
    }

    return (
        <div className="conference-submissions">
            <h2>Conference Submissions</h2>
            <div className="submissions-list">
                {submissions.map((submission) => (
                    <div key={submission.id} className="submission-card">
                        <h3>{submission.title}</h3>
                        <p className="submission-content">
                            {submission.content
                                ? submission.content.substring(0, 200)
                                : submission.abstract}
                            {(submission.content?.length > 200 ||
                                submission.abstract?.length > 200) &&
                                '...'}
                        </p>
                        <div className="submission-meta">
                            <span
                                className={`status status-${submission.status}`}
                            >
                                {submission.status}
                            </span>
                            <span className="date">
                                Submitted:{' '}
                                {new Date(
                                    submission.created_at,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .conference-submissions h2 {
                    margin-bottom: 1.5rem;
                }

                .submissions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .submission-card {
                    padding: 1.5rem;
                    background: #f9f9f9;
                    border-radius: 8px;
                    border-left: 4px solid #1976d2;
                }

                .submission-card h3 {
                    margin-bottom: 0.75rem;
                    color: #333;
                }

                .submission-content {
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .submission-meta {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .status-pending,
                .status-submitted {
                    background-color: #fff3e0;
                    color: #f57c00;
                }

                .status-accepted {
                    background-color: #e7f5e7;
                    color: #2e7d32;
                }

                . status-rejected {
                    background-color: #ffebee;
                    color: #c62828;
                }

                .date {
                    color: #666;
                    font-size: 0 9rem;
                }
            `}</style>
        </div>
    );
}
