import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function UserProfile() {
  const router = useRouter();
  const { username } = router.query;
  const [user, setUser] = useState(null);
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const userResponse = await fetch(`/api/v1/users/${username}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);

        // Check if this is the current user's profile
        const currentUserResponse = await fetch('/api/v1/users');
        if (currentUserResponse.ok) {
          const currentUser = await currentUserResponse.json();
          setIsOwnProfile(currentUser.username === username);
        }

        // Fetch user's abstracts
        const abstractsResponse = await fetch(`/api/v1/abstracts?author=${username}`);
        if (abstractsResponse.ok) {
          const abstractsData = await abstractsResponse.json();
          setAbstracts(abstractsData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="error-container">
          <h1>User Not Found</h1>
          <p>The user profile you are looking for does not exist.</p>
          <Link href="/" className="btn">← Back to Home</Link>
        </div>
        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
          }
          .btn {
            background: #667eea;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 1rem;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{user.username}'s Profile - Conference Manager</title>
      </Head>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1>Conference Manager</h1>
            <nav>
              <Link href="/">Home</Link>
              <Link href="/conferences">Conferences</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </div>
        </header>

        {/* Profile Hero */}
        <div className="profile-hero">
          <div className="profile-content">
            <div className="avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h1>{user.username}</h1>
              <p className="email">{user.email}</p>
              <div className="profile-meta">
                <span>📅 Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}</span>
                {user.role && <span>🎓 {user.role}</span>}
              </div>
              {isOwnProfile && (
                <button className="btn-edit">Edit Profile</button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="container">
          {/* Stats */}
          <section className="stats">
            <div className="stat-card">
              <h3>{abstracts.length}</h3>
              <p>Abstracts Submitted</p>
            </div>
            <div className="stat-card">
              <h3>{abstracts.filter(a => a.status === 'accepted').length}</h3>
              <p>Accepted</p>
            </div>
            <div className="stat-card">
              <h3>{abstracts.filter(a => a.status === 'pending').length}</h3>
              <p>Pending Review</p>
            </div>
          </section>

          {/* Bio Section */}
          {user.bio && (
            <section className="section">
              <h2>About</h2>
              <p className="bio">{user.bio}</p>
            </section>
          )}

          {/* Abstracts */}
          <section className="section">
            <h2>Abstract Submissions</h2>
            {abstracts.length > 0 ? (
              <div className="abstracts-grid">
                {abstracts.map((abstract) => (
                  <div key={abstract.id} className="abstract-card">
                    <div className="abstract-header">
                      <h3>{abstract.title}</h3>
                      <span className={`status status-${abstract.status}`}>
                        {abstract.status}
                      </span>
                    </div>
                    <p className="conference-name">
                      📚 {abstract.conference_title || 'Conference'}
                    </p>
                    <p className="abstract-excerpt">
                      {abstract.content?.substring(0, 150)}
                      {abstract.content?.length > 150 ? '...' : ''}
                    </p>
                    {abstract.keywords && abstract.keywords.length > 0 && (
                      <div className="keywords">
                        {abstract.keywords.slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="keyword">{keyword}</span>
                        ))}
                      </div>
                    )}
                    <p className="date">
                      Submitted on {new Date(abstract.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  {isOwnProfile 
                    ? "You haven't submitted any abstracts yet." 
                    : `${user.username} hasn't submitted any abstracts yet.`}
                </p>
                {isOwnProfile && (
                  <Link href="/conferences" className="btn">
                    Browse Conferences
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .page {
          min-height: 100vh;
          background: #f9fafb;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h1 {
          font-size: 1.5rem;
          color: #667eea;
          margin: 0;
        }

        nav {
          display: flex;
          gap: 1.5rem;
        }

        nav :global(a) {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        nav :global(a):hover {
          color: #667eea;
        }

        .profile-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 0;
        }

        .profile-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: white;
          color: #667eea;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
        }

        .profile-info h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
        }

        .email {
          opacity: 0.9;
          margin-bottom: 0.75rem;
        }

        .profile-meta {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .btn-edit {
          background: white;
          color: #667eea;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-card h3 {
          font-size: 2.5rem;
          color: #667eea;
          margin: 0 0 0.5rem 0;
        }

        .stat-card p {
          color: #6b7280;
          margin: 0;
        }

        .section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .section h2 {
          margin-top: 0;
          color: #111827;
          margin-bottom: 1.5rem;
        }

        .bio {
          color: #4b5563;
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .abstracts-grid {
          display: grid;
          gap: 1.5rem;
        }

        .abstract-card {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .abstract-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.75rem;
          gap: 1rem;
        }

        .abstract-header h3 {
          margin: 0;
          color: #111827;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-accepted {
          background: #d1fae5;
          color: #065f46;
        }

        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .conference-name {
          color: #667eea;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .abstract-excerpt {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }

        .keywords {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.75rem;
        }

        .keyword {
          background: #e0e7ff;
          color: #4338ca;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .date {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
        }

        .empty-state p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .btn {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }

        .btn:hover {
          background: #5568d3;
        }

        @media (max-width: 768px) {
          .profile-content {
            flex-direction: column;
            text-align: center;
          }

          .profile-info h1 {
            font-size: 2rem;
          }

          .abstract-header {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
