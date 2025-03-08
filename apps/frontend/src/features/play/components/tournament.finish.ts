import { PropsBaseComponent } from "@/core/components";

interface TournamentFinishProps {
  winner: {
    id: number;
    username: string;
    avatar: string;
    totalWins: number;
  };
  matches: Array<{
    id: number;
    player1: { id: number; username: string };
    player2: { id: number; username: string };
    player1Score: number;
    player2Score: number;
    status: string;
    winnerId: number;
  }>;
}

export class TournamentFinish extends PropsBaseComponent {
  connectedCallback() {
    super.connectedCallback();
    this.render();
  }

  render() {
    const { winner, matches } = this.props as TournamentFinishProps;

    this.innerHTML = /* html */ `
      <div class="flex flex-col items-center justify-center gap-8 p-8 bg-background/50 backdrop-blur rounded-lg border border-secondary">
        <div class="text-center">
          <h2 class="text-4xl font-bold mb-6">🏆 Tournament Winner 🏆</h2>
          <div class="flex flex-col items-center gap-4">
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-primary bg-background">
              <img 
                src="${winner.avatar || "/avatar.jpg"}" 
                alt="${winner.username}" 
                class="w-full h-full object-cover"
                onerror="this.src='/avatar.jpg'"
              >
            </div>
            <div class="text-center">
              <h3 class="text-3xl font-bold text-primary">${
                winner.username
              }</h3>
              <p class="text-xl text-gray-400">${winner.totalWins} ${
      winner.totalWins > 1 ? "Victories" : "Victory"
    }</p>
            </div>
          </div>
        </div>

        <div class="w-full max-w-2xl">
          <h3 class="text-2xl font-bold mb-4">Match History</h3>
          <div class="bg-background rounded-lg overflow-hidden border border-secondary">
            ${matches
              .filter((match) => match.status === "COMPLETED")
              .map(
                (match) => /* html */ `
              <div class="grid grid-cols-[1fr,auto,1fr] gap-4 p-4 border-b border-secondary/50 last:border-0 hover:bg-secondary/5 text-center">
                <div class="${
                  match.winnerId === match.player1.id
                    ? "text-primary font-bold"
                    : ""
                }">${match.player1.username}</div>
                <div class="font-mono px-4">${match.player1Score} - ${
                  match.player2Score
                }</div>
                <div class="${
                  match.winnerId === match.player2.id
                    ? "text-primary font-bold"
                    : ""
                }">${match.player2.username}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <a href="/play" class="btn-primary px-6 py-3 text-lg" data-link>
          Return to Tournaments
        </a>
      </div>
    `;
  }
}

customElements.define("tournament-finish", TournamentFinish);
