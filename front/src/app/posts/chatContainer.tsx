import { useRSA } from "../../hooks/useRSA";
import { useState } from "react";
import "../../styles/chat.css";

interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
}

type User = {
  id: string;
  name: string;
};

export default function ChatContainer({ user }: { user: User | null }) {

  const { publicKey } = useRSA();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim() || !user) return;

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "me",
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  if (!user) {
    return <div className="chat-container">Selecciona un usuario para chatear</div>;
  }

  return (
    <div className="chat-container">

      <h3>Chat con {user.name}</h3>

      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === "me" ? "me" : "other"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>

    </div>
  );
}