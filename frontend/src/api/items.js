const API_URL = import.meta.env.VITE_API_URL;

export async function fetchItems() {
  const res = await fetch(`${API_URL}/items`);
  return res.json();
}

export async function createItem(item) {
  await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export async function updateItem(id, item) {
  await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export async function deleteItem(id) {
  await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' });
}
