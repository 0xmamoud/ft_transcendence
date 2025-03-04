import { PropsBaseComponent } from "@/core/components";

interface Match {
  id: number;
  player1: {
    username: string;
    score?: number;
  };
  player2: {
    username: string;
    score?: number;
  };
  status: "pending" | "in_progress" | "completed";
}

interface MatchesProps {
  matches: Match[];
  tournamentStatus: "pending" | "in_progress" | "completed";
}

export class TournamentMatches extends PropsBaseComponent {
  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    // Nettoyage si nécessaire
  }

  render() {
    // Conversion explicite pour éviter l'erreur de type
    const props = JSON.parse(
      JSON.stringify(this.props)
    ) as unknown as MatchesProps;
    const { matches = [], tournamentStatus } = props;

    this.innerHTML = /* html */ `
      <div class="h-full flex flex-col">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold mb-4">Matches</h2>
          <button class="lg:hidden text-primary" id="toggleMatches">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Match List -->
        <div class="hidden lg:block flex-grow overflow-y-auto space-y-3" id="matchesList">
          ${
            matches.length > 0
              ? matches
                  .map(
                    (match) => /* html */ `
              <div class="match-item border border-secondary rounded-lg p-2">
                <div class="text-xs text-gray-500 mb-1">Match #${match.id}</div>
                <div class="flex flex-col gap-1">
                  <div class="flex justify-between items-center">
                    <span class="text-sm">${match.player1.username}</span>
                    ${
                      match.player1.score !== undefined
                        ? /* html */ `
                      <span class="text-xs bg-primary/10 text-primary px-1 rounded">${match.player1.score}</span>
                    `
                        : ""
                    }
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm">${match.player2.username}</span>
                    ${
                      match.player2.score !== undefined
                        ? /* html */ `
                      <span class="text-xs bg-primary/10 text-primary px-1 rounded">${match.player2.score}</span>
                    `
                        : ""
                    }
                  </div>
                </div>
                <div class="text-xs text-gray-500 mt-1 capitalize">${match.status.replace(
                  "_",
                  " "
                )}</div>
              </div>
            `
                  )
                  .join("")
              : `<div class="text-center text-gray-500 py-4">Aucun match disponible</div>`
          }
        </div>
      </div>
    `;
  }
}

customElements.define("tournament-matches", TournamentMatches);
