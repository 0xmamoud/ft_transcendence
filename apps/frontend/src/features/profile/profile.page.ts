import { BaseComponent } from "@/core/components";

class ProfilePage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x">
          <h1>Profile</h1>
        </section>
      </section>
    `;
  }
}

export default ProfilePage;
