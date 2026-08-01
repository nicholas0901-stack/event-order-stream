import { useEffect, useState } from 'react'
import { getOrders, connectOrderStream } from '../api'
import StatusBadge from './StatusBadge'

export default function OrderDashboard({ token, newOrder }) {
  const [orders, setOrders] = useState([])
  const [connected, setConnected] = useState(false)

  // Initial load
  useEffect(() => {
    getOrders(token).then(setOrders).catch(() => {})
  }, [token])

  // A freshly created order appears immediately, before Kafka/SSE round-trips back
  useEffect(() => {
    if (!newOrder) return
    setOrders((prev) => {
      if (prev.some((o) => o.id === newOrder.id)) return prev
      return [newOrder, ...prev]
    })
  }, [newOrder])

  // Live status updates
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

  return (
    <div className="glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div className="section-label" style={{ marginBottom: 0 }}>active orders</div>
        <div className={`live-indicator ${connected ? '' : 'offline'}`}>
          <span className="pulse-line"></span>
          {connected ? 'live' : 'connecting…'}
        </div>
      </div>

      {orders.length === 0 && <div className="empty-state">No orders yet — create one above.</div>}

      {orders.map((order) => (
        <div className="order-row" key={order.id}>
          <div>
            <div className="order-id">#{order.id.slice(0, 4).toUpperCase()} · {order.customerName}</div>
            {order.items?.map((item, i) => (
              <div className="order-meta" key={i}>
                {item.productName} · qty {item.quantity} · ${Number(item.unitPrice).toFixed(2)}
              </div>
            ))}
            {order.totalAmount != null && (
              <div className="order-meta" style={{ color: '#9ca0b8', marginTop: 2 }}>
                total: ${Number(order.totalAmount).toFixed(2)}
              </div>
            )}
          </div>
          <StatusBadge status={order.status} />
        </div>
      ))}
    </div>
  )
}
