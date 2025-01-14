import { BaseComponent } from "../../core/baseComponent";

class SignupPage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = `
      <div class="signup-page">
        <h1>Signup Page</h1>
        <p>Welcome to the signup page!</p>
      </div>
    `;
  }
}

export default SignupPage;
