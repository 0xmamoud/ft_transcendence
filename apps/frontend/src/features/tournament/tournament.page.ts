import { BaseComponent } from "@/core/components";

class TournamentPage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x">
          <h1>Tournament</h1>
        </section>
      </section>
    `;
  }
}

export default TournamentPage;
