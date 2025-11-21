import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/users/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/sessions', { method: 'DELETE' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <Link href="/" className="logo">
              <span className="logo-icon">📊</span>
              <span className="logo-text">Conference Manager</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Navigation */}
          <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/conferences" className="nav-link">
              Conferences
            </Link>
            
            {user ? (
              <>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link href={`/profile/${user.username}`} className="nav-link">
                  Profile
                </Link>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">
                  Sign In
                </Link>
                <Link href="/register" className="btn-register">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <style jsx>{`
        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .header-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          flex-shrink: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #111827;
          font-weight: 700;
          font-size: 1.25rem;
          transition: color 0.3s;
        }

        .logo:hover {
          color: #667eea;
        }

        .logo-icon {
          font-size: 1.5rem;
        }

        .logo-text {
          display: inline-block;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 1001;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 24px;
        }

        .hamburger span {
          display: block;
          height: 2px;
          background: #374151;
          border-radius: 2px;
          transition: all 0.3s;
        }

        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.3s;
          position: relative;
        }

        .nav-link:hover {
          color: #667eea;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #667eea;
          transition: width 0.3s;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .btn-logout {
          background: transparent;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-logout:hover {
          background: #fee;
          border-color: #ef4444;
          color: #ef4444;
        }

        .btn-register {
          background: #667eea;
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s;
          display: inline-block;
        }

        .btn-register:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block;
          }

          .logo-text {
            font-size: 1rem;
          }

          .nav {
            position: fixed;
            top: 0;
            right: -100%;
            height: 100vh;
            width: 280px;
            background: white;
            flex-direction: column;
            align-items: flex-start;
            padding: 5rem 2rem 2rem;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
            transition: right 0.3s ease;
            gap: 1.5rem;
          }

          .nav.mobile-open {
            right: 0;
          }

          .nav-link {
            width: 100%;
            padding: 0.75rem 0;
            font-size: 1.1rem;
          }

          .btn-logout,
          .btn-register {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .header-content {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
}