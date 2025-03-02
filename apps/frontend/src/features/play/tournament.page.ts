import { ParamsBaseComponent } from "@/core/components";
import "@/features/play/components/tournament-chat";
import "@/features/play/components/tournament-game";
import "@/features/play/components/tournament-matches";
import { tournamentService } from "./tournament.service";
import type { Tournament, Match, Participant } from "@/features/play/types";

class TournamentPage extends ParamsBaseComponent {
  private tournament: Tournament | null = null;
  private socket: WebSocket | null = null;
  private tournamentParticipants: Participant[] = [];
  private tournamentMatches: Match[] = [];

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadTournament();
    this.setupMobileToggles();
    this.setupWebSocket();
  }

  disconnectedCallback() {
    const toggleMatches = this.querySelector("#toggleMatches");
    const toggleChat = this.querySelector("#toggleChat");

    toggleMatches?.removeEventListener("click", () => {});
    toggleChat?.removeEventListener("click", () => {});
    this.closeWebSocket();
  }

  private setupWebSocket() {
    const tournamentId = Number(this.params.id);
    this.socket = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
        window.location.host
      }/api/ws`
    );

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      if (this.socket) {
        this.socket.send(
          JSON.stringify({
            event: "tournament:join",
            data: { tournamentId },
          })
        );
      }
    };

    this.socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      switch (message.event) {
        case "tournament:join":
          await this.loadParticipants();
          break;
        case "tournament:start":
          await this.loadMatches();
          break;
        case "tournament:update":
          await this.loadTournament();
          break;
        case "match:update":
          await this.loadMatches();
          break;
        default:
          console.log("Unknown event:", message.event);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
  }

  private closeWebSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private async loadTournament() {
    try {
      const tournamentId = Number(this.params.id);
      this.tournament = await tournamentService.getTournament(tournamentId);
      if (this.tournament) {
        this.tournamentParticipants = this.tournament.participants || [];
        this.tournamentMatches = this.tournament.matches || [];
      }
      this.render();
    } catch (error) {
      console.error("Failed to load tournament:", error);
    }
  }

  private async loadParticipants() {
    try {
      const tournamentId = Number(this.params.id);
      this.tournamentParticipants =
        await tournamentService.getTournamentParticipants(tournamentId);
      this.render();
    } catch (error) {
      console.error("Failed to load participants:", error);
    }
  }

  private async loadMatches() {
    try {
      const tournamentId = Number(this.params.id);
      this.tournamentMatches = await tournamentService.getTournamentMatches(
        tournamentId
      );
      this.render();
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  }

  private setupMobileToggles() {
    const toggleMatches = this.querySelector("#toggleMatches");
    const matchesList = this.querySelector("#matchesList");
    const toggleChat = this.querySelector("#toggleChat");
    const chatMessages = this.querySelector("#chatMessages");

    toggleMatches?.addEventListener("click", () => {
      matchesList?.classList.toggle("hidden");
    });

    toggleChat?.addEventListener("click", () => {
      chatMessages?.classList.toggle("hidden");
    });
  }

  private async handleStartTournament() {
    try {
      const tournamentId = Number(this.params.id);
      await tournamentService.startTournament(tournamentId);
      await this.loadTournament();
    } catch (error) {
      console.error("Failed to start tournament:", error);
    }
  }

  private handleSendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          event: "chat:message",
          data: {
            tournamentId: Number(this.params.id),
            message,
          },
        })
      );
    } else {
      console.error("WebSocket not connected");
    }
  }

  render() {
    const currentMatch = this.tournamentMatches.find(
      (match) => match.status === "IN_PROGRESS"
    );

    const mockMessages = [
      {
        id: "1",
        username: "Player1",
        message: "Good luck everyone!",
        timestamp: "12:34",
        isOnline: true,
      },
    ];

    this.innerHTML = /* html */ `
      <section class="min-h-screen padding-y">
        <div class="padding-x">
          <div class="max-w-[1920px] mx-auto">
            <div class="mb-8">
              <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 class="text-2xl sm:text-3xl font-bold">${
                  this.tournament?.name || "Loading..."
                }</h1>
              </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              <!-- Left Side - Match Schedule -->
              <div class="lg:col-span-2 bg-background border border-secondary rounded-lg p-4 order-2 lg:order-1">
                <tournament-matches
                  props='${JSON.stringify({
                    matches: this.tournamentMatches.map((match) => ({
                      id: match.id,
                      player1: {
                        username: match.player1?.username,
                        score: match.player1Score,
                      },
                      player2: {
                        username: match.player2?.username,
                        score: match.player2Score,
                      },
                      status: match.status.toLowerCase(),
                    })),
                    participants: this.tournamentParticipants.map(
                      (participant) => ({
                        id: participant.userId,
                        username: participant.username,
                        isCreator:
                          participant.userId === this.tournament?.creatorId,
                        isOnline: true, // TODO: Implémenter le statut en ligne
                      })
                    ),
                    tournamentStatus: this.tournament?.status?.toLowerCase(),
                    isCreator: this.tournament?.creatorId === 1, // TODO: Remplacer par l'ID de l'utilisateur actuel
                    onStartTournament: () => this.handleStartTournament(),
                  })}'
                ></tournament-matches>
              </div>

              <!-- Center - Game Area -->
              <div class="lg:col-span-7 flex flex-col gap-4 order-1 lg:order-2">
                <tournament-game
                  props='${JSON.stringify({
                    status: currentMatch ? "playing" : "waiting",
                    player1: currentMatch
                      ? {
                          username: currentMatch.player1?.username,
                          score: currentMatch.player1Score || 0,
                        }
                      : undefined,
                    player2: currentMatch
                      ? {
                          username: currentMatch.player2?.username,
                          score: currentMatch.player2Score || 0,
                        }
                      : undefined,
                  })}'
                ></tournament-game>
              </div>

              <!-- Right Side - Chat -->
              <div class="lg:col-span-3 bg-background border border-secondary rounded-lg p-4 order-3">
                <tournament-chat
                  props='${JSON.stringify({
                    messages: mockMessages,
                    onSendMessage: (message: string) =>
                      this.handleSendMessage(message),
                  })}'
                ></tournament-chat>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

export default TournamentPage;
