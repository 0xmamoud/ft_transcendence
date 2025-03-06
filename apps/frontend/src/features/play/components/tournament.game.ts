import { PropsBaseComponent } from "@/core/components";
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
  private isPlayer1: boolean = false;
  private isPlayer2: boolean = false;
  private isReady: boolean = false;
  private gameStarted: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    this.checkPlayerStatus();
    this.setupSocketListeners();
    this.render();
  }

  disconnectedCallback() {
    // Nettoyage des écouteurs d'événements
  }

  private checkPlayerStatus() {
    const { currentUserId, player1, player2 } = this.props as GameProps;

    console.log("Checking player status:", {
      currentUserId,
      player1Id: player1?.id,
      player2Id: player2?.id,
    });

    if (!currentUserId) return;

    // Conversion explicite en nombre pour la comparaison
    const currentUserIdNum = Number(currentUserId);
    const player1IdNum = player1 ? Number(player1.id) : undefined;
    const player2IdNum = player2 ? Number(player2.id) : undefined;

    this.isPlayer1 = player1IdNum === currentUserIdNum;
    this.isPlayer2 = player2IdNum === currentUserIdNum;

    console.log("Player status result:", {
      isPlayer1: this.isPlayer1,
      isPlayer2: this.isPlayer2,
      isPlayer: this.isPlayer1 || this.isPlayer2,
    });
  }

  private setupSocketListeners() {
    console.log("Setting up basic socket listeners");

    // Écouter l'événement de démarrage du match
    tournamentSocket.onMatchStart(() => {
      console.log("Match start event received");
      this.gameStarted = true;
      this.render();
    });

    // Écouter les mises à jour de score
    tournamentSocket.onScore((data) => {
      console.log("Score update received:", data);
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

    this.isReady = true;
    tournamentSocket.sendPlayerReady(tournamentId, matchId);
    console.log("Player ready sent to server");
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

    // Affichage simplifié
    this.innerHTML = /* html */ `
      <div class="flex flex-col items-center justify-center bg-gray-900 text-white p-4 rounded-lg">
        <div class="mb-4 text-center">
          <h2 class="text-xl font-bold mb-2">Match Status</h2>
          <div class="flex flex-col gap-2">
            <div class="bg-gray-800 p-2 rounded">
              <span class="font-semibold">Status:</span> ${status}
            </div>
            <div class="bg-gray-800 p-2 rounded">
              <span class="font-semibold">Player Role:</span> ${
                isPlayer
                  ? this.isPlayer1
                    ? "Player 1"
                    : "Player 2"
                  : "Spectator"
              }
            </div>
            <div class="bg-gray-800 p-2 rounded">
              <span class="font-semibold">Ready:</span> ${
                this.isReady ? "Yes" : "No"
              }
            </div>
            <div class="bg-gray-800 p-2 rounded">
              <span class="font-semibold">Game Started:</span> ${
                this.gameStarted ? "Yes" : "No"
              }
            </div>
          </div>
        </div>

        <div class="mb-4 text-center">
          <h3 class="text-lg font-bold mb-2">Players</h3>
          <div class="flex justify-between gap-4">
            <div class="bg-gray-800 p-2 rounded flex-1">
              <div class="font-semibold">${
                player1?.username || "Waiting..."
              }</div>
              <div>Score: ${player1?.score || 0}</div>
            </div>
            <div class="bg-gray-800 p-2 rounded flex-1">
              <div class="font-semibold">${
                player2?.username || "Waiting..."
              }</div>
              <div>Score: ${player2?.score || 0}</div>
            </div>
          </div>
        </div>

        ${
          status === "IN_PROGRESS" && isPlayer && !this.isReady
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
          this.gameStarted
            ? /* html */ `
            <div class="mt-4 p-4 bg-gray-800 rounded text-center">
              <p class="text-lg">Game in progress</p>
              <p class="text-sm mt-2">The full game implementation will be added step by step</p>
            </div>
          `
            : ""
        }
      </div>
    `;

    // Ajouter l'écouteur d'événement pour le bouton Ready
    const readyButton = this.querySelector("#readyButton");
    if (readyButton) {
      readyButton.addEventListener("click", () => this.handleReadyClick());
    }
  }
}

customElements.define("tournament-game", TournamentGame);
