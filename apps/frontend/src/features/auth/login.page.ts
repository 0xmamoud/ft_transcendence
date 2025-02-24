import { BaseComponent } from "@/core/components";
import { authService } from "@/features/auth/auth.service";
import { router } from "@/main";

class LoginPage extends BaseComponent {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    const form = this.querySelector("form");
    form?.addEventListener("submit", this.handleSubmit);
  }

  disconnectedCallback() {
    const form = this.querySelector("form");
    form?.removeEventListener("submit", this.handleSubmit);
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const response = await authService.login(email, password);
      console.log("login", response);
      router.navigateTo("/profile");
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    this.innerHTML = /* html */ `
      <section class=" flex items-center justify-center padding">
        <form class="flex flex-col p-8 gap-6 mx-auto w-full max-w-md bg-background rounded-lg border border-secondary shadow-lg">
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-2">Welcome Back</h1>
            <p >Sign in to your account</p>
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
            class="btn-primary active:scale-[0.98] transition-all "
          >
            Sign In
          </button>

          <div class="flex flex-col gap-2 text-center text-sm">
            <a 
              href="/register" 
              class="hover:text-primary/80 transition-colors"
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
