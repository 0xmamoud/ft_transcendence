import { PropsBaseComponent } from "@/core/components";
import { MatchHistory, userService } from "@/features/shared/user.service";
import * as d3 from "d3";

export class StatsChartComponent extends PropsBaseComponent {
  private matchHistory: MatchHistory | null = null;
  private svg: d3.Selection<SVGGElement, unknown, null, undefined> | null =
    null;

  async connectedCallback() {
    try {
      this.matchHistory = await userService.getUserMatchHistory();
      this.render();
      this.renderPieChart();
    } catch (error) {
      console.error("Error fetching match history:", error);
      this.render();
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
    if (!this.matchHistory) return;

    const { stats } = this.matchHistory;
    const lostMatches = stats.totalMatches - stats.wonMatches;
    const data = [
      { label: "Wins", value: stats.wonMatches, color: "#4CAF50" },
      { label: "Losses", value: lostMatches, color: "#F44336" },
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
    const winPercentage =
      stats.totalMatches > 0
        ? Math.round((stats.wonMatches / stats.totalMatches) * 100)
        : 0;

    this.svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "2.5rem")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text(`${winPercentage}%`);

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
    if (!this.matchHistory) {
      this.innerHTML = `<div class="p-4 text-center text-gray-400">No statistics available</div>`;
      return;
    }

    const { stats } = this.matchHistory;
    const lostMatches = stats.totalMatches - stats.wonMatches;
    const lossRate =
      stats.totalMatches > 0
        ? ((lostMatches / stats.totalMatches) * 100).toFixed(1)
        : "0.0";

    this.innerHTML = /* html */ `
      <div class="space-y-6">
        <div class="stats-grid grid grid-cols-3 gap-4">
          <div class="stat-card bg-background/30 backdrop-blur p-4 rounded-lg text-center border border-secondary/30 shadow-lg">
            <div class="text-sm text-gray-400 mb-1">Total Matches</div>
            <div class="text-3xl font-bold">${stats.totalMatches}</div>
          </div>
          
          <div class="stat-card bg-background/30 backdrop-blur p-4 rounded-lg text-center border border-secondary/30 shadow-lg">
            <div class="text-sm text-gray-400 mb-1">Wins</div>
            <div class="text-3xl font-bold text-green-500">${stats.wonMatches}</div>
          </div>
          
          <div class="stat-card bg-background/30 backdrop-blur p-4 rounded-lg text-center border border-secondary/30 shadow-lg">
            <div class="text-sm text-gray-400 mb-1">Losses</div>
            <div class="text-3xl font-bold text-red-500">${lostMatches}</div>
          </div>
        </div>
        
        <div class="pie-chart-container flex justify-center items-center mt-6 w-full h-[300px] bg-background/30 backdrop-blur rounded-lg p-4 border border-secondary/30 shadow-lg">
        </div>
        
        <div class="flex justify-between items-center px-4 py-3 bg-background/30 backdrop-blur rounded-lg border border-secondary/30 shadow-lg">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-green-700"></div>
            <span>Win Rate: <span class="font-bold text-green-500">${stats.winRate}%</span></span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-700"></div>
            <span>Loss Rate: <span class="font-bold text-red-500">${lossRate}%</span></span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("stats-chart", StatsChartComponent);
