import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react'

export default function FeedbackForm({ onAdminClick }) {
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('Please enter a feedback message.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('feedback')
        .insert([
          {
            message: message.trim(),
            category: category,
            is_reviewed: false
          }
        ])

      if (insertError) {
        throw insertError
      }

      setSubmitted(true)
      setMessage('')
      setCategory('general')
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError(err.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="glass-card success-screen">
        <div className="success-icon-wrapper">
          <CheckCircle2 size={40} />
        </div>
        <h2>Feedback Submitted!</h2>
        <p>
          Thank you for your anonymous feedback. Our team has received your submission and will review it shortly.
        </p>
        <button 
          onClick={() => setSubmitted(false)} 
          className="btn btn-primary"
        >
          Submit Another Feedback
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <MessageSquare className="logo-icon" size={28} />
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Send Anonymous Feedback</h2>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-control"
            disabled={loading}
          >
            <option value="general">General Feedback</option>
            <option value="suggestion">Suggestion</option>
            <option value="complaint">Complaint</option>
            <option value="appreciation">Appreciation</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">Your Feedback</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here... Feel free to be completely honest, your submission is 100% anonymous."
            className="form-control"
            disabled={loading}
            maxLength={1000}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <button 
            type="button" 
            className="admin-link-btn"
            onClick={onAdminClick}
          >
            Admin Sign In
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
            {!loading && <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  )
}
