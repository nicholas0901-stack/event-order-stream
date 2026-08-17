import { useState } from 'react'
import { login } from '../api'

export default function Login({ onLoggedIn, onSwitchToRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token } = await login(username, password)
      onLoggedIn(token, username)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass" style={{ maxWidth: 380, margin: '80px auto', padding: '32px 28px' }}>
      <div className="auth-icon-badge">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="9" rx="2" stroke="#0a0a12" strokeWidth="2"/>
          <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#0a0a12" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="auth-heading">Welcome back</div>
      <div className="auth-subtitle">Sign in to manage your orders</div>

      <form onSubmit={handleSubmit}>
        <div className="input-icon-wrap">
          <label htmlFor="username">username</label>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your username" />
        </div>

        <div className="input-icon-wrap" style={{ position: 'relative' }}>
          <label htmlFor="password">password</label>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="your password"
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.4 9.4 0 0112 5c5 0 9 4 10 7-.4 1.2-1.2 2.5-2.3 3.6M6.1 6.1C4 7.5 2.5 9.6 2 12c1 3 5 7 10 7 1.1 0 2.1-.2 3-.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>
            )}
          </button>
        </div>

        {error && <div className="error-text">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          {loading ? 'signing in…' : 'sign in →'}
        </button>
      </form>

      <div className="auth-divider">new here</div>

      <button className="btn-secondary-full" onClick={onSwitchToRegister}>
        create an account
      </button>
    </div>
  )
}