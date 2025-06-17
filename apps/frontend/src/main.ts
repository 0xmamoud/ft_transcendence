import "@/style.css";
import { SparklesCore } from "@/features/shared/particle";
import Router from "@/core/router";
import HomePage from "@/features/home/homePage";
import LeaderboardPage from "@/features/leaderboard/leaderboardPage";
import ProfilePage from "@/features/profile/profilePage";
import PlayPage from "@/features/play/playPage";
import LocalGamePage from "@/features/play/local-game/localGamePage";
import LoginPage from "@/features/auth/loginPage";
import RegisterPage from "@/features/auth/registerPage";
import TournamentPage from "@/features/play/tournamentPage";
import UserStatsPage from "@/features/leaderboard/userStatsPage";

const routes = [
  { path: "/", component: () => document.createElement("home-page") },
  {
    path: "/leaderboard",
    component: () => document.createElement("leaderboard-page"),
  },
  { path: "/profile", component: () => document.createElement("profile-page") },
  {
    path: "/play",
    component: () => document.createElement("play-page"),
  },
  {
    path: "/local-game",
    component: () => document.createElement("local-game-page"),
  },
  { path: "/login", component: () => document.createElement("login-page") },
  {
    path: "/register",
    component: () => document.createElement("register-page"),
  },
  {
    path: "/tournament/:id",
    component: () => document.createElement("tournament-page"),
  },
  {
    path: "/user/:id",
    component: () => document.createElement("user-stats-page"),
  },
];

export const router = new Router(routes);

const defineCustomElements = () => {
  customElements.define("home-page", HomePage);
  customElements.define("leaderboard-page", LeaderboardPage);
  customElements.define("profile-page", ProfilePage);
  customElements.define("play-page", PlayPage);
  customElements.define("local-game-page", LocalGamePage);
  customElements.define("login-page", LoginPage);
  customElements.define("register-page", RegisterPage);
  customElements.define("tournament-page", TournamentPage);
  customElements.define("user-stats-page", UserStatsPage);
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

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Forcer le rechargement de la page
    window.location.reload();
  });
}
