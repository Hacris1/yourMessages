import React, { useState } from "react";
import { encryptMessage, decryptMessage } from "@/utils/useRSA";

export default function MessageInput({ onSend }: { 
  onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  
  const aesKey = "clave entre usuarios";

  const handleSend = () => {
    if (!text) return;

    const encrypted = encryptMessage(text, aesKey);

    onSend(encrypted);

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
