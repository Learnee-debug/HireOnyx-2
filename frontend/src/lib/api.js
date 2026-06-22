const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const TOKEN_KEY = 'hireonyx_token';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Request failed.');
  }
  return json;
}

export const api = {
  auth: {
    signup: (data) => request('/api/auth/signup', { method: 'POST', body: data, auth: false }),
    login: (data) => request('/api/auth/login', { method: 'POST', body: data, auth: false }),
    me: () => request('/api/auth/me'),
  },
  jobs: {
    list: () => request('/api/jobs', { auth: false }),
    getOne: (id) => request(`/api/jobs/${id}`, { auth: false }),
    mine: () => request('/api/jobs/mine'),
    create: (data) => request('/api/jobs', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/jobs/${id}`, { method: 'PATCH', body: data }),
    applicants: (id) => request(`/api/jobs/${id}/applicants`),
  },
  applications: {
    create: (data) => request('/api/applications', { method: 'POST', body: data }),
    mine: () => request('/api/applications/mine'),
    check: (jobId) => request(`/api/applications/check/${jobId}`),
    recruiterAll: () => request('/api/applications/recruiter'),
    updateStatus: (id, status) => request(`/api/applications/${id}`, { method: 'PATCH', body: { status } }),
  },
};
