import { BaseComponent } from "@/core/components";

class LeaderboardPage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x">
          <h1>Leaderboard</h1>
        </section>
      </section>
    `;
  }
}

export default LeaderboardPage;
