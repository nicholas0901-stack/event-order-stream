import { useEffect, useState } from 'react'
import { getOrders, connectOrderStream } from '../api'
import StatusBadge from './StatusBadge'

export default function OrderDashboard({ token, newOrder }) {
  const [orders, setOrders] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    getOrders(token).then(setOrders).catch(() => {})
  }, [token])

  useEffect(() => {
    if (!newOrder) return
    setOrders((prev) => {
      if (prev.some((o) => o.id === newOrder.id)) return prev
      return [newOrder, ...prev]
    })
  }, [newOrder])

  useEffect(() => {
    const disconnect = connectOrderStream(
      token,
      (update) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === update.orderId ? { ...o, status: update.status } : o))
        )
      },
      () => setConnected(true),
      () => setConnected(false)
    )
    return disconnect
  }, [token])

  const counts = orders.reduce(
    (acc, o) => {
      const key = o.status?.toLowerCase()
      if (key && acc[key] !== undefined) acc[key] += 1
      return acc
    },
    { pending: 0, processing: 0, confirmed: 0, failed: 0 }
  )

  return (
    <div>
      <div className="stats-row" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">total orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{counts.pending + counts.processing}</div>
          <div className="stat-label">in progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{counts.confirmed}</div>
          <div className="stat-label">confirmed</div>
        </div>
      </div>

      <div className="glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>active orders</div>
          <div className={`live-indicator ${connected ? '' : 'offline'}`}>
            <span className="pulse-line"></span>
            {connected ? 'live' : 'connecting…'}
          </div>
        </div>

        {orders.length === 0 && (
          <div className="empty-state-rich">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="7" width="16" height="13" rx="2" stroke="#4a4f5c" strokeWidth="1.5"/>
              <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#4a4f5c" strokeWidth="1.5"/>
            </svg>
            <div className="empty-title">No orders yet</div>
            <div className="empty-sub">Create one using the form to see it update live</div>
          </div>
        )}

        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-top">
              <div>
                <div className="order-id">#{order.id.slice(0, 4).toUpperCase()} · {order.customerName}</div>
              </div>
              <StatusBadge status={order.status} />
            </div>
            {order.items?.length > 0 && (
              <div className="order-card-items">
                {order.items.map((item, i) => (
                  <div className="order-card-item-row" key={i}>
                    <span>{item.productName} × {item.quantity}</span>
                    <span>${Number(item.unitPrice).toFixed(2)}</span>
                  </div>
                ))}
                {order.totalAmount != null && (
                  <div className="order-card-total">
                    <span>total</span>
                    <span>${Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}