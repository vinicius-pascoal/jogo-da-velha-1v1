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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Escolha seu nickname</h2>
        <p className="text-gray-600 mb-6">
          Digite um nome para identificar você durante o jogo
        </p>

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Seu nickname"
          maxLength={20}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />

        <button
          onClick={handleSave}
          disabled={!nickname.trim()}
          className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
