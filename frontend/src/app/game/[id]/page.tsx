"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Ably from "ably";
import { GameState, ChatMessage } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";
import ShareModal from "@/components/ShareModal";
import ChatBox from "@/components/ChatBox";

export default function GamePage({ params }: { params: { id: string } }) {
  const [game, setGame] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const router = useRouter();

  const gameUrl = typeof window !== "undefined" ? window.location.href : "";


  useEffect(() => {
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = `player_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);

    const client = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY!);
    const channel = client.channels.get(`game:${params.id}`);

    channel.subscribe("state", (msg) => {
      setGame(msg.data);
      setChatMessages(msg.data.chat || []);
    });

    channel.subscribe("chat", (msg) => {
      setChatMessages((prev) => [...prev, msg.data]);
    });

    joinGame(id);
    return () => client.close();
  }, [params.id]);

  async function joinGame(pId: string) {
    try {
      const nickname = localStorage.getItem("playerNickname") || "Anônimo";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/join-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: params.id, playerId: pId, nickname }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao entrar no jogo");
        return;
      }

      const data = await res.json();
      setGame(data);
    } catch (err) {
      console.error("Erro ao entrar no jogo:", err);
      setError("Erro de conexão");
    }
  }

  async function play(index: number) {
    if (!playerId || !game) return;

    const myPlayer = game.players.find((p) => p.id === playerId);
    if (!myPlayer) {
      setError("Você não está neste jogo");
      return;
    }

    if (game.currentPlayer !== myPlayer.symbol) {
      setError("Não é seu turno!");
      setTimeout(() => setError(""), 2000);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: params.id, index, playerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Jogada inválida");
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      console.error("Erro ao fazer jogada:", err);
    }
  }

  async function restartGame() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restart-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: params.id, playerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao reiniciar jogo");
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      console.error("Erro ao reiniciar jogo:", err);
    }
  }

  if (error && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-red-950 dark:to-orange-950 p-4 sm:p-6 text-center">
        <div className="text-5xl sm:text-6xl animate-bounce-subtle">❌</div>
        <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{error}</p>
        <button onClick={() => router.push("/lobby")} className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform">
          Voltar ao Lobby
        </button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
        <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-base sm:text-lg font-medium">Carregando jogo...</p>
      </div>
    );
  }

  const myPlayer = game.players.find((p) => p.id === playerId);
  const isMyTurn = myPlayer && game.currentPlayer === myPlayer.symbol;

  return (
    <>
      <ThemeToggle />
      <ShareModal gameUrl={gameUrl} isOpen={game?.status === "waiting"} />
      <div className="min-h-screen flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-8 p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300 py-6 lg:py-12">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-4xl sm:text-5xl mb-3 animate-bounce-subtle">⚔️</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Jogo da Velha</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">Partida #{params.id.slice(0, 8)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className={`p-3 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${game.currentPlayer === "X" ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 shadow-lg shadow-blue-500/50 scale-105" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">X</div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Jogador X</p>
                  <p className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white truncate">{game.players[0]?.id === playerId ? `${game.players[0]?.nickname} (Você)` : game.players[0]?.nickname || "Aguardando..."}</p>
                </div>
              </div>
              {game.currentPlayer === "X" && !game.winner && (
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Jogando...
                </div>
              )}
            </div>

            <div className={`p-3 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${game.currentPlayer === "O" ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 shadow-lg shadow-purple-500/50 scale-105" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">O</div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Jogador O</p>
                  <p className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white truncate">{game.players[1]?.id === playerId ? `${game.players[1]?.nickname} (Você)` : game.players[1]?.nickname || "Aguardando..."}</p>
                </div>
              </div>
              {game.currentPlayer === "O" && !game.winner && (
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  Jogando...
                </div>
              )}
            </div>
          </div>

          {game.status === "waiting" && (
            <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl text-center animate-pulse">
              <p className="text-base sm:text-lg font-bold text-yellow-800 dark:text-yellow-300">⏳ Aguardando segundo jogador entrar...</p>
            </div>
          )}

          {game.status === "playing" && !game.winner && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-xl text-center">
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {isMyTurn ? (
                  <span className="flex items-center justify-center gap-2"><span className="text-xl sm:text-2xl">🎯</span>Sua vez de jogar!</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><span className="text-xl sm:text-2xl">⏳</span>Aguardando jogada do adversário</span>
                )}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 rounded-xl text-center animate-slide-up">
              <p className="text-base sm:text-lg font-bold text-red-800 dark:text-red-300">⚠️ {error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-3xl shadow-2xl mb-8 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {game.board.map((cell, i) => (
                <button key={i} onClick={() => play(i)} disabled={game.status !== "playing" || !!game.winner || !!cell || !isMyTurn} className={`aspect-square text-4xl sm:text-5xl font-bold border-2 rounded-2xl transition-all duration-300 ${cell === "X" ? "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-600 shadow-lg" : cell === "O" ? "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 text-purple-600 dark:text-purple-300 border-purple-300 dark:border-purple-600 shadow-lg" : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 active:scale-95"} disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}>
                  {cell}
                </button>
              ))}
            </div>
          </div>

          {game.winner && (
            <div className="text-center mb-8 animate-slide-up">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-6 sm:p-8 rounded-3xl border-2 border-yellow-400 dark:border-yellow-600 shadow-2xl">
                <div className="text-6xl sm:text-7xl mb-4 animate-bounce-subtle">{game.winner === "draw" ? "🤝" : myPlayer?.symbol === game.winner ? "🎉" : "😢"}</div>
                <p className="text-2xl sm:text-3xl font-extrabold mb-6 text-gray-900 dark:text-white">{game.winner === "draw" ? "Empate!" : myPlayer?.symbol === game.winner ? "Você Venceu!" : "Você Perdeu!"}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={restartGame} 
                    className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    🔄 Jogar Novamente
                  </button>
                  <button 
                    onClick={() => router.push("/lobby")} 
                    className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    Voltar ao Lobby
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        <div className="w-full max-w-md lg:max-w-sm animate-fade-in lg:sticky lg:top-6">
          <ChatBox gameId={params.id} playerId={playerId} messages={chatMessages} />
        </div>
      </div>
    </>
  );
}
