import { useState, useEffect } from 'react';

export default function ConferenceSpeakers({ conferenceId, conferenceSlug }) {
    const [speakers, setSpeakers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpeakers = async () => {
            try {
                const identifier = conferenceSlug || conferenceId;
                const response = await fetch(
                    `/api/v1/conferences/${identifier}/sections? section=speakers`,
                );
                const data = await response.json();
                setSpeakers(data.speakers || []);
            } catch (error) {
                console.error('Error fetching speakers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSpeakers();
    }, [conferenceId, conferenceSlug]);

    if (loading) return <p>Loading speakers...</p>;

    if (speakers.length === 0) {
        return <p>No speakers announced yet.</p>;
    }

    return (
        <div className="conference-speakers">
            <h2>Conference Speakers</h2>
            <div className="speakers-grid">
                {speakers.map((speaker) => (
                    <div key={speaker.id} className="speaker-card">
                        <div className="speaker-avatar">
                            {speaker.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="speaker-info">
                            <h3>{speaker.username}</h3>
                            {speaker.presentation_title && (
                                <p className="presentation-title">
                                    {speaker.presentation_title}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .conference-speakers h2 {
                    margin-bottom: 1.5rem;
                }

                .speakers-grid {
                    display: grid;
                    grid-template-columns: repeat(
                        auto-fill,
                        minmax(280px, 1fr)
                    );
                    gap: 1 5rem;
                }

                .speaker-card {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: #f9f9f9;
                    border-radius: 8px;
                    transition: box-shadow 0.2s;
                }

                .speaker-card:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .speaker-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(
                        135deg,
                        #667eea 0%,
                        #764ba2 100%
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                    font-weight: bold;
                    flex-shrink: 0;
                }

                .speaker-info {
                    flex: 1;
                }

                .speaker-info h3 {
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .presentation-title {
                    color: #666;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
}
