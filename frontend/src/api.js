const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8082'

// Render's free tier can throw a transient 429/503 at the gateway - either a
// brief edge-level burst throttle, or a cold start from an idle instance.
// IMPORTANT: keep this gentle. An aggressive/fast retry loop is exactly the
// kind of traffic pattern that can keep a burst-rate-limit re-triggering on
// itself, turning one transient 429 into a sustained one. Few attempts, long
// gaps between them - this is a safety net for a genuine blip, not something
// that should ever generate a noticeable burst of its own traffic.
const MAX_RETRIES = 3
const RETRY_DELAYS_MS = [5000, 15000, 30000] // 5s, then 15s, then 30s - deliberately spaced out

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * fetch() wrapper that retries on 429/503 (and on network-level failures)
 * a small number of times with wide gaps between attempts - just enough to
 * absorb a brief throttle or catch the tail end of a cold start, without
 * itself becoming a burst of traffic that could keep a rate limit active.
 * Any other response (including 401/404) returns immediately, no retry.
 * Pass onRetry(attempt, delayMs, maxAttempts) to surface progress in the UI.
 */
async function fetchWithRetry(url, options = {}, onRetry) {
  let lastError
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, options)
      const shouldRetry = (res.status === 429 || res.status === 503) && attempt < MAX_RETRIES
      if (!shouldRetry) return res
      lastError = new Error(`Received ${res.status}`)
    } catch (networkErr) {
      if (attempt === MAX_RETRIES) throw networkErr
      lastError = networkErr
    }
    const delay = RETRY_DELAYS_MS[attempt]
    onRetry?.(attempt + 1, delay, MAX_RETRIES + 1)
    await sleep(delay)
  }
  throw lastError
}

export async function login(username, password, onRetry) {
  const res = await fetchWithRetry(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }, onRetry)
  if (!res.ok) {
    if (res.status === 429 || res.status === 503) {
      throw new Error("Server is still waking up - this can take a couple of minutes on the free tier. Please wait and try again.")
    }
    throw new Error('Invalid username or password')
  }
  return res.json()
}

export async function createOrder(token, order, onRetry) {
  const res = await fetchWithRetry(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(order)
  }, onRetry)
  if (!res.ok) {
    if (res.status === 429 || res.status === 503) {
      throw new Error("Server is still waking up - this can take a couple of minutes on the free tier. Please wait and try again.")
    }
    const text = await res.text()
    throw new Error(text || 'Failed to create order')
  }
  return res.json()
}

export async function getOrders(token, onRetry) {
  const res = await fetchWithRetry(`${API_BASE}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  }, onRetry)
  if (!res.ok) {
    if (res.status === 429 || res.status === 503) {
      throw new Error("Server is still waking up - this can take a couple of minutes on the free tier. Please wait and try again.")
    }
    throw new Error('Failed to load orders')
  }
  return res.json()
}

/**
 * EventSource can't set an Authorization header, so the token travels as a
 * query param here - the gateway's JwtAuthFilter accepts either.
 *
 * IMPORTANT: the browser's native EventSource auto-reconnects on its own
 * whenever the connection drops - with NO backoff and NO limit. If the
 * stream keeps failing (bad token, gateway hiccup, cold start), that default
 * behavior hammers the endpoint every few seconds forever, invisibly, which
 * is exactly the kind of sustained traffic that can keep an edge-level
 * rate limit active. This replaces that with a manually managed reconnect:
 * a handful of attempts with real backoff, then it gives up instead of
 * retrying indefinitely.
 */
export function connectOrderStream(token, onStatusUpdate, onOpen, onError) {
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAYS_MS = [3000, 8000, 15000, 30000, 60000]

  let source = null
  let reconnectTimer = null
  let attempt = 0
  let stopped = false

  function connect() {
    if (stopped) return

    source = new EventSource(`${API_BASE}/api/orders/stream?token=${encodeURIComponent(token)}`)
    // Native auto-reconnect is what we're replacing - EventSource has no
    // official "disable retry" flag, so closing and reopening ourselves in
    // onerror (below) is the standard way to take control of it.

    source.addEventListener('order-status', (event) => {
      onStatusUpdate(JSON.parse(event.data))
    })

    source.onopen = () => {
      attempt = 0 // a successful connection resets the backoff
      onOpen?.()
    }

    source.onerror = (err) => {
      onError?.(err)
      source.close()
      if (stopped || attempt >= MAX_RECONNECT_ATTEMPTS) return
      const delay = RECONNECT_DELAYS_MS[attempt]
      attempt += 1
      reconnectTimer = setTimeout(connect, delay)
    }
  }

  connect()

  return () => {
    stopped = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    source?.close()
  }
}
