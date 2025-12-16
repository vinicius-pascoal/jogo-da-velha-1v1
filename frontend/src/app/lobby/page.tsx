"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NicknameModal from "@/components/NicknameModal";

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

      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">🎮 Jogo da Velha Online</h1>
            {nickname && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <p className="text-gray-600">
                  Jogando como: <span className="font-semibold">{nickname}</span>
                </p>
                <button
                  onClick={changeNickname}
                  className="text-sm text-blue-600 hover:underline"
                >
                  (alterar)
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Partidas Disponíveis</h2>

            {loading ? (
              <p className="text-center text-gray-500">Carregando...</p>
            ) : games.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma partida disponível. Crie uma nova!
              </p>
            ) : (
              <div className="space-y-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-semibold">Partida #{game.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {game.players}/2 jogadores
                      </p>
                      <p className="text-xs text-gray-400">
                        Criada {new Date(game.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      onClick={() => joinGame(game.id)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Entrar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={createGame}
            className="w-full px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold text-lg"
          >
            ➕ Criar Nova Partida
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            As partidas são atualizadas automaticamente a cada 3 segundos
          </p>
        </div>
      </main>
    </>
  );
}
