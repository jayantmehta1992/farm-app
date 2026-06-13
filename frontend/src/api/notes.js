const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchNotes() {
  const res = await fetch(`${API_URL}/notes`);
  return res.json();
}

export async function createNote(note) {
  await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
}

export async function updateNote(id, note) {
  await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
}

export async function deleteNote(id) {
  await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' });
}
