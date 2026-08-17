import { useState } from 'react'
import { login } from '../api'

export default function Login({ onLoggedIn, onSwitchToRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="glass" style={{ maxWidth: 360, margin: '80px auto' }}>
      <div className="section-label">sign in</div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">username</label>
        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label htmlFor="password">password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" />

        {error && <div className="error-text">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'signing in…' : 'sign in →'}
        </button>
      </form>

      <div className="ticker-note" style={{ marginTop: 16 }}>
        need an account?{' '}
        <span style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }} onClick={onSwitchToRegister}>
          create one
        </span>
      </div>
    </div>
  )
}