import { useState, useEffect } from 'react';

export default function DynamicRegistrationForm({ conferenceId, onSuccess }) {
    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadFields();
    }, [conferenceId]);

    const loadFields = async () => {
        try {
            const response = await fetch(
                `/api/v1/conferences/${conferenceId}/registration-fields`,
            );
            if (response.ok) {
                const data = await response.json();
                setFields(data);
            }
        } catch (error) {
            console.error('Error loading fields:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (fieldName, value) => {
        setFormData({ ...formData, [fieldName]: value });
        if (errors[fieldName]) {
            setErrors({ ...errors, [fieldName]: null });
        }
    };

    const handleMultiSelect = (fieldName, option) => {
        const current = formData[fieldName] || [];
        const updated = current.includes(option)
            ? current.filter((item) => item !== option)
            : [...current, option];
        handleChange(fieldName, updated);
    };

    const validate = () => {
        const newErrors = {};

        fields.forEach((field) => {
            if (field.is_required && !formData[field.field_name]) {
                newErrors[field.field_name] =
                    `${field.field_label} is required`;
            }

            if (field.field_type === 'email' && formData[field.field_name]) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData[field.field_name])) {
                    newErrors[field.field_name] = 'Invalid email address';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(
                `/api/v1/conferences/${conferenceId}/registrations`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ registration_data: formData }),
                },
            );

            if (response.ok) {
                if (onSuccess) onSuccess();
            } else {
                const data = await response.json();
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error submitting registration:', error);
            alert('An error occurred.  Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderField = (field) => {
        const commonProps = {
            style: styles.input,
            placeholder: field.placeholder,
        };

        switch (field.field_type) {
            case 'text':
            case 'email':
            case 'phone':
                return (
                    <input
                        type={field.field_type}
                        value={formData[field.field_name] || ''}
                        onChange={(e) =>
                            handleChange(field.field_name, e.target.value)
                        }
                        {...commonProps}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={formData[field.field_name] || ''}
                        onChange={(e) =>
                            handleChange(field.field_name, e.target.value)
                        }
                        rows={4}
                        style={{ ...styles.input, ...styles.textarea }}
                        placeholder={field.placeholder}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={formData[field.field_name] || ''}
                        onChange={(e) =>
                            handleChange(field.field_name, e.target.value)
                        }
                        {...commonProps}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={formData[field.field_name] || ''}
                        onChange={(e) =>
                            handleChange(field.field_name, e.target.value)
                        }
                        style={styles.input}
                    />
                );

            case 'select':
                return (
                    <select
                        value={formData[field.field_name] || ''}
                        onChange={(e) =>
                            handleChange(field.field_name, e.target.value)
                        }
                        style={styles.input}
                    >
                        <option value="">-- Select --</option>
                        {field.field_options?.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case 'radio':
                return (
                    <div style={styles.optionsContainer}>
                        {field.field_options?.map((option) => (
                            <label key={option} style={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name={field.field_name}
                                    value={option}
                                    checked={
                                        formData[field.field_name] === option
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            field.field_name,
                                            e.target.value,
                                        )
                                    }
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'multiselect':
                return (
                    <div style={styles.optionsContainer}>
                        {field.field_options?.map((option) => (
                            <label key={option} style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={(
                                        formData[field.field_name] || []
                                    ).includes(option)}
                                    onChange={() =>
                                        handleMultiSelect(
                                            field.field_name,
                                            option,
                                        )
                                    }
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={formData[field.field_name] || false}
                            onChange={(e) =>
                                handleChange(field.field_name, e.target.checked)
                            }
                        />
                        <span>{field.placeholder || 'Yes'}</span>
                    </label>
                );

            default:
                return <p>Unsupported field type: {field.field_type}</p>;
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading registration form...</div>;
    }

    if (fields.length === 0) {
        return (
            <div style={styles.emptyState}>
                <p>Registration form is not available yet. </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.title}>Conference Registration</h2>

            {fields.map((field) => (
                <div key={field.id} style={styles.fieldGroup}>
                    <label style={styles.label}>
                        {field.field_label}
                        {field.is_required && (
                            <span style={styles.required}>*</span>
                        )}
                    </label>

                    {field.help_text && (
                        <p style={styles.helpText}>{field.help_text}</p>
                    )}

                    {renderField(field)}

                    {errors[field.field_name] && (
                        <span style={styles.error}>
                            {errors[field.field_name]}
                        </span>
                    )}
                </div>
            ))}

            <button
                type="submit"
                disabled={submitting}
                style={styles.submitButton}
            >
                {submitting ? 'Submitting...' : 'Complete Registration'}
            </button>
        </form>
    );
}

const styles = {
    form: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: '700',
        marginBottom: '2rem',
        color: '#111827',
    },
    fieldGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#374151',
    },
    required: {
        color: '#ef4444',
        marginLeft: '0.25rem',
    },
    helpText: {
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '0.5rem',
        marginTop: '-0.25rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '1rem',
        transition: 'border-color 0.3s',
    },
    textarea: {
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    optionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
    },
    error: {
        color: '#ef4444',
        fontSize: '0.875rem',
        marginTop: '0.5rem',
        display: 'block',
    },
    submitButton: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '2rem',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280',
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
    },
};
