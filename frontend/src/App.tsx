import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/dashboard.tsx';
import BranchEditor from '@/pages/editor.tsx';
import { Link } from "react-router-dom";

function App() {
  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
          </li>
          <li>
            <Link to="/editor" className="text-white hover:text-gray-300">Editor</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<BranchEditor />} />
      </Routes>
    </div>
  );
}

export default App;