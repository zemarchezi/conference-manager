import { useState, useEffect } from 'react';

export default function ConferenceSchedule({ conferenceId, conferenceSlug }) {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const identifier = conferenceSlug || conferenceId;
                const response = await fetch(
                    `/api/v1/conferences/${identifier}/sections? section=schedule`,
                );
                const data = await response.json();
                setSchedule(data.schedule || []);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [conferenceId, conferenceSlug]);

    if (loading) return <p>Loading schedule...</p>;

    if (schedule.length === 0) {
        return <p>No schedule available yet.</p>;
    }

    return (
        <div className="conference-schedule">
            <h2>Conference Schedule</h2>
            <div className="schedule-list">
                {schedule.map((item) => (
                    <div key={item.id} className="schedule-item">
                        <div className="schedule-time">
                            <strong>
                                {new Date(item.start_time).toLocaleTimeString()}
                            </strong>
                            <span>-</span>
                            <strong>
                                {new Date(item.end_time).toLocaleTimeString()}
                            </strong>
                        </div>
                        <div className="schedule-details">
                            <h3>{item.title}</h3>
                            {item.location && (
                                <p className="location">📍 {item.location}</p>
                            )}
                            {item.description && (
                                <p className="description">
                                    {item.description}
                                </p>
                            )}
                            {item.speaker && (
                                <p className="speaker">🎤 {item.speaker}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .conference-schedule h2 {
                    margin-bottom: 1 5rem;
                }

                .schedule-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .schedule-item {
                    display: flex;
                    gap: 1 5rem;
                    padding: 1 5rem;
                    background: #f9f9f9;
                    border-radius: 8px;
                    border-left: 4px solid #1976d2;
                }

                .schedule-time {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                    min-width: 100px;
                    color: #1976d2;
                }

                .schedule-details {
                    flex: 1;
                }

                .schedule-details h3 {
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .location,
                .speaker {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }

                . description {
                    color: #555;
                    line-height: 1.6;
                }
            `}</style>
        </div>
    );
}
