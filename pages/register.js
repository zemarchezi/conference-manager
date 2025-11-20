import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        if (data.details) {
          const fieldErrors = {};
          data.details.forEach((detail) => {
            fieldErrors[detail.field] = detail.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || 'Registration failed' });
        }
      }
    } catch (err) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  if (success) {
    return (
      <>
        <Head>
          <title>Registration Successful - Conference Manager</title>
        </Head>
        <div className="container">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h1>Registration Successful!</h1>
            <p>Your account has been created. Redirecting to login...</p>
          </div>
        </div>
        <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .success-box {
            background: white;
            padding: 3rem;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
          }
          .success-icon {
            font-size: 4rem;
            color: #10b981;
            margin-bottom: 1rem;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Sign Up - Conference Manager</title>
      </Head>

      <div className="container">
        <div className="register-box">
          <h1>Create Account</h1>
          <p className="subtitle">Join Conference Manager to organize and participate in academic conferences.</p>

          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                disabled={loading}
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

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
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
                disabled={loading}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
              <small>Password must be at least 8 characters long</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                disabled={loading}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="footer-links">
            <p>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
            <p>
              <Link href="/">← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .register-box {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 450px;
        }

        h1 {
          margin-bottom: 0.5rem;
          color: #333;
          text-align: center;
        }

        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 600;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
        }

        input.error {
          border-color: #c33;
        }

        input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .field-error {
          display: block;
          color: #c33;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        small {
          display: block;
          color: #666;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .btn {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #5568d3;
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .footer-links {
          margin-top: 1.5rem;
          text-align: center;
        }

        .footer-links p {
          margin: 0.5rem 0;
          color: #666;
        }

        .footer-links a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .footer-links a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}