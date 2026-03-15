import { useState } from "react";

export default function MessageInput({ onSend }: { 
  onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text) return;

    onSend(text);

    setText("");
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe tu mensaje"
      />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
}
