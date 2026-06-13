import { request } from './client';

const BASE = '/notes';

export const fetchNotes = () =>
  request(BASE);

export const createNote = (note) =>
  request(BASE, { method: 'POST', body: JSON.stringify(note) });

export const updateNote = (id, note) =>
  request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(note) });

export const deleteNote = (id) =>
  request(`${BASE}/${id}`, { method: 'DELETE' });
