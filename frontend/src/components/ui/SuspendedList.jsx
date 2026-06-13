import { use } from 'react';
import EntryList from './EntryList';
import EmptyState from './EmptyState';

// Calls use(promise) which suspends until the fetch resolves.
// Must be rendered inside a <Suspense> boundary.
export default function SuspendedList({ promise, idKey, fields, color, onUpdate, onDelete, emptyMessage }) {
  const items = use(promise);
  return (
    <>
      <EntryList
        items={items}
        idKey={idKey}
        fields={fields}
        color={color}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
      {items.length === 0 && <EmptyState message={emptyMessage} />}
    </>
  );
}
