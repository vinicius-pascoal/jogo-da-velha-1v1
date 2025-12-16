export type Player = "X" | "O";

export interface PlayerInfo {
  id: string;
  nickname: string;
  symbol: Player;
  joinedAt: string;
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  winner: Player | "draw" | null;
  players: PlayerInfo[];
  status: "waiting" | "playing" | "finished";
  createdAt: string;
}
