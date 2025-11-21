import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';

export default function Layout({ children, title, description }) {
  const defaultTitle = 'Conference Manager - Manage Academic Conferences';
  const defaultDescription = 'Platform for managing academic conferences, abstract submissions, and peer reviews';

  return (
    <>
      <Head>
        <title>{title || defaultTitle}</title>
        <meta name="description" content={description || defaultDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="app-container">
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </div>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
        }
      `}</style>
    </>
  );
}