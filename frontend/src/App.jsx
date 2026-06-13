// App.jsx — our main React component (the UI of the page).

// useState lets a component "remember" values between renders (its state).
// useEffect lets us run code at certain times — e.g. when the page loads.
import { useState, useEffect } from 'react';
import './App.css';

// The address of our FastAPI backend, read from the .env file.
// Vite exposes any variable starting with VITE_ on import.meta.env.
// The "|| ..." part is a fallback used if the variable isn't set.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  // items   -> the current list of items (starts as an empty array)
  // setItems -> the function we call to update that list
  const [items, setItems] = useState([]);

  // The text the user is typing into the form inputs.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Ask the backend for all items and store them in state.
  async function loadItems() {
    const res = await fetch(`${API_URL}/items`);
    const data = await res.json();
    setItems(data);
  }

  // useEffect with an empty [] dependency list runs ONCE, when the
  // component first appears. Perfect for loading initial data.
  useEffect(() => {
    (async () => {
      await loadItems();
    })();
  }, []);

  // Runs when the form is submitted (the "Add" button).
  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's default page reload
    if (!name) return; // ignore empty submissions

    // Send a POST request with the new item as JSON.
    await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });

    // Clear the inputs and refresh the list so the new item shows up.
    setName('');
    setDescription('');
    loadItems();
  }

  // The "return" describes what to draw on screen. This JSX looks like
  // HTML but it's JavaScript — note className instead of class, and {}
  // to drop in JavaScript values.
  return (
    <div className="container">
      <h1>🚜 FARM App</h1>
      <p className="subtitle">FastAPI + React + MongoDB</p>

      <form onSubmit={handleSubmit} className="form">
        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <h2>Items ({items.length})</h2>
      <ul className="item-list">
        {/* Loop over items and draw one <li> for each. The "key" helps
            React track each row efficiently. */}
        {items.map((item) => (
          <li key={item._id}>
            <strong>{item.name}</strong>
            {item.description && <span> — {item.description}</span>}
          </li>
        ))}
      </ul>
      {items.length === 0 && <p>No items yet. Add one above!</p>}
    </div>
  );
}

export default App;
