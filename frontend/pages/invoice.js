// pages/invoice.js
import { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';

export default function Invoice() {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: '',
    customerName: '',
    items: '',
    total: 0,
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/generateInvoice', formData, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'invoice.pdf');
      document.body.appendChild(link);
      link.click();
      setMessage('Invoice generated successfully!');
    } catch (error) {
      console.error(error);
      setMessage('Error generating invoice');
    }
  };

  return (
    <>
      <Head>
        <title>Generate Invoice - Travel Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <header className="site-header">
          <div className="logo">
            <h1>Invoice Generator</h1>
          </div>
          <nav className="site-nav">
            <Link href="/"><a>Home</a></Link>
            <Link href="/planTrip"><a>Plan Trip</a></Link>
            <Link href="/viewPlans"><a>My Trips</a></Link>
          </nav>
        </header>

        <section className="content-section">
          <div className="card form-card">
            <h2>Invoice Details</h2>
            <form onSubmit={handleSubmit} className="invoice-form">
              <div className="form-group">
                <label htmlFor="invoiceNumber">Invoice Number:</label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerName">Customer Name:</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="items">Items (JSON format):</label>
                <textarea
                  id="items"
                  name="items"
                  value={formData.items}
                  onChange={handleChange}
                  placeholder='e.g., [{"description": "Insurance", "amount": 100}]'
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="total">Total Amount:</label>
                <input
                  type="number"
                  id="total"
                  name="total"
                  value={formData.total}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
              <button type="submit" className="btn primary-btn">Generate Invoice</button>
            </form>
            {message && <p className="form-message">{message}</p>}
          </div>
        </section>

        <footer className="site-footer">
          <p>&copy; {new Date().getFullYear()} Travel Planner</p>
        </footer>
      </div>
    </>
  );
}
