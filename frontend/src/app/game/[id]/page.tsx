"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Ably from "ably";
import { GameState } from "@/lib/types";

export default function GamePage({ params }: { params: { id: string } }) {
  const [game, setGame] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Gerar ou recuperar ID do jogador
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = `player_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);

    // Configurar Ably
    const client = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY!);
    const channel = client.channels.get(`game:${params.id}`);

    channel.subscribe("state", (msg) => {
      setGame(msg.data);
    });

    // Buscar estado inicial e tentar entrar
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

  if (error && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl text-red-600">{error}</p>
        <button
          onClick={() => router.push("/lobby")}
          className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800"
        >
          Voltar ao Lobby
        </button>
      </div>
    );
  }

  if (!game) {
    return <p className="text-center mt-10">Carregando...</p>;
  }

  const myPlayer = game.players.find((p) => p.id === playerId);
  const isMyTurn = myPlayer && game.currentPlayer === myPlayer.symbol;

  return (
    <div className="flex flex-col items-center mt-10 gap-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Jogo da Velha</h1>
        <p className="text-sm text-gray-600">Partida #{params.id.slice(0, 8)}</p>
      </div>

      {/* Status dos Jogadores */}
      <div className="flex gap-4 w-full max-w-md">
        <div className={`flex-1 p-4 rounded-lg border-2 ${game.currentPlayer === "X" ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}>
          <p className="text-sm text-gray-600">Jogador X</p>
          <p className="font-bold text-lg">
            {game.players[0]?.id === playerId
              ? `${game.players[0]?.nickname} (Você)`
              : game.players[0]?.nickname || "Aguardando..."}
          </p>
        </div>
        <div className={`flex-1 p-4 rounded-lg border-2 ${game.currentPlayer === "O" ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}>
          <p className="text-sm text-gray-600">Jogador O</p>
          <p className="font-bold text-lg">
            {game.players[1]?.id === playerId
              ? `${game.players[1]?.nickname} (Você)`
              : game.players[1]?.nickname || "Aguardando..."}
          </p>
        </div>
      </div>

      {/* Status do Jogo */}
      {game.status === "waiting" && (
        <p className="text-lg font-semibold text-yellow-600">
          ⏳ Aguardando segundo jogador...
        </p>
      )}

      {game.status === "playing" && !game.winner && (
        <p className="text-lg font-semibold">
          {isMyTurn ? (
            <span className="text-green-600">🎯 Sua vez de jogar!</span>
          ) : (
            <span className="text-gray-600">⏳ Vez do adversário ({game.currentPlayer})</span>
          )}
        </p>
      )}

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {/* Tabuleiro */}
      <div className="grid grid-cols-3 gap-2">
        {game.board.map((cell, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            disabled={game.status !== "playing" || !!game.winner || !!cell || !isMyTurn}
            className={`w-24 h-24 text-3xl font-bold border-2 rounded-lg transition ${cell === "X"
              ? "bg-blue-100 text-blue-600 border-blue-300"
              : cell === "O"
                ? "bg-red-100 text-red-600 border-red-300"
                : "bg-white border-gray-300 hover:bg-gray-50"
              } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Resultado */}
      {game.winner && (
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">
            {game.winner === "draw"
              ? "🤝 Empate!"
              : myPlayer?.symbol === game.winner
                ? "🎉 Você venceu!"
                : "😢 Você perdeu!"}
          </p>
          <button
            onClick={() => router.push("/lobby")}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Voltar ao Lobby
          </button>
        </div>
      )}

      {/* Informações do Jogador */}
      {myPlayer && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Você é o jogador <span className="font-bold">{myPlayer.symbol}</span></p>
        </div>
      )}
    </div>
  );
}
