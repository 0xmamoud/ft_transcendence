export interface GameState {
  ball: {
    x: number;
    y: number;
  };
  paddles: {
    player1: { y: number };
    player2: { y: number };
  };
  scores: {
    player1: number;
    player2: number;
  };
}

export class GameService {
  private gameState: GameState | null = null;
  private player1Id: number | null = null;
  private player2Id: number | null = null;

  private readonly paddleWidth = 10;
  private readonly paddleHeight = 100;
  private readonly defaultSpeed = 8;
  private readonly canvasWidth = 800;
  private readonly canvasHeight = 600;
  private ballDirectionX = 1;
  private ballDirectionY = 1;

  createGame(matchId: number, player1Id: number, player2Id: number): void {
    this.player1Id = player1Id;
    this.player2Id = player2Id;

    this.gameState = {
      ball: {
        x: this.canvasWidth / 2,
        y: this.canvasHeight / 2,
      },
      paddles: {
        player1: { y: this.canvasHeight / 2 - this.paddleHeight / 2 },
        player2: { y: this.canvasHeight / 2 - this.paddleHeight / 2 },
      },
      scores: {
        player1: 0,
        player2: 0,
      },
    };

    this.ballDirectionX = Math.random() > 0.5 ? 1 : -1;
    this.ballDirectionY = Math.random() > 0.5 ? 1 : -1;
  }

  getGameState(): GameState | null {
    return this.gameState;
  }

  getPlayerId(playerNumber: 1 | 2): number | null {
    return playerNumber === 1 ? this.player1Id : this.player2Id;
  }

  updateBall(): boolean {
    if (!this.gameState) {
      return false;
    }

    let scoreChanged = false;

    // Calculate new ball position
    this.gameState.ball.x += this.defaultSpeed * this.ballDirectionX;
    this.gameState.ball.y += this.defaultSpeed * this.ballDirectionY;

    // Wall collisions (top/bottom)
    if (
      this.gameState.ball.y <= 0 ||
      this.gameState.ball.y >= this.canvasHeight
    ) {
      this.gameState.ball.y = Math.max(
        0,
        Math.min(this.gameState.ball.y, this.canvasHeight)
      );
      this.ballDirectionY = -this.ballDirectionY;
    }

    // Paddle collisions
    if (
      this.gameState.ball.x <= this.paddleWidth &&
      this.gameState.ball.y >= this.gameState.paddles.player1.y &&
      this.gameState.ball.y <=
        this.gameState.paddles.player1.y + this.paddleHeight
    ) {
      this.gameState.ball.x = this.paddleWidth;
      this.ballDirectionX = 1;
    }

    if (
      this.gameState.ball.x >= this.canvasWidth - this.paddleWidth &&
      this.gameState.ball.y >= this.gameState.paddles.player2.y &&
      this.gameState.ball.y <=
        this.gameState.paddles.player2.y + this.paddleHeight
    ) {
      this.gameState.ball.x = this.canvasWidth - this.paddleWidth;
      this.ballDirectionX = -1;
    }

    // Score points
    if (this.gameState.ball.x <= 0) {
      this.gameState.scores.player2++;
      this.resetBall();
      scoreChanged = true;
    } else if (this.gameState.ball.x >= this.canvasWidth) {
      this.gameState.scores.player1++;
      this.resetBall();
      scoreChanged = true;
    }

    return scoreChanged;
  }

  private resetBall(): void {
    if (!this.gameState) return;

    this.gameState.ball = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
    };

    this.ballDirectionX = Math.random() > 0.5 ? 1 : -1;
    this.ballDirectionY = Math.random() > 0.5 ? 1 : -1;
  }

  movePaddle(playerId: number, position: number): void {
    if (!this.gameState) return;
    if (playerId !== this.player1Id && playerId !== this.player2Id) return;

    const playerNumber = playerId === this.player1Id ? "player1" : "player2";
    const clampedPosition = Math.max(
      0,
      Math.min(position, this.canvasHeight - this.paddleHeight)
    );
    this.gameState.paddles[playerNumber].y = clampedPosition;
  }

  isGameOver(): boolean {
    return (
      this.gameState !== null &&
      (this.gameState.scores.player1 >= 5 || this.gameState.scores.player2 >= 5)
    );
  }

  reset(): void {
    this.gameState = null;
    this.player1Id = null;
    this.player2Id = null;
    this.ballDirectionX = 1;
    this.ballDirectionY = 1;
  }
}
