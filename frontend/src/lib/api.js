// lib/api.js
// -----------------------------------------------------------------------------
// One tiny fetch wrapper.
//
// Why a wrapper?
//   - Adds the JWT (if any) automatically.
//   - Throws an Error with the backend's `error` message so React Query
//     can show it to the user.
//   - In dev the Vite proxy handles the base URL; in prod, set VITE_API_BASE.
// -----------------------------------------------------------------------------

const BASE = import.meta.env.VITE_API_BASE || ''; // empty → use same origin / proxy

let getToken = () => null;
export function bindTokenGetter(fn) {
  getToken = fn;
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(method, path, body, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const url = BASE + path;
  const res = await fetch(url, { method, headers, body: payload });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || res.statusText || 'Request failed';
    throw new ApiError(message, res.status, data && data.details);
  }

  return data;
}

export const api = {
  get:    (path)             => request('GET',    path),
  post:   (path, body)       => request('POST',   path, body),
  put:    (path, body)       => request('PUT',    path, body),
  patch:  (path, body)       => request('PATCH',  path, body),
  del:    (path)             => request('DELETE', path),
  upload: (path, file)       => {
    const form = new FormData();
    form.append('file', file);
    return request('POST', path, form);
  },
};
