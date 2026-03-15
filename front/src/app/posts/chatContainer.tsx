import { useState } from "react";
import forge from "node-forge";

type User = {
  _id: string;
  name: string;
  email: string;
  publicKey?: string; // PEM del otro usuario
};

type ChatContainerProps = {
  user: User | null;
  myPrivateKey: forge.pki.rsa.PrivateKey | null;
  myPublicKey: forge.pki.rsa.PublicKey | null;
  token: string; // JWT para requests
};

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatContainer({ user, myPrivateKey, token }: ChatContainerProps) {
  const [messages, setMessages] = useState<{ sender: "me" | "other"; text: string }[]>([]);
  const [input, setInput] = useState("");

  // Función para enviar mensaje cifrado
  const sendMessage = async () => {
    if (!user) return alert("Selecciona un usuario primero");

    try {
      // Obtener la publicKey del receptor desde backend
      let recipientPublicKeyPem = user.publicKey;
      if (!recipientPublicKeyPem) {
        const res = await fetch(`${API_URL}/api/user/getKey?userId=${user._id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        recipientPublicKeyPem = data.publicKey;
      }

      if (!recipientPublicKeyPem) return alert("El usuario no tiene publicKey");

      const recipientPublicKey = forge.pki.publicKeyFromPem(recipientPublicKeyPem);

      // Cifrar mensaje
      const encrypted = recipientPublicKey.encrypt(input, "RSA-OAEP");
      const encoded = forge.util.encode64(encrypted);

      // Mostrar en UI
      setMessages(prev => [...prev, { sender: "me", text: input }]);
      setInput("");

      // Enviar al backend
      await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: user._id, message: encoded })
      });

    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  // Función para recibir mensaje cifrado
  const receiveMessage = (cipherText: string) => {
    if (!myPrivateKey) return;

    try {
      const decoded = forge.util.decode64(cipherText);
      const decrypted = myPrivateKey.decrypt(decoded, "RSA-OAEP");

      setMessages(prev => [...prev, { sender: "other", text: decrypted }]);
    } catch (err) {
      console.error("Error descifrando:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ textAlign: m.sender === "me" ? "right" : "left" }}>
            <p>{m.text}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px" }}>
          Enviar
        </button>
      </div>
    </div>
  );
}