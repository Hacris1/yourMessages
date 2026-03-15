import { useState } from "react";
import forge from "node-forge";
import EmojiPicker from "emoji-picker-react";
import fondowpp from "../../fondowpp.png";

type User = {
  _id: string;
  name: string;
  email: string;
  publicKey?: string;
};

type ChatContainerProps = {
  user: User | null;
  myPrivateKey: forge.pki.rsa.PrivateKey | null;
  myPublicKey: forge.pki.rsa.PublicKey | null;
  token: string;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatContainer({ user, token }: ChatContainerProps) {

  const [messages, setMessages] = useState<{ sender: "me" | "other"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ENVIAR MENSAJE
  const sendMessage = async () => {

    if (!user) return alert("Selecciona un usuario primero");
    if (!input.trim()) return;

    try {

      let recipientPublicKeyPem = user.publicKey;

      if (!recipientPublicKeyPem) {
        const res = await fetch(`${API_URL}/api/user/publicKey/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        recipientPublicKeyPem = data.publicKey;
      }

      if (!recipientPublicKeyPem) return alert("El usuario no tiene publicKey");

      const recipientPublicKey = forge.pki.publicKeyFromPem(recipientPublicKeyPem);

      const encrypted = recipientPublicKey.encrypt(input, "RSA-OAEP");
      const encoded = forge.util.encode64(encrypted);

      setMessages(prev => [...prev, { sender: "me", text: input }]);
      setInput("");

      await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: user._id,
          message: encoded
        })
      });

    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  // EMOJIS
  const onEmojiClick = (emojiData: any) => {
    setInput(prev => prev + emojiData.emoji);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${fondowpp})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative"
      }}
    >

      {/* HEADER CHAT */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#202c33",
          borderBottom: "1px solid #1f2c34",
          fontWeight: 600,
          fontSize: "16px",
          color: "#e9edef"
        }}
      >
        {user ? `${user.name}` : "Selecciona un usuario para empezar"}
      </div>

      {/* MENSAJES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: m.sender === "me" ? "flex-end" : "flex-start",
              marginBottom: "6px",
            }}
          >

            <div
              style={{
                backgroundColor: m.sender === "me" ? "#005c4b" : "#202c33",
                color: "#e9edef",
                padding: "8px 12px",
                borderRadius: "12px",
                maxWidth: "60%",
                fontSize: "14px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.35)"
              }}
            >
              {m.text}
            </div>

          </div>

        ))}

      </div>

      {/* INPUT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 12px",
          backgroundColor: "#202c33",
          borderTop: "1px solid #1f2c34"
        }}
      >

        {/* BOTON EMOJI */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            background: "none",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            color: "#8696a0"
          }}
        >
          😊
        </button>

        {/* PICKER */}
        {showEmojiPicker && (
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              left: "0",
              zIndex: 999
            }}
          >
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        {/* INPUT */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1,
            border: "1px solid #2a3942",
            outline: "none",
            fontSize: "15px",
            color: "#e9edef",
            backgroundColor: "#111b21",
            borderRadius: "10px",
            padding: "10px 12px"
          }}
        />

        {/* BOTON ENVIAR */}
        <button
          onClick={sendMessage}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            backgroundColor: "#25d366",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>

      </div>

    </div>
  );
}