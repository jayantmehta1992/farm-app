import { useState, useCallback, Suspense } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote } from '../api/notes';
import AddForm from './ui/AddForm';
import SuspendedList from './ui/SuspendedList';

const FIELDS = [
  { key: 'title',   placeholder: 'Title',             required: true },
  { key: 'content', placeholder: 'Content (optional)'                },
];

export default function NotesSection() {
  const [promise, setPromise] = useState(() => fetchNotes());

  const refresh = useCallback(() => setPromise(fetchNotes()), []);

  const handleSubmit = useCallback(async (values) => {
    await createNote(values);
    refresh();
  }, [refresh]);

  const handleUpdate = useCallback(async (id, values) => {
    await updateNote(id, values);
    refresh();
  }, [refresh]);

  const handleDelete = useCallback(async (id) => {
    await deleteNote(id);
    refresh();
  }, [refresh]);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
          SQLite
        </span>
      </div>
      <AddForm fields={FIELDS} color="blue" onSubmit={handleSubmit} />
      <Suspense fallback={<p className="text-sm text-gray-400 mt-2">Loading…</p>}>
        <SuspendedList
          promise={promise}
          idKey="id"
          fields={FIELDS}
          color="blue"
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          emptyMessage="No notes yet. Add one above!"
        />
      </Suspense>
    </section>
  );
}
