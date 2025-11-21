import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Head>
        <title>Login - Conference Manager</title>
      </Head>

      <div className="page-container">
        <div className="login-box">
          <div className="logo-section">
            <span className="logo-icon">📊</span>
            <h1>Sign In</h1>
          </div>
          <p className="subtitle">Welcome back! Please sign in to your account.</p>

          <ErrorMessage message={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="footer-links">
            <p>
              Don't have an account? <Link href="/register">Sign up</Link>
            </p>
            <p>
              <Link href="/">← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .login-box {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 440px;
        }

        .logo-section {
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .logo-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        h1 {
          margin: 0;
          color: #111827;
          font-size: 1.875rem;
          font-weight: 700;
        }

        .subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s;
          outline: none;
        }

        .form-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .btn-full {
          width: 100%;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .footer-links {
          margin-top: 2rem;
          text-align: center;
        }

        .footer-links p {
          margin: 0.75rem 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .footer-links a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .footer-links a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .page-container {
            padding: 1rem;
          }

          .login-box {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </>
  );
}