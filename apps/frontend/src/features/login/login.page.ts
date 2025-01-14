import { BaseComponent } from "../../core/baseComponent";

class LoginPage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = `
      <div class="login-page">
        <h1>Login Page</h1>
        <p>Welcome to the login page!</p>
      </div>
    `;
  }
}

export default LoginPage;
