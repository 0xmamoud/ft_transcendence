import "@/style.css";
import { SparklesCore } from "@/features/shared/particle";
import Router from "@/core/router";
import HomePage from "@/features/home/home.page";
import LeaderboardPage from "@/features/leaderboard/leaderboard.page";
import ProfilePage from "@/features/profile/profile.page";
import TournamentPage from "@/features/tournament/tournament.page";
import LoginPage from "@/features/auth/login.page";
import RegisterPage from "@/features/auth/register.page";
import AuthCallbackPage from "@/features/auth/auth-callback.page";

const routes = [
  { path: "/", component: () => document.createElement("home-page") },
  {
    path: "/leaderboard",
    component: () => document.createElement("leaderboard-page"),
  },
  { path: "/profile", component: () => document.createElement("profile-page") },
  {
    path: "/tournament",
    component: () => document.createElement("tournament-page"),
  },
  { path: "/login", component: () => document.createElement("login-page") },
  {
    path: "/register",
    component: () => document.createElement("register-page"),
  },
  {
    path: "/auth/callback",
    component: () => document.createElement("auth-callback-page"),
  },
];

export const router = new Router(routes);

const defineCustomElements = () => {
  customElements.define("home-page", HomePage);
  customElements.define("leaderboard-page", LeaderboardPage);
  customElements.define("profile-page", ProfilePage);
  customElements.define("tournament-page", TournamentPage);
  customElements.define("login-page", LoginPage);
  customElements.define("register-page", RegisterPage);
  customElements.define("auth-callback-page", AuthCallbackPage);
};

const initMobileMenu = () => {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  const closeMobileMenu = () => {
    mobileMenu?.setAttribute("data-visible", "false");
  };

  mobileMenuBtn?.addEventListener("click", () => {
    const isVisible = mobileMenu?.getAttribute("data-visible") === "true";
    mobileMenu?.setAttribute("data-visible", isVisible ? "false" : "true");
  });

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.hasAttribute("data-link")) {
      closeMobileMenu();
    }
  });
};

const init = () => {
  new SparklesCore("sparklesCanvas");
  defineCustomElements();
  initMobileMenu();
};

document.addEventListener("DOMContentLoaded", init);

// Add HMR support
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Force page reload when components are updated
    window.location.reload();
  });
}
