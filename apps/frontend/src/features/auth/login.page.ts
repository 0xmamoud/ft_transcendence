import { BaseComponent } from "@/core/components";
import { authService } from "@/features/auth/auth.service";
import { router } from "@/main";

class LoginPage extends BaseComponent {
  private errorContainer: HTMLElement | null = null;

  constructor() {
    super();
  }

  private setError(message: string) {
    if (!this.errorContainer) {
      this.errorContainer = this.querySelector(".error-container");
    }

    if (this.errorContainer) {
      if (message) {
        this.errorContainer.innerHTML = `
          <div class="p-4 text-sm text-red-500 bg-red-100 rounded-md">
            ${message}
          </div>
        `;
        this.errorContainer.style.display = "block";
      } else {
        this.errorContainer.innerHTML = "";
        this.errorContainer.style.display = "none";
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    const form = this.querySelector("form");
    form?.addEventListener("submit", this.handleSubmit.bind(this));
  }

  disconnectedCallback() {
    const form = this.querySelector("form");
    form?.removeEventListener("submit", this.handleSubmit.bind(this));
  }

  async handleSubmit(e: Event) {
    e.preventDefault();

    const form = new FormData(e.target as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    this.setError("");

    try {
      const response = await authService.login(email, password);
      console.log("login", response);
      router.navigateTo("/profile");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during login";
      this.setError(errorMessage);
    }
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="flex items-center justify-center padding">
        <form class="flex flex-col p-8 gap-6 mx-auto w-full max-w-md bg-background rounded-lg border border-secondary shadow-lg">
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-2">Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>

          <div class="error-container" style="display: none;"></div>

          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-medium">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              class="input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="text-sm font-medium">Password</label>
            <input 
              type="password"
              id="password"
              name="password"
              class="input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit"
            class="btn-primary active:scale-[0.98] transition-all"
          >
            Sign In
          </button>

          <div class="flex flex-col gap-2 text-center text-sm">
            <a 
              href="/register" 
              class="hover:underline transition-all"
              data-link
            >
              Don't have an account? Register
            </a>
          </div>
        </form>
      </section>
    `;
  }
}

export default LoginPage;
