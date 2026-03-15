import { useState } from "react";
import forge from "node-forge";
import { buildApiUrl } from "../../utils/apiUrl";

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

export default function ChatContainer({ user, token }: ChatContainerProps) {
  const [messages, setMessages] = useState<{ sender: "me" | "other"; text: string }[]>([]);
  const [input, setInput] = useState("");

  // Función para enviar mensaje cifrado
  const sendMessage = async () => {
    if (!user) return alert("Selecciona un usuario primero");

    try {
      // Obtener la publicKey del receptor desde backend
      let recipientPublicKeyPem = user.publicKey;
      if (!recipientPublicKeyPem) {
        const res = await fetch(buildApiUrl(`/api/user/publicKey/${user._id}`), {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || "No se pudo obtener la publicKey del usuario");
        }
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
      await fetch(buildApiUrl("/api/messages"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: user._id, message: encoded })
      });

    } catch (err) {
      console.error("Error enviando mensaje:", err);
      alert("No se pudo enviar el mensaje. Verifica que ambos usuarios hayan iniciado sesión en el chat para registrar su publicKey.");
    }
  };

  

  return (
    <div style={{ display: "flex",flexDirection: "column", height: "100%" }}>
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