import { PropsBaseComponent } from "@/core/components";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isOnline: boolean;
}

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

export class TournamentChat extends PropsBaseComponent {
  private handleSubmit = (event: Event) => {
    event.preventDefault();
    const input = this.querySelector('input[type="text"]') as HTMLInputElement;
    const message = input.value.trim();

    if (message && this.props.onSendMessage) {
      this.props.onSendMessage(message);
      input.value = "";
    }
  };

  connectedCallback() {
    super.connectedCallback();
    const form = this.querySelector("form");
    form?.addEventListener("submit", this.handleSubmit);
  }

  disconnectedCallback() {
    const form = this.querySelector("form");
    form?.removeEventListener("submit", this.handleSubmit);
  }

  render() {
    const { messages = [] } = this.props as ChatProps;

    this.innerHTML = /* html */ `
      <div class="h-full flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Tournament Chat</h2>
          <button class="lg:hidden text-primary" id="toggleChat">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <!-- Chat Messages -->
        <div class="hidden lg:block flex-1 overflow-y-auto mb-4 space-y-4" id="chatMessages">
          ${messages
            .map(
              (message) => /* html */ `
            <div class="chat-message">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-1.5 h-1.5 rounded-full ${
                  message.isOnline ? "bg-green-500" : "bg-gray-500"
                }"></div>
                <div class="text-sm font-semibold">${message.username}</div>
                <div class="text-xs text-gray-500">${message.timestamp}</div>
              </div>
              <div class="bg-secondary/50 rounded-lg p-2 text-sm">
                ${message.message}
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Chat Input -->
        <form class="mt-auto pt-4 border-t border-secondary">
          <div class="relative">
            <input
              type="text"
              placeholder="Type a message..."
              class="w-full p-2 pr-10 rounded bg-background border border-secondary text-sm"
            />
            <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

customElements.define("tournament-chat", TournamentChat);
