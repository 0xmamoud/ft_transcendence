import { BaseComponent } from "../../core/baseComponent";

class LoginPage extends BaseComponent {
  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
    const form = document.querySelector('#loginForm')!;
    const loginButton = document.querySelector('#login')!;
    form.addEventListener('submit', this.handleLogin);
    loginButton.addEventListener('click', this.handle42Login);

  }

  async handle42Login(event: Event) {
    event.preventDefault();
    console.log('42 Login');
  }

  async handleLogin(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) {
      event.stopPropagation();
    } else {
      const formData = new FormData(form);
      const email = formData.get('email');
      const password = formData.get('password');

      //TODO: Implement login logic and toast message
      console.log(email, password);
    }
    form.classList.add('was-validated');
  }


  render() {
    this.innerHTML = `
    <div class="container mt-5 vh-100">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Login</h3>
            <form id="loginForm" novalidate>
              <!-- Email Input -->
              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" name="email" placeholder="Enter your email" required>
                <div class="invalid-feedback">
                  Please enter a valid email.
                </div>
              </div>
              <!-- Password Input -->
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="Enter your password" required>
                <div class="invalid-feedback">
                  Please provide your password.
                </div>
              </div>
              <!-- Submit Button -->
              <div class="d-grid">
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
              <p class="text-center mt-3" >Or</p>
              <div class="d-grid">
                <button type="button" class="btn btn-secondary" id="login" >Login with 42</button>
               </div>
            </form>
            <div class="text-center mt-3">
              <p>Don't have an account? <a href="/signup" data-link>Sign up</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    `;
  }
}

export default LoginPage;
