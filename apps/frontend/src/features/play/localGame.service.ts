import {
  GAME_CONFIG,
  GAME_RULES,
  GameState,
  Player,
  Position,
  Velocity,
} from "@/features/play/constants";

export class LocalGameService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;

  // Game state
  private state: GameState = {
    isGameOver: false,
    winner: null,
    score1: 0,
    score2: 0,
  };

  // Game objects
  private paddle1: Position = { x: 0, y: 0 };
  private paddle2: Position = { x: 0, y: 0 };
  private ball: Position = { x: 0, y: 0 };
  private ballVelocity: Velocity = { dx: 0, dy: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    this.ctx = ctx;
    this.initializeGame();
  }

  private initializeGame(): void {
    this.canvas.width = GAME_CONFIG.width;
    this.canvas.height = GAME_CONFIG.height;
    this.initializePositions();
  }

  private initializePositions(): void {
    this.paddle1 = {
      x: 0,
      y: (GAME_CONFIG.height - GAME_RULES.PADDLE_HEIGHT) / 2,
    };
    this.paddle2 = {
      x: GAME_CONFIG.width - GAME_RULES.PADDLE_WIDTH,
      y: (GAME_CONFIG.height - GAME_RULES.PADDLE_HEIGHT) / 2,
    };
    this.resetBallPosition();
  }

  private resetBallPosition(): void {
    this.ball = {
      x: GAME_CONFIG.width / 2,
      y: GAME_CONFIG.height / 2,
    };
    this.ballVelocity = { dx: 0, dy: 0 };
  }

  public start(): void {
    this.setupEventListeners();
    this.setInitialBallVelocity();
    this.startGameLoop();
  }

  private setInitialBallVelocity(): void {
    const angle = (Math.random() * Math.PI) / 4 + Math.PI / 8;
    const direction = Math.random() < 0.5 ? 1 : -1;

    this.ballVelocity = {
      dx: Math.cos(angle) * GAME_RULES.INITIAL_BALL_SPEED * direction,
      dy:
        Math.sin(angle) *
        GAME_RULES.INITIAL_BALL_SPEED *
        (Math.random() < 0.5 ? 1 : -1),
    };
  }

  private startGameLoop(): void {
    const gameLoop = () => {
      this.update();
      this.draw();
      this.animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  private update(): void {
    if (this.state.isGameOver) return;

    this.updateBallPosition();
    this.checkCollisions();
    this.checkScoring();
  }

  private draw(): void {
    this.clearCanvas();
    this.drawCenterLine();
    this.drawPaddles();
    this.drawBall();
    this.drawScores();
    this.drawWinnerMessage();
  }

  private updateBallPosition(): void {
    this.ball.x += this.ballVelocity.dx;
    this.ball.y += this.ballVelocity.dy;
  }

  private checkCollisions(): void {
    // Wall collisions
    if (
      this.ball.y <= 0 ||
      this.ball.y >= GAME_CONFIG.height - GAME_RULES.BALL_SIZE
    ) {
      this.ballVelocity.dy = -this.ballVelocity.dy;
    }

    // Paddle collisions
    if (
      this.checkPaddleCollision(this.paddle1) ||
      this.checkPaddleCollision(this.paddle2)
    ) {
      this.ballVelocity.dx = -this.ballVelocity.dx;
      this.ballVelocity.dy += (Math.random() - 0.5) * 2; // Add some randomness
    }
  }

  private checkScoring(): void {
    if (this.ball.x <= 0) {
      this.handleScore(2);
    } else if (this.ball.x >= GAME_CONFIG.width - GAME_RULES.BALL_SIZE) {
      this.handleScore(1);
    }
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = GAME_CONFIG.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawCenterLine(): void {
    this.ctx.strokeStyle = GAME_CONFIG.lineColor;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawPaddles(): void {
    this.ctx.fillStyle = GAME_CONFIG.lineColor;
    this.ctx.fillRect(
      this.paddle1.x,
      this.paddle1.y,
      GAME_RULES.PADDLE_WIDTH,
      GAME_RULES.PADDLE_HEIGHT
    );
    this.ctx.fillRect(
      this.paddle2.x,
      this.paddle2.y,
      GAME_RULES.PADDLE_WIDTH,
      GAME_RULES.PADDLE_HEIGHT
    );
  }

  private drawBall(): void {
    if (!this.state.isGameOver) {
      this.ctx.fillStyle = GAME_CONFIG.lineColor;
      this.ctx.fillRect(
        this.ball.x,
        this.ball.y,
        GAME_RULES.BALL_SIZE,
        GAME_RULES.BALL_SIZE
      );
    }
  }

  private drawScores(): void {
    this.ctx.fillStyle = GAME_CONFIG.textColor;
    this.ctx.font = GAME_CONFIG.fontSize;
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.state.score1.toString(), this.canvas.width / 4, 50);
    this.ctx.fillText(
      this.state.score2.toString(),
      (this.canvas.width * 3) / 4,
      50
    );
  }

  private drawWinnerMessage(): void {
    if (this.state.isGameOver && this.state.winner) {
      this.ctx.font = "36px Poppins";
      this.ctx.fillStyle = GAME_CONFIG.textColor;
      this.ctx.fillText(
        `Player ${this.state.winner} Wins!`,
        this.canvas.width / 2,
        this.canvas.height / 2 - 50
      );
    }
  }

  public stop(): void {
    this.stopGameLoop();
    this.removeEventListeners();
  }

  private stopGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public getGameState(): GameState {
    return { ...this.state };
  }

  public reset(): void {
    this.stop();
    this.state = {
      isGameOver: false,
      winner: null,
      score1: 0,
      score2: 0,
    };
    this.initializePositions();
    this.start();
    this.setInitialBallVelocity();
  }

  private readonly handleKeyPress = (event: KeyboardEvent): void => {
    if (this.state.isGameOver) return;

    const key = event.key.toLowerCase();
    const controls: Record<string, () => void> = {
      w: () => this.movePaddle(1, "up"),
      s: () => this.movePaddle(1, "down"),
      arrowup: () => this.movePaddle(2, "up"),
      arrowdown: () => this.movePaddle(2, "down"),
    };

    if (key in controls) {
      event.preventDefault();
      controls[key]();
    }
  };

  private setupEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyPress);
  }

  private removeEventListeners(): void {
    window.removeEventListener("keydown", this.handleKeyPress);
  }

  private movePaddle(player: Player, direction: "up" | "down"): void {
    const paddle = player === 1 ? this.paddle1 : this.paddle2;
    const movement =
      direction === "up" ? -GAME_RULES.PADDLE_SPEED : GAME_RULES.PADDLE_SPEED;

    paddle.y = Math.max(
      0,
      Math.min(
        GAME_CONFIG.height - GAME_RULES.PADDLE_HEIGHT,
        paddle.y + movement
      )
    );
  }

  private checkPaddleCollision(paddle: Position): boolean {
    return (
      this.ball.x <= paddle.x + GAME_RULES.PADDLE_WIDTH &&
      this.ball.x + GAME_RULES.BALL_SIZE >= paddle.x &&
      this.ball.y + GAME_RULES.BALL_SIZE >= paddle.y &&
      this.ball.y <= paddle.y + GAME_RULES.PADDLE_HEIGHT
    );
  }

  private handleScore(scorer: Player): void {
    if (scorer === 1) this.state.score1++;
    else this.state.score2++;

    if (this.state.score1 >= GAME_RULES.WIN_SCORE) {
      this.endGame(1);
    } else if (this.state.score2 >= GAME_RULES.WIN_SCORE) {
      this.endGame(2);
    } else {
      this.resetBallPosition();
      this.setInitialBallVelocity();
    }
  }

  private endGame(winner: Player): void {
    this.state.isGameOver = true;
    this.state.winner = winner;
    this.stopGameLoop();
  }
}
