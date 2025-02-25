import { BaseComponent } from "@/core/components";
import { authService } from "@/features/auth/auth.service";
import { router } from "@/main";

class AuthCallbackPage extends BaseComponent {
  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    this.handleAuthCallback();
  }

  private async handleAuthCallback() {
    try {
      // Afficher un message de chargement
      this.innerHTML = /* html */ `
        <div class="flex items-center justify-center h-screen">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-lg">Finalisation de l'authentification...</p>
          </div>
        </div>
      `;

      // Traiter le retour de l'authentification
      const result = authService.handleGoogleAuthRedirect();

      if (result.success) {
        // Rediriger vers la page de profil après une authentification réussie
        setTimeout(() => {
          router.navigateTo("/profile");
        }, 1000); // Petit délai pour montrer le message de succès
      }
    } catch (error) {
      // En cas d'erreur, afficher un message et rediriger vers la page de connexion
      this.innerHTML = /* html */ `
        <div class="flex items-center justify-center h-screen">
          <div class="text-center">
            <div class="text-red-500 text-5xl mb-4">⚠️</div>
            <p class="text-lg text-red-500 mb-4">Échec de l'authentification</p>
            <button 
              class="btn-primary"
              id="back-to-login"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      `;

      const backButton = this.querySelector("#back-to-login");
      backButton?.addEventListener("click", () => {
        router.navigateTo("/login");
      });
    }
  }

  render() {
    this.innerHTML = /* html */ `
      <div class="flex items-center justify-center h-screen">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p class="text-lg">Authentification en cours...</p>
        </div>
      </div>
    `;
  }
}

export default AuthCallbackPage;
