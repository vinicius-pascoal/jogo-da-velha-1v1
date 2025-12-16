"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";

interface ChatBoxProps {
  gameId: string;
  playerId: string;
  messages: ChatMessage[];
}

export default function ChatBox({ gameId, playerId, messages }: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          playerId,
          message: newMessage,
        }),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full max-h-[400px] sm:max-h-[500px] lg:max-h-[600px]">
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white text-center">
          💬 Chat da Partida
        </h3>
      </div>
      <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
            Nenhuma mensagem ainda. Diga olá!
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2 ${msg.playerId === playerId ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-[75%] sm:max-w-xs md:max-w-md p-2.5 sm:p-3 rounded-xl break-words ${msg.playerId === playerId
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                }`}
            >
              <p className="text-xs font-bold mb-1">
                {msg.nickname}
                {msg.playerId === playerId && " (Você)"}
              </p>
              <p className="text-xs sm:text-sm">{msg.message}</p>
              <p className="text-xs opacity-70 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite..."
            maxLength={100}
            className="flex-1 min-w-0 px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex-shrink-0 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enviar mensagem"
          >
            <span className="hidden sm:inline">Enviar</span>
            <span className="sm:hidden text-lg">📤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
