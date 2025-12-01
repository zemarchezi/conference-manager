import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="default-layout">
      <header className="site-header">
        <div className="container">
          <Link href="/" className="logo">
            Conference Manager
          </Link>
          <nav>
            <Link href="/conferences">Conferences</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/login">Login</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; 2025 Conference Manager. All rights reserved. </p>
        </div>
      </footer>

      <style jsx>{`
        .default-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .site-header {
          background: #1976d2;
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        nav {
          display: flex;
          gap: 1. 5rem;
        }

        .site-footer {
          background: #f5f5f5;
          padding: 2rem 0;
          margin-top: 4rem;
          text-align: center;
        }

        .site-footer p {
          color: #666;
          margin: 0;
        }

        .main-content {
          flex: 1;
          padding: 2rem 0;
        }
      `}</style>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif;
          color: #333;
        }

        . logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white ! important;
          text-decoration: none ! important;
        }

        nav a {
          color: white ! important;
          text-decoration: none !important;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        nav a:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}