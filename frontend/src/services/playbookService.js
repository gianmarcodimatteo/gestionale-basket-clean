const API_URL = '/api/playbook';

const getToken = () => localStorage.getItem('token');

export async function getPlaybooks(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error loading playbooks');
  return response.json();
}

export async function getPlaybookById(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error loading playbook');
  return response.json();
}


export async function createPlaybook(data) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('side', data.side);
  formData.append('notes', data.notes);
  if (data.file) {
    formData.append('file', data.file);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Error creating playbook');
  return response.json();
}

export async function updatePlaybook(id, data) {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  if (data.side) formData.append('side', data.side);
  if (data.notes) formData.append('notes', data.notes);
  if (data.file) formData.append('file', data.file);

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Error updating playbook');
  return response.json();
}

export async function deletePlaybook(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error deleting playbook');
  return response.json();
}
