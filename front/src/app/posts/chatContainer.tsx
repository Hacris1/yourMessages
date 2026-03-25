import { useState, useEffect, useRef } from "react";
import forge from "node-forge";
import EmojiPicker from "emoji-picker-react";
import fondowpp from "../../fondowpp.png";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import { useRSA } from "../../hooks/useRSA";
import { buildApiUrl } from "../../utils/apiUrl";

type User = {
  _id: string;
  name: string;
  email: string;
  publicKey?: string;
};

type Message = {
  _id: string;
  content: string;
  encryptedContent?: string;
  encryptedContentForSender?: string;
  emisor: {
    _id: string;
    name: string;
  };
  receptor?: string | { _id: string };
  date: string;
};

export default function ChatContainer({ user }: { user: User | null }) {

  const { user: currentUser, token } = useAuth();
  const { privateKey: myPrivateKey, decryptMessageWithHistory, publicKey: myPublicKey } = useRSA();

  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage: emitMessage, onMessageReceived } = useSocket(currentUser?._id || null);

  useEffect(() => {
    if (!token || !currentUser || !myPublicKey) return;

    const syncPublicKey = async () => {
      try {
        const myPublicKeyPem = localStorage.getItem("persistedPublicKeyPem") || 
                               sessionStorage.getItem("derivedPublicKeyPem");
        
        if (!myPublicKeyPem) {
          return;
        }
        
        const response = await fetch(buildApiUrl("/api/user/updatePublickey"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            userId: currentUser._id, 
            publicKey: myPublicKeyPem 
          })
        });

        if (!response.ok) {
          console.error("Error sincronizando clave pública");
        }
      } catch (err) {
        console.error("Error en sincronización de clave pública:", err);
      }
    };

    syncPublicKey();
  }, [token, currentUser?._id, myPublicKey]);

  useEffect(() => {
    if (user) {
      // Usuario seleccionado
    }
  }, [user?._id]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByChat, user?._id]); 

  useEffect(() => {
    // Private key watcher
  }, [myPrivateKey]);

  useEffect(() => {
    if (user?._id) {
      setMessagesByChat(prev => ({
        ...prev,
        [user._id]: []
      }));
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user || !currentUser) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(
          buildApiUrl(`/api/messages/conversation`),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              user1Id: currentUser._id,
              user2Id: user._id
            })
          }
        );

        let allMessages: Message[] = [];

        if (response.ok) {
          const backendMessages = await response.json();
          
          const processedMessages = backendMessages.map((msg: any) => {
            try {
              
              const isRecipient = currentUser._id === msg.receptor?._id || currentUser._id === msg.receptor;
              const encryptedToUse = isRecipient ? msg.encryptedContent : msg.encryptedContentForSender;

              if (encryptedToUse) {
                const decrypted = decryptMessageWithHistory(encryptedToUse);
                if (decrypted) {
                  msg.content = decrypted;
                } else {
                  msg.content = "⏳ No se pudo desencriptar este mensaje";
                }
              } else if (!myPrivateKey) {
                msg.content = "⏳ Aún no se han podido cargar estos mensajes";
              }
            } catch (err) {
              console.error("Error descifrando mensaje:", err);
              msg.content = "⏳ Aún no se han podido cargar estos mensajes";
            }

            return msg;
          });

          allMessages = processedMessages;
        }

        setMessagesByChat(prev => ({
          ...prev,
          [user._id]: allMessages
        }));
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      }
    };

    loadMessages();
  }, [user, currentUser, myPrivateKey]);

  // RECIBIR MENSAJES SOCKET
  useEffect(() => {

    if (!onMessageReceived || !user) return;

    const unsubscribe = onMessageReceived((message: any) => {
      if (message.emisor._id === user._id) {
        try {

          if (message.encryptedContent) {
            const decrypted = decryptMessageWithHistory(message.encryptedContent);
            
            if (decrypted) {
              message.content = decrypted;
            } else {
              message.content = "⏳ No se pudo desencriptar este mensaje";
            }
          } else {
            message.content = "⏳ Aún no se han podido cargar estos mensajes";
          }
        } catch (err) {
          console.error("Error descifrando mensaje por socket:", err);
          message.content = "⏳ Aún no se han podido cargar estos mensajes";
        }

        setMessagesByChat(prev => ({
          ...prev,
          [user._id]: [...(prev[user._id] || []), message]
        }));
      }
    });

    return unsubscribe;

  }, [myPrivateKey, onMessageReceived, user, currentUser]);

  // ENVIAR MENSAJE
  const sendMessage = () => {
    if (!input.trim() || !user?.publicKey || !currentUser || !myPublicKey) return;

    setLoading(true);

    try {
      
      const recipientPublicKey = forge.pki.publicKeyFromPem(user.publicKey);
      const encryptedForRecipient = recipientPublicKey.encrypt(input, "RSA-OAEP");
      const encodedForRecipient = forge.util.encode64(encryptedForRecipient);

      
      const myPublicKeyPem = sessionStorage.getItem("derivedPublicKeyPem") || 
                            localStorage.getItem("persistedPublicKeyPem");
      
      if (!myPublicKeyPem) {
        throw new Error("No se pudo obtener tu clave pública");
      }

      const myPublicKeyObj = forge.pki.publicKeyFromPem(myPublicKeyPem);
      const encryptedForSender = myPublicKeyObj.encrypt(input, "RSA-OAEP");
      const encodedForSender = forge.util.encode64(encryptedForSender);

      
      emitMessage({
        emisor: currentUser._id,
        receptor: user._id,
        content: input,
        encryptedContent: encodedForRecipient,
        encryptedContentForSender: encodedForSender
      });

      
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content: input,
        emisor: {
          _id: currentUser._id,
          name: currentUser.name
        },
        receptor: user._id,
        date: new Date().toISOString()
      };

      if (user._id) {
        setMessagesByChat(prev => ({
          ...prev,
          [user._id]: [...(prev[user._id] || []), optimisticMessage]
        }));
      }

      setInput("");

    } catch (err) {
      console.error("Error enviando mensaje:", err);
    } finally {
      setLoading(false);
    }
  };

  // ENTER
  const handleKeyPress = (e: React.KeyboardEvent) => {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();
      sendMessage();

    }

  };

  // EMOJIS
  const onEmojiClick = (emojiData: any) => {

    setInput(prev => prev + emojiData.emoji);

  };

  if (!user) {

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#999"
      }}>
        Selecciona un usuario para chatear
      </div>
    );

  }

  const messages = messagesByChat[user._id] || [];

  return (

    <div
      style={{
        backgroundImage: `url(${fondowpp})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative"
      }}
    >

      {/* HEADER */}
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
        {user.name}
      </div>

      {/* MENSAJES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px"
        }}
      >

        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#bbb" }}>
            No hay mensajes aún
          </p>
        )}

        {messages.map((msg) => (

          <div
            key={msg._id}
            style={{
              display: "flex",
              justifyContent:
                msg.emisor._id === currentUser?._id ? "flex-end" : "flex-start",
              marginBottom: "6px"
            }}
          >

            <div
              style={{
                backgroundColor:
                  msg.emisor._id === currentUser?._id
                    ? "#005c4b"
                    : "#202c33",
                color: "#e9edef",
                padding: "8px 12px",
                borderRadius: "12px",
                maxWidth: "60%",
                fontSize: "14px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.35)",

                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap"
              }}
            >

              {msg.content}

              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.7,
                  marginTop: "4px",
                  textAlign: "right"
                }}
              >
                {new Date(msg.date).toLocaleTimeString()}
              </div>

            </div>

          </div>

        ))}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT WHATSAPP */}
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

        {/* EMOJI BUTTON */}
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

        {/* EMOJI PICKER */}
        {showEmojiPicker && (
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              left: "10px",
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
          onKeyDown={handleKeyPress}
          placeholder="Escribe un mensaje..."
          disabled={loading}
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

        {/* SEND */}
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
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