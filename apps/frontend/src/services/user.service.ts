import { apiURL } from "../lib/constant";
import { UserServiceInterface } from "../lib/types";

class UserService implements UserServiceInterface {
  loginURL = `${apiURL}/login`;
  signupURL = `${apiURL}/signup`;
  oauthURL = `${apiURL}/oauth`;
  profileURL = `${apiURL}/profile`;
  logoutURL = `${apiURL}/logout`;
  sessionURL = `${apiURL}/me`;

  async login(email: string, password: string) {
    const response = await fetch(this.loginURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Failed to login");
    }
  }

  async signup(email: string, password: string) {
    const response = await fetch(this.signupURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Failed to signup");
    }
  }

  async oauth() {
    const response = await fetch(this.oauthURL);

    if (!response.ok) {
      throw new Error("Failed to oauth");
    }
  }

  async logout() {
    const response = await fetch(this.logoutURL);

    if (!response.ok) {
      throw new Error("Failed to logout");
    }
  }

  async getUserProfile() {
    const response = await fetch(this.sessionURL);

    if (!response.ok) {
      throw new Error("Failed to get user profile");
    }

    return response.json();
  }

  async getSession() {
    const response = await fetch(this.profileURL);

    if (!response.ok) {
      throw new Error("Failed to get session");
    }

    return response.json();
  }
}

const userService = new UserService();
export default userService;

