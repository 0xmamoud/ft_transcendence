import { BaseComponent } from "@/core/components";

class LoginPage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x">
          <h1>Login</h1>
        </section>
      </section>
    `;
  }
}

export default LoginPage;
