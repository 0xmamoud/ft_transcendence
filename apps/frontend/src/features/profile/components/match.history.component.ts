import { PropsBaseComponent } from "@/core/components";
import { MatchHistory, userService } from "@/features/shared/user.service";

export class MatchHistoryComponent extends PropsBaseComponent {
  private matchHistory: MatchHistory | null = null;

  async connectedCallback() {
    try {
      this.matchHistory = await userService.getUserMatchHistory();
      this.render();
    } catch (error) {
      console.error("Error fetching match history:", error);
      this.render();
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  render() {
    if (!this.matchHistory || this.matchHistory.matches.length === 0) {
      this.innerHTML = /* html */ `
        <div class="flex flex-col items-center justify-center p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p class="text-gray-400">No matches played yet</p>
          <p class="text-gray-500 text-sm mt-2">Play some games to see your match history here</p>
        </div>
      `;
      return;
    }

    const recentMatches = this.matchHistory.matches.slice(0, 10);

    const matchItems = recentMatches
      .map((match, index) => {
        const date = this.formatDate(match.date);
        const result = match.won ? "Victory" : "Defeat";
        const resultClass = match.won
          ? "bg-green-500/20 text-green-500 border-green-500/30"
          : "bg-red-500/20 text-red-500 border-red-500/30";
        const resultIcon = match.won
          ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>';

        const isEven = index % 2 === 0;
        const rowClass = isEven ? "bg-background/20" : "bg-background/10";

        return /* html */ `
        <div class="match-item ${rowClass} p-4 rounded-lg mb-3 transition-all hover:bg-background/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0">
                <img src="${match.opponentAvatar || "/avatar.jpg"}" alt="${
          match.opponentName
        }" 
                  class="w-12 h-12 rounded-full border-2 border-secondary/30 object-cover" 
                  onerror="this.src='/avatar.jpg'">
              </div>
              <div>
                <a data-link href="/user/${
                  match.opponentId
                }" class="font-medium hover:underline">${match.opponentName}</a>
                <div class="text-xs text-gray-400">${date}</div>
              </div>
            </div>
            
            <div class="flex items-center gap-6">
              <div class="score-display text-xl font-bold">
                <span class="${match.won ? "text-green-500" : "text-white"}">${
          match.userScore
        }</span>
                <span class="text-gray-400 mx-1">:</span>
                <span class="${!match.won ? "text-red-500" : "text-white"}">${
          match.opponentScore
        }</span>
              </div>
              
              <div class="result-badge ${resultClass} px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1">
                ${resultIcon}
                ${result}
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    this.innerHTML = /* html */ `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Recent Matches</h3>
          <div class="text-sm text-gray-400">
            Last ${recentMatches.length} matches
          </div>
        </div>
        
        <div class="match-list space-y-1">
          ${
            matchItems.length > 0
              ? matchItems
              : /* html */ `
            <div class="text-center p-8 text-gray-400">
              No matches found
            </div>
          `
          }
        </div>
      </div>
    `;
  }
}

customElements.define("match-history", MatchHistoryComponent);
