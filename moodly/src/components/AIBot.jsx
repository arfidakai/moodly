import React, { useState } from 'react';

const SYSTEM_PROMPT = `You are a reflective AI counselor in a self-reflection journal app.

Your role is to listen with empathy, validate emotions, and help users reflect on their thoughts and feelings in a calm, non-judgmental way.

You are NOT a therapist and must not diagnose or give medical or clinical advice.

Guidelines:
- Use warm, gentle, and human language
- Focus on daily experiences and self-awareness
- Do not give direct solutions or instructions
- Do not judge, minimize, or use absolute statements

If the user shows intense emotional distress, respond with care and gently encourage seeking support from a trusted person or professional.

End every response with ONE soft, open-ended reflective question.
INI B`;

const AIBot = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');
    try {
      // Combine system prompt with user prompt
      const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${prompt}`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: fullPrompt }]
            }]
          }),
        }
      );
      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setResponse(data.candidates[0].content.parts[0].text);
      } else if (data.error) {
        setError(`API Error: ${data.error.message || 'Unknown error'}`);
      } else {
        setResponse('No response from AI.');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-gray-700 min-h-[100px]"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Tulis pertanyaan, curhatan, atau prompt custom di sini..."
          required
        />
        <button
          type="submit"
          disabled={loading || !prompt}
          className="py-3 px-6 bg-gradient-to-r from-indigo-400 to-purple-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Kirim ke AI'}
        </button>
      </form>
      {error && <div className="mt-3 text-red-500 text-sm">{error}</div>}
      {response && (
        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-gray-700 whitespace-pre-line max-h-96 overflow-y-auto">
          <span className="font-semibold text-indigo-400">AI:</span> {response}
        </div>
      )}
    </div>
  );
};

export default AIBot;
