import { memo } from 'react';
import EntryItem from './EntryItem';

function EntryList({ items, idKey, fields, onUpdate, onDelete, color }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <EntryItem
          key={item[idKey]}
          id={item[idKey]}
          data={item}
          fields={fields}
          color={color}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default memo(EntryList);
