export class BaseComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    throw new Error("Method not implemented.");
  }
}

export class ParamsBaseComponent extends BaseComponent {
  declare params: Record<string, string>;

  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["params"];
  }

  connectedCallback() {
    this.updateParams();
    this.render();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "params" && newValue) {
      this.updateParams();
      this.render();
    }
  }

  updateParams() {
    const params = this.getAttribute("params");
    if (!params) return;
    this.params = JSON.parse(params);
  }
}

export class PropsBaseComponent extends BaseComponent {
  declare props: Record<string, string>;

  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["props"];
  }

  connectedCallback() {
    this.updateProps();
    this.render();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "props" && newValue) {
      this.updateProps();
      this.render();
    }
  }

  updateProps() {
    const props = this.getAttribute("props");
    if (!props) return;
    this.props = JSON.parse(props);
  }
}
