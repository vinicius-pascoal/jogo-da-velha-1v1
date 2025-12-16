export type Player = "X" | "O";

export interface PlayerInfo {
  id: string;
  nickname: string;
  symbol: Player;
  joinedAt: Date;
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  winner: Player | "draw" | null;
  players: PlayerInfo[];
  status: "waiting" | "playing" | "finished";
  createdAt: Date;
}

export function createGame(): GameState {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    players: [],
    status: "waiting",
    createdAt: new Date(),
  };
}

export function addPlayer(game: GameState, playerId: string, nickname: string): GameState | null {
  // Não permitir mais de 2 jogadores
  if (game.players.length >= 2) {
    return null;
  }

  // Não permitir jogador duplicado
  if (game.players.some(p => p.id === playerId)) {
    return game;
  }

  const symbol: Player = game.players.length === 0 ? "X" : "O";
  const newPlayer: PlayerInfo = {
    id: playerId,
    nickname: nickname || `Jogador ${symbol}`,
    symbol,
    joinedAt: new Date(),
  };

  const players = [...game.players, newPlayer];
  const status = players.length === 2 ? "playing" : "waiting";

  return {
    ...game,
    players,
    status,
  };
}

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function applyMove(
  game: GameState,
  index: number,
  playerId: string
): GameState | null {
  // Validar se o jogo está em andamento
  if (game.status !== "playing") return null;

  // Validar se a célula já está ocupada ou se há vencedor
  if (game.board[index] || game.winner) return null;

  // Validar se é o turno do jogador
  const player = game.players.find(p => p.id === playerId);
  if (!player || player.symbol !== game.currentPlayer) return null;

  const board = [...game.board];
  board[index] = game.currentPlayer;

  let winner: GameState["winner"] = null;

  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = board[a];
    }
  }

  if (!winner && board.every(Boolean)) {
    winner = "draw";
  }

  return {
    ...game,
    board,
    currentPlayer: game.currentPlayer === "X" ? "O" : "X",
    winner,
    status: winner ? "finished" : "playing",
  };
}
