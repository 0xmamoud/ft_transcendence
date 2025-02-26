import { BaseComponent } from "@/core/components";
import { authService } from "@/features/auth/auth.service";
import { router } from "@/main";

class LoginPage extends BaseComponent {
  private errorContainer: HTMLElement | null = null;
  private loginForm: HTMLElement | null = null;
  private twoFactorForm: HTMLElement | null = null;
  private userId: number | null = null;

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

  private showTwoFactorForm() {
    if (!this.loginForm) {
      this.loginForm = this.querySelector(".login-form");
    }
    if (!this.twoFactorForm) {
      this.twoFactorForm = this.querySelector(".verify-form");
    }

    if (this.loginForm && this.twoFactorForm) {
      this.loginForm.style.display = "none";
      this.twoFactorForm.style.display = "block";
    }
  }

  connectedCallback() {
    super.connectedCallback();
    const loginForm = this.querySelector(".login-form");
    const verifyForm = this.querySelector(".verify-form");

    loginForm?.addEventListener("submit", this.handleLoginSubmit.bind(this));
    verifyForm?.addEventListener("submit", this.handleVerifySubmit.bind(this));
  }

  disconnectedCallback() {
    const loginForm = this.querySelector(".login-form");
    const verifyForm = this.querySelector(".verify-form");

    loginForm?.removeEventListener("submit", this.handleLoginSubmit.bind(this));
    verifyForm?.removeEventListener(
      "submit",
      this.handleVerifySubmit.bind(this)
    );
  }

  async handleLoginSubmit(e: Event) {
    e.preventDefault();

    const form = new FormData(e.target as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    this.setError("");

    try {
      const response = await authService.login(email, password);

      if (response.requires2FA) {
        this.userId = response.userId;
        this.showTwoFactorForm();
      } else {
        router.navigateTo("/profile");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during login";
      this.setError(errorMessage);
    }
  }

  async handleVerifySubmit(e: Event) {
    e.preventDefault();

    if (!this.userId) {
      this.setError("Session expired. Please try logging in again.");
      return;
    }

    const form = new FormData(e.target as HTMLFormElement);
    const token = form.get("token") as string;

    this.setError("");

    try {
      await authService.loginWith2FA(this.userId, token);
      router.navigateTo("/profile");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid verification code";
      this.setError(errorMessage);
    }
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="flex items-center justify-center padding">
        <div class="flex flex-col p-8 gap-6 mx-auto w-full max-w-md bg-background rounded-lg border border-secondary shadow-lg">
          <div class="error-container" style="display: none;"></div>

          <form class="login-form flex flex-col gap-6">
            <div class="text-center">
              <h1 class="text-3xl font-bold mb-2">Welcome Back</h1>
              <p>Sign in to your account</p>
            </div>

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

            <p class="text-center text-xl m-0">Or</p>
            <a
              href="/api/auth/google"
              class="btn-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-2 py-1"
            >
              <img src="/google.svg" alt="Google" class="w-10 h-10" />
              Sign In with Google
            </a>

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

          <form class="verify-form flex flex-col gap-8 items-center" style="display: none;">
            <div class="text-center space-y-4">
              <h2 class="text-2xl font-bold">Two-Factor Authentication</h2>
              <div class="space-y-2">
                <p class="text-gray-600">Additional verification required</p>
                <p class="text-sm text-gray-500">Please enter the 6-digit code from your authenticator app to continue</p>
              </div>
            </div>

            <div class="space-y-6 w-full">
              <div class="flex flex-col gap-2">
                <div class="relative">
                  <input 
                    type="text" 
                    id="token"
                    name="token"
                    class="input text-center text-2xl tracking-[0.5em] font-mono"
                    placeholder="000000"
                    required
                    pattern="[0-9]{6}"
                    maxlength="6"
                    autocomplete="off"
                  />
                </div>
                <p class="text-xs text-gray-500 text-center">The code refreshes every 30 seconds</p>
              </div>

              <div class="flex flex-col gap-4">
                <button 
                  type="submit"
                  class="btn-primary w-full active:scale-[0.98] transition-all"
                >
                  Verify and Sign In
                </button>
                <button 
                  type="button"
                  class="btn-secondary w-full active:scale-[0.98] transition-all"
                  onclick="window.location.reload()"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    `;
  }
}

export default LoginPage;
