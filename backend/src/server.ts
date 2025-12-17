import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import { createGame, applyMove, addPlayer, restartGame } from "./lib/game";
import { games } from "./lib/store";
import { ably } from "./lib/ably";
import { getBotMove, isBotTurn } from "./lib/bot";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Criar nova partida PvP
app.post("/api/create-game", (req, res) => {
  const id = uuid();
  const game = createGame("pvp");

  games.set(id, game);

  console.log(`[CREATE] Nova partida PvP criada: ${id}`);

  return res.json({ gameId: id });
});

// Criar nova partida contra Bot
app.post("/api/create-bot-game", (req, res) => {
  const id = uuid();
  const game = createGame("bot");

  games.set(id, game);

  console.log(`[CREATE] Nova partida contra Bot criada: ${id}`);

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
      gameMode: game.gameMode,
    }));

  return res.json(availableGames);
});

// Entrar em uma partida
app.post("/api/join-game", async (req, res) => {
  const { gameId, playerId, nickname } = req.body;

  if (!gameId || !playerId) {
    return res.status(400).json({ error: "gameId and playerId are required" });
  }

  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const updated = addPlayer(game, playerId, nickname || "Anônimo");

  if (!updated) {
    return res.status(400).json({ error: "Cannot join game (full or already joined)" });
  }

  games.set(gameId, updated);

  // Se for jogo contra bot e ainda não tiver o bot, adicionar automaticamente
  if (updated.gameMode === "bot" && updated.players.length === 1) {
    const withBot = addPlayer(updated, "bot", "🤖 Bot");
    if (withBot) {
      games.set(gameId, withBot);
      console.log(`[BOT] Bot adicionado automaticamente ao jogo ${gameId}`);

      // Publicar atualização com bot via Ably
      try {
        await ably.channels.get(`game:${gameId}`).publish("state", withBot);
      } catch (error) {
        console.error("[ABLY] Erro ao publicar:", error);
      }

      console.log(`[JOIN] Jogador ${nickname || playerId} entrou no jogo ${gameId}`);
      return res.json(withBot);
    }
  }

  console.log(`[JOIN] Jogador ${nickname || playerId} entrou no jogo ${gameId}`);

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

  // Se for jogo contra bot e for a vez do bot, fazer jogada automática
  if (updated.gameMode === "bot" && isBotTurn(updated)) {
    setTimeout(async () => {
      const currentGame = games.get(gameId);
      if (!currentGame || !isBotTurn(currentGame)) return;

      try {
        const botMoveIndex = getBotMove(currentGame);
        const botUpdated = applyMove(currentGame, botMoveIndex, "bot");

        if (botUpdated) {
          games.set(gameId, botUpdated);
          console.log(`[BOT] Bot jogou no ${gameId}, posição ${botMoveIndex}`);

          // Publicar jogada do bot
          await ably.channels.get(`game:${gameId}`).publish("state", botUpdated);
        }
      } catch (error) {
        console.error("[BOT] Erro ao fazer jogada:", error);
      }
    }, 500); // Delay de 500ms para simular "pensamento" do bot
  }

  return res.json(updated);
});

// Enviar mensagem no chat
app.post("/api/chat", async (req, res) => {
  const { gameId, playerId, message } = req.body;

  if (!gameId || !playerId || !message) {
    return res.status(400).json({ error: "gameId, playerId, and message are required" });
  }

  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(403).json({ error: "Player not in this game" });
  }

  const chatMessage = {
    playerId,
    nickname: player.nickname,
    message,
    timestamp: new Date(),
  };

  game.chat.push(chatMessage);
  // Manter apenas as últimas 50 mensagens
  if (game.chat.length > 50) {
    game.chat.shift();
  }

  games.set(gameId, game);

  // Publicar apenas a mensagem do chat, para não reenviar o estado todo
  try {
    await ably.channels.get(`game:${gameId}`).publish("chat", chatMessage);
  } catch (error) {
    console.error("[ABLY] Erro ao publicar mensagem do chat:", error);
  }

  return res.status(200).json({ success: true });
});

// Reiniciar partida
app.post("/api/restart-game", async (req, res) => {
  const { gameId, playerId } = req.body;

  if (!gameId || !playerId) {
    return res.status(400).json({ error: "gameId and playerId are required" });
  }

  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  // Verificar se o jogador está na partida
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(403).json({ error: "Player not in this game" });
  }

  // Verificar se o jogo terminou
  if (!game.winner) {
    return res.status(400).json({ error: "Game is not finished yet" });
  }

  const updated = restartGame(game);
  games.set(gameId, updated);

  console.log(`[RESTART] Partida ${gameId} reiniciada por ${player.nickname}`);

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
