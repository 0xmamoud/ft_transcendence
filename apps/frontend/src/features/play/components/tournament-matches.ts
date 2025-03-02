import { PropsBaseComponent } from "@/core/components";

interface Participant {
  id: number;
  username: string;
  isCreator: boolean;
  isOnline: boolean;
}

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
  participants: Participant[];
  tournamentStatus: "pending" | "in_progress" | "completed";
  isCreator?: boolean;
  onStartTournament?: () => void;
}

export class TournamentMatches extends PropsBaseComponent {
  private handleStartTournament = () => {
    if (this.props.onStartTournament) {
      this.props.onStartTournament();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    const startButton = this.querySelector("#startTournamentBtn");
    startButton?.addEventListener("click", this.handleStartTournament);
  }

  disconnectedCallback() {
    const startButton = this.querySelector("#startTournamentBtn");
    startButton?.removeEventListener("click", this.handleStartTournament);
  }

  render() {
    const {
      matches = [],
      participants = [],
      tournamentStatus,
      isCreator,
    } = this.props as MatchesProps;

    this.innerHTML = /* html */ `
      <div class="lg:h-[calc(100vh-10rem)]">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold mb-4">Matches</h2>
          <button class="lg:hidden text-primary" id="toggleMatches">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Match List -->
        <div class="hidden lg:block lg:flex-grow lg:overflow-y-auto space-y-3" id="matchesList">
          ${matches
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
            .join("")}

          <!-- Tournament Info -->
          <div class="mt-4 pt-4 border-t border-secondary">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-sm">Participants</h3>
              ${
                isCreator && tournamentStatus === "pending"
                  ? /* html */ `
                <button id="startTournamentBtn" class="btn-primary btn-sm">Start Tournament</button>
              `
                  : ""
              }
            </div>
            <div class="space-y-2">
              ${participants
                .map(
                  (participant) => /* html */ `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full ${
                      participant.isOnline ? "bg-green-500" : "bg-gray-500"
                    }"></div>
                    <span class="text-sm">${participant.username}${
                    participant.isCreator ? " (Creator)" : ""
                  }</span>
                  </div>
                  <button class="text-gray-500 hover:text-primary transition-colors text-sm" title="Add to friend">
                    Add to friend
                  </button>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("tournament-matches", TournamentMatches);
