import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function MyRegistrations() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const authResponse = await fetch('/api/v1/users/me');
      if (! authResponse.ok) {
        router.push('/login? redirect=/dashboard/registrations');
        return;
      }
      setIsAuthenticated(true);

      const response = await fetch('/api/v1/users/me/registrations');
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: { bg: '#10b981', text: 'Confirmed' },
      pending: { bg: '#f59e0b', text: 'Pending' },
      cancelled: { bg: '#ef4444', text: 'Cancelled' },
      waitlist: { bg: '#6b7280', text: 'Waitlist' },
    };

    const style = statusStyles[status] || statusStyles.pending;

    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: 'white',
      }}>
        {style.text}
      </span>
    );
  };

  if (loading) {
    return <div style={styles.loading}>Loading your registrations...</div>;
  }

  return (
    <>
      <Head>
        <title>My Registrations - Conference Manager</title>
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1>Conference Manager</h1>
            <nav style={styles.nav}>
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/conferences">Conferences</Link>
            </nav>
          </div>
        </header>

        <div style={styles.pageHeader}>
          <h1>My Conference Registrations</h1>
          <p>View and manage all your conference registrations</p>
        </div>

        <div style={styles.content}>
          {registrations.length === 0 ?  (
            <div style={styles.empty}>
              <h3>No Registrations Yet</h3>
              <p>You haven't registered for any conferences. </p>
              <Link href="/conferences" style={styles.browseButton}>
                Browse Conferences
              </Link>
            </div>
          ) : (
            <div style={styles.registrationsList}>
              {registrations. map((reg) => (
                <div key={reg.id} style={styles.registrationCard}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.conferenceTitle}>{reg.conference_title}</h3>
                      <p style={styles.conferenceDates}>
                        📅 {new Date(reg. start_date).toLocaleDateString()} - {new Date(reg.end_date).toLocaleDateString()}
                      </p>
                      <p style={styles.conferenceLocation}>📍 {reg.location}</p>
                    </div>
                    {getStatusBadge(reg.status)}
                  </div>

                  <div style={styles. cardDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Registration Type:</span>
                      <span style={styles.detailValue}>{reg.registration_type}</span>
                    </div>
                    <div style={styles. detailItem}>
                      <span style={styles.detailLabel}>Confirmation Code:</span>
                      <span style={styles. confirmationCode}>{reg.confirmation_code}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles. detailLabel}>Registered On:</span>
                      <span style={styles.detailValue}>
                        {new Date(reg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={styles. cardActions}>
                    <Link href={`/c/${reg.conference_slug}`} style={styles.viewButton}>
                      View Conference →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
    fontSize: '18px',
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 0',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  pageHeader: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem 2rem',
    textAlign: 'center',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem 4rem',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  browseButton: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  registrationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1. 5rem',
  },
  registrationCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  conferenceTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    color: '#111827',
  },
  conferenceDates: {
    color: '#6b7280',
    margin: '0. 25rem 0',
  },
  conferenceLocation: {
    color: '#6b7280',
    margin: '0.25rem 0',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  detailValue: {
    color: '#6b7280',
  },
  confirmationCode: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#1f2937',
  },
  cardActions: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  viewButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
  },
};