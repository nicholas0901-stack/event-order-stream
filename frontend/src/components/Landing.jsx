import { useEffect, useRef, useState } from 'react'

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

function Reveal({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
      {children}
    </div>
  )
}

export default function Landing({ onEnter }) {
  const [tickerIndex, setTickerIndex] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [showPayload, setShowPayload] = useState(false)
  const orb1Ref = useRef(null)
  const orb2Ref = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev < TICKER_SEQUENCE.length - 1 ? prev + 1 : 0))
      setTickerIndex((prev) => (statusIndex === TICKER_SEQUENCE.length - 1 ? (prev + 1) % TICKER_ORDERS.length : prev))
    }, 1800)
    return () => clearInterval(interval)
  }, [statusIndex])

  useEffect(() => {
    function handleMouseMove(e) {
      const x = (e.clientX / window.innerWidth - 0.5) * 30
      const y = (e.clientY / window.innerHeight - 0.5) * 30
      if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${x}px, ${y}px)`
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${-x * 0.6}px, ${-y * 0.6}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const order = TICKER_ORDERS[tickerIndex]
  const status = TICKER_SEQUENCE[statusIndex]

  return (
    <div className="app-wrap">
      <div className="bg-grid"></div>
      <div className="orb orb-1" ref={orb1Ref}></div>
      <div className="orb orb-2" ref={orb2Ref}></div>

      <div className="nav">
        <span className="brand">event-order-stream</span>
        <a className="btn-ghost" href="https://github.com/nicholas0901-stack" target="_blank" rel="noreferrer">
          view source
        </a>
      </div>

      <h1 className="shimmer-text">real-time commerce,<br />powered by kafka</h1>
      <p className="sub">
        A full event-driven order pipeline — Kafka messaging, a JWT-secured API gateway,
        and a live status stream over SSE. Create an order and watch it move through
        the system in real time, no refresh, no polling.
      </p>

      <div style={{ marginBottom: 32 }}>
        <div className="cta-glow-wrap">
          <button className="btn-primary" onClick={onEnter}>try live demo →</button>
        </div>
      </div>

      <Reveal>
        <div className="stats-row">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
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
      </Reveal>

      <Reveal>
        <div className="glass">
          <div className="section-label">how it flows</div>
          <div className="flow-track">
            <div className="flow-dot"></div>
            {flow.map((step, i) => (
              <div className="order-row hoverable" key={step.label}>
                <div>
                  <div className="order-id">{String(i + 1).padStart(2, '0')} · {step.label}</div>
                  <div className="order-meta">{step.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
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
      </Reveal>

      <Reveal>
        <div className="glass">
          <div className="section-label">built with</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {stack.map((tech) => (
              <span key={tech} className="tech-badge hoverable">{tech}</span>
            ))}
          </div>
        </div>
      </Reveal>

      <footer className="footer">
        Built by Nicholas Ng · <a href="https://nicng.vercel.app/" target="_blank" rel="noreferrer">portfolio</a>
      </footer>
    </div>
  )
}