import React, { useState, useEffect } from 'react';
import { Trash2, Sparkles, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import AIBot from '../components/AIBot';

// Mood options configuration
const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'bg-green-100 border-green-200' },
  { emoji: '😌', label: 'Calm', color: 'bg-blue-100 border-blue-200' },
  { emoji: '😔', label: 'Sad', color: 'bg-indigo-100 border-indigo-200' },
  { emoji: '😴', label: 'Tired', color: 'bg-slate-100 border-slate-200' },
  { emoji: '😡', label: 'Angry', color: 'bg-red-100 border-red-200' },
  { emoji: '😰', label: 'Anxious', color: 'bg-yellow-100 border-yellow-200' },
  { emoji: '🤗', label: 'Grateful', color: 'bg-pink-100 border-pink-200' },
  { emoji: '😎', label: 'Confident', color: 'bg-cyan-100 border-cyan-200' },
];

const MoodTracker = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);

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
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

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

      // Langsung tampilkan refleksi tanpa popup konfirmasi
      setShowAI(true);

      // Reset form setelah delay agar modal muncul dulu
      setTimeout(() => {
        setNote('');
        setSelectedMood(null);
      }, 100);
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
        {/* Modal Ajakan Konsultasi AI */}
        {showAIPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-4">
              <div className="text-center">
                <div className="inline-block p-3 bg-purple-100 rounded-full mb-3">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  {selectedMood?.label === 'Sad' || selectedMood?.label === 'Tired' || selectedMood?.label === 'Anxious' || selectedMood?.label === 'Angry'
                    ? 'Yuk, semangat! 💪'
                    : 'Mantap! Tetap jaga energi positifmu! ✨'}
                </h3>
                <p className="text-slate-500 text-sm">
                  Dapatkan kata-kata refleksi untuk menemanimu hari ini
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAIPrompt(false);
                    setShowAI(false);
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Nanti Aja
                </button>
                <button
                  onClick={() => {
                    setShowAIPrompt(false);
                    setShowAI(true);
                  }}
                  className="flex-1 py-3 rounded-xl bg-indigo-400 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-200 transition-colors"
                >
                  Lihat Refleksi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Refleksi - mobile friendly */}
        {showAI && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-5 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-500 flex items-center gap-2">
                      <span role="img" aria-label="sparkle">✨</span> Refleksi Harian
                    </h2>
                    {/* <p className="text-slate-500 text-sm mt-1">Katax-kata inspiratif untuk menemanimu hari ini</p> */}
                  </div>
                  <button
                    onClick={() => setShowAI(false)}
                    className="text-slate-400 hover:text-slate-600 text-3xl leading-none -mt-1"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="px-6 py-5">
                <AIBot mood={selectedMood?.label} />
              </div>
            </div>
          </div>
        )}


        {/* Header + Logout button in top right */}
        <header className="text-center space-y-2 relative">
          <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-700 tracking-tight">Moodly</h1>
          <p className="text-slate-400 text-sm">How are you feeling today?</p>
          {/* Logout button in top right */}
          <div className="absolute top-2 right-2 group">
            <button
              onClick={handleLogout}
              className="p-2 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500" />
            </button>
            {/* Email appears on hover */}
            <span className="absolute right-12 top-1 bg-white px-3 py-1 rounded shadow text-xs text-slate-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {currentUser?.email}
            </span>
          </div>
        </header>

        {/* Input Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 space-y-6">
          
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Mood</label>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleMoodSelect(m)}
                  className={`
                    flex flex-col items-center justify-center min-w-[64px] p-3 rounded-2xl transition-all duration-200
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
            <>
              {(showAllEntries ? entries : entries.slice(0, 4)).map((entry) => (
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
              ))}
              
              {/* Button Lihat Lainnya */}
              {entries.length > 4 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowAllEntries(!showAllEntries)}
                    className="px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-500 font-semibold rounded-xl transition-colors duration-200 text-sm"
                  >
                    {showAllEntries ? 'Lihat Lebih Sedikit' : `Lihat Lainnya (${entries.length - 4} lagi)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default MoodTracker;
