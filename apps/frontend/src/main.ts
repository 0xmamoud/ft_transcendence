import Router from "./core/router";
import { BaseComponent, ParamsBaseComponent } from "./core/baseComponent";

class HomePage extends BaseComponent {
  render() {
    this.shadowRoot!.innerHTML = `<div>welcome to home page</div>`;
  }
}

class AboutPage extends BaseComponent {
  render() {
    this.shadowRoot!.innerHTML = `<div>welcome to about page</div>`;
  }

}

class ContactPage extends BaseComponent {
  render() {
    this.shadowRoot!.innerHTML = `<div>welcome to contact page</div>`;
  }

}


class PostPage extends ParamsBaseComponent {
  render() {
    this.shadowRoot!.innerHTML = `<div>
      welcome to post page ${this.params.id}
    </div>`;
  }

}

class UserPage extends ParamsBaseComponent {
  render() {
    this.shadowRoot!.innerHTML = `<div>
      welcome to user page ${this.params.id} ${this.params.name}
    </div>`;
  }

}

customElements.define("home-page", HomePage);
customElements.define("about-page", AboutPage);
customElements.define("contact-page", ContactPage);
customElements.define("post-page", PostPage);
customElements.define("user-page", UserPage);

const routes = [
  {
    path: "/",
    component: () => document.createElement("home-page"),
  },
  {
    path: "/about",
    component: () => document.createElement("about-page"),
  },
  {
    path: "/contact",
    component: () => document.createElement("contact-page"),
  },
  {
    path: "/posts/:id",
    component: () => document.createElement("post-page"),
  },
  {
    path: "/users/:id/:name",
    component: () => document.createElement("user-page"),
  },
];

export const router = new Router(routes);
