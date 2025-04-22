// pages/viewPlans.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Popconfirm, message as antdMessage } from 'antd';
import { useRouter } from 'next/router';

// Point this at your backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ViewPlans() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  // Load trips on mount
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return router.push('/login');

    const { customerId } = JSON.parse(raw);
    axios
      .get(`${API_URL}/api/viewPlans`, {
        headers: { 'x-user-id': customerId }
      })
      .then((res) => {
        setTrips(res.data);
        setError('');
      })
      .catch((err) => {
        console.error('Error fetching trips:', err);
        setError(err.response?.data?.error || 'Error retrieving trips');
      });
  }, [router]);

  // Delete a trip
  const handleDelete = (planId) => {
    axios
      .delete(`${API_URL}/api/holidayPlanner/${planId}`)
      .then(() => {
        antdMessage.success('Trip deleted successfully!');
        setTrips((t) => t.filter((trip) => trip._id !== planId));
      })
      .catch((err) => {
        console.error('Error deleting trip:', err);
        antdMessage.error('Failed to delete the trip.');
      });
  };

  // Generate invoice PDF for a trip
  const handleInvoice = async (planId) => {
    console.log('Generate invoice clicked for trip:', planId);
    
    const raw = localStorage.getItem('user');
    if (!raw) {
      antdMessage.error('Please log in again.');
      return router.push('/login');
    }
    const { customerId } = JSON.parse(raw);

    try {
      const res = await axios.post(
        `${API_URL}/api/generateInvoice`,
        { tripId: planId },
        {
          headers: { 'x-user-id': customerId },
          responseType: 'blob'
        }
      );

      // download the PDF
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${planId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      antdMessage.success('Invoice generated!');
    } catch (err) {
      console.error('Invoice generation failed:', err);
      if (err.response?.status === 401) {
        antdMessage.error('Unauthorized – please log in again.');
        localStorage.removeItem('user');
        router.push('/login');
      } else if (err.response?.data?.error) {
        antdMessage.error(err.response.data.error);
      } else {
        antdMessage.error('Error generating invoice.');
      }
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>My Trips – Travel Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <header className="site-header">
          <div className="logo"><h1>My Trips</h1></div>
          <nav className="site-nav">
            <Link href="/"><a>Home</a></Link>
            <Link href="/planTrip"><a>Plan Trip</a></Link>
            <Link href="/invoice"><a>Invoice</a></Link>
            <Button type="danger" onClick={handleLogout}>Logout</Button>
          </nav>
        </header>

        <section className="content-section">
          {error && <p className="error-msg">{error}</p>}
          {trips.length > 0 ? (
            <div className="trip-list">
              {trips.map((trip) => (
                <div key={trip._id} className="trip-card">
                  <h3>
                    <Link href={`/planDetails?planId=${trip._id}&country=${encodeURIComponent(trip.country)}`}>
                      <a>{trip.country} Trip</a>
                    </Link>
                  </h3>
                  <p><strong>Date &amp; Time:</strong> {trip.travelDateTime}</p>
                  <p><strong>Travelers:</strong> {trip.numberOfTravelers}</p>
                  <p><strong>Know Local Language?</strong> {trip.languageSuitability ? 'Yes' : 'No'}</p>
                  <div className="trip-actions">
                    <Popconfirm
                      title="Cancel this trip?"
                      onConfirm={() => handleDelete(trip._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="danger">Cancel</Button>
                    </Popconfirm>
                    <Button
                      type="primary"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleInvoice(trip._id)}
                    >
                      Generate Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="info-text">No trips found for your account.</p>
          )}
        </section>

        <footer className="site-footer">
          <p>&copy; {new Date().getFullYear()} Travel Planner</p>
        </footer>
      </div>
    </>
  );
}
