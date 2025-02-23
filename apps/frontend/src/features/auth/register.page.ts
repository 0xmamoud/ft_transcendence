import { BaseComponent } from "@/core/components";

class RegisterPage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x">
          <h1>Register</h1>
        </section>
      </section>
    `;
  }
}

export default RegisterPage;
