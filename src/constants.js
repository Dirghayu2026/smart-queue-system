export const PURPOSES = [
  { value: 'fee_payment', label: '💰 Fee Payment', color: '#00b4d8' },
  { value: 'document_submission', label: '📄 Document Submission', color: '#f5a623' },
  { value: 'refund_request', label: '💵 Refund Request', color: '#ff6b35' },
  { value: 'certificate_collection', label: '📜 Certificate Collection', color: '#00ff88' },
  { value: 'enquiry', label: '❓ Enquiry', color: '#6c757d' }
];

export const ADMIN_STATUSES = [
  { value: 'available', label: 'Available', color: '#28a745' },
  { value: 'busy', label: 'Busy', color: '#dc3545' },
  { value: 'break', label: 'On Break', color: '#ffc107' }
];

export const LUNCH_START = 13; // 1 PM
export const LUNCH_END = 14;   // 2 PM

export const STATUS_CONFIG = {
  waiting: { label: 'Waiting', color: '#6c757d', icon: '⏳', threshold: 5 },
  upcoming: { label: 'Upcoming', color: '#00b4d8', icon: '🔵', threshold: 1 },
  almost: { label: 'Almost There!', color: '#ff6b35', icon: '⚠️', threshold: 0 },
  turn: { label: 'YOUR TURN!', color: '#00ff88', icon: '🔔', threshold: -1 }
};