import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateConference() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    submission_deadline: '',
    organization_id: null,
    settings: {
      primary_color: '#3b82f6',
      secondary_color: '#1e40af',
      enable_reviews: true,
      enable_public_schedule: true,
      enable_abstract_submission: true,
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingChange = (setting, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [setting]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/conferences/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create conference');
      }

      // Redirect to conference dashboard
      router.push(`/conferences/${data.slug}/dashboard`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div style={styles.container}>
      <div style={styles.wizard}>
        <h1 style={styles.mainTitle}>Create Your Conference</h1>
        
        {/* Progress Steps */}
        <div style={styles.stepIndicator}>
          <div style={{ ...styles.stepItem, ...(step >= 1 ? styles.stepActive : {}) }}>
            <div style={styles.stepNumber}>1</div>
            <span style={styles.stepLabel}>Basic Info</span>
          </div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.stepItem, ...(step >= 2 ? styles.stepActive : {}) }}>
            <div style={styles.stepNumber}>2</div>
            <span style={styles.stepLabel}>Settings</span>
          </div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.stepItem, ...(step >= 3 ? styles.stepActive : {}) }}>
            <div style={styles.stepNumber}>3</div>
            <span style={styles.stepLabel}>Review</span>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div style={styles.stepContent}>
              <h2 style={styles.stepTitle}>Basic Information</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Conference Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., International Conference on AI 2025"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Describe your conference..."
                  style={{ ...styles.input, ...styles.textarea }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, USA or Virtual"
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Submission Deadline</label>
                <input
                  type="date"
                  name="submission_deadline"
                  value={formData.submission_deadline}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.buttonGroup}>
                <button type="button" onClick={nextStep} style={styles.primaryButton}>
                  Next: Settings →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Settings & Customization */}
          {step === 2 && (
            <div style={styles.stepContent}>
              <h2 style={styles.stepTitle}>Conference Settings</h2>

              <div style={styles.formGroup}>
                <h3 style={styles.sectionTitle}>Branding</h3>
                
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Primary Color</label>
                    <input
                      type="color"
                      value={formData.settings.primary_color}
                      onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                      style={styles.colorInput}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Secondary Color</label>
                    <input
                      type="color"
                      value={formData.settings.secondary_color}
                      onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                      style={styles.colorInput}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <h3 style={styles.sectionTitle}>Features</h3>
                
                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.settings.enable_abstract_submission}
                    onChange={(e) => handleSettingChange('enable_abstract_submission', e.target.checked)}
                  />
                  <span style={styles.checkboxLabel}>Enable Abstract Submissions</span>
                </label>

                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.settings.enable_reviews}
                    onChange={(e) => handleSettingChange('enable_reviews', e.target.checked)}
                  />
                  <span style={styles.checkboxLabel}>Enable Peer Review System</span>
                </label>

                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.settings.enable_public_schedule}
                    onChange={(e) => handleSettingChange('enable_public_schedule', e.target.checked)}
                  />
                  <span style={styles.checkboxLabel}>Make Schedule Public</span>
                </label>
              </div>

              <div style={styles.buttonGroup}>
                <button type="button" onClick={prevStep} style={styles.secondaryButton}>
                  ← Back
                </button>
                <button type="button" onClick={nextStep} style={styles.primaryButton}>
                  Next: Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div style={styles.stepContent}>
              <h2 style={styles.stepTitle}>Review Your Conference</h2>

              <div style={styles.reviewSection}>
                <h3 style={styles.reviewTitle}>Basic Information</h3>
                <div style={styles.reviewItem}>
                  <strong>Title:</strong> {formData.title}
                </div>
                <div style={styles.reviewItem}>
                  <strong>Description:</strong> {formData.description}
                </div>
                <div style={styles.reviewItem}>
                  <strong>Location:</strong> {formData.location || 'Not specified'}
                </div>
                <div style={styles.reviewItem}>
                  <strong>Dates:</strong> {formData.start_date} to {formData.end_date}
                </div>
                {formData.submission_deadline && (
                  <div style={styles.reviewItem}>
                    <strong>Submission Deadline:</strong> {formData.submission_deadline}
                  </div>
                )}
              </div>

              <div style={styles.reviewSection}>
                <h3 style={styles.reviewTitle}>Features Enabled</h3>
                <ul style={styles.featureList}>
                  {formData.settings.enable_abstract_submission && <li>✓ Abstract Submissions</li>}
                  {formData.settings.enable_reviews && <li>✓ Peer Review System</li>}
                  {formData.settings.enable_public_schedule && <li>✓ Public Schedule</li>}
                </ul>
              </div>

              <div style={styles.buttonGroup}>
                <button type="button" onClick={prevStep} style={styles.secondaryButton}>
                  ← Back
                </button>
                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? 'Creating...' : '🚀 Create Conference'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '40px 20px',
  },
  wizard: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '40px',
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '32px',
    textAlign: 'center',
    color: '#1e293b',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '48px',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    opacity: 0.4,
  },
  stepActive: {
    opacity: 1,
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  stepLabel: {
    fontSize: '14px',
    fontWeight: '500',
  },
  stepLine: {
    width: '100px',
    height: '2px',
    backgroundColor: '#e2e8f0',
    margin: '0 16px',
    marginBottom: '28px',
  },
  error: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '24px',
  },
  stepContent: {
    marginTop: '24px',
  },
  stepTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#1e293b',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#475569',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  colorInput: {
    width: '100px',
    height: '40px',
    padding: '4px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#334155',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    marginLeft: '8px',
    fontSize: '15px',
    color: '#475569',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '32px',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#3b82f6',
    border: '2px solid #3b82f6',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  reviewSection: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  reviewTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1e293b',
  },
  reviewItem: {
    marginBottom: '12px',
    fontSize: '15px',
    color: '#475569',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
};