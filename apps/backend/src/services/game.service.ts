export interface GameState {
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };
  paddles: {
    left: { y: number; height: number };
    right: { y: number; height: number };
  };
  canvas: {
    width: number;
    height: number;
  };
  scores: {
    left: number;
    right: number;
  };
  players: {
    player1Id: number;
    player2Id: number;
    player1Ready?: boolean;
    player2Ready?: boolean;
  };
}

export class GameService {
  private games: Map<number, GameState>;
  private readonly paddleWidth = 10;
  private readonly paddleHeight = 100;
  private readonly ballSpeed = 5;

  constructor() {
    this.games = new Map();
  }

  createGame(
    matchId: number,
    canvasWidth: number,
    canvasHeight: number,
    player1Id: number,
    player2Id: number
  ): void {
    const initialState: GameState = {
      ball: {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        dx: this.ballSpeed,
        dy: this.ballSpeed,
      },
      paddles: {
        left: {
          y: canvasHeight / 2 - this.paddleHeight / 2,
          height: this.paddleHeight,
        },
        right: {
          y: canvasHeight / 2 - this.paddleHeight / 2,
          height: this.paddleHeight,
        },
      },
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
      },
      scores: {
        left: 0,
        right: 0,
      },
      players: {
        player1Id,
        player2Id,
        player1Ready: false,
        player2Ready: false,
      },
    };

    this.games.set(matchId, initialState);
  }

  getPlayer1Id(matchId: number): number | undefined {
    return this.games.get(matchId)?.players.player1Id;
  }

  getPlayer2Id(matchId: number): number | undefined {
    return this.games.get(matchId)?.players.player2Id;
  }

  getGameState(matchId: number): GameState | undefined {
    return this.games.get(matchId);
  }

  updateBall(matchId: number): void {
    const state = this.games.get(matchId);
    if (!state) return;

    // Update the ball position
    state.ball.x += state.ball.dx;
    state.ball.y += state.ball.dy;

    // Check if the ball hits the top or bottom of the canvas
    if (state.ball.y <= 0 || state.ball.y >= state.canvas.height) {
      state.ball.dy = -state.ball.dy;
    }

    // Check if the ball hits the left paddle
    if (
      state.ball.x <= this.paddleWidth &&
      state.ball.y >= state.paddles.left.y &&
      state.ball.y <= state.paddles.left.y + state.paddles.left.height
    ) {
      state.ball.dx = this.ballSpeed;
    }

    // Check if the ball hits the right paddle
    if (
      state.ball.x >= state.canvas.width - this.paddleWidth &&
      state.ball.y >= state.paddles.right.y &&
      state.ball.y <= state.paddles.right.y + state.paddles.right.height
    ) {
      state.ball.dx = -this.ballSpeed;
    }

    // Check if the ball hits the left side of the canvas
    if (state.ball.x <= 0) {
      state.scores.right++;
      this.resetBall(matchId, "right");
    } else if (state.ball.x >= state.canvas.width) {
      state.scores.left++;
      this.resetBall(matchId, "left");
    }
  }

  private resetBall(matchId: number, serveDirection: "left" | "right"): void {
    const state = this.games.get(matchId);
    if (!state) return;

    state.ball = {
      x: state.canvas.width / 2,
      y: state.canvas.height / 2,
      dx: serveDirection === "left" ? -this.ballSpeed : this.ballSpeed,
      dy: this.ballSpeed,
    };
  }

  movePaddle(matchId: number, side: "left" | "right", position: number): void {
    const state = this.games.get(matchId);
    if (!state) return;

    const paddle = state.paddles[side];
    if (position >= 0 && position + paddle.height <= state.canvas.height) {
      paddle.y = position;
    }
  }

  removeGame(matchId: number): void {
    this.games.delete(matchId);
  }
}
