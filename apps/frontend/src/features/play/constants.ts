export const GAME_CONFIG = {
  width: 800,
  height: 400,
  backgroundColor: "#000000",
  lineColor: "#FFFFFF",
  textColor: "#FFFFFF",
  fontSize: "48px Poppins",
} as const;

export const GAME_RULES = {
  WIN_SCORE: 5,
  PADDLE_HEIGHT: 100,
  PADDLE_WIDTH: 10,
  BALL_SIZE: 10,
  PADDLE_SPEED: 8,
  INITIAL_BALL_SPEED: 5,
} as const;

export type Player = 1 | 2;

export interface GameState {
  isGameOver: boolean;
  winner: Player | null;
  score1: number;
  score2: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}
