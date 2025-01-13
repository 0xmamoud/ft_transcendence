import { BaseComponent } from "../../core/baseComponent";

class HomePage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <div class="home-page">
        <h1>Home Page</h1>
        <p>Welcome to the home page!</p>
      </div>
    `;
  }
}

export default HomePage;
