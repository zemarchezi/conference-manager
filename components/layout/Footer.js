import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            {/* About Section */}
            <div className="footer-section">
              <h3 className="footer-title">
                <span className="footer-icon">📊</span>
                Conference Manager
              </h3>
              <p className="footer-description">
                Streamline your academic conference organization with our comprehensive management platform.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="section-title">Quick Links</h4>
              <ul className="footer-links">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/conferences">Conferences</Link></li>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-section">
              <h4 className="section-title">Resources</h4>
              <ul className="footer-links">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/documentation">Documentation</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/support">Support</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-section">
              <h4 className="section-title">Legal</h4>
              <ul className="footer-links">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-bottom">
            <p className="copyright">
              &copy; {currentYear} Conference Manager. All rights reserved.
            </p>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                GitHub
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          background: #1f2937;
          color: #e5e7eb;
          margin-top: auto;
        }

        .footer-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 3rem 2rem 1.5rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .footer-icon {
          font-size: 1.5rem;
        }

        .footer-description {
          color: #9ca3af;
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.75rem 0;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-links li {
          margin: 0;
        }

        .footer-links a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
        }

        .footer-links a:hover {
          color: #667eea;
        }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid #374151;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .copyright {
          color: #9ca3af;
          margin: 0;
          font-size: 0.9rem;
        }

        .social-links {
          display: flex;
          gap: 1.5rem;
        }

        .social-links a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
        }

        .social-links a:hover {
          color: #667eea;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .footer-content {
            padding: 2rem 1.5rem 1rem;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
            padding-top: 1.5rem;
          }

          .social-links {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}