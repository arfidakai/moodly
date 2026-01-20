import React, { useState } from 'react';

// Daily reflection quotes from successful people
const reflectionQuotes = [
  {
    quote: "What you think, you become. What you feel, you attract. What you imagine, you create.",
    author: "Buddha",
    category: "manifesting"
  },
  {
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "self-awareness"
  },
  {
    quote: "Love yourself first and everything else falls into line.",
    author: "Lucille Ball",
    category: "self-love"
  },
  {
    quote: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
    author: "Buddha",
    category: "self-love"
  },
  {
    quote: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.",
    author: "Rumi",
    category: "self-awareness"
  },
  {
    quote: "The privilege of a lifetime is to become who you truly are.",
    author: "Carl Jung",
    category: "self-awareness"
  },
  {
    quote: "Knowing yourself is the beginning of all wisdom.",
    author: "Aristotle",
    category: "self-awareness"
  },
  {
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "self-love"
  },
  {
    quote: "The universe is not outside of you. Look inside yourself; everything that you want, you already are.",
    author: "Rumi",
    category: "manifesting"
  },
  {
    quote: "Your thoughts are the architects of your destiny.",
    author: "David O. McKay",
    category: "manifesting"
  },
  {
    quote: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
    category: "self-love"
  },
  {
    quote: "To love oneself is the beginning of a lifelong romance.",
    author: "Oscar Wilde",
    category: "self-love"
  },
  {
    quote: "When you arise in the morning, think of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love.",
    author: "Marcus Aurelius",
    category: "manifesting"
  },
  {
    quote: "The greatest discovery of my generation is that human beings can alter their lives by altering their attitudes of mind.",
    author: "William James",
    category: "self-awareness"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "manifesting"
  },
  {
    quote: "Self-care is not selfish. You cannot serve from an empty vessel.",
    author: "Eleanor Brown",
    category: "self-love"
  },
  {
    quote: "The most powerful relationship you will ever have is the relationship with yourself.",
    author: "Steve Maraboli",
    category: "self-awareness"
  },
  {
    quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "self-awareness"
  },
  {
    quote: "You are enough just as you are.",
    author: "Meghan Markle",
    category: "self-love"
  },
  {
    quote: "Whatever the mind can conceive and believe, it can achieve.",
    author: "Napoleon Hill",
    category: "manifesting"
  },
    {
    quote: "Actions are judged by intentions.",
    author: "Prophet Muhammad ﷺ",
    category: "self-awareness"
  },
  {
    quote: "The strong person is not the one who overcomes others, but the one who controls himself when angry.",
    author: "Prophet Muhammad ﷺ",
    category: "self-awareness"
  },
  {
    quote: "Make things easy and do not make them difficult. Give glad tidings and do not make people run away.",
    author: "Prophet Muhammad ﷺ",
    category: "self-love"
  },
  {
    quote: "Whoever puts his trust in God, He will be enough for him.",
    author: "Qur'an 65:3",
    category: "manifesting"
  },
  {
    quote: "Indeed, with hardship comes ease.",
    author: "Qur'an 94:6",
    category: "manifesting"
  },

  // === SAHABA & EARLY SCHOLARS ===
  {
    quote: "Call yourself to account before you are called to account.",
    author: "Umar ibn Al-Khattab",
    category: "self-awareness"
  },
  {
    quote: "Knowledge is not what is memorized, but what benefits.",
    author: "Imam Ash-Shafi'i",
    category: "self-awareness"
  },
  {
    quote: "Time is like a sword; if you do not cut it, it will cut you.",
    author: "Imam Ash-Shafi'i",
    category: "self-awareness"
  },
  {
    quote: "Patience is to faith what the head is to the body.",
    author: "Ali ibn Abi Talib",
    category: "self-awareness"
  },

  // === SUFI & ULAMA SPIRITUAL ===
  {
    quote: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
    category: "self-awareness"
  },
  {
    quote: "Why are you busy looking for heaven? You are already standing in it when you remember God.",
    author: "Rabi'ah Al-Adawiyah",
    category: "self-awareness"
  },
  {
    quote: "The heart becomes peaceful only when it knows who it belongs to.",
    author: "Imam Al-Ghazali",
    category: "self-awareness"
  },
  {
    quote: "Your soul is nourished by what you give, not by what you take.",
    author: "Hasan Al-Basri",
    category: "self-love"
  },
  {
    quote: "When the heart is sincere, even small deeds become great.",
    author: "Imam Ibn Ataillah",
    category: "manifesting"
  },

  // === MODERN ISLAMIC THINKERS ===
  {
    quote: "Faith is not just belief, it is a way of seeing the world.",
    author: "Seyyed Hossein Nasr",
    category: "self-awareness"
  },
  {
    quote: "True freedom is freeing the soul from dependence on anything other than God.",
    author: "Buya Hamka",
    category: "self-awareness"
  }

];

const AIBot = ({ mood }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Automatically get reflection when component mounts
  React.useEffect(() => {
    if (mood) {
      handleGetReflection();
    }
  }, [mood]);

  const handleGetReflection = () => {
    setLoading(true);
    
    // Map moods to quote categories
    const moodToCategory = {
      'Happy': 'manifesting',
      'Sad': 'self-love',
      'Anxious': 'self-awareness',
      'Tired': 'self-love',
      'Grateful': 'manifesting',
      'Confident': 'manifesting',
      'Calm': 'self-awareness',
      'Angry': 'self-awareness'
    };
    
    // Pesan pembuka berdasarkan mood
    const moodMessages = {
      'Happy': '🌟 Senang melihatmu bahagia! Terus jaga semangat ini ya!',
      'Calm': '🧘 Ketenangan adalah kekuatan. Tetap jaga inner peace-mu.',
      'Sad': '💙 It\'s okay to feel sad. Kamu kuat dan berani.',
      'Tired': '🌙 Kamu sudah bekerja keras. You deserve rest.',
      'Angry': '🔥 Kemarahanmu valid. That\'s self-awareness.',
      'Anxious': '🌸 Kamu tidak sendirian. Proud of you!',
      'Grateful': '🙏 Gratitude is powerful. Universe hears you.',
      'Confident': '💪 Yes! Keep believing in yourself!'
    };
    
    const category = moodToCategory[mood] || null;
    let selectedQuote;
    
    if (category) {
      const categoryQuotes = reflectionQuotes.filter(q => q.category === category);
      selectedQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
    } else {
      selectedQuote = reflectionQuotes[Math.floor(Math.random() * reflectionQuotes.length)];
    }
    
    // Create personalized reflection message
    const openingMessage = moodMessages[mood] || '✨ Setiap perasaan yang kamu rasakan itu valid. Hari ini kamu sudah melakukan sesuatu yang berarti.';
    const reflection = `${openingMessage}\n\n─────────────\n\n"${selectedQuote.quote}"\n\n— ${selectedQuote.author}\n\n─────────────\n\nJangan lupa isi suluk dan lakuin awrad nya 💫`;
    
    setTimeout(() => {
      setResponse(reflection);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-4">      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-gray-500 mt-3 text-sm">Memuat refleksi...</p>
        </div>
      ) : response ? (
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 mt-1">💭</span>
            <div className="flex-1 text-base whitespace-pre-line leading-relaxed">
              {response}
            </div>
          </div>
          <button
            onClick={handleGetReflection}
            className="mt-5 w-full py-3 px-4 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 font-medium rounded-xl transition-all text-sm"
          >
            🔄 Dapatkan Refleksi Lain
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AIBot;
