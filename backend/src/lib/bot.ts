import { GameState, Player } from "./game";

/**
 * Bot que joga jogo da velha usando algoritmo Minimax
 */

interface MoveScore {
  index: number;
  score: number;
}

/**
 * Verifica se há um vencedor no tabuleiro
 */
function checkWinner(board: (Player | null)[]): Player | "draw" | null {
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

  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== null)) {
    return "draw";
  }

  return null;
}

/**
 * Algoritmo Minimax para calcular a melhor jogada
 */
function minimax(
  board: (Player | null)[],
  player: Player,
  isMaximizing: boolean,
  botSymbol: Player,
  humanSymbol: Player
): number {
  const winner = checkWinner(board);

  if (winner === botSymbol) return 10;
  if (winner === humanSymbol) return -10;
  if (winner === "draw") return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = botSymbol;
        const score = minimax(board, player, false, botSymbol, humanSymbol);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanSymbol;
        const score = minimax(board, player, true, botSymbol, humanSymbol);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

/**
 * Calcula a melhor jogada para o bot
 */
export function getBotMove(game: GameState): number {
  const { board, currentPlayer } = game;

  // Encontrar o símbolo do bot e do humano
  const botPlayer = game.players.find((p) => p.id === "bot");
  if (!botPlayer) {
    throw new Error("Bot player not found");
  }

  const botSymbol = botPlayer.symbol;
  const humanSymbol: Player = botSymbol === "X" ? "O" : "X";

  // Se o tabuleiro está vazio, joga no centro
  if (board.every((cell) => cell === null)) {
    return 4;
  }

  let bestScore = -Infinity;
  let bestMove = -1;

  // Testar todas as posições possíveis
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = botSymbol;
      const score = minimax([...board], currentPlayer, false, botSymbol, humanSymbol);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  if (bestMove === -1) {
    // Fallback: primeira posição vazia
    bestMove = board.findIndex((cell) => cell === null);
  }

  return bestMove;
}

/**
 * Verifica se é a vez do bot jogar
 */
export function isBotTurn(game: GameState): boolean {
  const botPlayer = game.players.find((p) => p.id === "bot");
  if (!botPlayer) return false;

  return game.currentPlayer === botPlayer.symbol && game.status === "playing";
}
