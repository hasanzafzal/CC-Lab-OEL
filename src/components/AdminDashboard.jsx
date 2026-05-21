import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import FeedbackItem from './FeedbackItem'
import { 
  LogOut, 
  Filter, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react'

export default function AdminDashboard({ onLogout }) {
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Real-time connection status
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  // Filters State
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'reviewed'
  const [categoryFilter, setCategoryFilter] = useState('all') // 'all', 'general', 'suggestion', 'complaint', 'appreciation'

  // Fetch feedback function
  const fetchFeedback = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setFeedbackList(data || [])
    } catch (err) {
      console.error('Error fetching feedback:', err)
      setError('Failed to fetch feedback submissions.')
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time updates
  useEffect(() => {
    fetchFeedback()

    // Setup realtime subscription
    const channel = supabase
      .channel('feedback-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback' },
        (payload) => {
          console.log('Realtime change received:', payload)
          // Refetch to ensure all sorting, limits, and records are perfectly aligned
          fetchFeedback()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true)
        } else {
          setRealtimeConnected(false)
        }
      })

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Local handlers for immediate UI responsiveness before real-time event updates
  const handleItemDelete = (deletedId) => {
    setFeedbackList(prev => prev.filter(item => item.id !== deletedId))
  }

  const handleItemUpdate = (updatedId, newStatus) => {
    setFeedbackList(prev => 
      prev.map(item => item.id === updatedId ? { ...item, is_reviewed: newStatus } : item)
    )
  }

  // Stats calculation
  const totalSubmissions = feedbackList.length
  const pendingCount = feedbackList.filter(item => !item.is_reviewed).length
  const reviewedCount = feedbackList.filter(item => item.is_reviewed).length
  const complaintCount = feedbackList.filter(item => item.category === 'complaint').length

  // Filtered list
  const filteredFeedbackList = feedbackList.filter(item => {
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'reviewed' && item.is_reviewed) || 
      (statusFilter === 'pending' && !item.is_reviewed)

    const matchesCategory = 
      categoryFilter === 'all' || 
      item.category === categoryFilter

    return matchesStatus && matchesCategory
  })

  return (
    <div className="dashboard-grid">
      {/* Dashboard Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Feedback Submissions</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Monitor and manage feedback sent by visitors anonymously
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {realtimeConnected ? (
            <div className="realtime-badge">
              <span className="pulse-dot"></span>
              Live Feed Connected
            </div>
          ) : (
            <div className="realtime-badge" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)' }}>
              Real-time Offline
            </div>
          )}
          <button 
            onClick={fetchFeedback} 
            className="btn btn-secondary btn-sm"
            title="Refresh database feed"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: 'var(--accent-glow)', color: 'var(--accent-color)' }}>
            <MessageSquare size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Submissions</h4>
            <div className="stat-value">{totalSubmissions}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: 'var(--pending-glow)', color: 'var(--pending-color)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Pending Review</h4>
            <div className="stat-value">{pendingCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: 'var(--success-glow)', color: 'var(--success-color)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Reviewed Items</h4>
            <div className="stat-value">{reviewedCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: 'var(--danger-glow)', color: 'var(--danger-color)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h4>Complaints</h4>
            <div className="stat-value">{complaintCount}</div>
          </div>
        </div>
      </div>

      {/* Filtering Actions */}
      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={16} className="empty-icon" style={{ margin: 0 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
          <div className="filter-btn-group">
            <button 
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'reviewed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('reviewed')}
            >
              Reviewed
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category:</span>
          <div className="filter-btn-group">
            <button 
              className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${categoryFilter === 'general' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('general')}
            >
              General
            </button>
            <button 
              className={`filter-btn ${categoryFilter === 'suggestion' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('suggestion')}
            >
              Suggestions
            </button>
            <button 
              className={`filter-btn ${categoryFilter === 'complaint' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('complaint')}
            >
              Complaints
            </button>
            <button 
              className={`filter-btn ${categoryFilter === 'appreciation' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('appreciation')}
            >
              Appreciation
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Feedback List */}
      {loading ? (
        <div className="empty-state">
          <RefreshCw className="empty-icon spin" style={{ animation: 'spin 2s linear infinite' }} />
          <p>Syncing anonymous messages...</p>
        </div>
      ) : filteredFeedbackList.length === 0 ? (
        <div className="glass-card empty-state">
          <Search className="empty-icon" size={40} />
          <h3>No submissions found</h3>
          <p>
            {feedbackList.length === 0 
              ? "No visitors have submitted any feedback yet." 
              : "Try adjusting your category or review filters to see items."}
          </p>
        </div>
      ) : (
        <div className="feedback-list">
          {filteredFeedbackList.map((item) => (
            <FeedbackItem
              key={item.id}
              item={item}
              onDelete={handleItemDelete}
              onUpdate={handleItemUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
