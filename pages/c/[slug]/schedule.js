import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ConferenceSchedule() {
  const router = useRouter();
  const { slug } = router.query;
  const [conference, setConference] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedSchedule, setGroupedSchedule] = useState({});

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

      const scheduleResponse = await fetch(`/api/v1/conferences/${confData.id}/schedules`);
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        setSchedule(scheduleData);
        groupScheduleByDay(scheduleData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupScheduleByDay = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const date = new Date(item.start_time).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    setGroupedSchedule(grouped);
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!conference) return <div>Conference not found</div>;

  return (
    <>
      <Head>
        <title>Schedule - {conference.title}</title>
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <Link href={`/c/${slug}`} style={styles.backLink}>← Back to Conference</Link>
          <h1 style={styles.title}>Conference Schedule</h1>
        </header>

        <div style={styles.content}>
          {Object.keys(groupedSchedule).length === 0 ? (
            <div style={styles.empty}>
              <p>Schedule will be announced soon.</p>
            </div>
          ) : (
            Object.keys(groupedSchedule).map((day) => (
              <div key={day} style={styles.daySection}>
                <h2 style={styles.dayTitle}>{day}</h2>
                <div style={styles.scheduleList}>
                  {groupedSchedule[day].map((item) => (
                    <div key={item.id} style={styles.scheduleItem}>
                      <div style={styles.timeSlot}>
                        <div style={styles.time}>
                          {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={styles.timeDivider}>-</div>
                        <div style={styles.time}>
                          {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={styles.itemDetails}>
                        <h3 style={styles.itemTitle}>{item.title}</h3>
                        {item.speaker && (
                          <p style={styles.speaker}>👤 {item.speaker}</p>
                        )}
                        {item.description && (
                          <p style={styles.description}>{item.description}</p>
                        )}
                        {item.location && (
                          <p style={styles.location}>📍 {item.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
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
    margin: '10px 0 0 0',
    color: '#1f2937',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  empty: {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#6b7280',
  },
  daySection: {
    marginBottom: '40px',
  },
  dayTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #3b82f6',
  },
  scheduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  scheduleItem: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '20px',
  },
  timeSlot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '100px',
    padding: '10px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
  },
  time: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e40af',
  },
  timeDivider: {
    margin: '5px 0',
    color: '#93c5fd',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 10px 0',
  },
  speaker: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '5px 0',
  },
  description: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '10px 0',
  },
  location: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '5px 0',
  },
};