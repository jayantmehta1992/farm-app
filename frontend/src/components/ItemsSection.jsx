import { useState, useCallback, Suspense } from 'react';
import { fetchItems, createItem, updateItem, deleteItem } from '../api/items';
import AddForm from './ui/AddForm';
import SuspendedList from './ui/SuspendedList';

const FIELDS = [
  { key: 'name',        placeholder: 'Item name',             required: true },
  { key: 'description', placeholder: 'Description (optional)'                },
];

export default function ItemsSection() {
  const [promise, setPromise] = useState(() => fetchItems());

  const refresh = useCallback(() => setPromise(fetchItems()), []);

  const handleSubmit = useCallback(async (values) => {
    await createItem(values);
    refresh();
  }, [refresh]);

  const handleUpdate = useCallback(async (id, values) => {
    await updateItem(id, values);
    refresh();
  }, [refresh]);

  const handleDelete = useCallback(async (id) => {
    await deleteItem(id);
    refresh();
  }, [refresh]);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Items</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
          MongoDB
        </span>
      </div>
      <AddForm fields={FIELDS} color="green" onSubmit={handleSubmit} />
      <Suspense fallback={<p className="text-sm text-gray-400 mt-2">Loading…</p>}>
        <SuspendedList
          promise={promise}
          idKey="_id"
          fields={FIELDS}
          color="green"
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          emptyMessage="No items yet. Add one above!"
        />
      </Suspense>
    </section>
  );
}
