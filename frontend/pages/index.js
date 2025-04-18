// pages/index.js
import Link from 'next/link';
import Head from 'next/head';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if a user is logged in by inspecting localStorage.
    // Replace "user" with the key you use for storing session details.
    const userSession = localStorage.getItem('user');
    if (!userSession) {
      router.push('/login');
    }
  }, []);

  // When logout is clicked, remove the session and redirect to login page.
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear the stored session
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Travel Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <header className="site-header">
          <div className="logo">
            <h1>Travel Planner</h1>
          </div>
          <nav className="site-nav">
            <Link href="/planTrip"><a>Plan a Trip</a></Link>
            <Link href="/viewPlans"><a>My Trips</a></Link>
            <Link href="/invoice"><a>Invoice</a></Link>
            {/* Logout Button */}
            <Button type="danger" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </header>

        <section className="hero">
          <div className="hero-content">
            <h2>Your Adventure Awaits</h2>
            <p>
              Explore breathtaking destinations, customize your travel itinerary, and make every journey unforgettable.
            </p>
            <Link href="/planTrip">
              <a className="btn primary-btn">Start Planning Now</a>
            </Link>
          </div>
        </section>

        <footer className="site-footer">
          <p>&copy; {new Date().getFullYear()} Travel Planner. Crafted with passion.</p>
        </footer>
      </div>
    </>
  );
}
