import { useState, useCallback, useMemo, memo } from 'react';

function EntryItem({ id, data, fields, onUpdate, onDelete, color = 'green' }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(data);

  const borderClass = color === 'blue' ? 'border-blue-400'            : 'border-green-400';
  const ringClass   = color === 'blue' ? 'focus:ring-blue-500'        : 'focus:ring-green-500';
  const btnClass    = color === 'blue' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-green-700 hover:bg-green-800';

  const primary   = useMemo(() => fields[0],        [fields]);
  const secondary = useMemo(() => fields.slice(1),  [fields]);

  const handleChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleEditStart = useCallback(() => {
    setValues(data);
    setEditing(true);
  }, [data]);

  const handleCancel = useCallback(() => {
    setEditing(false);
  }, []);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    await onUpdate(id, values);
    setEditing(false);
  }, [onUpdate, id, values]);

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [onDelete, id]);

  if (editing) {
    return (
      <li>
        <form onSubmit={handleSave} className="flex gap-2 flex-wrap">
          {fields.map((f) => (
            <input
              key={f.key}
              className={`flex-1 min-w-36 px-3 py-2 text-sm border ${borderClass} rounded-lg focus:outline-none focus:ring-2 ${ringClass}`}
              value={values[f.key] ?? ''}
              onChange={(e) => handleChange(f.key, e.target.value)}
            />
          ))}
          <button type="submit" className={`px-3 py-2 text-sm font-medium ${btnClass} text-white rounded-lg cursor-pointer`}>Save</button>
          <button type="button" onClick={handleCancel} className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg text-sm">
      <span>
        <span className="font-medium text-gray-800">{data[primary.key]}</span>
        {secondary.map((f) =>
          data[f.key] ? <span key={f.key} className="text-gray-500"> — {data[f.key]}</span> : null
        )}
      </span>
      <div className="flex gap-2 ml-4 shrink-0">
        <button onClick={handleEditStart} className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">Edit</button>
        <button onClick={handleDelete} className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 cursor-pointer">Delete</button>
      </div>
    </li>
  );
}

export default memo(EntryItem);
