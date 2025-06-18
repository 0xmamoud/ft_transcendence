import { PropsBaseComponent } from "@/core/components";
import { UserProfile } from "@/features/shared/type";
import { userService } from "@/features/shared/userService";
import "@/features/shared/components/errorContainer";

export class ProfileFormComponent extends PropsBaseComponent {
  private userProfile: UserProfile | null = null;
  private form: HTMLFormElement | null = null;
  private errorContainer: HTMLElement | null = null;
  private successTimeout: number | null = null;
  private successMessage: HTMLDivElement | null = null;

  private readonly handleAvatarClick = () => {
    (this.querySelector('input[type="file"]') as HTMLInputElement)?.click();
  };

  async connectedCallback() {
    try {
      this.userProfile = await userService.getUserProfile();
      this.render();
      this.form = this.querySelector("form");
      this.errorContainer = this.querySelector("#profileFormError");
      this.successMessage = this.querySelector("#successMessage");
      this.setupEventListeners();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load profile";
      this.setError(errorMessage);
    }
  }

  private setupEventListeners() {
    this.querySelector(".avatar-upload")?.addEventListener(
      "click",
      this.handleAvatarClick
    );
    this.querySelector('input[type="file"]')?.addEventListener(
      "change",
      this.handleAvatarChange.bind(this)
    );
    this.form?.addEventListener("submit", this.handleSubmit.bind(this));
  }

  disconnectedCallback() {
    this.querySelector(".avatar-upload")?.removeEventListener(
      "click",
      this.handleAvatarClick
    );
    this.querySelector('input[type="file"]')?.removeEventListener(
      "change",
      this.handleAvatarChange.bind(this)
    );
    this.form?.removeEventListener("submit", this.handleSubmit.bind(this));

    if (this.successTimeout) {
      window.clearTimeout(this.successTimeout);
    }
  }

  private setError(message: string) {
    if (this.errorContainer) {
      this.errorContainer.setAttribute("props", JSON.stringify({ message }));
    }
  }

  private showSuccessMessage() {
    if (this.successMessage) {
      this.successMessage.classList.remove("hidden");
      if (this.successTimeout) {
        window.clearTimeout(this.successTimeout);
      }
      this.successTimeout = window.setTimeout(() => {
        this.successMessage?.classList.add("hidden");
      }, 3000);
    }
  }

  private handleAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = this.querySelector(
          ".avatar-preview"
        ) as HTMLImageElement;
        if (preview && e.target?.result) {
          preview.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.userProfile || !this.form) return;

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const fileInput = this.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const updatedProfile = {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        avatar: fileInput.files?.length
          ? fileInput.files[0]
          : this.userProfile.avatar,
      };

      this.userProfile = await userService.updateUserProfile(updatedProfile);
      this.render();
      this.showSuccessMessage();
      this.setError("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      this.setError(errorMessage);
    }
  }

  render() {
    const avatarUrl = this.userProfile?.avatar?.toString().startsWith("http")
      ? this.userProfile.avatar
      : `/api/${this.userProfile?.avatar}`;

    this.innerHTML = /* html */ `
      <form class="space-y-6">
        <error-container id="profileFormError" props='{"message":""}'></error-container>
        
        <div id="successMessage" class="hidden bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg">
          Profile updated successfully!
        </div>

        <div class="flex flex-col items-center mb-8">
          <div class="relative group cursor-pointer avatar-upload">
            <img 
              src="${avatarUrl}"
              alt="Avatar" 
              class="avatar-preview w-32 h-32 rounded-full object-cover border-4 border-primary/50 shadow-lg" 
              onerror="this.src='/avatar.jpg'"
            >
            <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-white text-xs mt-1">Change Avatar</span>
              </div>
            </div>
          </div>
          <input type="file" name="avatar" class="hidden" accept="image/*">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label for="username" class="block text-sm font-medium mb-1 text-gray-200">Username</label>
            <input 
              type="text" 
              id="username"
              name="username"
              class="w-full p-3 rounded-md border border-secondary bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value="${this.userProfile?.username || ""}"
              required
            >
          </div>

          <div class="form-group">
            <label for="email" class="block text-sm font-medium mb-1 text-gray-200">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              class="w-full p-3 rounded-md border border-secondary bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value="${this.userProfile?.email || ""}"
              required
            >
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" class="btn-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Save Changes
          </button>
        </div>
      </form>
    `;

    // Réattacher les event listeners après le render
    this.form = this.querySelector("form");
    this.errorContainer = this.querySelector("#profileFormError");
    this.successMessage = this.querySelector("#successMessage");
    this.setupEventListeners();
  }
}

customElements.define("profile-form", ProfileFormComponent);
