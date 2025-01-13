import { BaseComponent } from "../../core/baseComponent";

class LeaderboardPage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <div class="leaderboard-page">
        <h1>Leaderboard Page</h1>
        <p>Welcome to the leaderboard page!</p>
      </div>
    `;
  }
}

export default LeaderboardPage;
