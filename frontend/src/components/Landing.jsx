import { useEffect, useState } from 'react'

const stack = ['Kafka', 'Spring Boot', 'JWT', 'SSE', 'PostgreSQL', 'React', 'Docker']

const flow = [
  { label: 'React frontend', detail: 'Creates orders, watches them live' },
  { label: 'API gateway', detail: 'JWT auth · proxies · SSE broadcast' },
  { label: 'Kafka', detail: 'order-events → order-status-updates' },
  { label: 'Notification service', detail: 'Consumes, processes, publishes status' }
]

const stats = [
  { value: '3', label: 'backend services' },
  { value: '2', label: 'kafka topics' },
  { value: '<1s', label: 'status propagation' }
]

// Mock Data on how the stats will be. 
const TICKER_SEQUENCE = ['pending', 'processing', 'confirmed']
const TICKER_ORDERS = [
  { id: '7A21', customer: 'Sarah Chen', item: 'Mechanical keyboard' },
  { id: '3F09', customer: 'Marcus Lee', item: 'USB-C dock' },
  { id: '9D44', customer: 'Priya Nair', item: 'Wireless mouse' }
]

const payloadExample = `{
  "orderId": "a3f2-...",
  "customerName": "John Doe",
  "totalAmount": 129.00,
  "items": [
    { "productName": "Mechanical keyboard", "quantity": 1, "unitPrice": 129.00 }
  ],
  "createdAt": "2026-07-29T02:14:00Z"
}`

export default function Landing({ onEnter }) {
  const [tickerIndex, setTickerIndex] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [showPayload, setShowPayload] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < TICKER_SEQUENCE.length - 1) return prev + 1
        return 0
      })
      setTickerIndex((prev) => {
        // advance to next fake order once a full cycle completes
        if (statusIndex === TICKER_SEQUENCE.length - 1) {
          return (prev + 1) % TICKER_ORDERS.length
        }
        return prev
      })
    }, 1800)
    return () => clearInterval(interval)
  }, [statusIndex])

  const order = TICKER_ORDERS[tickerIndex]
  const status = TICKER_SEQUENCE[statusIndex]

  return (
    <div className="app-wrap">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="nav">
        <span className="brand">event-order-stream</span>
        <a
          className="btn-ghost"
          href="https://github.com/nicholas0901-stack"
          target="_blank"
          rel="noreferrer"
        >
          view source
        </a>
      </div>

      <h1>real-time commerce,<br />powered by kafka</h1>
      <p className="sub">
        A full event-driven order pipeline — Kafka messaging, a JWT-secured API gateway,
        and a live status stream over SSE. Create an order and watch it move through
        the system in real time, no refresh, no polling.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button className="btn-primary" onClick={onEnter}>try live demo →</button>
      </div>

      <div className="stats-row">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass">
        <div className="section-label">watch it work</div>
        <div className="order-row">
          <div>
            <div className="order-id">#{order.id} · {order.customer}</div>
            <div className="order-meta">{order.item}</div>
          </div>
          <div className={`status ${status}`}>
            <span className={`dot ${status}`}></span>
            {status}
          </div>
        </div>
        <div className="ticker-note">simulated preview — sign in to create a real one</div>
      </div>

      <div className="glass">
        <div className="section-label">how it flows</div>
        {flow.map((step, i) => (
          <div className="order-row hoverable" key={step.label}>
            <div>
              <div className="order-id">{String(i + 1).padStart(2, '0')} · {step.label}</div>
              <div className="order-meta">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass">
        <div
          className="section-label"
          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setShowPayload((v) => !v)}
        >
          <span>event payload</span>
          <span>{showPayload ? '− hide' : '+ show'}</span>
        </div>
        {showPayload && <pre className="code-block">{payloadExample}</pre>}
      </div>

      <div className="glass">
        <div className="section-label">built with</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {stack.map((tech) => (
            <span key={tech} className="tech-badge hoverable">{tech}</span>
          ))}
        </div>
      </div>

      <footer className="footer">
        Built by Nicholas Ng · <a href="https://nicng.vercel.app/" target="_blank" rel="noreferrer">portfolio</a>
      </footer>
    </div>
  )
}
