import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ConferenceAbstracts() {
  const router = useRouter();
  const { slug } = router.query;
  const [conference, setConference] = useState(null);
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  const fetchData = async () => {
    try {
      const confResponse = await fetch(`/api/v1/conferences/by-slug/${slug}`);
      const confData = await confResponse.json();
      setConference(confData);

      // Fetch accepted abstracts only
      const abstractsResponse = await fetch(
        `/api/v1/conferences/${confData.id}/abstracts?status=accepted`
      );
      if (abstractsResponse.ok) {
        const abstractsData = await abstractsResponse.json();
        setAbstracts(abstractsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAbstracts = abstracts.filter(
    (abstract) =>
      abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abstract.author_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abstract.keywords?.some((kw) => kw.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!conference) return <div>Conference not found</div>;

  return (
    <>
      <Head>
        <title>Accepted Abstracts - {conference.title}</title>
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <Link href={`/c/${slug}`} style={styles.backLink}>← Back to Conference</Link>
          <h1 style={styles.title}>Accepted Abstracts</h1>
          <p style={styles.subtitle}>Browse all accepted submissions for this conference</p>
        </header>

        <div style={styles.content}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by title, author, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {filteredAbstracts.length === 0 ? (
            <div style={styles.empty}>
              <p>{searchTerm ? 'No abstracts match your search.' : 'No accepted abstracts yet.'}</p>
            </div>
          ) : (
            <div style={styles.abstractsList}>
              {filteredAbstracts.map((abstract) => (
                <div key={abstract.id} style={styles.abstractCard}>
                  <h3 style={styles.abstractTitle}>{abstract.title}</h3>
                  <p style={styles.author}>By {abstract.author_username}</p>
                  <p style={styles.abstractContent}>{abstract.content.substring(0, 200)}...</p>
                  {abstract.keywords && abstract.keywords.length > 0 && (
                    <div style={styles.keywords}>
                      {abstract.keywords.map((keyword, idx) => (
                        <span key={idx} style={styles.keyword}>{keyword}</span>
                      ))}
                    </div>
                  )}
                  <Link href={`/c/${slug}/abstracts/${abstract.id}`} style={styles.readMore}>
                    Read Full Abstract →
                  </Link>
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  searchBox: {
    marginBottom: '30px',
  },
  searchInput: {
    width: '100%',
    padding: '15px 20px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  empty: {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#6b7280',
  },
  abstractsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  abstractCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s',
  },
  abstractTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 10px 0',
  },
  author: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 15px 0',
  },
  abstractContent: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '0 0 15px 0',
  },
  keywords: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    margin: '15px 0',
  },
  keyword: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    padding: '5px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
  },
  readMore: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
  },
};