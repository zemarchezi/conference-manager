import { useState } from 'react';

export default function ConferenceRegistration({
    conferenceId,
    conferenceSlug,
    onRegister,
    isRegistered,
}) {
    const [selectedRole, setSelectedRole] = useState('attendee');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onRegister(selectedRole);
        setIsSubmitting(false);
    };

    if (isRegistered) {
        return (
            <div className="registration-success">
                <h2>✓ You're Registered!</h2>
                <p>You have successfully registered for this conference.</p>
                <style jsx>{`
                    .registration-success {
                        text-align: center;
                        padding: 3rem;
                    }

                    .registration-success h2 {
                        color: #2e7d32;
                        margin-bottom: 1rem;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="conference-registration">
            <h2>Register for Conference</h2>
            <p className="intro">
                Join this conference and be part of an exciting academic event.
                Choose your role below.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="role-selection">
                    <label className="role-option">
                        <input
                            type="radio"
                            name="role"
                            value="attendee"
                            checked={selectedRole === 'attendee'}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        />
                        <div className="role-card">
                            <h3>Attendee</h3>
                            <p>Participate and attend conference sessions</p>
                        </div>
                    </label>

                    <label className="role-option">
                        <input
                            type="radio"
                            name="role"
                            value="speaker"
                            checked={selectedRole === 'speaker'}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        />
                        <div className="role-card">
                            <h3>Speaker</h3>
                            <p>Present your research and submit abstracts</p>
                        </div>
                    </label>

                    <label className="role-option">
                        <input
                            type="radio"
                            name="role"
                            value="reviewer"
                            checked={selectedRole === 'reviewer'}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        />
                        <div className="role-card">
                            <h3>Reviewer</h3>
                            <p>
                                Review submitted abstracts and provide feedback
                            </p>
                        </div>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="register-button"
                >
                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </button>
            </form>

            <style jsx>{`
                .conference-registration {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .conference-registration h2 {
                    margin-bottom: 1rem;
                }

                .intro {
                    color: #666;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .role-selection {
                    display: grid;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .role-option {
                    cursor: pointer;
                }

                .role-option input[type='radio'] {
                    display: none;
                }

                .role-card {
                    padding: 1 5rem;
                    background: #f9f9f9;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .role-option input[type='radio']:checked + . role-card {
                    border-color: #1976d2;
                    background: #e3f2fd;
                }

                .role-card:hover {
                    border-color: #1976d2;
                }

                .role-card h3 {
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .role-card p {
                    color: #666;
                    font-size: 0.9rem;
                }

                .register-button {
                    width: 100%;
                    padding: 1rem 2rem;
                    background: #1976d2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0 2s;
                }

                .register-button:hover:not(:disabled) {
                    background: #1565c0;
                }

                .register-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
