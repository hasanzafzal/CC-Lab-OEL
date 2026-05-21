import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import FeedbackForm from './components/FeedbackForm'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import { Shield, MessageSquare, LogOut, Heart, RefreshCw } from 'lucide-react'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('feedback') // 'feedback', 'login'

  useEffect(() => {
    // 1. Check current session on mount
    const checkSession = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession()
        setSession(activeSession)
      } catch (err) {
        console.error('Error getting initial session:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // 2. Listen to authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state event change:', event)
      setSession(newSession)

      if (newSession) {
        setView('dashboard')
      } else {
        setView('feedback')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setView('feedback')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  // Loader screen
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0b0a0f',
        color: '#f3f4f6'
      }}>
        <RefreshCw size={36} className="empty-icon" style={{ animation: 'spin 2s linear infinite', color: 'var(--accent-color)' }} />
        <p style={{ marginTop: '16px', fontSize: '0.95rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          SECURE CONNECTION ESTABLISHING...
        </p>
      </div>
    )
  }

  return (
    <div className="container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-wrapper" onClick={() => setView(session ? 'dashboard' : 'feedback')}>
          <MessageSquare className="logo-icon" size={24} />
          <span className="logo-text">On the Down-Low</span>
        </div>

        <div className="header-actions">
          {session ? (
            <>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} style={{ color: 'var(--accent-light)' }} />
                Admin Active
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </>
          ) : view === 'feedback' ? (
            <button
              onClick={() => setView('login')}
              className="btn btn-secondary btn-sm"
            >
              <Shield size={14} />
              Admin Portal
            </button>
          ) : (
            <button
              onClick={() => setView('feedback')}
              className="btn btn-secondary btn-sm"
            >
              Feedback Box
            </button>
          )}
        </div>
      </header>

      {/* Main Body Grid */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {session ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : view === 'login' ? (
          <AdminLogin onBack={() => setView('feedback')} />
        ) : (
          <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1>On the Down-Low</h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '8px auto 0' }}>
                A secure space to submit your opinions, reports, and praise anonymously. Because we like to keep it on the down-low.
              </p>
            </div>
            <FeedbackForm onAdminClick={() => setView('login')} />
          </div>
        )}
      </main>

      {/* Decorative Footer */}
      <footer className="app-footer">
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span>On the Down-Low Anonymous Feedback System</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            A project by Hasan - 028
          </span>
        </p>
      </footer>
    </div>
  )
}

export default App
