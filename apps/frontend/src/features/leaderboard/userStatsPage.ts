import { ParamsBaseComponent } from "@/core/components";
import { router } from "@/main";
import { leaderboardService } from "./leaderboardService";
import { UserStats } from "./types";
import { userService } from "@/features/shared/userService";
import * as d3 from "d3";

class UserStatsPage extends ParamsBaseComponent {
  private userStats: UserStats | null = null;
  private svg: d3.Selection<SVGGElement, unknown, null, undefined> | null =
    null;

  async connectedCallback() {
    try {
      super.connectedCallback();
      this.innerHTML = `<div>Loading...</div>`;
      await userService.getUserProfile();

      const userId = parseInt(this.params.id);
      if (isNaN(userId)) {
        router.navigateTo("/leaderboard");
        return;
      }

      this.userStats = await leaderboardService.getUserStats(userId);
      this.render();
      this.renderPieChart();
    } catch (error) {
      router.navigateTo("/login");
    }
  }

  disconnectedCallback() {
    if (this.svg) {
      this.svg.selectAll("*").remove();
      this.svg.remove();
      this.svg = null;
    }
  }

  private renderPieChart() {
    if (!this.userStats) return;

    const { stats } = this.userStats;
    const data = [
      { label: "Wins", value: stats.wins, color: "#4CAF50" },
      { label: "Losses", value: stats.losses, color: "#F44336" },
    ];

    const container = this.querySelector(".pie-chart-container");
    if (!container) return;

    // Nettoyer le conteneur
    d3.select(container).selectAll("*").remove();

    const width = 280;
    const height = 280;
    const radius = Math.min(width, height) / 2;

    // Créer SVG
    const svgElement = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("class", "mx-auto");

    this.svg = svgElement
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`) as any;

    if (!this.svg) return;

    // Définir les gradients
    const defs = svgElement.append("defs");

    // Gradient pour les victoires
    const winGradient = defs
      .append("linearGradient")
      .attr("id", "winGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");

    winGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4CAF50")
      .attr("stop-opacity", 1);

    winGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2E7D32")
      .attr("stop-opacity", 1);

    // Gradient pour les défaites
    const lossGradient = defs
      .append("linearGradient")
      .attr("id", "lossGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");

    lossGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F44336")
      .attr("stop-opacity", 1);

    lossGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#C62828")
      .attr("stop-opacity", 1);

    // Ajouter l'ombre
    const filter = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3);

    filter.append("feOffset").attr("dx", 1).attr("dy", 1);

    const feComponentTransfer = filter.append("feComponentTransfer");
    feComponentTransfer
      .append("feFuncA")
      .attr("type", "linear")
      .attr("slope", 0.5);

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Créer le pie chart
    const pie = d3
      .pie<any>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.03);

    const arc = d3
      .arc<any>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8)
      .cornerRadius(8);

    const pieData = pie(data);

    // Ajouter les segments avec animation
    this.svg
      .selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (_, i) =>
        i === 0 ? "url(#winGradient)" : "url(#lossGradient)"
      )
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .style("stroke-width", "2px")
      .style("filter", "url(#drop-shadow)")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);

    // Ajouter le pourcentage au centre
    const winPercentage = this.userStats.stats.winRate;

    this.svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "2.5rem")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text(`${winPercentage.toFixed(1)}%`);

    this.svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.8em")
      .style("font-size", "0.9rem")
      .style("fill", "rgba(255, 255, 255, 0.7)")
      .text("Win Rate");

    // Ajouter les valeurs
    this.svg
      .selectAll(".value-label")
      .data(pieData)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "0.9rem")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("opacity", 0)
      .text((d) => d.value)
      .transition()
      .delay((_, i) => 600 + i * 100)
      .duration(500)
      .style("opacity", 1);
  }

  render() {
    if (!this.userStats) {
      return;
    }

    const { stats } = this.userStats;
    const lossRate = ((stats.losses / stats.totalMatches) * 100).toFixed(1);
    const recentMatches = this.userStats.matchHistory.slice(0, 10);

    this.innerHTML = /* html */ `
      <section class="padding-y container mx-auto">
        <section class="padding-x">
          <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">${
                this.userStats.username
              }'s Profile</h1>
          </div>

          <div class="space-y-6">
            <div class="stats-grid grid grid-cols-3 gap-4">
              <div class="stat-card bg-background/30 backdrop-blur p-4 rounded-lg text-center border border-secondary/30 shadow-lg">
                <div class="text-sm text-gray-400 mb-1">Total Matches</div>
                <div class="text-3xl font-bold">${stats.totalMatches}</div>
              </div>
              
              <div class="stat-card bg-background/30 backdrop-blur p-4 rounded-lg text-center border border-secondary/30 shadow-lg">
                <div class="text-sm text-gray-400 mb-1">Wins</div>
                <div class="text-3xl font-bold text-green-500">${
                  stats.wins
                }</div>
              </div>
              
              <div class="stat-card bg-background/30 backdrop-blur p-4 rounded-lg text-center border border-secondary/30 shadow-lg">
                <div class="text-sm text-gray-400 mb-1">Losses</div>
                <div class="text-3xl font-bold text-red-500">${
                  stats.losses
                }</div>
              </div>
            </div>
            
            <div class="pie-chart-container flex justify-center items-center mt-6 w-full h-[300px] bg-background/30 backdrop-blur rounded-lg p-4 border border-secondary/30 shadow-lg">
            </div>
            
            <div class="flex justify-between items-center px-4 py-3 bg-background/30 backdrop-blur rounded-lg border border-secondary/30 shadow-lg">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-green-700"></div>
                <span>Win Rate: <span class="font-bold text-green-500">${stats.winRate.toFixed(
                  1
                )}%</span></span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-700"></div>
                <span>Loss Rate: <span class="font-bold text-red-500">${lossRate}%</span></span>
              </div>
            </div>

            <div class="mt-8 bg-background/50 backdrop-blur rounded-lg border border-secondary p-6">
              <div class="space-y-4">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-medium">Recent Matches</h3>
                  <div class="text-sm text-gray-400">
                    Last ${recentMatches.length} matches
                  </div>
                </div>
                
                <div class="match-list space-y-1">
                  ${
                    recentMatches.length > 0
                      ? recentMatches
                          .map((match, index) => {
                            const isEven = index % 2 === 0;
                            const rowClass = isEven
                              ? "bg-background/20"
                              : "bg-background/10";
                            const resultClass = match.won
                              ? "bg-green-500/20 text-green-500 border-green-500/30"
                              : "bg-red-500/20 text-red-500 border-red-500/30";
                            const resultIcon = match.won
                              ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>'
                              : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>';

                            return /* html */ `
                        <div class="match-item ${rowClass} p-4 rounded-lg mb-3 transition-all hover:bg-background/30">
                          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div class="flex items-center gap-3">
                              <div class="flex items-center gap-2">
                                <a data-link href="/user/${
                                  this.userStats?.id
                                }" class="font-medium hover:underline">
                                  ${this.userStats?.username}
                                </a>
                                <span class="text-gray-400">vs</span>
                                <a data-link href="/user/${
                                  match.opponent.id
                                }" class="font-medium hover:underline">
                                  ${match.opponent.username}
                                </a>
                              </div>
                            </div>
                            
                            <div class="flex items-center gap-6">
                              <div class="result-badge ${resultClass} px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1">
                                ${resultIcon}
                                ${match.won ? "Victory" : "Defeat"}
                              </div>
                            </div>
                          </div>
                        </div>
                      `;
                          })
                          .join("")
                      : /* html */ `
                      <div class="text-center p-8 text-gray-400">
                        No matches found
                      </div>
                    `
                  }
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    `;
  }
}

export default UserStatsPage;
