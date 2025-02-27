import { BaseComponent } from "@/core/components";

class PlayPage extends BaseComponent {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  private setupEventListeners() {
    const accordionButtons = this.querySelectorAll("[data-accordion-target]");
    const createGameForm =
      this.querySelector<HTMLFormElement>("#createGameForm");
    const joinGameForm = this.querySelector<HTMLFormElement>("#joinGameForm");
    const createTournamentForm = this.querySelector<HTMLFormElement>(
      "#createTournamentForm"
    );
    const joinTournamentForm = this.querySelector<HTMLFormElement>(
      "#joinTournamentForm"
    );

    accordionButtons.forEach((button) => {
      button.addEventListener("click", this.handleAccordionClick.bind(this));
    });

    createGameForm?.addEventListener(
      "submit",
      this.handleCreateGame.bind(this)
    );
    joinGameForm?.addEventListener("submit", this.handleJoinGame.bind(this));
    createTournamentForm?.addEventListener(
      "submit",
      this.handleCreateTournament.bind(this)
    );
    joinTournamentForm?.addEventListener(
      "submit",
      this.handleJoinTournament.bind(this)
    );
  }

  private removeEventListeners() {
    const accordionButtons = this.querySelectorAll("[data-accordion-target]");
    const createGameForm =
      this.querySelector<HTMLFormElement>("#createGameForm");
    const joinGameForm = this.querySelector<HTMLFormElement>("#joinGameForm");
    const createTournamentForm = this.querySelector<HTMLFormElement>(
      "#createTournamentForm"
    );
    const joinTournamentForm = this.querySelector<HTMLFormElement>(
      "#joinTournamentForm"
    );

    accordionButtons.forEach((button) => {
      button.removeEventListener("click", this.handleAccordionClick.bind(this));
    });

    createGameForm?.removeEventListener(
      "submit",
      this.handleCreateGame.bind(this)
    );
    joinGameForm?.removeEventListener("submit", this.handleJoinGame.bind(this));
    createTournamentForm?.removeEventListener(
      "submit",
      this.handleCreateTournament.bind(this)
    );
    joinTournamentForm?.removeEventListener(
      "submit",
      this.handleJoinTournament.bind(this)
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

  private handleCreateGame(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const gameName = formData.get("gameName") as string;

    // TODO: Implement game creation logic
    console.log("Creating game:", gameName);
    window.location.href = `/online-game/create/${gameName}`;
  }

  private handleJoinGame(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const gameId = formData.get("gameId") as string;

    // TODO: Implement game joining logic
    console.log("Joining game:", gameId);
    window.location.href = `/online-game/join/${gameId}`;
  }

  private handleCreateTournament(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const tournamentName = formData.get("tournamentName") as string;

    // TODO: Implement tournament creation logic
    console.log("Creating tournament:", tournamentName);
    window.location.href = `/tournament/create/${tournamentName}`;
  }

  private handleJoinTournament(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const tournamentId = formData.get("tournamentId") as string;

    // TODO: Implement tournament joining logic
    console.log("Joining tournament:", tournamentId);
    window.location.href = `/tournament/join/${tournamentId}`;
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
                      <button type="submit" class="btn-primary w-full">Create Tournament</button>
                    </form>
                  </div>
                  
                  <div class="p-4 border border-secondary rounded-lg">
                    <h3 class="font-bold mb-4">Join Tournament</h3>
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
