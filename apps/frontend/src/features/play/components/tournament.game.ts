import { PropsBaseComponent } from "@/core/components";
import { GameService, GameState } from "@/features/play/game.service";
import { tournamentSocket } from "@/features/play/tournament.socket.service";

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
  private gameService: GameService | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private readonly FPS = 60;
  private readonly frameDelay = 1000 / this.FPS;
  private isPlayer1: boolean = false;
  private isPlayer2: boolean = false;
  private isReady: boolean = false;
  private matchResult: { winner?: Player; loser?: Player } | null = null;
  private gameStarted: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    this.setupSocketListeners();
    this.checkPlayerStatus();
  }

  disconnectedCallback() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private checkPlayerStatus() {
    const { currentUserId, player1, player2 } = this.props as GameProps;
    if (!currentUserId) return;

    this.isPlayer1 = player1?.id === currentUserId;
    this.isPlayer2 = player2?.id === currentUserId;
  }

  private setupSocketListeners() {
    if (!this.socketService) {
      console.log("No socket service available");
      return;
    }

    console.log("Setting up socket listeners for game component");

    this.socketService.onGameUpdate((state: GameState) => {
      console.log("Game update received with state:", {
        player1Ready: state.players.player1Ready,
        player2Ready: state.players.player2Ready,
        currentGameStarted: this.gameStarted,
      });

      // Mettre à jour l'état du jeu
      if (this.gameService) {
        this.gameService.updateFromServer(state);
      }

      // Vérifier si les deux joueurs sont prêts
      if (
        state.players.player1Ready &&
        state.players.player2Ready &&
        !this.gameStarted
      ) {
        console.log("Both players ready from game update");
        this.gameStarted = true;
        if (!this.gameService) {
          this.initializeGame();
        }
      }

      this.render();
    });

    this.socketService.onScore((data) => {
      console.log("Score update received:", data);
      const { player1, player2 } = this.props as GameProps;
      if (player1) player1.score = data.player1Score;
      if (player2) player2.score = data.player2Score;
      this.render();
    });

    this.socketService.onMatchStart(() => {
      console.log("Match start event received in game component");
      console.log("Current state before update:", {
        gameStarted: this.gameStarted,
        isReady: this.isReady,
        gameService: !!this.gameService,
      });

      this.matchResult = null;
      this.gameStarted = true;
      this.isReady = true;

      if (!this.gameService) {
        this.initializeGame();
      }

      console.log("State after match start:", {
        gameStarted: this.gameStarted,
        isReady: this.isReady,
        gameService: !!this.gameService,
      });

      this.render();
    });

    this.socketService.onMatchEnd((data: { winnerId: number }) => {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      const { player1, player2 } = this.props as GameProps;
      if (player1 && player2) {
        if (data.winnerId === player1.id) {
          this.matchResult = { winner: player1, loser: player2 };
        } else {
          this.matchResult = { winner: player2, loser: player1 };
        }
      }

      // Réinitialiser l'état du jeu
      this.gameService = null;
      this.canvas = null;
      this.context = null;
      this.isReady = false;
      this.gameStarted = false;

      this.render();
    });
  }

  private initializeGame() {
    console.log("Initializing game");
    if (this.gameService) {
      console.log("Game already initialized");
      return;
    }

    if (!this.canvas) {
      this.canvas = this.querySelector("#gameCanvas");
      if (!this.canvas) {
        console.error("Canvas not found");
        return;
      }
    }

    // Définir des dimensions fixes pour le canvas
    this.canvas.width = 800;
    this.canvas.height = 600;
    console.log("Canvas dimensions:", this.canvas.width, this.canvas.height);

    if (!this.context) {
      this.context = this.canvas.getContext("2d");
      if (!this.context) {
        console.error("Could not get canvas context");
        return;
      }
    }

    console.log("Creating new game service");
    this.gameService = new GameService(this.canvas.width, this.canvas.height);
    this.setupEventListeners();
    this.startGameLoop();
  }

  private startGameLoop() {
    const gameLoop = (timestamp: number) => {
      if (timestamp - this.lastFrameTime >= this.frameDelay) {
        this.update();
        this.draw();
        this.lastFrameTime = timestamp;
      }
      this.animationFrameId = requestAnimationFrame(gameLoop);
    };

    this.animationFrameId = requestAnimationFrame(gameLoop);
  }

  private update() {
    if (!this.gameService) return;
    this.gameService.updateBall();
  }

  private draw() {
    if (!this.context || !this.gameService || !this.canvas) return;

    // Effacer le canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const state = this.gameService.getState();
    console.log("Drawing game state:", state);

    this.drawPaddles(state);
    this.drawBall(state);
    this.drawNet();
  }

  private drawPaddles(state: GameState) {
    if (!this.context) return;

    this.context.fillStyle = "white";

    this.context.fillRect(
      0,
      state.paddles.left.y,
      10,
      state.paddles.left.height
    );

    this.context.fillRect(
      this.canvas!.width - 10,
      state.paddles.right.y,
      10,
      state.paddles.right.height
    );
  }

  private drawBall(state: GameState) {
    if (!this.context) return;

    this.context.fillStyle = "white";
    this.context.beginPath();
    this.context.arc(state.ball.x, state.ball.y, 5, 0, Math.PI * 2);
    this.context.fill();
  }

  private drawNet() {
    if (!this.context || !this.canvas) return;

    this.context.setLineDash([5, 5]);
    this.context.beginPath();
    this.context.moveTo(this.canvas.width / 2, 0);
    this.context.lineTo(this.canvas.width / 2, this.canvas.height);
    this.context.strokeStyle = "white";
    this.context.stroke();
    this.context.setLineDash([]);
  }

  private setupEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.gameService) return;

    const { tournamentId, matchId } = this.props as GameProps;
    if (!this.socketService || !tournamentId || !matchId) return;

    if (this.isPlayer1) {
      switch (event.key) {
        case "w":
        case "W":
          this.gameService.movePaddle("left", "up");
          this.socketService.sendPaddleMove(
            tournamentId,
            matchId,
            this.gameService.getState().paddles.left.y
          );
          break;
        case "s":
        case "S":
          this.gameService.movePaddle("left", "down");
          this.socketService.sendPaddleMove(
            tournamentId,
            matchId,
            this.gameService.getState().paddles.left.y
          );
          break;
      }
    } else if (this.isPlayer2) {
      switch (event.key) {
        case "ArrowUp":
          this.gameService.movePaddle("right", "up");
          this.socketService.sendPaddleMove(
            tournamentId,
            matchId,
            this.gameService.getState().paddles.right.y
          );
          break;
        case "ArrowDown":
          this.gameService.movePaddle("right", "down");
          this.socketService.sendPaddleMove(
            tournamentId,
            matchId,
            this.gameService.getState().paddles.right.y
          );
          break;
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    // Gérer le relâchement des touches si nécessaire
  }

  private handleReadyClick() {
    console.log("Ready button clicked");
    const { tournamentId, matchId } = this.props as GameProps;
    if (!this.socketService || !tournamentId || !matchId) return;

    this.isReady = true;
    this.socketService.sendPlayerReady(tournamentId, matchId);
    console.log("Player ready sent, updating UI");
    this.render();
  }

  render() {
    const { player1, player2, status } = this.props as GameProps;
    const isPlayer = this.isPlayer1 || this.isPlayer2;

    console.log("Rendering game component:", {
      isReady: this.isReady,
      gameStarted: this.gameStarted,
      status,
      isPlayer,
    });

    this.innerHTML = /* html */ `
      <div class="flex flex-col gap-4 h-full">
        <!-- Current Match Info -->
        ${
          player1 && player2
            ? /* html */ `
          <div class="bg-background border border-secondary rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div class="text-center">
                <div class="font-bold text-base sm:text-xl">${player1.username}</div>
                <div class="text-2xl sm:text-3xl font-bold text-primary">${player1.score}</div>
              </div>
              <div class="text-xl sm:text-2xl font-bold text-gray-500">VS</div>
              <div class="text-center">
                <div class="font-bold text-base sm:text-xl">${player2.username}</div>
                <div class="text-2xl sm:text-3xl font-bold text-primary">${player2.score}</div>
              </div>
            </div>
          </div>
        `
            : ""
        }

        <!-- Game Canvas -->
        <div class="flex-grow bg-background border border-secondary rounded-lg p-4 h-[50vh] sm:h-[60vh] lg:h-[600px] relative">
          ${
            status === "PENDING"
              ? /* html */ `
            <div class="text-center text-gray-500">
              <p class="text-xl">Waiting for previous matches...</p>
              <p class="text-sm">Your match will start soon</p>
            </div>
          `
              : status === "IN_PROGRESS"
              ? /* html */ `
            <div class="w-full h-full flex items-center justify-center">
              ${
                isPlayer
                  ? !this.isReady
                    ? /* html */ `
                      <div class="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                        <div class="text-center space-y-4">
                          <p class="text-white text-xl mb-4">Are you ready?</p>
                          <button
                            id="readyButton"
                            class="px-8 py-4 bg-primary text-white text-lg font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                          >
                            Click to Start
                          </button>
                        </div>
                      </div>
                    `
                    : !this.gameStarted
                    ? /* html */ `
                      <div class="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                        <div class="text-center text-white">
                          <p class="text-xl">Waiting for other player...</p>
                          <p class="text-sm">Game will start when both players are ready</p>
                        </div>
                      </div>
                    `
                    : ""
                  : /* html */ `
                    <div class="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                      <div class="text-center text-white">
                        <p class="text-xl">Spectating mode</p>
                        <p class="text-sm">Watch the game in progress</p>
                      </div>
                    </div>
                  `
              }
              <canvas id="gameCanvas" class="w-full h-full bg-black"></canvas>
            </div>
          `
              : /* html */ `
            <div class="text-center text-gray-500">
              ${
                this.matchResult
                  ? /* html */ `
                    <div class="space-y-4">
                      <p class="text-3xl font-bold text-primary">${this.matchResult.winner?.username} Wins!</p>
                      <p class="text-xl">Final Score</p>
                      <div class="flex justify-center items-center gap-8">
                        <div class="text-center">
                          <p class="font-bold">${this.matchResult.winner?.username}</p>
                          <p class="text-2xl font-bold text-primary">${this.matchResult.winner?.score}</p>
                        </div>
                        <div class="text-xl font-bold text-gray-500">-</div>
                        <div class="text-center">
                          <p class="font-bold">${this.matchResult.loser?.username}</p>
                          <p class="text-2xl font-bold text-primary">${this.matchResult.loser?.score}</p>
                        </div>
                      </div>
                    </div>
                  `
                  : /* html */ `
                    <p class="text-xl">Match finished!</p>
                    <p class="text-sm">Waiting for next match...</p>
                  `
              }
            </div>
          `
          }
        </div>

        ${
          status === "IN_PROGRESS" && isPlayer && this.gameStarted
            ? /* html */ `
          <div class="bg-background border border-secondary rounded-lg p-4">
            <div class="text-center text-sm">
              ${
                this.isPlayer1
                  ? "Use W/S keys to move"
                  : "Use UP/DOWN arrow keys to move"
              }
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;

    if (status === "IN_PROGRESS") {
      const readyButton = this.querySelector("#readyButton");
      if (readyButton) {
        readyButton.addEventListener("click", () => this.handleReadyClick());
      }
    }
  }
}

customElements.define("tournament-game", TournamentGame);
