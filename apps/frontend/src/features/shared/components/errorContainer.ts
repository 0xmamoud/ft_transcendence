import { PropsBaseComponent } from "@/core/components";

interface ErrorContainerProps {
  message?: string;
}

export class ErrorContainer extends PropsBaseComponent {
  render() {
    const { message } = this.props as ErrorContainerProps;

    this.innerHTML = `
      <div class="error-container" style="display: ${
        message ? "block" : "none"
      }">
        ${
          message
            ? `
          <div class="p-4 text-sm text-red-500 bg-red-100 rounded-md">
            ${message}
          </div>
        `
            : ""
        }
      </div>
    `;
  }
}

customElements.define("error-container", ErrorContainer);
