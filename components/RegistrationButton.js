import { useState, useEffect } from 'react';

export default function RegistrationButton({ conferenceId, conferenceSlug }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [registration, setRegistration] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuthAndRegistration();
    }, [conferenceId]);

    const checkAuthAndRegistration = async () => {
        setLoading(true);
        try {
            // Check authentication
            const authResponse = await fetch('/api/v1/users/me');
            const authenticated = authResponse.ok;
            setIsAuthenticated(authenticated);

            if (authenticated) {
                // Check if already registered
                const regResponse = await fetch(
                    `/api/v1/conferences/${conferenceId}/registrations/my-registration`,
                );
                if (regResponse.ok) {
                    const regData = await regResponse.json();
                    setRegistration(regData);
                }
            }
        } catch (err) {
            console.error('Error checking registration:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (registrationData) => {
        setRegistering(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/v1/conferences/${conferenceId}/registrations`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registrationData),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to register');
            }

            const newRegistration = await response.json();
            setRegistration(newRegistration);
            setShowModal(false);
            alert(
                'Registration successful!  Check your email for confirmation.',
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setRegistering(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your registration?')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/conferences/${conferenceId}/registrations/my-registration`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                throw new Error('Failed to cancel registration');
            }

            setRegistration(null);
            alert('Registration cancelled successfully');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <button style={styles.button} disabled>
                Loading...
            </button>
        );
    }

    if (!isAuthenticated) {
        return (
            <a
                href={`/c/${conferenceSlug}/login? redirect=/c/${conferenceSlug}`}
                style={styles.button}
            >
                Login to Register
            </a>
        );
    }

    if (registration) {
        if (registration.status === 'cancelled') {
            return (
                <button
                    onClick={() => setShowModal(true)}
                    style={styles.button}
                >
                    Register Again
                </button>
            );
        }

        return (
            <div style={styles.registeredContainer}>
                <div style={styles.registeredBadge}>
                    ✓ Registered
                    {registration.confirmation_code && (
                        <span style={styles.confirmationCode}>
                            Code: {registration.confirmation_code}
                        </span>
                    )}
                </div>
                <button onClick={handleCancel} style={styles.cancelButton}>
                    Cancel Registration
                </button>
            </div>
        );
    }

    return (
        <>
            <button onClick={() => setShowModal(true)} style={styles.button}>
                Register for Conference
            </button>

            {showModal && (
                <RegistrationModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleRegister}
                    loading={registering}
                    error={error}
                />
            )}
        </>
    );
}

function RegistrationModal({ onClose, onSubmit, loading, error }) {
    const [formData, setFormData] = useState({
        registration_type: 'regular',
        dietary_requirements: '',
        accessibility_needs: '',
        tshirt_size: '',
        emergency_contact: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const registrationData = {
            registration_type: formData.registration_type,
            registration_data: {
                dietary_requirements: formData.dietary_requirements,
                accessibility_needs: formData.accessibility_needs,
                tshirt_size: formData.tshirt_size,
                emergency_contact: formData.emergency_contact,
            },
        };

        onSubmit(registrationData);
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2>Register for Conference</h2>
                    <button onClick={onClose} style={styles.closeButton}>
                        ×
                    </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Registration Type</label>
                        <select
                            value={formData.registration_type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    registration_type: e.target.value,
                                })
                            }
                            style={styles.select}
                        >
                            <option value="regular">Regular Attendee</option>
                            <option value="student">Student</option>
                            <option value="speaker">Speaker</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Dietary Requirements (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.dietary_requirements}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    dietary_requirements: e.target.value,
                                })
                            }
                            placeholder="e.g., Vegetarian, Vegan, Gluten-free"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Accessibility Needs (Optional)
                        </label>
                        <textarea
                            value={formData.accessibility_needs}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    accessibility_needs: e.target.value,
                                })
                            }
                            placeholder="Any accessibility requirements we should know about"
                            style={styles.textarea}
                            rows={3}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            T-Shirt Size (Optional)
                        </label>
                        <select
                            value={formData.tshirt_size}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tshirt_size: e.target.value,
                                })
                            }
                            style={styles.select}
                        >
                            <option value="">Select size</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Emergency Contact (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.emergency_contact}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    emergency_contact: e.target.value,
                                })
                            }
                            placeholder="Name and phone number"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.modalFooter}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={styles.submitBtn}
                        >
                            {loading
                                ? 'Registering...'
                                : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    button: {
        background: '#10b981',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'background 0.3s',
    },
    registeredContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-start',
    },
    registeredBadge: {
        background: '#10b981',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    confirmationCode: {
        fontSize: '12px',
        opacity: 0.9,
    },
    cancelButton: {
        background: 'transparent',
        color: '#ef4444',
        border: '1px solid #ef4444',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0. 6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalHeader: {
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '32px',
        cursor: 'pointer',
        color: '#6b7280',
        padding: 0,
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        padding: '20px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: '#374151',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    error: {
        background: '#fee2e2',
        color: '#991b1b',
        padding: '12px',
        borderRadius: '6px',
        margin: '0 20px 20px',
    },
    modalFooter: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
    },
    cancelBtn: {
        padding: '10px 20px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        background: 'white',
        cursor: 'pointer',
        fontSize: '14px',
    },
    submitBtn: {
        padding: '10px 20px',
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
};
