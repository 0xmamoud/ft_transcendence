interface StarConfig {
  elementId: string;
  count: number;
  maxX: number;
  maxY: number;
}

class StarryBackground {
  private readonly containers: string[] = ['stars1', 'stars2', 'stars3'];
  private readonly starCounts: number[] = [500, 100, 50];
  private resizeTimeout: number | null = null;

  constructor() {
    this.initStars();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  private createStars({ elementId, count, maxX, maxY }: StarConfig): void {
    const container = document.getElementById(elementId);
    if (!container) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * maxX}px`;
      star.style.top = `${Math.random() * maxY}px`;
      fragment.appendChild(star);
    }

    container.appendChild(fragment);
  }

  private clearStars(): void {
    this.containers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    });
  }

  private initStars(): void {
    const width = window.innerWidth;
    const height = window.innerHeight * 2;

    this.clearStars();

    this.containers.forEach((containerId, index) => {
      this.createStars({
        elementId: containerId,
        count: this.starCounts[index],
        maxX: width,
        maxY: height
      });
    });
  }

  private handleResize(): void {
    if (this.resizeTimeout) {
      window.cancelAnimationFrame(this.resizeTimeout);
    }

    this.resizeTimeout = window.requestAnimationFrame(() => {
      this.initStars();
      this.resizeTimeout = null;
    });
  }

  public destroy(): void {
    if (this.resizeTimeout) {
      window.cancelAnimationFrame(this.resizeTimeout);
    }
    window.removeEventListener('resize', this.handleResize);
    this.clearStars();
  }
}


export default StarryBackground;
