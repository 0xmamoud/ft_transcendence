import { PropsBaseComponent } from "@/core/components";

interface Participant {
  id: number;
  username: string;
  isCreator: boolean;
  isOnline: boolean;
}

interface ParticipantsProps {
  participants: Participant[];
  tournamentStatus: "pending" | "in_progress" | "completed";
  isCreator?: boolean;
  startTournament?: boolean;
}

export class TournamentParticipants extends PropsBaseComponent {
  private handleStartTournament = () => {
    // Déclencher un événement personnalisé
    this.dispatchEvent(new CustomEvent("startTournament"));
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
    // Conversion explicite pour éviter l'erreur de type
    const props = JSON.parse(
      JSON.stringify(this.props)
    ) as unknown as ParticipantsProps;
    const {
      participants = [],
      tournamentStatus,
      isCreator,
      startTournament,
    } = props;

    this.innerHTML = /* html */ `
      <div class="h-fit">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold mb-4">Participants</h2>
          <button class="lg:hidden text-primary" id="toggleParticipants">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Participants List -->
        <div class="hidden lg:block max-h-[300px] overflow-y-auto" id="participantsList">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-sm">Participants (${
              participants.length
            })</h3>
            ${
              isCreator && tournamentStatus === "pending" && startTournament
                ? /* html */ `
              <button id="startTournamentBtn" class="btn-primary btn-sm">Start Tournament</button>
            `
                : ""
            }
          </div>
          <div class="space-y-2">
            ${
              participants.length > 0
                ? participants
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
                    .join("")
                : `<div class="text-center text-gray-500 py-4">Aucun participant</div>`
            }
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("tournament-participants", TournamentParticipants);
