const BASE = 'https://dummyjson.com';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new Error('Network error. Check your internet connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const PAGE_SIZE = 12;

/** Products list: plain, search, or category, always with pagination + sortBy/order. */
export function getProducts({ q = '', category = '', sortBy = '', order = 'asc', page = 1, limit = PAGE_SIZE }) {
  const p = new URLSearchParams({ limit, skip: (page - 1) * limit });
  if (sortBy) {
    p.set('sortBy', sortBy);
    p.set('order', order);
  }
  if (q) {
    p.set('q', q);
    return request(`/products/search?${p}`);
  }
  if (category) return request(`/products/category/${encodeURIComponent(category)}?${p}`);
  return request(`/products?${p}`);
}

export const getProduct = (id) => request(`/products/${id}`);
export const getCategories = () => request('/products/categories');
export const getDemoUsers = (limit = 6) =>
  request(`/users?limit=${limit}&select=username,password,firstName,lastName,image`);

export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  });
export const getMe = (token) => request('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
export const getUserCarts = (id) => request(`/carts/user/${id}`);
export const submitCart = (userId, products) =>
  request('/carts/add', { method: 'POST', body: JSON.stringify({ userId, products }) });
