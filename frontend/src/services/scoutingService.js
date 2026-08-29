import { uploadWithProgress } from '../utils/uploadWithProgress.js';

const API_URL = '/api/scouting';

const getToken = () => localStorage.getItem('token');

export async function getScoutingReports(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error loading scouting reports');
  return response.json();
}

export async function getScoutingReportById(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error loading scouting report');
  return response.json();
}

export async function createScoutingReport(data, onProgress) {
  const formData = new FormData();
  formData.append('opponent', data.opponent);
  if (data.matchDate) formData.append('matchDate', data.matchDate);
  if (data.content) formData.append('content', data.content);
  if (data.eventId) formData.append('eventId', data.eventId);
  if (data.strategy) formData.append('strategy', data.strategy);
  if (data.notes) formData.append('notes', data.notes);
  if (data.keyPlayers && data.keyPlayers.length > 0) {
    formData.append('keyPlayers', JSON.stringify(data.keyPlayers));
  }
  if (data.file) {
    formData.append('file', data.file);
  }

  return uploadWithProgress(API_URL, formData, 'POST', onProgress);
}

export async function updateScoutingReport(id, data, onProgress) {
  const formData = new FormData();
  if (data.opponent) formData.append('opponent', data.opponent);
  if (data.matchDate) formData.append('matchDate', data.matchDate);
  if (data.content) formData.append('content', data.content);
  if (data.eventId) formData.append('eventId', data.eventId);
  if (data.strategy) formData.append('strategy', data.strategy);
  if (data.notes) formData.append('notes', data.notes);
  if (data.keyPlayers) formData.append('keyPlayers', JSON.stringify(data.keyPlayers));
  if (data.file) formData.append('file', data.file);

  return uploadWithProgress(`${API_URL}/${id}`, formData, 'PUT', onProgress);
}

export async function deleteScoutingReport(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error deleting scouting report');
  return response.json();
}

export async function createScoutingNote(data) {
  const response = await fetch(`${API_URL}/notes/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Error creating scouting note');
  return response.json();
}

export async function getScoutingNotes(reportId) {
  const params = reportId ? `?reportId=${reportId}` : '';
  const response = await fetch(`${API_URL}/notes${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error loading scouting notes');
  return response.json();
}

export async function deleteScoutingNote(id) {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error('Error deleting scouting note');
  return response.json();
}
