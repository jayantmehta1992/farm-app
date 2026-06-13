import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  // --- Items state (MongoDB) ------------------------------------------------
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // --- Notes state (SQLite) -------------------------------------------------
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    (async () => {
      await Promise.all([loadItems(), loadNotes()]);
    })();
  }, []);

  // --- Items ----------------------------------------------------------------
  async function loadItems() {
    const res = await fetch(`${API_URL}/items`);
    setItems(await res.json());
  }

  async function handleItemSubmit(e) {
    e.preventDefault();
    if (!name) return;
    await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    setName('');
    setDescription('');
    loadItems();
  }

  // --- Notes ----------------------------------------------------------------
  async function loadNotes() {
    const res = await fetch(`${API_URL}/notes`);
    setNotes(await res.json());
  }

  async function handleNoteSubmit(e) {
    e.preventDefault();
    if (!title) return;
    await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    setTitle('');
    setContent('');
    loadNotes();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">FARM App</h1>
      <p className="text-sm text-gray-400 mt-1 mb-10">
        FastAPI · React · MongoDB · SQLite
      </p>

      {/* ---- Items (MongoDB) ----------------------------------------------- */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Items</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
            MongoDB
          </span>
        </div>

        <form onSubmit={handleItemSubmit} className="flex gap-2 mb-4 flex-wrap">
          <input
            className="flex-1 min-w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="flex-1 min-w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 cursor-pointer"
          >
            Add
          </button>
        </form>

        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item._id} className="px-4 py-3 border border-gray-100 rounded-lg text-sm">
              <span className="font-medium text-gray-800">{item.name}</span>
              {item.description && (
                <span className="text-gray-500"> — {item.description}</span>
              )}
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">No items yet. Add one above!</p>
        )}
      </section>

      {/* ---- Notes (SQLite) ------------------------------------------------ */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
            SQLite
          </span>
        </div>

        <form onSubmit={handleNoteSubmit} className="flex gap-2 mb-4 flex-wrap">
          <input
            className="flex-1 min-w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="flex-1 min-w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Content (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            Add
          </button>
        </form>

        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="px-4 py-3 border border-gray-100 rounded-lg text-sm">
              <span className="font-medium text-gray-800">{note.title}</span>
              {note.content && (
                <span className="text-gray-500"> — {note.content}</span>
              )}
            </li>
          ))}
        </ul>
        {notes.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">No notes yet. Add one above!</p>
        )}
      </section>
    </div>
  );
}

export default App;
