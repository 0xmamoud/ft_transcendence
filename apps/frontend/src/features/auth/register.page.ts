import { BaseComponent } from "@/core/components";
import { authService } from "@/features/auth/auth.service";
import { twoFactorService } from "@/features/shared/twoFactor.service";
import { router } from "@/main";
import "@/shared/components/error-container";

class RegisterPage extends BaseComponent {
  private errorContainer: HTMLElement | null = null;
  private registerForm: HTMLElement | null = null;
  private twoFactorForm: HTMLElement | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupForms();
    this.setupEventListeners();
  }

  private setupForms() {
    this.errorContainer = this.querySelector("#registerError");
    this.registerForm = this.querySelector(".register-form");
    this.twoFactorForm = this.querySelector(".verify-form");
  }

  private setError(message: string) {
    if (this.errorContainer) {
      this.errorContainer.setAttribute("props", JSON.stringify({ message }));
    }
  }

  private showTwoFactorForm() {
    if (this.registerForm && this.twoFactorForm) {
      this.registerForm.style.display = "none";
      this.twoFactorForm.style.display = "block";
    }
  }

  private updateQRCode(qrCode: string) {
    const qrContainer = this.querySelector(".qr-container");
    if (qrContainer) {
      qrContainer.innerHTML = /* html */ `
        <div class="bg-white p-4 rounded-lg shadow-md inline-block">
          <img src="${qrCode}" alt="QR Code" class="w-48 h-48" />
        </div>
      `;
    }
  }

  private setupEventListeners() {
    const registerForm = this.querySelector(".register-form");
    const verifyForm = this.querySelector(".verify-form");

    registerForm?.addEventListener(
      "submit",
      this.handleRegisterSubmit.bind(this)
    );
    verifyForm?.addEventListener("submit", this.handleVerifySubmit.bind(this));
  }

  disconnectedCallback() {
    const registerForm = this.querySelector(".register-form");
    const verifyForm = this.querySelector(".verify-form");

    registerForm?.removeEventListener(
      "submit",
      this.handleRegisterSubmit.bind(this)
    );
    verifyForm?.removeEventListener(
      "submit",
      this.handleVerifySubmit.bind(this)
    );
  }

  async handleRegisterSubmit(e: Event) {
    e.preventDefault();

    const form = new FormData(e.target as HTMLFormElement);
    const email = form.get("email") as string;
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    this.setError("");

    try {
      await authService.register(email, password, username);
      try {
        const qrCode = await twoFactorService.getQRCode();
        this.showTwoFactorForm();
        this.updateQRCode(qrCode);
      } catch (error) {
        console.error("Error getting QR code:", error);
        router.navigateTo("/profile");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during registration";
      this.setError(errorMessage);
    }
  }

  async handleVerifySubmit(e: Event) {
    e.preventDefault();

    const form = new FormData(e.target as HTMLFormElement);
    const token = form.get("token") as string;

    this.setError("");

    try {
      await twoFactorService.enable2FA(token);
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
          <error-container id="registerError" props='{"message":""}'></error-container>

          <form class="register-form flex flex-col gap-6">
            <div class="text-center">
              <h1 class="text-3xl font-bold mb-2">Create Account</h1>
              <p>Sign up for a new account</p>
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
              <label for="username" class="text-sm font-medium">Username</label>
              <input 
                type="text" 
                id="username"
                name="username"
                class="input"
                placeholder="Choose a username"
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
                placeholder="Choose a password"
                required
              />
            </div>

            <button 
              type="submit"
              class="btn-primary active:scale-[0.98] transition-all"
            >
              Sign Up
            </button>

            <p class="text-center text-xl m-0">Or</p>
            <a
              href="/api/auth/google"
              class="btn-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-2 py-1"
            >
              <img src="/google.svg" alt="Google" class="w-10 h-10" />
              Sign Up with Google
            </a>

            <div class="flex flex-col gap-2 text-center text-sm">
              <a 
                href="/login" 
                class="hover:underline transition-all"
                data-link
              >
                Already have an account? Sign In
              </a>
            </div>
          </form>

          <form class="verify-form flex flex-col gap-8 items-center" style="display: none;">
            <div class="text-center space-y-4">
              <h2 class="text-2xl font-bold">Two-Factor Authentication</h2>
              <div class="space-y-2">
                <p class="text-gray-600">Enhance your account security</p>
                <p class="text-sm text-gray-500">Follow these steps to enable 2FA:</p>
              </div>
            </div>

            <div class="space-y-6 w-full">
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold">1</div>
                  <p class="text-sm">Install Google Authenticator on your phone</p>
                </div>
                
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold">2</div>
                  <p class="text-sm">Scan the QR code below with the app</p>
                </div>
              </div>

              <div class="qr-container flex justify-center"></div>

              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold">3</div>
                  <p class="text-sm">Enter the 6-digit code from the app</p>
                </div>

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
              </div>
            </div>

            <button 
              type="submit"
              class="btn-primary w-full active:scale-[0.98] transition-all"
            >
              Enable Two-Factor Authentication
            </button>
          </form>
        </div>
      </section>
    `;
  }
}

export default RegisterPage;
