import { useState, useCallback, useMemo } from 'react';

export default function AddForm({ fields, onSubmit, color = 'green' }) {
  const empty = useMemo(() => Object.fromEntries(fields.map((f) => [f.key, ''])), [fields]);
  const [values, setValues] = useState(empty);

  const ringClass = color === 'blue' ? 'focus:ring-blue-500' : 'focus:ring-green-500';
  const btnClass  = color === 'blue' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-green-700 hover:bg-green-800';

  const handleChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const required = fields.find((f) => f.required);
    if (required && !values[required.key]) return;
    await onSubmit(values);
    setValues(empty);
  }, [fields, values, onSubmit, empty]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4 flex-wrap">
      {fields.map((f) => (
        <input
          key={f.key}
          className={`flex-1 min-w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ringClass}`}
          placeholder={f.placeholder}
          value={values[f.key]}
          onChange={(e) => handleChange(f.key, e.target.value)}
        />
      ))}
      <button type="submit" className={`px-4 py-2 text-sm font-medium ${btnClass} text-white rounded-lg cursor-pointer`}>
        Add
      </button>
    </form>
  );
}
