const API_URL = '/api/daily-report';

const getToken = () => localStorage.getItem('token');

export async function getDailyReport(date) {
  const dateStr = date.toISOString().split('T')[0];
  const response = await fetch(`${API_URL}?date=${dateStr}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return { data: null };
    }
    throw new Error('Error loading report');
  }
  return response.json();
}

export async function updateDailyReport(date, data) {
  const dateStr = date.toISOString().split('T')[0];
  const response = await fetch(`${API_URL}?date=${dateStr}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      date: dateStr,
      ...data,
    }),
  });

  if (!response.ok) throw new Error('Error saving report');
  return response.json();
}
