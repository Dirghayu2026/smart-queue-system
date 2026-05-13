export const generateToken = (queueLength) => {
  const prefixes = ['A', 'B', 'C', 'D', 'E'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}${(queueLength + 1).toString().padStart(4, '0')}`;
};

export const formatTime = (date) => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

export const formatDate = (date) => {
  return date.toLocaleDateString();
};

export const calculateWaitTime = (position, avgServiceTimeMinutes) => {
  if (position <= 0) return 0;
  return Math.max(0, position) * avgServiceTimeMinutes;
};

export const formatWaitTime = (minutes) => {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.ceil(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const getQRCodeUrl = (counterName, baseUrl = window.location.origin) => {
  const params = new URLSearchParams({
    counter: counterName,
    timestamp: Date.now()
  });
  const queueUrl = `${baseUrl}/join?${params.toString()}`;
  // Using Google Charts API for QR generation
  return `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(queueUrl)}&chs=300x300&choe=UTF-8&chld=L|2`;
};

export const getPositionStatus = (position) => {
  if (position === null || position === undefined) return null;
  if (position === 1) return 'almost';
  if (position <= 5) return 'upcoming';
  return 'waiting';
};