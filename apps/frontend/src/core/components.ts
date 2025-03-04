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
    try {
      this.data = JSON.parse(value);
    } catch (error) {
      console.error(`Error parsing ${this.attributeName}:`, error);
    }
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
  declare props: Record<string, any>;

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
    try {
      // Remplacer les entités HTML par leurs caractères correspondants
      const decodedProps = props
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

      this.props = JSON.parse(decodedProps);
    } catch (error) {
      console.error("Error parsing props:", error, props);
      // Initialiser avec un objet vide en cas d'erreur
      this.props = {};
    }
  }
}
