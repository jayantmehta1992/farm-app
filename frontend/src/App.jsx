import ItemsSection from './components/ItemsSection';
import NotesSection from './components/NotesSection';

function App() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">FARM App</h1>
      <p className="text-sm text-gray-400 mt-1 mb-10">
        FastAPI · React · MongoDB · SQLite
      </p>
      <ItemsSection />
      <NotesSection />
    </div>
  );
}

export default App;
