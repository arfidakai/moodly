import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MoodTracker from './pages/MoodTracker';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('moodly-dark') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('moodly-dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('moodly-dark', 'false');
    }
  }, [darkMode]);

  return (
    <Router>
      <AuthProvider>
        <button
          onClick={() => setDarkMode(d => !d)}
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl shadow bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MoodTracker />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;