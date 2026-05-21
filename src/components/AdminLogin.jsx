import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Shield, Key, AlertCircle, ArrowLeft, LogIn } from 'lucide-react'

export default function AdminLogin({ onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please provide both email and password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (loginError) {
        throw loginError
      }
      
      // The session listener in App.jsx will automatically handle the login state transition
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="success-icon-wrapper" style={{ margin: '0 auto 16px', background: 'var(--accent-glow)' }}>
          <Shield className="logo-icon" size={32} />
        </div>
        <h2>Admin Portal</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Sign in to manage anonymous feedback submissions</p>
      </div>

      <div className="glass-card">
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="form-control"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-control"
              disabled={loading}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <LogIn size={16} />}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onBack}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <ArrowLeft size={16} />
              Back to Feedback Form
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
