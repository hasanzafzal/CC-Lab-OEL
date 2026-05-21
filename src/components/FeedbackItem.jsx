import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Trash2, Calendar, AlertCircle } from 'lucide-react'

export default function FeedbackItem({ item, onDelete, onUpdate }) {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleStatusToggle = async () => {
    setUpdating(true)
    const newStatus = !item.is_reviewed

    try {
      const { data, error } = await supabase
        .from('feedback')
        .update({ is_reviewed: newStatus })
        .eq('id', item.id)
        .select()

      if (error) {
        throw error
      }

      onUpdate(item.id, newStatus)
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status. Please make sure the RLS policy is configured correctly.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this feedback item?')
    if (!confirmDelete) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', item.id)

      if (error) {
        throw error
      }

      onDelete(item.id)
    } catch (err) {
      console.error('Error deleting feedback:', err)
      alert('Failed to delete item. Please make sure the RLS policy is configured correctly.')
      setDeleting(false)
    }
  }

  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'suggestion':
        return 'badge-suggestion'
      case 'complaint':
        return 'badge-complaint'
      case 'appreciation':
        return 'badge-appreciation'
      default:
        return 'badge-general'
    }
  }

  const getCategoryLabel = (category) => {
    switch (category?.toLowerCase()) {
      case 'suggestion':
        return 'Suggestion'
      case 'complaint':
        return 'Complaint'
      case 'appreciation':
        return 'Appreciation'
      default:
        return 'General'
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (e) {
      return dateString
    }
  }

  return (
    <div 
      className={`feedback-item ${item.is_reviewed ? 'reviewed' : 'pending'}`}
      style={{ opacity: deleting ? 0.4 : 1 }}
    >
      <div className="feedback-item-header">
        <div className="feedback-meta">
          <span className={`badge ${getCategoryBadgeClass(item.category)}`}>
            {getCategoryLabel(item.category)}
          </span>
          <span className="feedback-time">
            <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
            {formatDate(item.created_at)}
          </span>
        </div>
        
        <div>
          <span className={`badge ${item.is_reviewed ? 'badge-reviewed' : 'badge-pending'}`}>
            {item.is_reviewed ? 'Reviewed' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="feedback-message">
        {item.message}
      </div>

      <div className="feedback-actions">
        <label className="switch-label">
          <span>Reviewed</span>
          <input
            type="checkbox"
            checked={item.is_reviewed || false}
            onChange={handleStatusToggle}
            disabled={updating || deleting}
            className="switch-input"
          />
          <div className="switch-custom"></div>
        </label>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn btn-secondary btn-sm"
          style={{ 
            color: 'var(--danger-color)', 
            borderColor: 'rgba(239, 68, 68, 0.2)',
            padding: '6px 12px'
          }}
          title="Delete feedback permanently"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </div>
  )
}
