import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function SubmitAbstract() {
  const router = useRouter();
  const { slug } = router.query;
  const [conference, setConference] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    keywords: '',
  });

  useEffect(() => {
    if (slug) {
      checkAuthAndFetchData();
    }
  }, [slug]);

  const checkAuthAndFetchData = async () => {
    try {
      // Check if user is authenticated
      const userResponse = await fetch('/api/v1/users/me');
      setIsAuthenticated(userResponse.ok);

      const confResponse = await fetch(`/api/v1/conferences/by-slug/${slug}`);
      const confData = await confResponse.json();
      setConference(confData);

      const settingsResponse = await fetch(`/api/v1/conferences/${confData.id}/settings`);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const keywords = formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k);

      const response = await fetch(`/api/v1/conferences/${conference.id}/abstracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          keywords,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit abstract');
      }

      setSuccess(true);
      setFormData({ title: '', content: '', keywords: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!conference) return <div>Conference not found</div>;

  if (!settings?.enable_abstract_submission) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          <h1>Submissions Closed</h1>
          <p>Abstract submission is not currently available for this conference.</p>
          <Link href={`/c/${slug}`}>Return to Conference Page</Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          <h1>Authentication Required</h1>
          <p>You need to be logged in to submit an abstract.</p>
          <Link href={`/login?redirect=/c/${slug}/submit`} style={styles.loginButton}>
            Log In
          </Link>
          <p style={{ marginTop: '15px' }}>
            Don't have an account? <Link href="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Submit Abstract - {conference.title}</title>
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <Link href={`/c/${slug}`} style={styles.backLink}>← Back to Conference</Link>
          <h1 style={styles.title}>Submit Your Abstract</h1>
          <p style={styles.subtitle}>{conference.title}</p>
        </header>

        <div style={styles.content}>
          {success ? (
            <div style={styles.successMessage}>
              <h2>✅ Abstract Submitted Successfully!</h2>
              <p>Your abstract has been submitted and is now under review.</p>
              <Link href={`/c/${slug}`} style={styles.returnButton}>
                Return to Conference
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              {error && (
                <div style={styles.error}>
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={settings?.abstract_max_length || 300}
                  placeholder="Enter your abstract title"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Abstract Content * 
                  <span style={styles.charCount}>
                    {formData.content.length}/{settings?.abstract_max_length || 5000}
                  </span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="12"
                  maxLength={settings?.abstract_max_length || 5000}
                  placeholder="Enter your abstract content"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Keywords {settings?.keywords_required && '*'}
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  required={settings?.keywords_required}
                  placeholder="Enter keywords separated by commas (e.g., machine learning, AI, neural networks)"
                  style={styles.input}
                />
                <p style={styles.hint}>Separate multiple keywords with commas</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitButton,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Abstract'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: '30px 20px',
    borderBottom: '1px solid #e5e7eb',
  },
  backLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500',
    marginBottom: '10px',
    display: 'inline-block',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '10px 0',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '5px 0 0 0',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  message: {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '12px',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '100px auto',
  },
  loginButton: {
    display: 'inline-block',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '20px',
  },
  form: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  error: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  successMessage: {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  returnButton: {
    display: 'inline-block',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '20px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px',
  },
  charCount: {
    fontWeight: 'normal',
    color: '#6b7280',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.6',
    boxSizing: 'border-box',
  },
  hint: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '5px',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    transition: 'background-color 0.3s',
  },
};