import { PropsBaseComponent } from "@/core/components";

interface Player {
  username: string;
  score: number;
}

interface GameProps {
  player1?: Player;
  player2?: Player;
  status: "waiting" | "playing" | "finished";
}

export class TournamentGame extends PropsBaseComponent {
  render() {
    const { player1, player2, status } = this.props as GameProps;

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
        <div class="flex-grow bg-background border border-secondary rounded-lg p-4 h-[50vh] sm:h-[60vh] lg:h-[600px] flex items-center justify-center">
          ${
            status === "waiting"
              ? /* html */ `
            <div class="text-center text-gray-500">
              <p class="text-xl">Game will appear here</p>
              <p class="text-sm">Waiting for match to start...</p>
            </div>
          `
              : status === "playing"
              ? /* html */ `
            <canvas id="gameCanvas" class="w-full h-full"></canvas>
          `
              : /* html */ `
            <div class="text-center text-gray-500">
              <p class="text-xl">Match finished!</p>
              <p class="text-sm">Waiting for next match...</p>
            </div>
          `
          }
        </div>
      </div>
    `;

    // Si le jeu est en cours, initialiser le canvas
    if (status === "playing") {
      this.initializeGame();
    }
  }

  private initializeGame() {
    const canvas = this.querySelector("#gameCanvas") as HTMLCanvasElement;
    if (!canvas) return;

    // TODO: Initialiser le jeu ici
    // Cette méthode sera implémentée plus tard avec la logique du jeu
  }
}

customElements.define("tournament-game", TournamentGame);
