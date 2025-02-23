export class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  color: string;

  constructor(
    canvas: HTMLCanvasElement,
    color: string,
    minSize: number,
    maxSize: number
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * (maxSize - minSize) + minSize;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.color = color;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > this.canvas.width) this.x = 0;
    if (this.x < 0) this.x = this.canvas.width;
    if (this.y > this.canvas.height) this.y = 0;
    if (this.y < 0) this.y = this.canvas.height;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

export class SparklesCore {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[] = [];
  animationFrameId: number = 0;
  minSize: number;
  maxSize: number;
  particleDensity: number;
  particleColor: string;

  constructor(
    canvasId: string,
    particleColor = "#FFFFFF",
    minSize = 0.6,
    maxSize = 1.4,
    particleDensity = 100
  ) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.particleDensity = particleDensity;
    this.particleColor = particleColor;

    this.init();
    this.animate();

    window.addEventListener("resize", this.handleResize.bind(this));
    window.addEventListener("beforeunload", this.destroy.bind(this));
  }

  init() {
    this.particles = [];
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    for (let i = 0; i < this.particleDensity; i++) {
      this.particles.push(
        new Particle(
          this.canvas,
          this.particleColor,
          this.minSize,
          this.maxSize
        )
      );
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.init();
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener("resize", this.handleResize.bind(this));
    window.removeEventListener("beforeunload", this.destroy.bind(this));
  }
}
