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

export abstract class AttributeBaseComponent<
  T extends Record<string, unknown>
> extends BaseComponent {
  protected declare data: T;
  protected abstract readonly attributeName: string;

  protected updateData() {
    const value = this.getAttribute(this.attributeName);
    if (!value) return;
    this.data = JSON.parse(value);
  }
}

export class ParamsBaseComponent extends AttributeBaseComponent<
  Record<string, string>
> {
  protected readonly attributeName = "params";

  get params() {
    return this.data;
  }

  connectedCallback() {
    this.updateData();
    this.render();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === this.attributeName && newValue) {
      this.updateData();
      this.render();
    }
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
