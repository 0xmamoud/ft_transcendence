
import Router from "./core/router";

import StarryBackground from "./features/shared/starryBackground";
import GamePage from "./features/game/game.page";
import HomePage from "./features/home/home.page";
import LeaderboardPage from "./features/leaderboard/leaderboard.page";
import ProfilePage from "./features/profile/profile.page";
import LoginPage from "./features/login/login.page";
import SignupPage from "./features/signup/signup.page";

function initializeApp() {

  customElements.define("game-page", GamePage);
  customElements.define("home-page", HomePage);
  customElements.define("leaderboard-page", LeaderboardPage);
  customElements.define("profile-page", ProfilePage);
  customElements.define("login-page", LoginPage);
  customElements.define("signup-page", SignupPage);

  const routes = [
    { path: "/", component: () => document.createElement("home-page") },
    { path: "/game", component: () => document.createElement("game-page") },
    { path: "/leaderboard", component: () => document.createElement("leaderboard-page") },
    { path: "/profile", component: () => document.createElement("profile-page") },
    { path: "/login", component: () => document.createElement("login-page") },
    { path: "/signup", component: () => document.createElement("signup-page") },
  ];

  new Router(routes);
  new StarryBackground();
}

initializeApp();

