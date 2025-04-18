// pages/viewPlans.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Popconfirm, message as antdMessage } from 'antd';
import Router, { useRouter } from 'next/router';

export default function ViewPlans() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for the session in localStorage
    const session = localStorage.getItem('user');
    if (!session) {
      // No session: redirect to login page
      router.push('/login');
    } else {
      // Parse session data to get customerId
      const sessionData = JSON.parse(session);
      const customerId = sessionData.customerId;
      // Fetch trips using the customerId from session
      axios
        .get('http://localhost:3001/api/viewPlans', {
          headers: { 'x-user-id': customerId },
        })
        .then((res) => {
          setTrips(res.data);
          setError('');
        })
        .catch((err) => {
          setError(err.response?.data?.error || 'Error retrieving trips');
          setTrips([]);
        });
    }
  }, [router]);

  // Handler for deleting a trip
  const handleDelete = (planId) => {
    axios
      .delete(`http://localhost:3001/api/holidayPlanner/${planId}`)
      .then((res) => {
        antdMessage.success('Trip deleted successfully!');
        setTrips(trips.filter((trip) => trip._id !== planId));
      })
      .catch((err) => {
        antdMessage.error('Failed to delete the trip.');
      });
  };

  // Logout handler: clear session and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>My Trips - Travel Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <header className="site-header">
          <div className="logo">
            <h1>My Trips</h1>
          </div>
          <nav className="site-nav">
            <Link href="/"><a>Home</a></Link>
            <Link href="/planTrip"><a>Plan Trip</a></Link>
            <Link href="/invoice"><a>Invoice</a></Link>
            <Button type="danger" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </header>

        <section className="content-section">
          {error && <p className="error-msg">{error}</p>}
          {trips.length > 0 ? (
            <div className="trip-list">
              {trips.map((trip) => (
                <div key={trip._id} className="trip-card">
                  {/* Title is clickable: redirects to Plan Details page with query parameters */}
                  <h3>
                    <Link href={`/planDetails?planId=${trip._id}&country=${encodeURIComponent(trip.country)}`}>
                      <a>{trip.country} Trip</a>
                    </Link>
                  </h3>
                  <p>
                    <strong>Date &amp; Time:</strong> {trip.travelDateTime}
                  </p>
                  <p>
                    <strong>Travelers:</strong> {trip.numberOfTravelers}
                  </p>
                  <p>
                    <strong>Language Suitability:</strong> {trip.languageSuitability ? 'Yes' : 'No'}
                  </p>
                  <Popconfirm
                    title="Are you sure you want to cancel this plan?"
                    onConfirm={() => handleDelete(trip._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="danger">Cancel</Button>
                  </Popconfirm>
                </div>
              ))}
            </div>
          ) : (
            <p className="info-text">No trips found.</p>
          )}
        </section>

        <footer className="site-footer">
          <p>&copy; {new Date().getFullYear()} Travel Planner</p>
        </footer>
      </div>
    </>
  );
}
