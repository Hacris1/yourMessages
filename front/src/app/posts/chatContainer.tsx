import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/chat.css";

interface Message {
  _id: string;
  content: string;
  emisor: {
    _id: string;
    name: string;
    email: string;
  };
  receptor: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
}

type User = {
  _id: string;
  name: string;
  email: string;
  publicKey: string;
};

export default function ChatContainer({ user }: { user: User | null }) {
  const { token, user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Cargar mensajes cuando se selecciona un usuario
  useEffect(() => {
    if (!user || !token || !currentUser) return;

    setMessages([]);
    loadMessages();
  }, [user, token, currentUser]);

  const loadMessages = async () => {
    if (!user || !token || !currentUser) return;

    try {
      const response = await fetch(
        `${API_URL}api/messages/conversation/${currentUser._id}/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        console.error("Error al cargar mensajes");
        return;
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !token || !currentUser) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}api/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: input,
          emisor: currentUser._id,
          receptor: user._id,
          date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error("Error al enviar mensaje");
        return;
      }

      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="chat-container">
        <div className="empty-state">
          <h3>Selecciona un usuario para chatear</h3>
          <p>Elige un usuario de la lista para comenzar una conversación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat con {user.name}</h3>
        <small>{user.email}</small>
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <div className="no-messages">
            <p>No hay mensajes aún. ¡Comienza la conversación!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.emisor._id === currentUser?._id;
          return (
            <div key={msg._id} className={`message ${isMe ? "me" : "other"}`}>
              <div className="message-content">{msg.content}</div>
              <small className="message-time">
                {new Date(msg.date).toLocaleTimeString()}
              </small>
            </div>
          );
        })}
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje... (Enter para enviar)"
          rows={2}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}