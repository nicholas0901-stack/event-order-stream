const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8082'

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) {
    throw new Error('Invalid username or password')
  }
  return res.json()
}

export async function createOrder(token, order) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(order)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to create order')
  }
  return res.json()
}

export async function getOrders(token) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    throw new Error('Failed to load orders')
  }
  return res.json()
}

/**
 * EventSource can't set an Authorization header, so the token travels as a
 * query param here - the gateway's JwtAuthFilter accepts either.
 */
export function connectOrderStream(token, onStatusUpdate, onOpen, onError) {
  const source = new EventSource(`${API_BASE}/api/orders/stream?token=${encodeURIComponent(token)}`)

  source.addEventListener('order-status', (event) => {
    onStatusUpdate(JSON.parse(event.data))
  })
  source.onopen = () => onOpen?.()
  source.onerror = (err) => onError?.(err)

  return () => source.close()
}
