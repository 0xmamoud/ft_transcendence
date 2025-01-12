import Router from "./core/router";

class HomePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot!.innerHTML = `<div>welcome to home page</div>`;
  }

}

class AboutPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot!.innerHTML = `<div>welcome to about page</div>`;
  }

}

class ContactPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot!.innerHTML = `<div>welcome to contact page</div>`;
  }

}


class PostPage extends HTMLElement {
  declare params: Record<string, string>;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.updateParams();
    this.render();
  }

  static get observedAttributes() {
    return ["params"];
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "params") {
      this.updateParams();
      this.render();
    }
  }

  updateParams() {
    const params = JSON.parse(this.getAttribute("params")!);
    this.params = params;
  }

  render() {
    this.shadowRoot!.innerHTML = `<div>
      welcome to post page ${this.params.id}
    </div>`;
  }

}

class UserPage extends HTMLElement {
  declare params: Record<string, string>;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.updateParams();
    this.render();
  }

  static get observedAttributes() {
    return ["params"];
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "params" && newValue) {
      this.updateParams();
      this.render();
    }
  }

  updateParams() {
    const params = JSON.parse(this.getAttribute("params")!);
    this.params = params;
  }

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

const router = new Router(routes);
