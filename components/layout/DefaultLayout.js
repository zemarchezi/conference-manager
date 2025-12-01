import Link from 'next/link';

export default function DefaultLayout({ children }) {
  return (
    <div className="default-layout">
      <header className="site-header">
        <div className="container">
          <Link href="/">
            <a className="logo">Conference Manager</a>
          </Link>
          <nav>
            <Link href="/conferences">
              <a>Conferences</a>
            </Link>
            <Link href="/dashboard">
              <a>Dashboard</a>
            </Link>
            <Link href="/login">
              <a>Login</a>
            </Link>
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

        . site-header {
          background: #1976d2;
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0. 1);
        }

        . container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1. 5rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
        }

        nav {
          display: flex;
          gap: 1. 5rem;
        }

        nav a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        nav a:hover {
          opacity: 0.8;
        }

        .main-content {
          flex: 1;
          padding: 2rem 0;
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
      `}</style>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
            Arial, sans-serif;
          color: #333;
        }
      `}</style>
    </div>
  );
}