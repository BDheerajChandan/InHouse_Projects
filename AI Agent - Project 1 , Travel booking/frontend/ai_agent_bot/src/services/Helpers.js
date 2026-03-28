// Helpers.js

/**
 * Format an ISO date string to human-readable form.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Format a booked_at datetime string.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/** Vehicle → icon mapping */
export const VEHICLE_ICONS = {
  train:  '🚆',
  bus:    '🚌',
  flight: '✈️',
  car:    '🚗',
  bike:   '🏍️',
}

/** Tool → readable label */
export const TOOL_LABELS = {
  create_booking:     'Booking Created',
  get_travel_history: 'Travel History',
  delete_booking:     'Booking Deleted',
  update_booking:     'Booking Updated',
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Suggested quick prompts */
export const QUICK_PROMPTS = [
  'Book a train ticket from BBSR to VSKP',
  'Book a flight from Delhi to Mumbai tomorrow',
  'Show me my travel history',
  'Show me all train bookings',
  'Show me travel history between 2025-01-01 and 2025-12-31',
  'Book a bus from Hyderabad to Bangalore',
]