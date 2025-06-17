import { BaseComponent } from "@/core/components";
import { tournamentService } from "./tournamentService";
import "@/features/shared/components/errorContainer";

class PlayPage extends BaseComponent {
  private createGameError: HTMLElement | null = null;
  private joinGameError: HTMLElement | null = null;
  private createTournamentError: HTMLElement | null = null;
  private joinTournamentError: HTMLElement | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
    this.setupErrorContainers();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  private setupErrorContainers() {
    this.createGameError = this.querySelector("#createGameError");
    this.joinGameError = this.querySelector("#joinGameError");
    this.createTournamentError = this.querySelector("#createTournamentError");
    this.joinTournamentError = this.querySelector("#joinTournamentError");
  }

  private setError(container: HTMLElement | null, message: string) {
    if (container) {
      container.setAttribute("props", JSON.stringify({ message }));
    }
  }

  private setupEventListeners() {
    this.setupAccordionListeners();
    this.setupOnlineGameListeners();
    this.setupTournamentListeners();
  }

  private setupAccordionListeners() {
    const accordionButtons = this.querySelectorAll("[data-accordion-target]");
    accordionButtons.forEach((button) => {
      button.addEventListener("click", this.handleAccordionClick.bind(this));
    });
  }

  private setupOnlineGameListeners() {
    const createGameForm =
      this.querySelector<HTMLFormElement>("#createGameForm");
    const joinGameForm = this.querySelector<HTMLFormElement>("#joinGameForm");

    createGameForm?.addEventListener(
      "submit",
      this.handleCreateTournament.bind(this)
    );
    joinGameForm?.addEventListener("submit", this.handleJoinGame.bind(this));
  }

  private setupTournamentListeners() {
    const createTournamentForm = this.querySelector<HTMLFormElement>(
      "#createTournamentForm"
    );
    const joinTournamentForm = this.querySelector<HTMLFormElement>(
      "#joinTournamentForm"
    );

    createTournamentForm?.addEventListener(
      "submit",
      this.handleCreateTournament.bind(this)
    );
    joinTournamentForm?.addEventListener(
      "submit",
      this.handleJoinGame.bind(this)
    );
  }

  private removeEventListeners() {
    this.removeAccordionListeners();
    this.removeOnlineGameListeners();
    this.removeTournamentListeners();
  }

  private removeAccordionListeners() {
    const accordionButtons = this.querySelectorAll("[data-accordion-target]");
    accordionButtons.forEach((button) => {
      button.removeEventListener("click", this.handleAccordionClick.bind(this));
    });
  }

  private removeOnlineGameListeners() {
    const createGameForm =
      this.querySelector<HTMLFormElement>("#createGameForm");
    const joinGameForm = this.querySelector<HTMLFormElement>("#joinGameForm");

    createGameForm?.removeEventListener(
      "submit",
      this.handleCreateTournament.bind(this)
    );
    joinGameForm?.removeEventListener("submit", this.handleJoinGame.bind(this));
  }

  private removeTournamentListeners() {
    const createTournamentForm = this.querySelector<HTMLFormElement>(
      "#createTournamentForm"
    );
    const joinTournamentForm = this.querySelector<HTMLFormElement>(
      "#joinTournamentForm"
    );

    createTournamentForm?.removeEventListener(
      "submit",
      this.handleCreateTournament.bind(this)
    );
    joinTournamentForm?.removeEventListener(
      "submit",
      this.handleJoinGame.bind(this)
    );
  }

  private handleAccordionClick(event: Event) {
    const button = event.currentTarget as HTMLElement;
    const targetId = button.getAttribute("data-accordion-target");
    const content = this.querySelector(`#${targetId}`);

    if (content) {
      const isExpanded = !content.classList.contains("hidden");

      this.querySelectorAll("[data-accordion-content]").forEach((item) => {
        item.classList.add("hidden");
      });

      if (!isExpanded) content.classList.remove("hidden");
    }
  }

  private async handleCreateTournament(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = (formData.get("gameName") ||
      formData.get("tournamentName")) as string;
    const isGame = form.id === "createGameForm";
    const username = isGame
      ? undefined
      : (formData.get("creatorUsername") as string);

    try {
      const { id } = await tournamentService.createTournament({
        name,
        creatorUsername: username,
        maxParticipants: isGame ? 2 : undefined,
      });
      window.location.href = `/tournament/${id}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to create ${isGame ? "game" : "tournament"}`;
      const errorContainer = isGame
        ? this.createGameError
        : this.createTournamentError;
      this.setError(errorContainer, errorMessage);
    }
  }

  private async handleJoinGame(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const gameId = formData.get("gameId") || formData.get("tournamentId");
    const isGame = form.id === "joinGameForm";

    try {
      await tournamentService.joinTournament(Number(gameId), {
        username: isGame ? undefined : (formData.get("username") as string),
      });
      window.location.href = `/tournament/${gameId}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to join game";
      const errorContainer = isGame
        ? this.joinGameError
        : this.joinTournamentError;
      this.setError(errorContainer, errorMessage);
    }
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-8 text-center">Choose Your Game Mode</h1>
          
          <div class="space-y-4">
            <div class="border border-secondary rounded-lg overflow-hidden">
              <button
                type="button"
                class="flex items-center justify-between w-full p-5 font-medium text-left"
                data-accordion-target="localGame"
              >
                <span class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H2a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H2a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                  Local Game
                </span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
              <div id="localGame" class="hidden p-5 border-t border-secondary" data-accordion-content>
                <p class="mb-4">Play a local game of Pong with a friend! Use W/S keys for the left paddle and UP/DOWN arrow keys for the right paddle.</p>
                <a href="/local-game" data-link class="btn-primary">Start Local Game</a>
              </div>
            </div>

            <div class="border border-secondary rounded-lg overflow-hidden">
              <button
                type="button"
                class="flex items-center justify-between w-full p-5 font-medium text-left"
                data-accordion-target="onlineGame"
              >
                <span class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Online Game
                </span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
              <div id="onlineGame" class="hidden p-5 border-t border-secondary" data-accordion-content>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 border border-secondary rounded-lg">
                    <h3 class="font-bold mb-4">Create Game</h3>
                    <error-container id="createGameError" props='{"message":""}'></error-container>
                    <form id="createGameForm" class="space-y-4">
                      <div>
                        <label for="gameName" class="block mb-2">Game Name</label>
                        <input
                          type="text"
                          id="gameName"
                          name="gameName"
                          class="w-full p-2 rounded bg-background border border-secondary"
                          required
                        />
                      </div>
                      <button type="submit" class="btn-primary w-full">Create Game</button>
                    </form>
                  </div>
                  
                  <div class="p-4 border border-secondary rounded-lg">
                    <h3 class="font-bold mb-4">Join Game</h3>
                    <error-container id="joinGameError" props='{"message":""}'></error-container>
                    <form id="joinGameForm" class="space-y-4">
                      <div>
                        <label for="gameId" class="block mb-2">Game ID</label>
                        <input
                          type="text"
                          id="gameId"
                          name="gameId"
                          class="w-full p-2 rounded bg-background border border-secondary"
                          required
                        />
                      </div>
                      <button type="submit" class="btn-primary w-full">Join Game</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div class="border border-secondary rounded-lg overflow-hidden">
              <button
                type="button"
                class="flex items-center justify-between w-full p-5 font-medium text-left"
                data-accordion-target="tournament"
              >
                <span class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Tournament
                </span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
              <div id="tournament" class="hidden p-5 border-t border-secondary" data-accordion-content>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 border border-secondary rounded-lg">
                    <h3 class="font-bold mb-4">Create Tournament</h3>
                    <error-container id="createTournamentError" props='{"message":""}'></error-container>
                    <form id="createTournamentForm" class="space-y-4">
                      <div>
                        <label for="tournamentName" class="block mb-2">Tournament Name</label>
                        <input
                          type="text"
                          id="tournamentName"
                          name="tournamentName"
                          class="w-full p-2 rounded bg-background border border-secondary"
                          required
                        />
                      </div>
                      <div>
                        <label for="creatorUsername" class="block mb-2">Your Username</label>
                        <input
                          type="text"
                          id="creatorUsername"
                          name="creatorUsername"
                          class="w-full p-2 rounded bg-background border border-secondary"
                          required
                        />
                      </div>
                      <button type="submit" class="btn-primary w-full">Create Tournament</button>
                    </form>
                  </div>
                  
                  <div class="p-4 border border-secondary rounded-lg">
                    <h3 class="font-bold mb-4">Join Tournament</h3>
                    <error-container id="joinTournamentError" props='{"message":""}'></error-container>
                    <form id="joinTournamentForm" class="space-y-4">
                      <div>
                        <label for="tournamentId" class="block mb-2">Tournament ID</label>
                        <input
                          type="text"
                          id="tournamentId"
                          name="tournamentId"
                          class="w-full p-2 rounded bg-background border border-secondary"
                          required
                        />
                      </div>
                      <div>
                        <label for="username" class="block mb-2">Your Username</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          class="w-full p-2 rounded bg-background border border-secondary"
                          required
                        />
                      </div>
                      <button type="submit" class="btn-primary w-full">Join Tournament</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    `;
  }
}

export default PlayPage;
