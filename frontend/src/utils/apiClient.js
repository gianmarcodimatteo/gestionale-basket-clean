let toastCallback = null;
let navigateCallback = null;

export function setToastCallback(callback) {
  toastCallback = callback;
}

export function setNavigateCallback(callback) {
  navigateCallback = callback;
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (navigateCallback) {
        navigateCallback('/login');
      }
      if (toastCallback) {
        toastCallback('Session expired. Please login again.', 'error');
      }
      throw new Error('Unauthorized');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      if (toastCallback) {
        toastCallback(data.error || 'You do not have permission to perform this action.', 'error');
      }
      throw new Error(data.error || 'Access denied');
    }

    // Handle other errors
    if (toastCallback) {
      toastCallback(data.error || 'An error occurred', 'error');
    }
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export async function apiGet(url) {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handleResponse(response);
}

export async function apiPost(url, body) {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function apiPut(url, body) {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function apiDelete(url) {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handleResponse(response);
}
