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
  const [error, setError] = useState('')
  const router = useRouter()

  // load list of invoices
  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return router.push('/login')
    const { customerId } = JSON.parse(raw)

    axios
      .get(`${API_URL}/api/invoices`, {
        headers: { 'x-user-id': customerId },
      })
      .then(res => setInvoices(res.data))
      .catch(err => {
        console.error(err)
        setError(err.response?.data?.error || 'Failed to load invoices')
      })
  }, [router])

  // open the PDF in a new tab (view) or force-download
  const openPdf = (tripId, invoiceNumber, download = false) => {
    const raw = localStorage.getItem('user')
    if (!raw) return router.push('/login')
    const { customerId } = JSON.parse(raw)

    // build URL with query params
    const url = `${API_URL}/api/generateInvoice?tripId=${tripId}&userId=${customerId}`

    if (download) {
      // create a hidden <a> to download
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('Invoice downloaded!')
    } else {
      // open in new tab
      const win = window.open(url, '_blank')
      if (!win) {
        message.error('Please enable pop‑ups for this site.')
      }
    }
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
            <Link href="/invoice"><a>Invoices</a></Link>
            <Button type="danger" onClick={handleLogout}>Logout</Button>
          </nav>
        </header>

        <section className="content-section">
          {error && <p className="error-msg">{error}</p>}

          {invoices.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={invoices}
              renderItem={inv => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      onClick={() =>
                        openPdf(inv.tripId, inv.invoiceNumber, false)
                      }
                    >
                      View
                    </Button>,
                    <Button
                      key="download"
                      type="primary"
                      onClick={() =>
                        openPdf(inv.tripId, inv.invoiceNumber, true)
                      }
                    >
                      Download
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={`Invoice #${inv.invoiceNumber}`}
                    description={
                      <>
                        <div>
                          Date: {moment(inv.date).format('DD/MM/YYYY')}
                        </div>
                        <div>Total: RM{inv.total.toFixed(2)}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <p className="info-text">
              {error || 'You have no invoices yet.'}
            </p>
          )}
        </section>

        <footer className="site-footer">
          <p>© {new Date().getFullYear()} Travel Planner</p>
        </footer>
      </div>
    </>
  )
}
