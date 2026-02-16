import React, { useState, useEffect } from 'react';
import { Trash2, Sparkles, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import AIBot from '../components/AIBot';

// Mood options configuration
const DEFAULT_MOODS = [
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

  const [topMood, setTopMood] = useState(null);

  // Custom Mood
  const [moods, setMoods] = useState(DEFAULT_MOODS);
  const [customEmoji, setCustomEmoji] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [customError, setCustomError] = useState('');
  const [showCustomSuccess, setShowCustomSuccess] = useState(false);

  useEffect(() => {
    if (!entries || entries.length === 0) {
      setTopMood(null);
      return;
    }
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const monthlyEntries = entries.filter(e => {
      const t = e.timestamp?.toDate ? e.timestamp.toDate() : new Date(e.timestamp);
      return t.getMonth() === thisMonth && t.getFullYear() === thisYear;
    });
    if (monthlyEntries.length === 0) {
      setTopMood(null);
      return;
    }
    const freq = {};
    monthlyEntries.forEach(e => {
      const label = e.mood?.label;
      if (label) freq[label] = (freq[label] || 0) + 1;
    });
    let max = 0, maxLabel = null;
    Object.entries(freq).forEach(([label, count]) => {
      if (count > max) {
        max = count;
        maxLabel = label;
      }
    });
    const moodObj = moods.find(m => m.label === maxLabel);
    setTopMood(moodObj ? { ...moodObj, count: max } : null);
  }, [entries]);

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

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'moodEntries', deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      alert('Failed to delete entry. Please try again.');
    } finally {
      setDeleting(false);
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
        {/* Modal Konfirmasi Hapus */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-4">
              <div className="text-center">
                <div className="inline-block p-3 bg-red-100 rounded-full mb-3">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                  Hapus Entry?
                </h3>
                <p className="text-slate-500 dark:text-slate-300 text-sm">
                  Entry mood ini akan dihapus permanen. Lanjutkan?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-red-400 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-200 transition-colors"
                  disabled={deleting}
                >
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}

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
              {moods.map((m) => (
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

            {/* Custom Mood Form */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={customEmoji}
                  onChange={e => setCustomEmoji(e.target.value)}
                  placeholder="Emoji"
                  className="w-16 text-2xl p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                  placeholder="Mood label"
                  className="flex-1 p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  maxLength={16}
                />
                <button
                  onClick={() => {
                    if (!customEmoji.trim() || !customLabel.trim()) {
                      setCustomError('Emoji dan label wajib diisi');
                      return;
                    }
                    if (moods.some(m => m.label.toLowerCase() === customLabel.trim().toLowerCase())) {
                      setCustomError('Label sudah ada');
                      return;
                    }
                    setMoods([...moods, {
                      emoji: customEmoji.trim(),
                      label: customLabel.trim(),
                      color: 'bg-purple-100 border-purple-200',
                    }]);
                    setCustomEmoji('');
                    setCustomLabel('');
                    setCustomError('');
                    setShowCustomSuccess(true);
                    setTimeout(() => setShowCustomSuccess(false), 1500);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-400 hover:bg-indigo-500 text-white font-semibold text-sm"
                >
                  Tambah
                </button>
                      {/* Modal sukses custom mood */}
                      {showCustomSuccess && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                          <div className="bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 shadow-xl border border-green-200 flex items-center gap-3">
                            <span className="text-2xl">🎉</span>
                            <span className="text-green-600 dark:text-green-300 font-semibold">Mood berhasil ditambahkan!</span>
                          </div>
                        </div>
                      )}
              </div>
              {customError && <div className="text-xs text-red-500 mt-1">{customError}</div>}
              <div className="text-xs text-slate-400">Tambah mood sendiri jika mood default kurang sesuai (emoji + label)</div>
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

        {/* Statistik Mood Bulan Ini */}
        {topMood && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3 text-indigo-700 text-sm font-semibold">
            <span className="text-2xl">{topMood.emoji}</span>
            Mood terbanyak bulan ini: <span className="ml-1 font-bold">{topMood.label}</span>
            <span className="ml-2 text-xs text-indigo-400">({topMood.count}x)</span>
          </div>
        )}

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
