import { useState } from 'react';

export default function RegistrationFormBuilder({ conferenceId, onSave }) {
    const [fields, setFields] = useState([]);
    const [showAddField, setShowAddField] = useState(false);
    const [newField, setNewField] = useState({
        field_name: '',
        field_type: 'text',
        field_label: '',
        field_options: [],
        placeholder: '',
        help_text: '',
        is_required: false,
        display_order: fields.length,
    });

    const fieldTypes = [
        { value: 'text', label: 'Short Text' },
        { value: 'textarea', label: 'Long Text' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone Number' },
        { value: 'number', label: 'Number' },
        { value: 'date', label: 'Date' },
        { value: 'select', label: 'Dropdown' },
        { value: 'multiselect', label: 'Multiple Choice (Checkboxes)' },
        { value: 'radio', label: 'Single Choice (Radio)' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'file', label: 'File Upload' },
    ];

    const needsOptions = ['select', 'multiselect', 'radio'].includes(
        newField.field_type,
    );

    const handleAddField = async () => {
        try {
            const fieldToSave = {
                ...newField,
                field_name:
                    newField.field_name ||
                    newField.field_label.toLowerCase().replace(/\s+/g, '_'),
            };

            const response = await fetch(
                `/api/v1/conferences/${conferenceId}/registration-fields`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fieldToSave),
                },
            );

            if (response.ok) {
                const savedField = await response.json();
                setFields([...fields, savedField]);
                setNewField({
                    field_name: '',
                    field_type: 'text',
                    field_label: '',
                    field_options: [],
                    placeholder: '',
                    help_text: '',
                    is_required: false,
                    display_order: fields.length + 1,
                });
                setShowAddField(false);
                if (onSave) onSave();
            }
        } catch (error) {
            console.error('Error adding field:', error);
            alert('Failed to add field');
        }
    };

    const handleDeleteField = async (fieldId) => {
        if (!confirm('Are you sure you want to delete this field?')) return;

        try {
            const response = await fetch(
                `/api/v1/conferences/${conferenceId}/registration-fields/${fieldId}`,
                { method: 'DELETE' },
            );

            if (response.ok) {
                setFields(fields.filter((f) => f.id !== fieldId));
                if (onSave) onSave();
            }
        } catch (error) {
            console.error('Error deleting field:', error);
        }
    };

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
        }
    };

    useState(() => {
        loadFields();
    }, [conferenceId]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Registration Form Builder</h2>
                <button
                    onClick={() => setShowAddField(true)}
                    style={styles.btnPrimary}
                >
                    + Add Field
                </button>
            </div>

            {/* Existing Fields */}
            <div style={styles.fieldsList}>
                {fields.length === 0 ? (
                    <p style={styles.emptyState}>
                        No fields added yet. Click "Add Field" to get started.
                    </p>
                ) : (
                    fields.map((field, index) => (
                        <div key={field.id} style={styles.fieldItem}>
                            <div style={styles.fieldHeader}>
                                <span style={styles.fieldOrder}>
                                    #{index + 1}
                                </span>
                                <span style={styles.fieldLabel}>
                                    {field.field_label}
                                    {field.is_required && (
                                        <span style={styles.required}>*</span>
                                    )}
                                </span>
                                <span style={styles.fieldType}>
                                    {field.field_type}
                                </span>
                            </div>
                            <div style={styles.fieldActions}>
                                <button
                                    onClick={() => handleDeleteField(field.id)}
                                    style={styles.btnDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Field Modal */}
            {showAddField && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3>Add New Field</h3>

                        <div style={styles.formGroup}>
                            <label>Field Label *</label>
                            <input
                                type="text"
                                value={newField.field_label}
                                onChange={(e) =>
                                    setNewField({
                                        ...newField,
                                        field_label: e.target.value,
                                    })
                                }
                                placeholder="e.g., Dietary Restrictions"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Field Type *</label>
                            <select
                                value={newField.field_type}
                                onChange={(e) =>
                                    setNewField({
                                        ...newField,
                                        field_type: e.target.value,
                                    })
                                }
                                style={styles.input}
                            >
                                {fieldTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {needsOptions && (
                            <div style={styles.formGroup}>
                                <label>Options (comma-separated) *</label>
                                <input
                                    type="text"
                                    placeholder="Option 1, Option 2, Option 3"
                                    onChange={(e) =>
                                        setNewField({
                                            ...newField,
                                            field_options: e.target.value
                                                .split(',')
                                                .map((s) => s.trim()),
                                        })
                                    }
                                    style={styles.input}
                                />
                            </div>
                        )}

                        <div style={styles.formGroup}>
                            <label>Placeholder</label>
                            <input
                                type="text"
                                value={newField.placeholder}
                                onChange={(e) =>
                                    setNewField({
                                        ...newField,
                                        placeholder: e.target.value,
                                    })
                                }
                                placeholder="Placeholder text"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Help Text</label>
                            <textarea
                                value={newField.help_text}
                                onChange={(e) =>
                                    setNewField({
                                        ...newField,
                                        help_text: e.target.value,
                                    })
                                }
                                placeholder="Additional information for this field"
                                style={styles.textarea}
                                rows={2}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={newField.is_required}
                                    onChange={(e) =>
                                        setNewField({
                                            ...newField,
                                            is_required: e.target.checked,
                                        })
                                    }
                                />
                                <span>Required field</span>
                            </label>
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                onClick={handleAddField}
                                style={styles.btnPrimary}
                            >
                                Add Field
                            </button>
                            <button
                                onClick={() => setShowAddField(false)}
                                style={styles.btnSecondary}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    btnPrimary: {
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    fieldsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    emptyState: {
        textAlign: 'center',
        color: '#6b7280',
        padding: '3rem',
    },
    fieldItem: {
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fieldHeader: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flex: 1,
    },
    fieldOrder: {
        backgroundColor: '#f3f4f6',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: '600',
    },
    fieldLabel: {
        fontWeight: '500',
        flex: 1,
    },
    required: {
        color: '#ef4444',
        marginLeft: '0.25rem',
    },
    fieldType: {
        color: '#6b7280',
        fontSize: '0.875rem',
        backgroundColor: '#f9fafb',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
    },
    fieldActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    btnDelete: {
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        fontSize: '1rem',
        marginTop: '0.5rem',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        fontSize: '1rem',
        marginTop: '0.5rem',
        fontFamily: 'inherit',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
    },
    btnSecondary: {
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};
