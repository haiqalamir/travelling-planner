// pages/invoice.js
import { useState, useEffect } from 'react'
import axios from 'axios'
import Head from 'next/head'
import Link from 'next/link'
import { List, Button, message } from 'antd'
import moment from 'moment'
import { useRouter } from 'next/router'

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [error, setError] = useState('')
  const router = useRouter()

  // 1) on mount, load your invoices
  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) {
      // no session at all → must log in
      router.push('/login')
      return
    }
    const { customerId } = JSON.parse(raw)

    axios
      .get('http://localhost:3001/api/invoices', {
        headers: { 'x-user-id': customerId },
      })
      .then((res) => {
        setInvoices(res.data)
      })
      .catch((err) => {
        console.error(err)
        setError(err.response?.data?.error || 'Failed to load invoices')
      })
  }, [router])

  // 2) fetch PDF and either open or download
  const fetchPdf = async (tripId, invoiceNumber, action) => {
    const raw = localStorage.getItem('user')
    if (!raw) {
      router.push('/login')
      return
    }
    const { customerId } = JSON.parse(raw)

    try {
      const res = await axios.post(
        'http://localhost:3001/api/generateInvoice',
        { tripId },
        {
          headers: { 'x-user-id': customerId },
          responseType: 'blob',
        }
      )

      const blobUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' })
      )
      if (action === 'view') {
        window.open(blobUrl, '_blank')
      } else {
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `invoice-${invoiceNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
    } catch (err) {
      console.error(err)
      message.error(`Failed to ${action} invoice`)
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
          <div className="logo">
            <h1>My Invoices</h1>
          </div>
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
                    <Button
                      key="view"
                      type="link"
                      onClick={() =>
                        fetchPdf(inv.tripId, inv.invoiceNumber, 'view')
                      }
                    >
                      View
                    </Button>,
                    <Button
                      key="download"
                      type="primary"
                      onClick={() =>
                        fetchPdf(inv.tripId, inv.invoiceNumber, 'download')
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
                        <div>Date: {moment(inv.date).format('DD/MM/YYYY')}</div>
                        <div>Total: RM{inv.total.toFixed(2)}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <p className="info-text">
              {error ? error : 'You have no invoices yet.'}
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
