import { request } from './client';

const BASE = '/items';

export const fetchItems = () =>
  request(BASE);

export const createItem = (item) =>
  request(BASE, { method: 'POST', body: JSON.stringify(item) });

export const updateItem = (id, item) =>
  request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(item) });

export const deleteItem = (id) =>
  request(`${BASE}/${id}`, { method: 'DELETE' });
