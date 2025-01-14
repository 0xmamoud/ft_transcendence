import { BaseComponent } from "../../core/baseComponent";

class HomePage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = `
      <section >
        <section class="max-container hero" >
          <h1>Pong Challenge</h1>
          <p class="hero_text">
            Welcome to the ultimate pong challenge !
            <br>
            Invite your friends and compete to see who is the best pong player.
          </p>
          <h2>Are you ready to take the challenge?</h2>
          <div class="hero_cta">
            <a href="/game" data-link>
              <button class="try_btn">
                Try it out
              </button>
            </a>
            <a href="/login" data-link>
              <button class="join_btn">
                Join the challenge
              </button>
            </a>
          </div>
        </section> 
        <section class="max-container home_image_container">
          <img 
            srcset="https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 320w, https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 400w, https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 450w, https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 640w, https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 700w, https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 800w, https://cdn.dribbble.com/users/728843/screenshots/2019841/media/9ede3a2e951fcfeecf62919f19bd0397.gif 768w" 
            class="img-fluid" alt="pong challenge demo">
        </section>
      </section>
    `;
  }
}

export default HomePage;
