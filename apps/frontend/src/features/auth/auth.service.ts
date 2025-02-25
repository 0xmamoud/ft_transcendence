export class AuthService {
  async login(email: string, password: string) {
    console.log("login", email, password);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to login");
    }

    return data;
  }

  async register(username: string, email: string, password: string) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to register");
    }

    return data;
  }

  async logout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to logout");
    }

    return data;
  }

  async checkAuthStatus() {
    try {
      // Vérifier si l'utilisateur est connecté en vérifiant les cookies
      // Cette méthode peut être appelée au chargement de l'application
      const response = await fetch("/api/auth/status", {
        method: "GET",
      });

      if (!response.ok) {
        return { isAuthenticated: false };
      }

      const data = await response.json();
      return { isAuthenticated: true, user: data.user };
    } catch (error) {
      console.error("Error checking auth status:", error);
      return { isAuthenticated: false };
    }
  }

  // Méthode pour gérer le retour de l'authentification Google
  handleGoogleAuthRedirect() {
    // Cette méthode peut être appelée sur la page de redirection après l'authentification Google
    // Par exemple, vous pourriez avoir une page /auth/callback qui appelle cette méthode
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      throw new Error(error);
    }

    // Si pas d'erreur, l'authentification a réussi et les cookies ont été définis par le backend
    return { success: true };
  }
}

export const authService = new AuthService();
