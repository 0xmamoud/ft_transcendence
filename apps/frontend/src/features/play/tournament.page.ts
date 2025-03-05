import { ParamsBaseComponent } from "@/core/components";
import "@/features/play/components/tournament.chat";
import "@/features/play/components/tournament.game";
import "@/features/play/components/tournament.matches";
import "@/features/play/components/tournament.participants";
import { tournamentService } from "@/features/play/tournament.service";
import { tournamentSocket } from "@/features/play/tournament.socket.service";
import type { Tournament, Match, Participant } from "@/features/play/types";
import { userService } from "@/features/shared/user.service";
import { router } from "@/main";

class TournamentPage extends ParamsBaseComponent {
  private tournament: Tournament | null = null;
  private tournamentParticipants: Participant[] = [];
  private tournamentMatches: Match[] = [];
  private currentUser: number | null = null;
  private currentUsername: string = "";
  private defaultUsername: string = "SINJ";
  private messages: Array<{
    id: string;
    username: string;
    message: string;
    timestamp: string;
    isOnline: boolean;
  }> = [];

  async connectedCallback() {
    this.innerHTML = `<div class="loading">Chargement...</div>`;
    super.connectedCallback();

    try {
      await this.loadUserProfile();
      await this.loadTournament();
      await this.setupWebSocket();
      this.render();
      this.setupMobileToggles();

      this.addEventListener("click", this.handleClick);
    } catch (error) {
      console.error("Failed to initialize tournament page:", error);
      router.navigateTo("/login");
    }
  }

  disconnectedCallback() {
    const toggleMatches = this.querySelector("#toggleMatches");
    const toggleChat = this.querySelector("#toggleChat");
    const toggleParticipants = this.querySelector("#toggleParticipants");

    toggleMatches?.removeEventListener("click", () => {});
    toggleChat?.removeEventListener("click", () => {});
    toggleParticipants?.removeEventListener("click", () => {});

    this.removeEventListener("click", this.handleClick);

    this.cleanupWebSocket();
  }

  private handleClick = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.id === "startTournamentBtn") {
      this.handleStartTournament();
    }
  };

  private async loadUserProfile() {
    const userProfile = await userService.getUserProfile();
    this.currentUser = userProfile.id;
    this.defaultUsername = userProfile.username;
  }

  private async loadTournament() {
    try {
      const tournamentId = Number(this.params.id);
      this.tournament = await tournamentService.getTournament(tournamentId);
      if (this.tournament) {
        this.tournamentParticipants = this.tournament.participants || [];
        this.tournamentMatches = this.tournament.matches || [];
        this.currentUsername =
          this.tournament.participants.find(
            (p) => p.userId === this.currentUser
          )?.username || this.defaultUsername;
      }
    } catch (error) {
      console.error("Failed to load tournament:", error);
    }
  }

  private async loadParticipants() {
    try {
      const tournamentId = Number(this.params.id);
      this.tournamentParticipants =
        await tournamentService.getTournamentParticipants(tournamentId);

      this.currentUsername =
        this.tournamentParticipants.find((p) => p.userId === this.currentUser)
          ?.username || this.defaultUsername;

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

  private async setupWebSocket() {
    try {
      await tournamentSocket.initialize();

      const tournamentId = Number(this.params.id);
      tournamentSocket.joinTournament(tournamentId);

      this.setupSocketEventListeners();
    } catch (error) {
      console.error("Failed to setup WebSocket:", error);
    }
  }

  private setupSocketEventListeners() {
    tournamentSocket.on("tournament:join", (data) => {
      this.addChatMessage({
        id: Date.now().toString(),
        username: "System",
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        isOnline: true,
      });
      this.loadParticipants();
    });

    tournamentSocket.on("tournament:leave", (data) => {
      this.addChatMessage({
        id: Date.now().toString(),
        username: "System",
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        isOnline: true,
      });
      this.loadParticipants();
    });

    tournamentSocket.on("tournament:start", (data) => {
      console.log("tournament:start", data);
      this.addChatMessage({
        id: Date.now().toString(),
        username: "System",
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        isOnline: true,
      });
      this.loadMatches();
      this.loadTournament();
    });

    tournamentSocket.on("tournament:finish", (data) => {
      this.addChatMessage({
        id: Date.now().toString(),
        username: "System",
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        isOnline: true,
      });
      this.loadTournament();
    });

    tournamentSocket.on("tournament:chat", (data) => {
      const participant = this.tournamentParticipants.find(
        (p) => p.userId === data.userId
      );

      this.addChatMessage({
        id: Date.now().toString(),
        username: participant?.username || `User ${data.userId}`,
        message: data.message,
        timestamp: new Date(data.timestamp).toLocaleTimeString(),
        isOnline: true,
      });
    });
  }

  private cleanupWebSocket() {
    if (tournamentSocket.isConnected()) {
      const tournamentId = Number(this.params.id);
      tournamentSocket.leaveTournament(tournamentId);
      tournamentSocket.disconnect();
    }
  }

  private addChatMessage(message: {
    id: string;
    username: string;
    message: string;
    timestamp: string;
    isOnline: boolean;
  }) {
    this.messages.push(message);
    this.render();
  }

  private async handleStartTournament() {
    try {
      const tournamentId = Number(this.params.id);
      await tournamentService.startTournament(tournamentId);

      if (this.tournament) {
        this.tournament.status = "IN_PROGRESS";
      }

      tournamentSocket.startTournament(tournamentId);

      this.render();
    } catch (error) {
      console.error("Failed to start tournament:", error);
    }
  }

  private setupMobileToggles() {
    const toggleMatches = this.querySelector("#toggleMatches");
    const matchesList = this.querySelector("#matchesList");
    const toggleChat = this.querySelector("#toggleChat");
    const chatMessages = this.querySelector("#chatMessages");
    const toggleParticipants = this.querySelector("#toggleParticipants");
    const participantsList = this.querySelector("#participantsList");

    toggleMatches?.addEventListener("click", () => {
      matchesList?.classList.toggle("hidden");
    });

    toggleChat?.addEventListener("click", () => {
      chatMessages?.classList.toggle("hidden");
    });

    toggleParticipants?.addEventListener("click", () => {
      participantsList?.classList.toggle("hidden");
    });
  }

  render() {
    const currentMatch = this.tournamentMatches.find(
      (match) => match.status === "IN_PROGRESS"
    );

    this.innerHTML = /* html */ `
      <section class="min-h-screen padding-y">
        <div class="padding-x">
          <div class="max-w-[1920px] mx-auto">
            <div class="mb-8">
              <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h1 class="text-2xl sm:text-3xl font-bold mb-2">
                    ${this.tournament?.name || "Loading..."}
                  </h1>
                  <div class="flex items-center gap-2 text-gray-500">
                    <span class="text-sm">Tournament ID:</span>
                    <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-mono text-lg">${
                      this.params.id
                    }</span>
                    <span class="text-sm">(Share this ID to invite players)</span>
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row items-end gap-2">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-500">Status:</span>
                      <span class="px-3 py-1 rounded-full text-sm font-medium ${
                        this.tournament?.status?.toLowerCase() === "pending"
                          ? "bg-blue-100 text-blue-800"
                          : this.tournament?.status?.toLowerCase() ===
                            "in_progress"
                          ? "bg-green-100 text-green-800"
                          : this.tournament?.status?.toLowerCase() ===
                            "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-gray-100 text-gray-800"
                      }">
                        ${this.tournament?.status?.toLowerCase() || "unknown"}
                      </span>
                    </div>
                    ${
                      this.tournament?.creatorId === this.currentUser &&
                      this.tournament?.status?.toLowerCase() === "pending"
                        ? /* html */ `
                    <button
                      class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm cursor-pointer"
                      id="startTournamentBtn"
                    >
                      Start Tournament
                          </button>`
                        : ""
                    }
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              <div class="lg:col-span-2 flex flex-col gap-4 order-2 lg:order-1">
                <div class="bg-background border border-secondary rounded-lg p-4 h-fit">
                  <tournament-participants
                    props='${JSON.stringify({
                      participants: this.tournamentParticipants.map(
                        (participant) => ({
                          id: participant.userId,
                          username: participant.username,
                          isCreator:
                            participant.userId === this.tournament?.creatorId,
                          isOnline: true,
                        })
                      ),
                      isCreator:
                        this.tournament?.creatorId === this.currentUser,
                    }).replace(/'/g, "&apos;")}'
                  ></tournament-participants>
                </div>
                
                <div class="bg-background border border-secondary rounded-lg p-4 flex-grow">
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
                      tournamentStatus: this.tournament?.status?.toLowerCase(),
                    }).replace(/'/g, "&apos;")}'
                  ></tournament-matches>
                </div>
              </div>

              <div class="lg:col-span-7 flex flex-col gap-4 order-1 lg:order-2">
                <tournament-game
                  props='${JSON.stringify({
                    status: currentMatch?.status || "PENDING",
                    player1: currentMatch?.player1
                      ? {
                          id: currentMatch.player1.id,
                          username: currentMatch.player1.username,
                          score: currentMatch.player1Score || 0,
                        }
                      : undefined,
                    player2: currentMatch?.player2
                      ? {
                          id: currentMatch.player2.id,
                          username: currentMatch.player2.username,
                          score: currentMatch.player2Score || 0,
                        }
                      : undefined,
                    currentUserId: this.currentUser,
                    matchId: currentMatch?.id,
                    tournamentId: Number(this.params.id),
                  }).replace(/'/g, "&apos;")}'
                ></tournament-game>
              </div>
              
              <div class="lg:col-span-3 bg-background border border-secondary rounded-lg p-4 order-4 lg:order-3">
                <tournament-chat
                  props='${JSON.stringify({
                    messages: this.messages,
                    currentUsername: this.currentUsername,
                    tournamentId: Number(this.params.id),
                  }).replace(/'/g, "&apos;")}'
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
