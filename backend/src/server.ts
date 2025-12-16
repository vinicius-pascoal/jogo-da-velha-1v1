import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import { createGame, applyMove, addPlayer } from "./lib/game";
import { games } from "./lib/store";
import { ably } from "./lib/ably";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Criar nova partida
app.post("/api/create-game", (req, res) => {
  const id = uuid();
  const game = createGame();

  games.set(id, game);

  console.log(`[CREATE] Nova partida criada: ${id}`);

  return res.json({ gameId: id });
});

// Buscar estado de uma partida
app.get("/api/game/:id", (req, res) => {
  const { id } = req.params;
  const game = games.get(id);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  return res.json(game);
});

// Listar partidas disponíveis (lobby)
app.get("/api/lobby", (req, res) => {
  const availableGames = Array.from(games.entries())
    .filter(([_, game]) => game.status === "waiting")
    .map(([id, game]) => ({
      id,
      players: game.players.length,
      createdAt: game.createdAt,
    }));

  return res.json(availableGames);
});

// Entrar em uma partida
app.post("/api/join-game", async (req, res) => {
  const { gameId, playerId } = req.body;

  if (!gameId || !playerId) {
    return res.status(400).json({ error: "gameId and playerId are required" });
  }

  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const updated = addPlayer(game, playerId);

  if (!updated) {
    return res.status(400).json({ error: "Cannot join game (full or already joined)" });
  }

  games.set(gameId, updated);

  console.log(`[JOIN] Jogador ${playerId} entrou no jogo ${gameId}`);

  // Publicar atualização via Ably
  try {
    await ably.channels.get(`game:${gameId}`).publish("state", updated);
  } catch (error) {
    console.error("[ABLY] Erro ao publicar:", error);
  }

  return res.json(updated);
});

// Executar jogada
app.post("/api/move", async (req, res) => {
  const { gameId, index, playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: "playerId is required" });
  }

  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const updated = applyMove(game, index, playerId);

  if (!updated) {
    return res.status(400).json({ error: "Invalid move" });
  }

  games.set(gameId, updated);

  console.log(`[MOVE] Jogador ${playerId} jogou no ${gameId}, posição ${index}`);

  // Publicar atualização via Ably
  try {
    await ably.channels.get(`game:${gameId}`).publish("state", updated);
  } catch (error) {
    console.error("[ABLY] Erro ao publicar:", error);
  }

  return res.json(updated);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", games: games.size });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📊 Ably configurado: ${!!process.env.ABLY_API_KEY}`);
});
