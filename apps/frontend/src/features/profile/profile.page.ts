import { authService } from "@/features/auth/auth.service";
import { BaseComponent } from "@/core/components";
import { router } from "@/main";
import "@/features/profile/components/match.history.component";
import "@/features/profile/components/stats.chart.component";
import "@/features/profile/components/profile.form.component";
import { userService } from "@/features/shared/user.service";
class ProfilePage extends BaseComponent {
  private logoutButton: HTMLButtonElement | null = null;
  private handleLogout = () => {
    authService.logout().then(() => router.navigateTo("/login"));
  };

  async connectedCallback() {
    try {
      this.innerHTML = `<div>Loading...</div>`;
      await userService.getUserProfile();
      this.render();

      this.logoutButton = this.querySelector(".logout-btn");
      this.logoutButton?.addEventListener("click", this.handleLogout);
    } catch (error) {
      console.error(error);
      router.navigateTo("/login");
    }
  }

  disconnectedCallback() {
    this.logoutButton?.removeEventListener("click", this.handleLogout);
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y container mx-auto">
        <section class="padding-x">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Profile page</h1>
            <button class="btn-secondary logout-btn">Logout</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-background/50 backdrop-blur rounded-lg border border-secondary p-6">
              <h2 class="text-2xl font-bold mb-4">Profile Informations</h2>
              <profile-form></profile-form>
            </div>

            <div class="bg-background/50 backdrop-blur rounded-lg border border-secondary p-6">
              <h2 class="text-2xl font-bold mb-4">Statistics</h2>
              <stats-chart></stats-chart>
            </div>
          </div>

          <div class="mt-8 bg-background/50 backdrop-blur rounded-lg border border-secondary p-6">
            <h2 class="text-2xl font-bold mb-4">Match History</h2>
            <match-history></match-history>
          </div>
        </section>
      </section>
    `;
  }
}

export default ProfilePage;
