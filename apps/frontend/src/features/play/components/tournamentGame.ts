import { PropsBaseComponent } from "@/core/components";
import { tournamentSocket } from "@/features/play/tournamentSocketService";

interface GameState {
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

interface Player {
  id: number;
  username: string;
  score: number;
}

interface GameProps {
  player1?: Player;
  player2?: Player;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  currentUserId?: number;
  matchId?: number;
  tournamentId?: number;
}

export class TournamentGame extends PropsBaseComponent {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private gameState: GameState | null = null;
  private isReady = false;

  // Dimensions du canvas (mêmes valeurs que le serveur)
  private readonly canvasWidth = 800;
  private readonly canvasHeight = 600;
  private readonly paddleWidth = 10;
  private readonly paddleHeight = 100;

  connectedCallback() {
    super.connectedCallback();
    this.setupGame();
  }

  disconnected() {
    this.cleanupGame();
    super.connectedCallback();
  }

  private setupGame() {
    this.render();
    this.setupCanvas();
    this.setupControls();
    this.setupSocketListeners();
  }

  private setupCanvas() {
    this.canvas = this.querySelector("#gameCanvas") as HTMLCanvasElement;
    if (!this.canvas) {
      console.error("Canvas not found");
      return;
    }

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) {
      console.error("Could not get canvas context");
      return;
    }

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.drawEmptyState();
  }

  private setupControls() {
    const { currentUserId, player1, player2 } = this.props as GameProps;
    if (!currentUserId || (!player1?.id && !player2?.id)) return;

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private setupSocketListeners() {
    const { tournamentId, matchId } = this.props as GameProps;
    if (!tournamentId || !matchId) return;

    tournamentSocket.on("match:ready", (data) => {
      const { player1Ready, player2Ready } = data;
      const { currentUserId, player1, player2 } = this.props as GameProps;

      if (currentUserId === player1?.id) {
        this.isReady = player1Ready;
      } else if (currentUserId === player2?.id) {
        this.isReady = player2Ready;
      }

      this.render();
    });

    tournamentSocket.on("match:update", (data) => {
      if (data.state) {
        this.gameState = data.state;
        requestAnimationFrame(() => this.drawGame());
      }
    });

    tournamentSocket.on("match:start", () => {
      this.render();
    });

    tournamentSocket.on("match:end", () => {
      this.cleanupGame();
      this.render();
    });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.movePaddle("up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.movePaddle("down");
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      this.movePaddle("stop");
    }
  };

  private movePaddle(direction: "up" | "down" | "stop") {
    const { tournamentId, matchId } = this.props as GameProps;
    if (!tournamentId || !matchId) return;

    if (direction === "stop") return;

    const currentPaddleY = this.getCurrentPlayerPaddleY();
    if (currentPaddleY === null) return;

    const step = 15;
    const newPosition =
      direction === "up"
        ? Math.max(0, currentPaddleY - step)
        : Math.min(
            this.canvasHeight - this.paddleHeight,
            currentPaddleY + step
          );

    tournamentSocket.sendPaddleMove(tournamentId, matchId, newPosition);
  }

  private getCurrentPlayerPaddleY(): number | null {
    if (!this.gameState) return null;

    const { currentUserId, player1 } = this.props as GameProps;
    if (!currentUserId) return null;

    return currentUserId === player1?.id
      ? this.gameState.paddles.player1.y
      : this.gameState.paddles.player2.y;
  }

  private handleReadyClick() {
    const { tournamentId, matchId } = this.props as GameProps;
    if (!tournamentId || !matchId) return;

    this.isReady = true;
    tournamentSocket.sendPlayerReady(tournamentId, matchId);
    this.render();
  }

  private cleanupGame() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);

    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.canvas = null;
    this.ctx = null;
    this.gameState = null;
    this.isReady = false;
  }

  private drawGame() {
    if (!this.canvas || !this.ctx || !this.gameState) return;

    const ctx = this.ctx;
    const { ball, paddles, scores } = this.gameState;
    const { player1, player2 } = this.props as GameProps;

    // Background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Center line
    ctx.strokeStyle = "#FFFFFF";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.canvas.width / 2, 0);
    ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "48px Poppins";
    ctx.textAlign = "center";
    ctx.fillText(scores.player1.toString(), this.canvas.width / 4, 50);
    ctx.fillText(scores.player2.toString(), (this.canvas.width * 3) / 4, 50);

    // Player names
    if (player1 && player2) {
      ctx.font = "14px Poppins";
      ctx.fillText(player1.username, this.canvas.width / 4, 80);
      ctx.fillText(player2.username, (this.canvas.width * 3) / 4, 80);
    }

    // Paddles
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, paddles.player1.y, this.paddleWidth, this.paddleHeight);
    ctx.fillRect(
      this.canvas.width - this.paddleWidth,
      paddles.player2.y,
      this.paddleWidth,
      this.paddleHeight
    );

    // Ball (carré de 10x10)
    ctx.fillRect(ball.x - 5, ball.y - 5, 10, 10);
  }

  private drawEmptyState() {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;

    // Background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Center line
    ctx.strokeStyle = "#FFFFFF";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.canvas.width / 2, 0);
    ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Waiting message
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "24px Poppins";
    ctx.textAlign = "center";
    ctx.fillText(
      "En attente des joueurs...",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  render() {
    const { player1, player2, status, currentUserId } = this.props as GameProps;
    const isPlayer =
      currentUserId === player1?.id || currentUserId === player2?.id;

    this.innerHTML = /* html */ `
      <section class="padding-y">
        <div class="game-container bg-background rounded-lg p-4 shadow-lg relative">
          <div class="flex flex-col gap-4 items-center">
            <div class="flex items-center justify-between w-full max-w-4xl">
              <div class="flex items-center gap-4">
                <div class="bg-blue-900 px-4 py-2 rounded">
                  <span class="font-semibold">${
                    player1?.username || "Waiting..."
                  }</span>
                </div>
                <span class="text-2xl font-bold">VS</span>
                <div class="bg-pink-900 px-4 py-2 rounded">
                  <span class="font-semibold">${
                    player2?.username || "Waiting..."
                  }</span>
                </div>
            </div>
              <div class="flex items-center gap-2">
                ${
                  isPlayer
                    ? `
                  <div class="bg-gray-800 px-4 py-2 rounded">
                    <span class="font-semibold">Ready: ${
                      this.isReady ? "Yes" : "No"
                    }</span>
            </div>
                `
                    : ""
                }
                <div class="bg-gray-800 px-4 py-2 rounded">
                  <span class="font-semibold">Status: ${status}</span>
            </div>
          </div>
        </div>

            <canvas 
              id="gameCanvas"
              class="border border-secondary rounded shadow-lg"
            ></canvas>

            ${
              status === "IN_PROGRESS" && isPlayer && !this.isReady
                ? /* html */ `
                <button id="readyButton" class="btn-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  Click to Start
                </button>`
                : ""
            }
          </div>
        </div>

        ${
          isPlayer && status === "IN_PROGRESS"
            ? /* html */ `
              <div class="text-center mt-4">
                <h2 class="text-xl font-bold mb-4">Controls</h2>
                <p>Use ↑ and ↓ arrow keys to move your paddle</p>
              </div>`
            : ""
        }
      </section>
    `;

    this.setupCanvas();
    this.setupControls();

    const readyButton = this.querySelector("#readyButton");
    if (readyButton) {
      readyButton.addEventListener("click", () => this.handleReadyClick());
    }
  }
}

customElements.define("tournament-game", TournamentGame);
