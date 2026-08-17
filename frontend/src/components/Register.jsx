import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8082'

export default function Register({ onRegistered, onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (res.status === 409) {
        setError('That username is already taken.')
        return
      }
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Registration failed')
      }

      const { token, username: registeredUsername } = await res.json()
      onRegistered(token, registeredUsername)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass" style={{ maxWidth: 360, margin: '80px auto' }}>
      <div className="section-label">create account</div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="reg-username">username</label>
        <input id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="choose a username" />

        <label htmlFor="reg-password">password</label>
        <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="at least 8 characters" />

        <label htmlFor="reg-confirm">confirm password</label>
        <input id="reg-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="re-enter password" />

        {error && <div className="error-text">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
          {loading ? 'creating account…' : 'create account →'}
        </button>
      </form>

      <div className="ticker-note" style={{ marginTop: 16 }}>
        already have an account?{' '}
        <span style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }} onClick={onSwitchToLogin}>
          sign in
        </span>
      </div>
    </div>
  )
}