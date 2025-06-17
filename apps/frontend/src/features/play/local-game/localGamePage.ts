import { BaseComponent } from "@/core/components";
import { LocalGameService } from "@/features/play/local-game/localGameService";
import { GAME_CONFIG, GAME_RULES } from "@/features/play/constants";

class LocalGamePage extends BaseComponent {
  private gameService: LocalGameService | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private gameStateInterval: number | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.initializeCanvas();
    this.setupEventListeners();
    this.startGameStateCheck();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  private cleanup() {
    this.gameService?.stop();
    this.removeEventListeners();
    this.stopGameStateCheck();
  }

  private startGameStateCheck() {
    this.stopGameStateCheck();
    this.gameStateInterval = window.setInterval(
      () => this.checkGameState(),
      100
    );
  }

  private stopGameStateCheck() {
    if (this.gameStateInterval !== null) {
      clearInterval(this.gameStateInterval);
      this.gameStateInterval = null;
    }
  }

  private initializeCanvas() {
    this.canvas = this.querySelector("canvas");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return;

    this.canvas.width = GAME_CONFIG.width;
    this.canvas.height = GAME_CONFIG.height;

    this.drawInitialState();
  }

  private drawInitialState() {
    if (!this.ctx || !this.canvas) return;

    // Background
    this.ctx.fillStyle = GAME_CONFIG.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Center line
    this.ctx.strokeStyle = GAME_CONFIG.lineColor;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Initial paddles
    this.ctx.fillStyle = GAME_CONFIG.lineColor;
    // Left paddle
    this.ctx.fillRect(
      0,
      (this.canvas.height - GAME_RULES.PADDLE_HEIGHT) / 2,
      GAME_RULES.PADDLE_WIDTH,
      GAME_RULES.PADDLE_HEIGHT
    );
    // Right paddle
    this.ctx.fillRect(
      this.canvas.width - GAME_RULES.PADDLE_WIDTH,
      (this.canvas.height - GAME_RULES.PADDLE_HEIGHT) / 2,
      GAME_RULES.PADDLE_WIDTH,
      GAME_RULES.PADDLE_HEIGHT
    );

    // Initial scores
    this.ctx.fillStyle = GAME_CONFIG.textColor;
    this.ctx.font = GAME_CONFIG.fontSize;
    this.ctx.textAlign = "center";
    this.ctx.fillText("0", this.canvas.width / 4, 50);
    this.ctx.fillText("0", (this.canvas.width * 3) / 4, 50);
  }

  private setupEventListeners() {
    const startButton = this.querySelector<HTMLButtonElement>("#startGame");
    const restartButton = this.querySelector<HTMLButtonElement>("#restartGame");

    startButton?.addEventListener("click", this.handleStartGame);
    restartButton?.addEventListener("click", this.handleRestartGame);
  }

  private removeEventListeners() {
    const startButton = this.querySelector<HTMLButtonElement>("#startGame");
    const restartButton = this.querySelector<HTMLButtonElement>("#restartGame");

    startButton?.removeEventListener("click", this.handleStartGame);
    restartButton?.removeEventListener("click", this.handleRestartGame);
  }

  private checkGameState() {
    if (!this.gameService) return;

    const gameState = this.gameService.getGameState();
    this.updateButtonVisibility(gameState.isGameOver);
  }

  private updateButtonVisibility(isGameOver: boolean) {
    const startButton = this.querySelector<HTMLButtonElement>("#startGame");
    const restartButton = this.querySelector<HTMLButtonElement>("#restartGame");

    if (startButton) startButton.style.display = "none";
    if (restartButton) {
      restartButton.style.display = isGameOver ? "block" : "none";
    }
  }

  private readonly handleStartGame = () => {
    if (this.gameService || !this.canvas) return;

    this.updateButtonVisibility(false);
    this.gameService = new LocalGameService(this.canvas);
    this.gameService.start();
  };

  private readonly handleRestartGame = () => {
    if (!this.gameService) return;

    this.updateButtonVisibility(false);
    this.gameService.reset();
  };

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x flex flex-col items-center gap-8">
          <div class="flex items-center justify-between w-full max-w-4xl">
            <h1 class="text-3xl font-bold">Local Game</h1>
            <button class="btn-secondary" onclick="window.history.back()">Back to Menu</button>
          </div>
          
          <div class="game-container bg-background rounded-lg p-4 shadow-lg relative">
            <canvas class="border border-secondary rounded"></canvas>
            <button id="startGame" class="btn-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 py-4 text-xl font-bold">
              Start Game
            </button>
            <button id="restartGame" class="btn-primary absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 py-4 text-xl font-bold" style="display: none;">
              Play Again
            </button>
          </div>

          <div class="controls text-center">
            <h2 class="text-xl font-bold mb-4">Controls</h2>
            <div class="flex justify-center gap-12">
              <div class="player-controls">
                <h3 class="font-bold mb-2">Player 1</h3>
                <p>W - Move Up</p>
                <p>S - Move Down</p>
              </div>
              <div class="player-controls">
                <h3 class="font-bold mb-2">Player 2</h3>
                <p>↑ - Move Up</p>
                <p>↓ - Move Down</p>
              </div>
            </div>
          </div>
        </section>
      </section>
    `;
  }
}

export default LocalGamePage;
