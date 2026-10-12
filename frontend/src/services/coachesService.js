const API_URL = '/api/coaches';

const getToken = () => localStorage.getItem('token');

export async function getCoachesReports(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error loading coaches reports');
  return response.json();
}

export async function deleteCoachesReport(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error deleting coaches report');
  return response.json();
}
