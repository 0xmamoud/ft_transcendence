import { PropsBaseComponent } from "@/core/components";
import { tournamentSocket } from "@/features/play/tournament.socket.service";

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

  // Dimensions du canvas
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

    setTimeout(() => {
      this.setupCanvas();
      this.setupControls();
      this.setupSocketListeners();
    }, 0);
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

    // Définir les dimensions réelles du canvas
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    // Appliquer le style pour le responsive
    this.canvas.style.width = "100%";
    this.canvas.style.height = "auto";
    this.canvas.style.maxWidth = "800px";
    this.canvas.style.backgroundColor = "black";
    this.canvas.style.display = "block";
    this.canvas.style.margin = "0 auto";

    // Dessiner l'état initial
    this.drawEmptyState();
  }

  private setupControls() {
    const { currentUserId, player1, player2 } = this.props as GameProps;
    if (!currentUserId || (!player1?.id && !player2?.id)) return;

    // Gérer les touches du clavier
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // Gérer les boutons tactiles
    const upButton = this.querySelector("#upButton");
    const downButton = this.querySelector("#downButton");

    if (upButton) {
      upButton.addEventListener("touchstart", () => this.movePaddle("up"));
      upButton.addEventListener("touchend", () => this.movePaddle("stop"));
      upButton.addEventListener("mousedown", () => this.movePaddle("up"));
      upButton.addEventListener("mouseup", () => this.movePaddle("stop"));
    }

    if (downButton) {
      downButton.addEventListener("touchstart", () => this.movePaddle("down"));
      downButton.addEventListener("touchend", () => this.movePaddle("stop"));
      downButton.addEventListener("mousedown", () => this.movePaddle("down"));
      downButton.addEventListener("mouseup", () => this.movePaddle("stop"));
    }
  }

  private setupSocketListeners() {
    const { tournamentId, matchId } = this.props as GameProps;
    if (!tournamentId || !matchId) return;

    // Écouter l'état ready des joueurs
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

    // Écouter les mises à jour du jeu
    tournamentSocket.on("match:update", (data) => {
      if (data.state) {
        this.gameState = data.state;
        this.drawGame();
      }
    });

    // Écouter le début du match
    tournamentSocket.on("match:start", () => {
      this.render();
    });

    // Écouter la fin du match
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

    const step = 20;
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
    if (!this.canvas || !this.ctx || !this.gameState) {
      console.log("Cannot draw game:", {
        hasCanvas: !!this.canvas,
        hasContext: !!this.ctx,
        hasGameState: !!this.gameState,
        canvasWidth: this.canvas?.width,
        canvasHeight: this.canvas?.height,
      });
      return;
    }

    // S'assurer que le canvas a les bonnes dimensions
    if (
      this.canvas.width !== this.canvasWidth ||
      this.canvas.height !== this.canvasHeight
    ) {
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;
    }

    const ctx = this.ctx;
    const { ball, paddles, scores } = this.gameState;
    const { player1, player2 } = this.props as GameProps;

    // Effacer le canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner le fond
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner la ligne centrale
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.canvas.width / 2, 0);
    ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dessiner les scores
    ctx.fillStyle = "#FFF";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(scores.player1.toString(), this.canvas.width / 4, 30);
    ctx.fillText(scores.player2.toString(), (this.canvas.width / 4) * 3, 30);

    // Dessiner les noms des joueurs
    if (player1 && player2) {
      ctx.font = "14px Arial";
      ctx.fillText(player1.username, this.canvas.width / 4, 50);
      ctx.fillText(player2.username, (this.canvas.width / 4) * 3, 50);
    }

    // Dessiner les raquettes
    this.drawPaddle(ctx, 0, paddles.player1.y, "#4299e1");
    this.drawPaddle(
      ctx,
      this.canvas.width - this.paddleWidth,
      paddles.player2.y,
      "#ed64a6"
    );

    // Dessiner la balle
    this.drawBall(ctx, ball.x, ball.y);
  }

  private drawPaddle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, this.paddleWidth, this.paddleHeight);
    ctx.restore();
  }

  private drawBall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const radius = 5;
    ctx.save();
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawEmptyState() {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.canvas.width / 2, 0);
    ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
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
      <div class="flex flex-col items-center justify-center bg-gray-900 text-white p-4 rounded-lg w-full">
        <div class="mb-4 text-center">
          <h2 class="text-xl font-bold mb-2">Match Status</h2>
          <div class="flex flex-wrap gap-2 justify-center">
            <div class="bg-gray-800 p-2 rounded">
              <span class="font-semibold">Status:</span> ${status}
            </div>
            ${
              isPlayer
                ? `
              <div class="bg-gray-800 p-2 rounded">
                <span class="font-semibold">Ready:</span> ${
                  this.isReady ? "Yes" : "No"
                }
              </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="mb-4 text-center">
          <h3 class="text-lg font-bold mb-2">Players</h3>
          <div class="flex justify-between gap-4">
            <div class="bg-blue-900 p-2 rounded flex-1">
              <div class="font-semibold">${
                player1?.username || "Waiting..."
              }</div>
            </div>
            <div class="bg-pink-900 p-2 rounded flex-1">
              <div class="font-semibold">${
                player2?.username || "Waiting..."
              }</div>
            </div>
          </div>
        </div>

        ${
          status === "IN_PROGRESS" && isPlayer && !this.isReady
            ? `
          <button id="readyButton" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mb-4">
            Click to Start
          </button>
        `
            : ""
        }

        <div class="w-full max-w-[800px] mx-auto">
          <div class="relative w-full" style="padding-top: 75%;">
            <canvas 
              id="gameCanvas"
              class="absolute top-0 left-0 w-full h-full border border-gray-700 rounded shadow-lg"
            ></canvas>
          </div>
        </div>

        ${
          isPlayer && status === "IN_PROGRESS"
            ? `
          <div class="text-center mt-4">
            <p class="mb-2">Utilisez les flèches ↑ et ↓ pour déplacer votre raquette</p>
            <div class="flex justify-center gap-4 mt-2">
              <button id="upButton" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-xl shadow-lg transition-colors">↑</button>
              <button id="downButton" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-xl shadow-lg transition-colors">↓</button>
            </div>
          </div>
        `
            : ""
        }
      </div>
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
