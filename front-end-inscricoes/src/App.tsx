import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/cliente/*" element={<ClientLayout />} />
      </Routes>
    </Router>
  );
}

export default App;