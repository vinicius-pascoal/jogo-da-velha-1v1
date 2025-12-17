"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import NicknameModal from "@/components/NicknameModal";

export default function Home() {
  const router = useRouter();
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  function goToLobby() {
    router.push("/lobby");
  }

  async function createBotGame(nickname: string) {
    try {
      const res = await fetch("http://localhost:4000/api/create-bot-game", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.gameId) {
        router.push(`/game/${data.gameId}`);
      } else {
        console.error("Erro ao criar jogo contra bot:", data.error);
        alert("Erro ao criar jogo contra bot");
      }
    } catch (error) {
      console.error("Erro ao criar jogo contra bot:", error);
      alert("Erro ao criar jogo contra bot");
    }
  }

  function handlePlayAgainstBot() {
    setShowNicknameModal(true);
  }

  return (
    <>
      <ThemeToggle />
      <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
        <div className="text-center animate-fade-in">
          <div className="mb-6">
            <div className="text-6xl sm:text-7xl mb-4 animate-bounce-subtle">🎮</div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Jogo da Velha Online
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl font-medium">
            Multiplayer em tempo real ou jogue contra o bot
          </p>
        </div>

        <div className="flex flex-col gap-4 animate-slide-up">
          <button
            onClick={goToLobby}
            className="group relative px-8 py-4 text-lg sm:px-10 sm:py-5 sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-2xl hover:shadow-blue-500/50 dark:shadow-blue-900/50 hover:scale-105 transform"
          >
            <span className="relative z-10 flex items-center gap-3">
              Entrar no Lobby
              <svg
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
          </button>
        </div>
      </main>

      {showNicknameModal && (
        <NicknameModal
          onConfirm={(nickname) => {
            setShowNicknameModal(false);
            createBotGame(nickname);
          }}
          onCancel={() => setShowNicknameModal(false)}
        />
      )}
    </>
  );
}
