import { BaseComponent } from "@/core/components";

class HomePage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="padding-y">
        <section class="padding-x flex flex-col items-center justify-center text-center gap-8">
          <h1 class="text-primary">Pong Challenge</h1>
          <p class="text-xl max-w-2xl">
            Welcome to the ultimate pong challenge!
            <br>
            Invite your friends and compete to see who is the best pong player.
          </p>
          <h2 class="text-foreground">Are you ready to take the challenge?</h2>
          <div class="flex items-center gap-4 mt-4">
            <a href="/game" data-link>
              <button class="btn-primary">
                Try it out
              </button>
            </a>
            <a href="/login" data-link>
              <button class="btn-secondary">
                Join the challenge
              </button>
            </a>
          </div>
        </section> 
        <section class="padding-x mt-12">
          <img 
            srcset="https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 320w,
                    https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 400w,
                    https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 450w,
                    https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 640w,
                    https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 700w,
                    https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 800w,
                    https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 768w"
            class="w-full max-w-4xl mx-auto rounded-lg shadow-lg" 
            alt="pong challenge demo">
        </section>
      </section>
    `;
  }
}

export default HomePage;
