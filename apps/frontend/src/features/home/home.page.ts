import { BaseComponent } from "../../core/baseComponent";

class HomePage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = `
      <section >
        <div >
          <h1>Home page</h1>
          <p>Welcome to the home page!</p>
        </div> 
      </section>
    `;
  }
}

export default HomePage;
