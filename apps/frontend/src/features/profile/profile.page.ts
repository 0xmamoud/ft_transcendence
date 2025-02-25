import { authService } from "@/features/auth/auth.service";
import { userService } from "@/features/shared/user.service";
import { BaseComponent } from "@/core/components";
import { router } from "@/main";
import { UserProfile } from "../shared/type";

class ProfilePage extends BaseComponent {
  private userProfile: UserProfile | null = null;

  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      this.innerHTML = `<div class="loading">Chargement...</div>`;

      this.userProfile = await userService.getUserProfile();

      this.render();

      this.querySelector(".logout-btn")?.addEventListener(
        "click",
        this.handleLogout.bind(this)
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du profil utilisateur:",
        error
      );
      router.navigateTo("/login");
    }
  }

  disconnectedCallback() {
    const logoutBtn = this.querySelector(".logout-btn");
    if (logoutBtn) {
      const newBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode?.replaceChild(newBtn, logoutBtn);
    }
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
          <div class="user-info">
            <p>Nom d'utilisateur: ${this.userProfile?.username || "N/A"}</p>
            <p>Email: ${this.userProfile?.email || "N/A"}</p>
            <img src="${
              this.userProfile?.avatar
            }" alt="Avatar" class="w-10 h-10 rounded-full" />
          </div>
          <button class="btn-primary logout-btn">
            Logout
          </button>
        </section>
      </section>
    `;
  }
}

export default ProfilePage;
