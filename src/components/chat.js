import { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy KuroChat. ¿Qué necesitai?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_GROQ_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Eres KuroChat, un asistente personal amigable. Responde siempre en español.' },
            ...newMessages.map(m => ({ role: m.role, content: m.text }))
          ]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const botReply = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: 'assistant', text: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span className="status-dot"></span>
        KuroChat
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="message assistant">Escribiendo...</div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe un mensaje..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}

export default Chat;