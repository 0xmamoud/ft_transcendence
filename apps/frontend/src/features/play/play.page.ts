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
    accordionButtons.forEach((button) => {
      button.addEventListener("click", this.handleAccordionClick.bind(this));
    });
  }

  private removeEventListeners() {
    const accordionButtons = this.querySelectorAll("[data-accordion-target]");
    accordionButtons.forEach((button) => {
      button.removeEventListener("click", this.handleAccordionClick.bind(this));
    });
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
                <p class="mb-4">Challenge another player online in a 1v1 match!</p>
                <button class="btn-primary">Find Online Match</button>
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
                <p class="mb-4">Join or create a tournament and compete with multiple players!</p>
                <div class="flex gap-4 max-md:flex-col">
                  <button class="btn-primary">Create Tournament</button>
                  <button class="btn-secondary">Join Tournament</button>
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
