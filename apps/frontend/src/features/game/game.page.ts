import { BaseComponent } from "../../core/baseComponent";

class GamePage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = `
      <div class="game-page">
        <h1>Game Page</h1>
        <p>Welcome to the game page!</p>
      </div>
    `;
  }
}

export default GamePage;
