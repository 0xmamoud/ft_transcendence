interface AuthService {
  login(
    email: string,
    password: string
  ): Promise<{ message: string } | { userId: number; requires2FA: boolean }>;

  register(
    email: string,
    password: string,
    username: string
  ): Promise<{ message: string }>;
  loginWith2FA(userId: number, token: string): Promise<{ message: string }>;
  logout(): Promise<{ message: string }>;
}

class AuthService implements AuthService {
  async login(email: string, password: string) {
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

  async register(email: string, password: string, username: string) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, username }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to register");
    }

    return data;
  }

  async loginWith2FA(userId: number, token: string) {
    const response = await fetch("/api/2fa/login-with-2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify 2FA");
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

  handleGoogleAuthRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      throw new Error(error);
    }

    return { success: true };
  }
}

export const authService = new AuthService();
