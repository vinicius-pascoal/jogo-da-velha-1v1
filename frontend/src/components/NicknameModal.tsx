"use client";

import { useState, useEffect } from "react";

interface NicknameModalProps {
  onSave: (nickname: string) => void;
}

export default function NicknameModal({ onSave }: NicknameModalProps) {
  const [nickname, setNickname] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("playerNickname");
    if (!saved) {
      setIsOpen(true);
    } else {
      onSave(saved);
    }
  }, [onSave]);

  const handleSave = () => {
    if (nickname.trim()) {
      localStorage.setItem("playerNickname", nickname.trim());
      onSave(nickname.trim());
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Bem-vindo!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Escolha um nickname para começar a jogar
          </p>
        </div>

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Digite seu nickname"
          maxLength={20}
          className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent mb-6 text-lg placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          autoFocus
        />

        <button
          onClick={handleSave}
          disabled={!nickname.trim()}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transform disabled:hover:scale-100"
        >
          Começar a Jogar 🎮
        </button>
      </div>
    </div>
  );
}
