const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8082'

// Render's free tier can throw a transient 429/503 at the gateway for two very
// different reasons: a brief edge-level throttle (recovers in a few seconds),
// or a full cold start from an idle instance - which, measured from this
// app's own logs, takes 140-160 seconds end to end (JVM boot + Kafka consumer
// group join). A retry budget has to cover the *worse* case or it's useless -
// so this backs off gradually and gives it a genuine 3 minutes before giving up,
// not just a few seconds.
const MAX_RETRIES = 14
const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 15000 // cap so it settles into "poll every 15s" rather than growing forever

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * fetch() wrapper that retries on 429/503 (and on network-level failures,
 * which is what a still-booting instance often looks like) with capped
 * exponential backoff: 1s, 2s, 4s, 8s, then 15s repeatedly - roughly 3
 * minutes of total retry budget, enough to survive a real cold start rather
 * than just a brief blip. Any other response (including other error codes
 * like 401/404) is returned immediately without retrying - only "come back
 * later" signals get retried. Pass onRetry(attempt, delayMs, maxAttempts) to
 * surface progress in the UI instead of leaving the caller guessing.
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
    const delay = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS)
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
