const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
};

export const publicApi = {
  stats: () => api('/public/stats'),
};

export const ticketApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/tickets${q ? `?${q}` : ''}`);
  },
  stats: () => api('/tickets/stats'),
  get: (id) => api(`/tickets/${id}`),
  create: (body) => api('/tickets', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => api(`/tickets/${id}`, { method: 'DELETE' }),
  addComment: (id, body) =>
    api(`/tickets/${id}/comments`, { method: 'POST', body: JSON.stringify(body) }),
};

export const adminApi = {
  listTickets: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/admin/tickets${q ? `?${q}` : ''}`);
  },
  updateTicket: (id, body) =>
    api(`/admin/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  stats: () => api('/admin/stats'),
  admins: () => api('/admin/admins'),
  activity: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/admin/activity${q ? `?${q}` : ''}`);
  },
};

export const notificationApi = {
  list: () => api('/notifications'),
  markRead: (id) => api(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => api('/notifications/read-all', { method: 'PATCH' }),
};
