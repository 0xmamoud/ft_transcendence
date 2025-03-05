export interface GameState {
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };
  paddles: {
    left: { y: number; height: number };
    right: { y: number; height: number };
  };
  canvas: {
    width: number;
    height: number;
  };
  scores: {
    left: number;
    right: number;
  };
  players: {
    player1Id: number;
    player2Id: number;
    player1Ready?: boolean;
    player2Ready?: boolean;
  };
}

export class GameService {
  private state: GameState;
  private readonly paddleWidth = 10;
  private readonly paddleHeight = 100;
  private readonly ballSpeed = 5;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.state = {
      ball: {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        dx: this.ballSpeed,
        dy: this.ballSpeed,
      },
      paddles: {
        left: {
          y: canvasHeight / 2 - this.paddleHeight / 2,
          height: this.paddleHeight,
        },
        right: {
          y: canvasHeight / 2 - this.paddleHeight / 2,
          height: this.paddleHeight,
        },
      },
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
      },
      scores: {
        left: 0,
        right: 0,
      },
      players: {
        player1Id: 0,
        player2Id: 0,
        player1Ready: false,
        player2Ready: false,
      },
    };
  }

  // Mettre à jour la position de la balle
  updateBall(): void {
    const { ball, canvas } = this.state;

    // Mise à jour de la position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Collision avec les murs (haut/bas)
    if (ball.y <= 0 || ball.y >= canvas.height) {
      ball.dy = -ball.dy;
    }

    // Collision avec les paddles
    if (
      ball.x <= this.paddleWidth &&
      ball.y >= this.state.paddles.left.y &&
      ball.y <= this.state.paddles.left.y + this.state.paddles.left.height
    ) {
      ball.dx = this.ballSpeed;
    }

    if (
      ball.x >= canvas.width - this.paddleWidth &&
      ball.y >= this.state.paddles.right.y &&
      ball.y <= this.state.paddles.right.y + this.state.paddles.right.height
    ) {
      ball.dx = -this.ballSpeed;
    }

    // Vérification des points
    if (ball.x <= 0) {
      this.state.scores.right++;
      this.resetBall("right");
    } else if (ball.x >= canvas.width) {
      this.state.scores.left++;
      this.resetBall("left");
    }
  }

  private resetBall(serveDirection: "left" | "right"): void {
    const { canvas } = this.state;

    this.state.ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: serveDirection === "left" ? -this.ballSpeed : this.ballSpeed,
      dy: this.ballSpeed,
    };
  }

  // Obtenir l'état actuel du jeu
  getState(): GameState {
    return { ...this.state };
  }

  // Mettre à jour l'état avec les données du serveur
  updateFromServer(newState: GameState) {
    this.state = newState;
  }

  // Déplacer un paddle
  movePaddle(side: "left" | "right", direction: "up" | "down"): void {
    const paddle = this.state.paddles[side];
    const step = 10; // Vitesse de déplacement du paddle

    if (direction === "up" && paddle.y >= step) {
      paddle.y -= step;
    } else if (
      direction === "down" &&
      paddle.y + paddle.height <= this.state.canvas.height - step
    ) {
      paddle.y += step;
    }
  }
}
