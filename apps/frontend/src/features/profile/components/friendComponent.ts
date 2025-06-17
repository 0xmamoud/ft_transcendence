import { PropsBaseComponent } from "@/core/components";
import { friendService, Friend } from "@/features/profile/friendService";
import "@/features/shared/components/errorContainer";

export class FriendComponent extends PropsBaseComponent {
  private friends: Friend[] = [];
  private addFriendForm: HTMLFormElement | null = null;
  private errorContainer: HTMLElement | null = null;
  private successMessage: HTMLDivElement | null = null;
  private successTimeout: number | null = null;

  async connectedCallback() {
    try {
      await this.loadFriends();
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error("Error loading friends:", error);
      this.render();
    }
  }

  disconnectedCallback() {
    this.addFriendForm?.removeEventListener(
      "submit",
      this.handleAddFriend.bind(this)
    );
    if (this.successTimeout) {
      window.clearTimeout(this.successTimeout);
    }
  }

  private async loadFriends() {
    try {
      this.friends = await friendService.getFriendsList();
    } catch (error) {
      console.error("Error loading friends:", error);
      this.friends = [];
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load friends";
      this.setError(errorMessage);
    }
  }

  private setupEventListeners() {
    this.addFriendForm = this.querySelector("#addFriendForm");
    this.errorContainer = this.querySelector("#friendError");
    this.successMessage = this.querySelector("#friendSuccessMessage");

    this.addFriendForm?.addEventListener(
      "submit",
      this.handleAddFriend.bind(this)
    );

    // Add event listeners for delete buttons
    const deleteButtons = this.querySelectorAll(".delete-friend-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", this.handleDeleteFriend.bind(this));
    });
  }

  private setError(message: string) {
    if (this.errorContainer) {
      this.errorContainer.setAttribute("props", JSON.stringify({ message }));
    }
  }

  private showSuccessMessage(message: string) {
    if (this.successMessage) {
      this.successMessage.textContent = message;
      this.successMessage.classList.remove("hidden");
      if (this.successTimeout) {
        window.clearTimeout(this.successTimeout);
      }
      this.successTimeout = window.setTimeout(() => {
        this.successMessage?.classList.add("hidden");
      }, 3000);
    }
  }

  private async handleAddFriend(event: Event) {
    event.preventDefault();
    if (!this.addFriendForm) return;

    const submitButton = this.addFriendForm.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    // Prevent multiple submissions
    if (submitButton.disabled) return;

    try {
      const formData = new FormData(this.addFriendForm);
      const username = formData.get("username") as string;

      if (!username.trim()) {
        this.setError("Username is required");
        return;
      }

      // Disable button during request
      submitButton.disabled = true;
      submitButton.textContent = "Adding...";

      await friendService.addFriend(username.trim());

      // Reload friends list after adding
      await this.loadFriends();
      this.showSuccessMessage(`${username} has been added as a friend!`);
      this.setError("");
      this.addFriendForm.reset();
      this.render();
      this.setupEventListeners();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add friend";
      this.setError(errorMessage);
    } finally {
      // Re-enable button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = /* html */ `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add
        `;
      }
    }
  }

  private async handleDeleteFriend(event: Event) {
    event.preventDefault();
    const button = event.currentTarget as HTMLButtonElement;
    const friendId = parseInt(button.dataset.friendId || "");
    const friendUsername = button.dataset.friendUsername || "";

    if (!friendId) return;

    // Prevent multiple submissions
    if (button.disabled) return;

    try {
      // Disable button during request
      button.disabled = true;
      button.innerHTML = /* html */ `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.6 2.296.6 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      `;

      await friendService.deleteFriend(friendId);

      // Remove friend from local list
      this.friends = this.friends.filter((friend) => friend.id !== friendId);
      this.showSuccessMessage(
        `${friendUsername} has been removed from your friends.`
      );
      this.setError("");
      this.render();
      this.setupEventListeners();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove friend";
      this.setError(errorMessage);
    } finally {
      // Re-enable button
      if (button) {
        button.disabled = false;
        button.innerHTML = /* html */ `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        `;
      }
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  render() {
    const friendItems =
      this.friends.length > 0
        ? this.friends
            .map((friend, index) => {
              const isEven = index % 2 === 0;
              const rowClass = isEven ? "bg-background/20" : "bg-background/10";
              // Use current date as placeholder since backend doesn't provide createdAt
              const joinedDate = this.formatDate(new Date().toISOString());

              return /* html */ `
            <div class="friend-item ${rowClass} p-4 rounded-lg mb-3 transition-all hover:bg-background/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0">
                    <img src="${friend.avatar || "/avatar.jpg"}" alt="${
                friend.username
              }" 
                      class="w-12 h-12 rounded-full border-2 border-secondary/30 object-cover" 
                      onerror="this.src='/avatar.jpg'">
                  </div>
                  <div>
                    <a data-link href="/user/${
                      friend.id
                    }" class="font-medium hover:underline">${
                friend.username
              }</a>
                    <div class="text-xs text-gray-400">Friends since ${joinedDate}</div>
                  </div>
                </div>
                
                <div class="flex items-center">
                  <button 
                    class="btn-secondary btn-sm text-red-400 hover:text-red-300 delete-friend-btn" 
                    title="Remove Friend"
                    data-friend-id="${friend.id}"
                    data-friend-username="${friend.username}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          `;
            })
            .join("")
        : /* html */ `
        <div class="flex flex-col items-center justify-center p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-gray-400">No friends yet</p>
          <p class="text-gray-500 text-sm mt-2">Add some friends to start building your network</p>
        </div>
      `;

    this.innerHTML = /* html */ `
      <div class="space-y-6">
        <!-- Add Friend Form -->
        <div class="bg-background/30 rounded-lg p-4 border border-secondary/50">
          <h3 class="text-lg font-medium mb-4">Add Friend</h3>
          <error-container id="friendError" props='{"message":""}'></error-container>
          
          <div id="friendSuccessMessage" class="hidden bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg mb-4">
            Friend added successfully!
          </div>
          
          <form id="addFriendForm" class="flex gap-3">
            <input 
              type="text" 
              name="username"
              placeholder="Enter username" 
              class="flex-1 p-3 rounded-md border border-secondary bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              required
            >
            <button type="submit" class="btn-primary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add
            </button>
          </form>
        </div>

        <!-- Friends List -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Friends (${this.friends.length})</h3>
          </div>
          
          <div class="friend-list space-y-1">
            ${friendItems}
          </div>
        </div>
      </div>
    `;

    // Réattacher les event listeners après le render
    this.setupEventListeners();
  }
}

customElements.define("friend-list", FriendComponent);
