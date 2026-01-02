import React, { useState, useEffect } from 'react';
import { Trash2, Sparkles, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

// Mood options configuration
const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'bg-green-100 border-green-200' },
  { emoji: '😌', label: 'Calm', color: 'bg-blue-100 border-blue-200' },
  { emoji: '😔', label: 'Sad', color: 'bg-indigo-100 border-indigo-200' },
  { emoji: '😴', label: 'Tired', color: 'bg-slate-100 border-slate-200' },
  { emoji: '😡', label: 'Angry', color: 'bg-red-100 border-red-200' },
];

const MoodTracker = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (!currentUser) return;

    // Real-time listener for user's mood entries
    const q = query(
      collection(db, 'moodEntries'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(entriesData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- Handlers ---
  const handleSave = async () => {
    if (!selectedMood || !currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'moodEntries'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        mood: {
          emoji: selectedMood.emoji,
          label: selectedMood.label,
          color: selectedMood.color
        },
        note: note,
        timestamp: new Date(),
        date: new Date().toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      });

      // Reset form
      setNote('');
      setSelectedMood(null);
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'moodEntries', id));
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex justify-center">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2 relative">
          <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-700 tracking-tight">Moodly</h1>
          <p className="text-slate-400 text-sm">How are you feeling today?</p>
          
          {/* User info and logout */}
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <span className="text-xs text-slate-400">{currentUser?.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-full transition-colors group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
            </button>
          </div>
        </header>

        {/* Input Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 space-y-6">
          
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Mood</label>
            <div className="flex justify-between gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m)}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-2xl w-full transition-all duration-200
                    ${selectedMood?.label === m.label 
                      ? `${m.color} scale-105 shadow-sm border-2` 
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}
                  `}
                >
                  <span className="text-2xl mb-1">{m.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Reflection</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?..."
              className="w-full h-24 p-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-slate-600 placeholder:text-slate-300 resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!selectedMood || loading}
            className={`
              w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300
              ${selectedMood && !loading
                ? 'bg-indigo-400 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-200 cursor-pointer' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            {loading ? 'SAVING...' : 'LOG ENTRY'}
          </button>
        </div>

        {/* Entries Feed */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-10 text-slate-300">
              <p>No entries yet. Start your journal above!</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div 
                key={entry.id} 
                className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-50 hover:shadow-md transition-all duration-300 flex flex-col gap-3 relative overflow-hidden"
              >
                {/* Decorative side bar based on mood color */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${entry.mood.color.split(' ')[0]}`}></div>
                
                <div className="flex justify-between items-start pl-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-slate-50 p-2 rounded-xl">{entry.mood.emoji}</span>
                    <div>
                      <h3 className="font-bold text-slate-700">{entry.mood.label}</h3>
                      <div className="flex items-center text-xs text-slate-400 gap-1">
                        <Calendar className="w-3 h-3" />
                        {entry.date}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {entry.note && (
                  <p className="text-slate-600 text-sm leading-relaxed pl-3 pt-2 border-t border-slate-50 mt-1">
                    {entry.note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default MoodTracker;
