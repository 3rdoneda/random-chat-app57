// src/screens/PersonalChat.tsx

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { Link } from "react-router-dom";

const PersonalChat = () => {
  const { userId } = useParams(); // dynamic user ID
  const socketContext = useSocket();
  // If your context provides the raw socket as 'socket', use that:
  const socket = (socketContext as any).socket || socketContext;
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receive-message");
  }, [socket]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    socket.emit("send-message", { to: userId, text: input });
    setMessages((prev) => [...prev, input]);
    setInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f0]">
      <div className="p-4 bg-[#ececec] shadow flex items-center">
        <Link to="/chat-page" className="text-blue-600">← Back</Link>
        <h2 className="ml-4 font-semibold">Chat with User {userId}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl px-4 py-2 shadow w-fit self-end"
          >
            {msg}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white flex items-center border-t">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border rounded-lg px-4 py-2 mr-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div
    </div>
  );
};

export default PersonalChat;
