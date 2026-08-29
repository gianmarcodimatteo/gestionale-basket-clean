import { uploadWithProgress } from '../utils/uploadWithProgress.js';

const API_URL = '/api/practices';

const getToken = () => localStorage.getItem('token');

export async function getTrainingSessions(page = 1, limit = 20, filters = {}) {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters,
  });

  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error loading training sessions');
  return response.json();
}

export async function getTrainingSessionById(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error loading training session');
  return response.json();
}

export async function createTrainingSession(data, onProgress) {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('date', data.date);
  formData.append('duration', data.duration);
  formData.append('type', data.type);
  if (data.description) formData.append('description', data.description);
  if (data.notes) formData.append('notes', data.notes);
  if (data.video) formData.append('video', data.video);
  if (data.participants) formData.append('participants', JSON.stringify(data.participants));

  return uploadWithProgress(API_URL, formData, 'POST', onProgress);
}

export async function updateTrainingSession(id, data, onProgress) {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('date', data.date);
  formData.append('duration', data.duration);
  formData.append('type', data.type);
  if (data.description) formData.append('description', data.description);
  if (data.notes) formData.append('notes', data.notes);
  if (data.video) formData.append('video', data.video);
  if (data.participants) formData.append('participants', JSON.stringify(data.participants));

  return uploadWithProgress(`${API_URL}/${id}`, formData, 'PUT', onProgress);
}

export async function deleteTrainingSession(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error deleting training session');
  return response.json();
}
