import { BaseComponent } from "@/core/components";
import { router } from "@/main";
import { leaderboardService } from "./leaderboardService";
import { LeaderboardEntry } from "./types";
import { userService } from "@/features/shared/userService";

class LeaderboardPage extends BaseComponent {
  private leaderboard: LeaderboardEntry[] = [];

  async connectedCallback() {
    try {
      this.innerHTML = `<div>Loading...</div>`;
      await userService.getUserProfile();
      this.leaderboard = await leaderboardService.getLeaderboard();
      this.render();
    } catch (error) {
      router.navigateTo("/login");
    }
  }

  private renderPodium() {
    const topThree = this.leaderboard.slice(0, 3);
    if (topThree.length === 0) return "";

    return /* html */ `
      <div class="flex flex-col sm:flex-row justify-center items-end gap-4 mb-12 h-auto sm:h-72 px-4">
        ${topThree
          .map((player, index) => {
            const height =
              index === 1 ? "sm:h-52" : index === 2 ? "sm:h-44" : "sm:h-60";
            const order =
              index === 1
                ? "sm:order-first order-2"
                : index === 0
                ? "order-1"
                : "order-3";
            const width = "w-full sm:w-36 max-w-xs";
            const position = index === 1 ? "2nd" : index === 0 ? "1st" : "3rd";
            const margin = index === 1 ? "mb-4 sm:mb-0" : "mb-4 sm:mb-0";

            const styles =
              index === 0
                ? {
                    bg: "bg-gradient-to-b from-yellow-300 to-yellow-400",
                    border: "border-yellow-500",
                    shadow: "shadow-yellow-500/50",
                    text: "text-yellow-950",
                    containerBg: "bg-yellow-100",
                    medal: "🥇",
                  }
                : index === 1
                ? {
                    bg: "bg-gradient-to-b from-slate-300 to-slate-400",
                    border: "border-slate-500",
                    shadow: "shadow-slate-500/50",
                    text: "text-slate-950",
                    containerBg: "bg-white",
                    medal: "🥈",
                  }
                : {
                    bg: "bg-gradient-to-b from-orange-300 to-orange-400",
                    border: "border-orange-500",
                    shadow: "shadow-orange-500/50",
                    text: "text-orange-950",
                    containerBg: "bg-orange-100",
                    medal: "🥉",
                  };

            return /* html */ `
              <div class="flex flex-col items-center ${order} ${margin} relative ${width}">
                <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl">
                  ${styles.medal}
                </div>
                <div class="flex flex-col items-center justify-end ${height} w-full 
                     ${styles.bg} rounded-t-lg p-4 
                     border-2 ${styles.border}
                     shadow-lg ${styles.shadow}
                     transition-all duration-300
                     hover:scale-105 hover:-translate-y-1">
                  <div class="text-xl font-bold ${
                    styles.text
                  } mb-2 text-center">${position}</div>
                  <div class="w-full px-2 py-1 rounded-md ${
                    styles.containerBg
                  } mb-2">
                    <a data-link href="/user/${
                      player.id
                    }" class="block font-bold text-center truncate w-full ${
              styles.text
            } text-lg hover:underline">
                      ${player.username}
                    </a>
                  </div>
                  <div class="font-semibold ${styles.text} text-center">
                    Win Rate: ${player.winRate.toFixed(1)}%
                  </div>
                  <div class="font-semibold ${styles.text} text-center">
                    Wins: ${player.wins}
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  private renderLeaderboardTable() {
    const otherPlayers = this.leaderboard.slice(3);
    if (otherPlayers.length === 0) return "";

    return /* html */ `
      <div class="bg-background/50 backdrop-blur rounded-lg border border-secondary overflow-hidden mx-4 sm:mx-0">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-background/70">
              <tr>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Rank</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Player</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider hidden sm:table-cell">Matches</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider hidden sm:table-cell">Wins</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Win Rate</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-secondary">
              ${otherPlayers
                .map(
                  (player, index) => /* html */ `
                <tr class="hover:bg-background/70 transition-colors">
                  <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="text-foreground inline-flex items-center justify-center w-6 h-6">
                        ${index + 4}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <a data-link href="/user/${
                      player.id
                    }" class="text-sm font-medium text-foreground hover:underline">
                      ${player.username}
                    </a>
                  </td>
                  <td class="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm text-foreground">${
                      player.totalMatches
                    }</div>
                  </td>
                  <td class="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm text-foreground">${player.wins}</div>
                  </td>
                  <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-foreground">
                      <div class="flex items-center">
                        <div class="w-16 sm:w-full bg-background rounded-full h-2.5 mr-2">
                          <div
                            class="bg-primary h-2.5 rounded-full"
                            style="width: ${player.winRate}%"
                          ></div>
                        </div>
                        <span class="whitespace-nowrap">${player.winRate.toFixed(
                          1
                        )}%</span>
                      </div>
                    </div>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y container mx-auto">
        <section class="padding-x">
          <h1 class="text-3xl font-bold mb-6 text-center px-4 sm:px-0">Leaderboard</h1>
          
          ${this.renderPodium()}
          ${this.renderLeaderboardTable()}
        </section>
      </section>
    `;
  }
}

export default LeaderboardPage;
