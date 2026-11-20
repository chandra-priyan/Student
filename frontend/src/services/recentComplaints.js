const STORAGE_KEY = 'campuscare.recentComplaintIds';
const COMPLAINT_ID_PATTERN = /^SC-\d{4}-[A-F0-9]{8}$/i;

export function getRecentComplaintIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored)
      ? stored.filter((id) => typeof id === 'string' && COMPLAINT_ID_PATTERN.test(id)).slice(0, 3)
      : [];
  } catch {
    return [];
  }
}

export function rememberComplaintId(complaintId) {
  try {
    const ids = getRecentComplaintIds().filter((id) => id !== complaintId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([complaintId, ...ids].slice(0, 3)));
    return true;
  } catch {
    return false;
  }
}
