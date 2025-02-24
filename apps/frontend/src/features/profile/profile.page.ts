import { authService } from "@/features/auth/auth.service";
import { BaseComponent } from "@/core/components";
import { router } from "@/main";

class ProfilePage extends BaseComponent {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.querySelector(".logout-btn")?.addEventListener(
      "click",
      this.handleLogout
    );
  }

  disconnectedCallback() {
    this.querySelector(".logout-btn")?.removeEventListener(
      "click",
      this.handleLogout
    );
  }

  async handleLogout() {
    try {
      const response = await authService.logout();
      console.log("logout", response);
      router.navigateTo("/login");
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x">
          <h1>Profile</h1>
          <button class="btn-primary logout-btn">
            Logout
          </button>
        </section>
      </section>
    `;
  }
}

export default ProfilePage;
