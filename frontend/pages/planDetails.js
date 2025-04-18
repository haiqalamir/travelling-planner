// pages/planDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';

export default function PlanDetails() {
  const router = useRouter();
  const { country, planId } = router.query;
  const [countryDetails, setCountryDetails] = useState(null);
  const [localTime, setLocalTime] = useState(null);
  const [error, setError] = useState('');

  // Helper function to parse timezone string (e.g., "UTC+08:00") into minutes offset.
  const getOffsetInMinutes = (tzString) => {
    if (!tzString.startsWith('UTC')) return 0;
    const parts = tzString.substring(3).split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
    return hours * 60 + minutes;
  };

  useEffect(() => {
    if (country) {
      axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`)
        .then((res) => {
          const details = res.data[0]; // Use the first result.
          setCountryDetails(details);
          if (details.timezones && details.timezones.length > 0) {
            const tzString = details.timezones[0]; // e.g., "UTC+08:00"
            const offsetMinutes = getOffsetInMinutes(tzString);
            // Get current time in that timezone
            const currentTime = moment().utcOffset(offsetMinutes).format("hh:mm A");
            setLocalTime(currentTime);
          }
        })
        .catch((err) => {
          console.error(err);
          setError('Error fetching country details.');
        });
    }
  }, [country]);

  return (
    <>
      <Head>
        <title>Plan Details - Travel Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <header className="site-header">
          <div className="logo">
            <h1>Plan Details</h1>
          </div>
          <nav className="site-nav">
            <a onClick={() => router.push('/')}>Home</a>
          </nav>
        </header>
        <section className="content-section">
          {error && <p className="error-msg">{error}</p>}
          {countryDetails ? (
            <div className="card">
              {/* Media container for flag and coatOfArms */}
              <div className="media-container">
                {countryDetails.flags && countryDetails.flags.png && (
                  <img 
                    src={countryDetails.flags.png} 
                    alt={`${countryDetails.name.common} flag`} 
                    className="country-flag" 
                  />
                )}
                {countryDetails.coatOfArms && countryDetails.coatOfArms.png && (
                  <img 
                    src={countryDetails.coatOfArms.png} 
                    alt={`${countryDetails.name.common} coat of arms`} 
                    className="coat-of-arms" 
                  />
                )}
              </div>
              <h2>{countryDetails.name.common}</h2>
              <p><strong>Region:</strong> {countryDetails.region}</p>
              <p><strong>Subregion:</strong> {countryDetails.subregion}</p>
              <p><strong>Capital:</strong> {countryDetails.capital ? countryDetails.capital[0] : 'N/A'}</p>
              <p>
                <strong>Currency:</strong> {countryDetails.currencies
                  ? Object.values(countryDetails.currencies).map((cur) => cur.name).join(', ')
                  : 'N/A'} ( {countryDetails.currencies
                  ? Object.values(countryDetails.currencies).map((cur) => cur.symbol).join(', ')
                  : 'N/A'} )
              </p>
              
              <p>
                <strong>Timezone:</strong> {countryDetails.timezones ? countryDetails.timezones[0] : 'N/A'}{' '}
                {localTime && `(Current time: ${localTime})`}
              </p>
              {countryDetails.maps && countryDetails.maps.googleMaps && (
                <p>
                  <strong>Maps:<br></br></strong> <br />
                  <button 
                    onClick={() => window.open(countryDetails.maps.googleMaps, '_blank')}
                    className="btn primary-btn"
                  >
                    Open in Google Maps
                  </button>
                </p>
              )}
            </div>
          ) : (
            <p>Loading country details...</p>
          )}
        </section>
        <footer className="site-footer">
          <p>&copy; {new Date().getFullYear()} Travel Planner</p>
        </footer>
      </div>
    </>
  );
}
