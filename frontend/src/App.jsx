import { useEffect, useState } from 'react'
import Landing from './components/Landing'
import Login from './components/Login'
import Register from './components/Register'
import OrderForm from './components/OrderForm'
import OrderDashboard from './components/OrderDashboard'

const STORAGE_KEY = 'eos_auth'

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'login' | 'register' | 'dashboard'
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState(null)
  const [newOrder, setNewOrder] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { token: savedToken, username: savedUsername } = JSON.parse(saved)
        if (savedToken) {
          setToken(savedToken)
          setUsername(savedUsername)
          setView('dashboard')
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  function handleLogin(t, u) {
    setToken(t)
    setUsername(u)
    setView('dashboard')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: t, username: u }))
  }

  function handleLogout() {
    setToken(null)
    setUsername(null)
    setView('landing')
    localStorage.removeItem(STORAGE_KEY)
  }

  if (view === 'landing') {
    return <Landing onEnter={() => setView('login')} />
  }

  if (view === 'register') {
    return (
      <div className="app-wrap">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="nav">
          <span className="brand">LedgerExchange</span>
          <button className="btn-ghost" onClick={() => setView('landing')}>← back</button>
        </div>
        <Register onRegistered={handleLogin} onSwitchToLogin={() => setView('login')} />
      </div>
    )
  }

  if (view === 'login' || !token) {
    return (
      <div className="app-wrap">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="nav">
          <span className="brand">LedgerExchange</span>
          <button className="btn-ghost" onClick={() => setView('landing')}>← back</button>
        </div>
        <Login onLoggedIn={handleLogin} onSwitchToRegister={() => setView('register')} />
      </div>
    )
  }

  return (
      <div className="app-wrap">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="nav">
          <span className="brand">LedgerExchange</span>
          <button className="btn-ghost" onClick={handleLogout}>sign out</button>
        </div>

        <div className="dashboard-header">
          <div className="dashboard-greeting">
            signed in as <strong>{username}</strong>
          </div>
          <h1>real-time commerce,<br />powered by kafka</h1>
          <p className="sub">
            Every order streams through an event pipeline and updates live below —
            no refresh, no polling.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-col-sticky">
            <OrderForm token={token} onOrderCreated={setNewOrder} />
          </div>
          <OrderDashboard token={token} newOrder={newOrder} />
        </div>

        <footer className="footer">
          Built by Nicholas Ng · <a href="https://nicng.vercel.app/" target="_blank" rel="noreferrer">portfolio</a>
        </footer>
      </div>
    )
}