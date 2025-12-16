"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NicknameModal from "@/components/NicknameModal";
import ThemeToggle from "@/components/ThemeToggle";

interface LobbyGame {
  id: string;
  players: number;
  createdAt: string;
}

export default function LobbyPage() {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("playerNickname");
    if (saved) {
      setNickname(saved);
    }

    fetchGames();
    const interval = setInterval(fetchGames, 3000);
    return () => clearInterval(interval);
  }, []);

  async function fetchGames() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lobby`);
      const data = await res.json();
      setGames(data);
    } catch (error) {
      console.error("Erro ao buscar partidas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createGame() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-game`, {
      method: "POST",
    });
    const { gameId } = await res.json();
    router.push(`/game/${gameId}`);
  }

  function joinGame(gameId: string) {
    router.push(`/game/${gameId}`);
  }

  function changeNickname() {
    localStorage.removeItem("playerNickname");
    location.reload();
  }

  return (
    <>
      <NicknameModal onSave={setNickname} />
      <ThemeToggle />

      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
        <div className="max-w-3xl w-full animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="text-5xl sm:text-6xl mb-4 animate-bounce-subtle">🎮</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Lobby de Partidas
            </h1>
            {nickname && (
              <div className="flex items-center justify-center gap-2 mt-6 animate-slide-up">
                <div className="flex items-center flex-wrap justify-center gap-2 px-4 py-2 sm:px-5 sm:py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-xl sm:text-2xl">👤</span>
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {nickname}
                    </span>
                  </p>
                  <button
                    onClick={changeNickname}
                    className="ml-2 px-3 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors font-medium"
                  >
                    Alterar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Available Games Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 mb-6 border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">🎯</span>
                Partidas Disponíveis
              </h2>
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                {games.length} {games.length === 1 ? "partida" : "partidas"}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">
                  Carregando partidas...
                </p>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎲</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  Nenhuma partida disponível no momento
                </p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  Seja o primeiro a criar uma!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {games.map((game, index) => (
                  <div
                    key={game.id}
                    className="group flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 gap-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 hover:shadow-lg animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                        #{game.id.slice(0, 2)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                          Partida #{game.id.slice(0, 8)}
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 mt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span className="text-lg">👥</span>
                            <span className="font-semibold">
                              {game.players}/2 jogadores
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                            <span>🕐</span>
                            {new Date(game.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => joinGame(game.id)}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform group-hover:scale-110 flex-shrink-0"
                    >
                      Entrar 🚀
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Game Button */}
          <button
            onClick={createGame}
            className="group w-full px-6 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg sm:text-xl shadow-2xl hover:shadow-blue-500/50 dark:shadow-blue-900/50 hover:scale-[1.02] transform"
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-xl sm:text-2xl">➕</span>
              Criar Nova Partida
              <svg
                className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </span>
          </button>

          {/* Auto-update info */}
          <div className="text-center mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Atualização automática a cada 3 segundos
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
