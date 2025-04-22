// frontend/pages/invoice.js

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import axios from 'axios'
import { List, Button, message } from 'antd'
import moment from 'moment'
import { useRouter } from 'next/router'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [error, setError]     = useState('')
  const router                = useRouter()

  // Load invoices on mount
  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return router.push('/login')
    const { customerId } = JSON.parse(raw)

    axios
      .get(`${API_URL}/api/invoices`, {
        headers: { 'x-user-id': customerId },
      })
      .then((res) => setInvoices(res.data))
      .catch((err) => {
        console.error(err)
        setError(err.response?.data?.error || 'Failed to load invoices')
      })
  }, [router])

  // VIEW: open blank tab synchronously, then load PDF into it
  const handleView = (tripId) => {
    console.log('View clicked for trip', tripId)
    const newWin = window.open('', '_blank')
    if (!newWin) {
      message.error('Please enable pop‑ups for this site.')
      return
    }

    const raw = localStorage.getItem('user')
    if (!raw) {
      newWin.close()
      return router.push('/login')
    }
    const { customerId } = JSON.parse(raw)

    axios
      .post(
        `${API_URL}/api/generateInvoice`,
        { tripId },
        {
          headers:      { 'x-user-id': customerId },
          responseType: 'blob',
        }
      )
      .then((res) => {
        const blob    = new Blob([res.data], { type: 'application/pdf' })
        const blobUrl = window.URL.createObjectURL(blob)
        newWin.location.href = blobUrl
      })
      .catch((err) => {
        console.error('Failed to view invoice:', err)
        newWin.close()
        message.error('Failed to view invoice')
      })
  }

  // DOWNLOAD: fetch PDF, then trigger a download
  const handleDownload = (tripId, invoiceNumber) => {
    console.log('Download clicked for trip', tripId)
    const raw = localStorage.getItem('user')
    if (!raw) return router.push('/login')
    const { customerId } = JSON.parse(raw)

    axios
      .post(
        `${API_URL}/api/generateInvoice`,
        { tripId },
        {
          headers:      { 'x-user-id': customerId },
          responseType: 'blob',
        }
      )
      .then((res) => {
        const blob    = new Blob([res.data], { type: 'application/pdf' })
        const blobUrl = window.URL.createObjectURL(blob)
        const link    = document.createElement('a')
        link.href     = blobUrl
        link.download = `invoice-${invoiceNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(blobUrl)
        message.success('Invoice downloaded!')
      })
      .catch((err) => {
        console.error('Failed to download invoice:', err)
        message.error('Failed to download invoice')
      })
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <>
      <Head>
        <title>My Invoices – Travel Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="site-header">
          <div className="logo"><h1>My Invoices</h1></div>
          <nav className="site-nav">
            <Link href="/"><a>Home</a></Link>
            <Link href="/planTrip"><a>Plan Trip</a></Link>
            <Link href="/viewPlans"><a>My Trips</a></Link>
            <Button type="danger" onClick={handleLogout}>Logout</Button>
          </nav>
        </header>

        <section className="content-section">
          {error && <p className="error-msg">{error}</p>}

          {invoices.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={invoices}
              renderItem={(inv) => (
                <List.Item
                  actions={[
                    <Button key="view" type="link" onClick={() => handleView(inv.tripId)}>
                      View
                    </Button>,
                    <Button
                      key="download"
                      type="primary"
                      onClick={() => handleDownload(inv.tripId, inv.invoiceNumber)}
                    >
                      Download
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={`Invoice #${inv.invoiceNumber}`}
                    description={
                      <>
                        <div>Date: {moment(inv.date).format('DD/MM/YYYY')}</div>
                        <div>Total: RM{inv.total.toFixed(2)}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <p className="info-text">{error || 'You have no invoices yet.'}</p>
          )}
        </section>

        <footer className="site-footer">
          <p>© {new Date().getFullYear()} Travel Planner</p>
        </footer>
      </div>
    </>
  )
}
