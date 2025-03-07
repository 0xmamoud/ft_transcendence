import { PropsBaseComponent } from "@/core/components";
import { tournamentSocket } from "@/features/play/tournament.socket.service";
import { GameState as ServerGameState } from "@/features/play/game.service";

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

interface PlayerState {
  isPlayer1: boolean;
  isPlayer2: boolean;
  isReady: boolean;
}

interface GameStateData {
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

interface MatchState {
  isStarted: boolean;
  isEnded: boolean;
  winnerId: number | null;
}

export class TournamentGame extends PropsBaseComponent {
  // État du joueur
  private playerState: PlayerState = {
    isPlayer1: false,
    isPlayer2: false,
    isReady: false,
  };

  // État du match
  private matchState: MatchState = {
    isStarted: false,
    isEnded: false,
    winnerId: null,
  };

  // État du jeu (reçu du serveur)
  private gameState: GameStateData | null = null;

  // Ressources canvas
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  // Contrôles
  private keyState = { up: false, down: false };
  private lastPaddleUpdate = 0;
  private readonly paddleUpdateInterval = 60; // ms

  connectedCallback() {
    super.connectedCallback();
    console.log("TournamentGame connected, props:", this.props);
    this.checkPlayerStatus();
    this.setupSocketListeners();
    this.render();

    // Attendre que le DOM soit mis à jour avant de configurer le canvas
    setTimeout(() => {
      this.setupCanvas();
      this.setupKeyboardControls();

      // Si le match est déjà en cours, démarrer le jeu
      const { status } = this.props as GameProps;
      if (status === "IN_PROGRESS") {
        console.log("Match is already in progress, initializing game");
        this.matchState.isStarted = true;

        // Demander l'état actuel du jeu via le socket
        const { tournamentId, matchId } = this.props as GameProps;
        if (tournamentId && matchId) {
          console.log("Requesting current game state");
          tournamentSocket.getGameState(tournamentId, matchId);
        }
      }
    }, 100);
  }

  disconnectedCallback() {
    console.log("Tournament game component disconnecting");

    // Cleanup game resources
    this.cleanupGame();

    // Call parent disconnectedCallback
    super.connectedCallback();
  }

  private checkPlayerStatus() {
    const { currentUserId, player1, player2 } = this.props as GameProps;

    console.log("Checking player status:", {
      currentUserId,
      player1Id: player1?.id,
      player2Id: player2?.id,
    });

    if (!currentUserId) return;

    const currentUserIdNum = Number(currentUserId);
    const player1IdNum = player1 ? Number(player1.id) : undefined;
    const player2IdNum = player2 ? Number(player2.id) : undefined;

    this.playerState.isPlayer1 = player1IdNum === currentUserIdNum;
    this.playerState.isPlayer2 = player2IdNum === currentUserIdNum;

    console.log("Player status result:", {
      isPlayer1: this.playerState.isPlayer1,
      isPlayer2: this.playerState.isPlayer2,
      isPlayer: this.playerState.isPlayer1 || this.playerState.isPlayer2,
    });
  }

  private setupSocketListeners() {
    console.log("Setting up socket listeners");

    tournamentSocket.on("match:ready", (data) => {
      const { player1Ready, player2Ready } = data;

      if (this.playerState.isPlayer1) {
        this.playerState.isReady = player1Ready;
      } else if (this.playerState.isPlayer2) {
        this.playerState.isReady = player2Ready;
      }

      this.render();
    });

    tournamentSocket.onGameUpdate((stateData: any) => {
      if (stateData && stateData.state) {
        this.gameState = stateData.state;
      } else if (
        stateData &&
        stateData.ball &&
        stateData.paddles &&
        stateData.canvas &&
        stateData.scores
      ) {
        this.gameState = stateData;
      } else {
        console.error("Invalid game state format:", stateData);
        return;
      }

      if (this.canvas && this.ctx) {
        try {
          this.drawGame();
        } catch (error) {
          console.error("Error drawing game from update:", error);
          this.drawEmptyState();
        }
      }

      if (!this.matchState.isStarted && this.gameState) {
        this.matchState.isStarted = true;
        this.startGameLoop();
      }
    });

    tournamentSocket.onMatchStart(() => {
      this.matchState.isStarted = true;
      this.matchState.isEnded = false;
      this.matchState.winnerId = null;
      this.render();
      this.startGameLoop();
    });

    tournamentSocket.onMatchEnd((data) => {
      this.matchState.isEnded = true;
      this.matchState.isStarted = false;
      this.matchState.winnerId = data.winnerId;
      this.cleanupGame();
      this.render();
    });
  }

  private handleReadyClick() {
    console.log("Ready button clicked");
    const { tournamentId, matchId } = this.props as GameProps;

    if (!tournamentId || !matchId) {
      console.error("Missing tournamentId or matchId");
      return;
    }

    this.playerState.isReady = true;
    tournamentSocket.sendPlayerReady(tournamentId, matchId);
    console.log("Player ready sent to server");
    this.render();
  }

  private setupCanvas() {
    console.log("Setting up canvas");
    this.canvas = this.querySelector("#gameCanvas") as HTMLCanvasElement;
    if (this.canvas) {
      console.log("Canvas found:", this.canvas);
      this.ctx = this.canvas.getContext("2d");
      console.log("Canvas context:", this.ctx);

      // Définir les dimensions initiales du canvas
      if (this.gameState && this.gameState.canvas) {
        this.canvas.width = this.gameState.canvas.width;
        this.canvas.height = this.gameState.canvas.height;
      } else {
        // Dimensions par défaut si l'état du jeu n'est pas encore disponible
        this.canvas.width = 800;
        this.canvas.height = 600;
      }

      this.resizeCanvas();
      window.addEventListener("resize", this.resizeCanvas);

      // Si nous avons déjà un état de jeu, démarrer la boucle de jeu
      if (this.gameState) {
        console.log("Game state already exists, starting game loop");
        this.matchState.isStarted = true;
        this.startGameLoop();
      } else {
        // Dessiner un état initial vide
        this.drawEmptyState();
      }
    } else {
      console.error("Canvas not found!");
    }
  }

  private resizeCanvas = () => {
    if (!this.canvas) return;

    const container = this.canvas.parentElement;
    if (!container) return;

    // Get the container width
    const containerWidth = container.clientWidth;

    // Set a maximum width for the canvas
    const maxWidth = 800;
    const width = Math.min(containerWidth - 20, maxWidth); // 20px padding

    // Maintain aspect ratio (4:3)
    const height = width * 0.75;

    // Update canvas display size
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    console.log("Canvas resized to:", {
      displayWidth: width,
      displayHeight: height,
      internalWidth: this.canvas.width,
      internalHeight: this.canvas.height,
    });
  };

  private cleanupEventListeners() {
    // Nettoyer les event listeners du clavier
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("resize", this.resizeCanvas);

    // Nettoyer les event listeners des boutons
    const upButton = this.querySelector("#upButton");
    const downButton = this.querySelector("#downButton");
    const readyButton = this.querySelector("#readyButton");

    if (upButton) {
      upButton.removeEventListener("touchstart", () => {});
      upButton.removeEventListener("touchend", () => {});
      upButton.removeEventListener("mousedown", () => {});
      upButton.removeEventListener("mouseup", () => {});
      upButton.removeEventListener("mouseleave", () => {});
    }

    if (downButton) {
      downButton.removeEventListener("touchstart", () => {});
      downButton.removeEventListener("touchend", () => {});
      downButton.removeEventListener("mousedown", () => {});
      downButton.removeEventListener("mouseup", () => {});
      downButton.removeEventListener("mouseleave", () => {});
    }

    if (readyButton) {
      readyButton.removeEventListener("click", () => {});
    }
  }

  private setupKeyboardControls() {
    // Nettoyer les anciens event listeners avant d'en ajouter de nouveaux
    this.cleanupEventListeners();

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // Utiliser des références aux fonctions pour pouvoir les retirer plus tard
    const handleTouchStart = (key: "up" | "down") => () => {
      this.keyState[key] = true;
    };

    const handleTouchEnd = (key: "up" | "down") => () => {
      this.keyState[key] = false;
    };

    setTimeout(() => {
      const upButton = this.querySelector("#upButton");
      const downButton = this.querySelector("#downButton");

      if (upButton) {
        const upStart = handleTouchStart("up");
        const upEnd = handleTouchEnd("up");
        upButton.addEventListener("touchstart", upStart);
        upButton.addEventListener("touchend", upEnd);
        upButton.addEventListener("mousedown", upStart);
        upButton.addEventListener("mouseup", upEnd);
        upButton.addEventListener("mouseleave", upEnd);
      }

      if (downButton) {
        const downStart = handleTouchStart("down");
        const downEnd = handleTouchEnd("down");
        downButton.addEventListener("touchstart", downStart);
        downButton.addEventListener("touchend", downEnd);
        downButton.addEventListener("mousedown", downStart);
        downButton.addEventListener("mouseup", downEnd);
        downButton.addEventListener("mouseleave", downEnd);
      }
    }, 0);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.keyState.up = true;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.keyState.down = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.keyState.up = false;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.keyState.down = false;
    }
  };

  private startGameLoop() {
    if (!this.canvas || !this.ctx) {
      console.error("Cannot start game loop: canvas or context is missing");
      this.setupCanvas();
      return;
    }

    // Annuler toute boucle existante avant d'en démarrer une nouvelle
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Dessiner une fois immédiatement
    if (this.gameState) {
      this.drawGame();
    } else {
      this.drawEmptyState();
    }

    let lastUpdate = performance.now();
    const minUpdateInterval = 1000 / 30; // Limiter à 30fps
    let frameCount = 0;
    let lastFPSUpdate = performance.now();

    const gameLoop = () => {
      const now = performance.now();
      const delta = now - lastUpdate;

      // FPS monitoring
      frameCount++;
      if (now - lastFPSUpdate >= 1000) {
        console.debug("FPS:", frameCount);
        frameCount = 0;
        lastFPSUpdate = now;
      }

      if (delta >= minUpdateInterval) {
        try {
          this.updatePaddlePosition();
          if (this.ctx && this.canvas) {
            this.drawGame();
          }
          lastUpdate = now;
        } catch (error) {
          console.error("Error in game loop:", error);
          this.drawEmptyState();
        }
      }

      // Only request next frame if component is still connected
      if (this.isConnected) {
        this.animationFrameId = requestAnimationFrame(gameLoop);
      } else {
        this.cleanupGame();
      }
    };

    this.animationFrameId = requestAnimationFrame(gameLoop);
  }

  private updatePaddlePosition() {
    if (
      !this.gameState ||
      (!this.playerState.isPlayer1 && !this.playerState.isPlayer2)
    )
      return;

    const now = Date.now();
    if (now - this.lastPaddleUpdate < this.paddleUpdateInterval) return;
    this.lastPaddleUpdate = now;

    const { tournamentId, matchId } = this.props as GameProps;
    if (!tournamentId || !matchId) return;

    if (this.keyState.up || this.keyState.down) {
      const paddle = this.playerState.isPlayer1
        ? this.gameState.paddles.left
        : this.gameState.paddles.right;
      const canvasHeight = this.gameState.canvas.height;

      // Calculate new position
      let newPosition = paddle.y;
      if (this.keyState.up) {
        newPosition = Math.max(0, newPosition - 20);
      }
      if (this.keyState.down) {
        newPosition = Math.min(canvasHeight - paddle.height, newPosition + 20);
      }

      // Send update to server
      tournamentSocket.sendPaddleMove(tournamentId, matchId, newPosition);
    }
  }

  private drawGame() {
    if (!this.canvas || !this.ctx || !this.gameState) {
      console.error("Cannot draw game:", {
        canvas: !!this.canvas,
        ctx: !!this.ctx,
        gameState: !!this.gameState,
      });
      return;
    }

    // Vérifier que l'état du jeu a la structure attendue
    if (
      !this.gameState.canvas ||
      !this.gameState.paddles ||
      !this.gameState.ball ||
      !this.gameState.scores
    ) {
      console.error(
        "Game state is missing required properties:",
        this.gameState
      );
      this.drawEmptyState();
      return;
    }

    const { canvas, paddles, ball, scores, players } = this.gameState;
    const ctx = this.ctx;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawBackground(ctx, canvas);

    // Draw game elements with minimal state changes
    ctx.save();

    // Set common styles
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";

    // Draw scores
    ctx.font = "24px Arial";
    ctx.fillText(scores.left.toString(), canvas.width / 4, 30);
    ctx.fillText(scores.right.toString(), (canvas.width / 4) * 3, 30);

    // Draw middle line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player names
    const { player1, player2 } = this.props as GameProps;
    if (player1 && player2) {
      ctx.font = "14px Arial";
      ctx.fillText(player1.username, canvas.width / 4, 50);
      ctx.fillText(player2.username, (canvas.width / 4) * 3, 50);
    }

    // Draw game elements
    this.drawPaddle(ctx, 0, paddles.left.y, 10, paddles.left.height, "#4299e1");
    this.drawPaddle(
      ctx,
      canvas.width - 10,
      paddles.right.y,
      10,
      paddles.right.height,
      "#ed64a6"
    );
    this.drawBall(ctx, ball.x, ball.y, 10);

    // Draw ready status only if game hasn't started yet
    if (
      !this.matchState.isStarted &&
      players &&
      (!players.player1Ready || !players.player2Ready)
    ) {
      this.drawReadyStatus(ctx, canvas, players);
    }

    // Restore context
    ctx.restore();
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    canvas: { width: number; height: number }
  ) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Draw grid with minimal state changes
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawPaddle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
    ctx.save();

    // Draw glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;

    // Draw paddle
    ctx.fillRect(x, y, width, height);

    // Draw highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(x + 1, y + 1, width - 2, 5);

    ctx.restore();
  }

  private drawBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ) {
    ctx.save();

    // Draw glow
    ctx.shadowColor = "#f7fafc";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#f7fafc";

    // Draw ball
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(x - radius / 3, y - radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawReadyStatus(
    ctx: CanvasRenderingContext2D,
    canvas: { width: number; height: number },
    players: { player1Ready?: boolean; player2Ready?: boolean }
  ) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.fillText(
      "Waiting for players to be ready",
      canvas.width / 2,
      canvas.height / 2 - 10
    );

    ctx.font = "16px Arial";
    ctx.fillText(
      `Player 1: ${
        players.player1Ready ? "Ready ✓" : "Not Ready ✗"
      }   |   Player 2: ${players.player2Ready ? "Ready ✓" : "Not Ready ✗"}`,
      canvas.width / 2,
      canvas.height / 2 + 20
    );
  }

  private cleanupGame() {
    console.log("Cleaning up game resources");

    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Clear canvas to free memory
    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Reset game state
    this.gameState = null;
    this.matchState.isStarted = false;
    this.playerState.isReady = false;
    this.keyState = { up: false, down: false };
    this.lastPaddleUpdate = 0;

    // Remove references
    this.ctx = null;
    this.canvas = null;

    // Force garbage collection of event listeners
    this.cleanupEventListeners();
  }

  public updateGameState(data: any) {
    console.log("Game state update received:", data, {
      canvas: !!this.canvas,
      ctx: !!this.ctx,
      gameState: !!this.gameState,
    });

    // Vérifier si les données sont dans le format attendu
    if (data && data.state) {
      this.gameState = data.state;
    } else if (
      data &&
      data.ball &&
      data.paddles &&
      data.canvas &&
      data.scores
    ) {
      // Si l'état est directement l'objet GameState sans être encapsulé
      this.gameState = data;
    } else {
      console.error("Invalid game state data received:", data);
      return;
    }

    this.matchState.isStarted = true;

    // Mettre à jour les scores si disponibles
    if (this.gameState && this.gameState.scores) {
      this.gameState.scores.left = data.scores.left;
      this.gameState.scores.right = data.scores.right;
    }

    // Forcer le rendu immédiatement
    if (this.canvas && this.ctx) {
      // S'assurer que les dimensions du canvas correspondent à l'état du jeu
      if (this.gameState && this.gameState.canvas) {
        if (
          this.canvas.width !== this.gameState.canvas.width ||
          this.canvas.height !== this.gameState.canvas.height
        ) {
          this.canvas.width = this.gameState.canvas.width;
          this.canvas.height = this.gameState.canvas.height;
          this.resizeCanvas();
        }
      }

      try {
        this.drawGame();
      } catch (error) {
        console.error("Error drawing game:", error);
        this.drawEmptyState();
      }
    } else {
      console.error("Canvas or context not available for update");
      this.setupCanvas();
    }

    // Démarrer la boucle de jeu si elle n'est pas déjà en cours
    if (this.animationFrameId === null) {
      this.startGameLoop();
    }
  }

  // Dessiner un état initial vide en attendant les données du serveur
  private drawEmptyState() {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Fond noir
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    // Ligne centrale
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Message d'attente
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("En attente de l'état du jeu...", width / 2, height / 2);
  }

  render() {
    const { player1, player2, status } = this.props as GameProps;
    const isPlayer = this.playerState.isPlayer1 || this.playerState.isPlayer2;

    const p1Score = this.gameState?.scores.left || player1?.score || 0;
    const p2Score = this.gameState?.scores.right || player2?.score || 0;

    let winner, loser;
    if (this.matchState.isEnded && this.matchState.winnerId) {
      if (player1 && player2) {
        if (player1.id === this.matchState.winnerId) {
          winner = player1;
          loser = player2;
        } else {
          winner = player2;
          loser = player1;
        }
      }
    }

    console.log("Rendering game component:", {
      isReady: this.playerState.isReady,
      gameStarted: this.matchState.isStarted,
      matchEnded: this.matchState.isEnded,
      status,
      isPlayer,
      player1Score: p1Score,
      player2Score: p2Score,
      winnerId: this.matchState.winnerId,
    });

    this.innerHTML = /* html */ `
      <div class="flex flex-col items-center justify-center bg-gray-900 text-white p-4 rounded-lg w-full">
        <div class="mb-4 text-center">
          <h2 class="text-xl font-bold mb-2">Match Status</h2>
          <div class="flex flex-wrap gap-2 justify-center">
            <div class="bg-gray-800 p-2 rounded">
              <span class="font-semibold">Status:</span> ${status}
            </div>
            <div class="bg-gray-800 p-2 rounded">
              <span class="font-semibold">Role:</span> ${
                isPlayer
                  ? this.playerState.isPlayer1
                    ? "Player 1"
                    : "Player 2"
                  : "Spectator"
              }
            </div>
            <div class="bg-gray-800 p-2 rounded">
              <span class="font-semibold">Ready:</span> ${
                this.playerState.isReady ? "Yes" : "No"
              }
            </div>
          </div>
        </div>

        <div class="mb-4 text-center">
          <h3 class="text-lg font-bold mb-2">Players</h3>
          <div class="flex justify-between gap-4">
            <div class="bg-blue-900 p-2 rounded flex-1">
              <div class="font-semibold">${
                player1?.username || "Waiting..."
              }</div>
              <div>Score: ${p1Score}</div>
            </div>
            <div class="bg-pink-900 p-2 rounded flex-1">
              <div class="font-semibold">${
                player2?.username || "Waiting..."
              }</div>
              <div>Score: ${p2Score}</div>
            </div>
          </div>
        </div>

        ${
          status === "IN_PROGRESS" && isPlayer && !this.playerState.isReady
            ? /* html */ `
            <button
              id="readyButton"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Click to Start
            </button>
          `
            : ""
        }

        ${
          this.matchState.isStarted || status === "IN_PROGRESS"
            ? /* html */ `
            <div class="mt-4 w-full">
              <div class="canvas-container w-full flex justify-center">
                <canvas 
                  id="gameCanvas" 
                  width="800" 
                  height="600" 
                  style="max-width: 100%; background-color: black;"
                  class="border border-gray-700 rounded shadow-lg"
                ></canvas>
              </div>
              ${
                isPlayer
                  ? `<div class="text-center mt-4">
                    <p class="mb-2">Utilisez les flèches ↑ et ↓ pour déplacer votre raquette</p>
                    <div class="flex justify-center gap-4 mt-2">
                      <button id="upButton" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-xl shadow-lg transition-colors">↑</button>
                      <button id="downButton" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-xl shadow-lg transition-colors">↓</button>
                    </div>
                  </div>`
                  : `<div class="text-center mt-4">
                    <p class="text-gray-400">Vous êtes spectateur de ce match</p>
                  </div>`
              }
            </div>
          `
            : ""
        }

        ${
          this.matchState.isEnded && winner && loser
            ? /* html */ `
            <div class="mt-4 p-4 bg-green-800 rounded text-center">
              <p class="text-xl font-bold">Match terminé!</p>
              <p class="text-lg mt-2">${winner.username} a gagné avec un score de ${winner.score} - ${loser.score}</p>
            </div>
          `
            : ""
        }
      </div>
    `;

    const readyButton = this.querySelector("#readyButton");
    if (readyButton) {
      readyButton.addEventListener("click", () => this.handleReadyClick());
    }

    const debugButton = document.createElement("button");
    debugButton.textContent = "Debug: Test Game State";
    debugButton.className = "mt-2 px-4 py-2 bg-red-600 text-white rounded";
    debugButton.addEventListener("click", () => {
      const testState = {
        matchId: 43,
        state: {
          ball: { x: 460, y: 360, dx: 5, dy: 5 },
          paddles: {
            left: { y: 250, height: 100 },
            right: { y: 250, height: 100 },
          },
          canvas: { width: 800, height: 600 },
          scores: { left: 4, right: 4 },
          players: {
            player1Id: 9,
            player2Id: 6,
            player1Ready: true,
            player2Ready: true,
          },
        },
      };
      this.updateGameState(testState);
    });
    this.appendChild(debugButton);

    // Ajouter un bouton pour demander manuellement l'état du jeu
    const refreshButton = document.createElement("button");
    refreshButton.textContent = "Rafraîchir l'état du jeu";
    refreshButton.className = "mt-2 px-4 py-2 bg-blue-600 text-white rounded";
    refreshButton.addEventListener("click", () => {
      const { tournamentId, matchId } = this.props as GameProps;
      if (tournamentId && matchId) {
        console.log("Manually requesting game state");
        tournamentSocket.getGameState(tournamentId, matchId);
      }
    });
    this.appendChild(refreshButton);

    this.setupCanvas();
  }
}

customElements.define("tournament-game", TournamentGame);
