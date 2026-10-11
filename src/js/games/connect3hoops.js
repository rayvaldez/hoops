
export class Connect3Hoops {
  constructor(container) {
    this.container = container;
    this.columns = 5;
    this.rows = 6;
    this.board = [];
    this.currentPlayer = 1;
    this.selectedColumn = 2;
    this.gameOver = false;
    this.busy = false;
  }

  start() {
    this.board = Array.from(
      { length: this.rows },
      () => Array(this.columns).fill(0)
    );

    this.currentPlayer = 1;
    this.selectedColumn = 2;
    this.gameOver = false;
    this.busy = false;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <section class="connect3-screen">
        <h2 class="connect3-title">CONNECT 3 HOOPS</h2>

        <div class="connect3-status">
          <div class="connect3-player player-one ${
            this.currentPlayer === 1 ? "active" : ""
          }">
            PLAYER 1
            <small>HOOP A</small>
          </div>

          <div class="connect3-player player-two ${
            this.currentPlayer === 2 ? "active" : ""
          }">
            PLAYER 2
            <small>HOOP B</small>
          </div>
        </div>

        <p class="connect3-instruction" data-status>
          PLAYER ${this.currentPlayer}: SELECT YOUR COLUMN
        </p>

        <div class="connect3-board">
          <div class="connect3-hoops">
            ${Array.from({ length: this.columns }, (_, c) => `
              <button
                class="connect3-hoop ${
                  c === this.selectedColumn ? "selected" : ""
                }"
                data-column="${c}"
                aria-label="Select column ${c + 1}"
                ${this.busy || this.gameOver ? "disabled" : ""}
              >
                <span class="connect3-hoop-rim"></span>
                <span class="connect3-hoop-net"></span>
              </button>
            `).join("")}
          </div>

          <div class="connect3-grid">
            ${this.board.map((row, r) =>
              row.map((player, c) => `
                <div class="connect3-cell"
                  data-row="${r}" data-col="${c}">
                  ${player ? `
                    <div class="connect3-token player-${player}"></div>
                  ` : ""}
                </div>
              `).join("")
            ).join("")}
          </div>
        </div>

        <div class="connect3-controls">
          <button class="connect3-button"
            data-action="left"
            ${this.busy || this.gameOver ? "disabled" : ""}>
            ◀ LEFT
          </button>

          <button class="connect3-button connect3-shoot"
            data-action="shoot"
            ${this.busy || this.gameOver ? "disabled" : ""}>
            🏀 SHOOT
          </button>

          <button class="connect3-button"
            data-action="right"
            ${this.busy || this.gameOver ? "disabled" : ""}>
            RIGHT ▶
          </button>
        </div>

        <div class="connect3-test-controls">
          <span>PROTOTYPE: </span>
          <button class="connect3-test-button"
            data-action="make"
            ${this.busy || this.gameOver ? "disabled" : ""}>
            Simulate Make
          </button>
          <button class="connect3-test-button"
            data-action="miss"
            ${this.busy || this.gameOver ? "disabled" : ""}>
            Simulate Miss
          </button>
        </div>

        <div class="connect3-result" data-result></div>
      </section>
    `;

    this.bindEvents();
  }

  bindEvents() {
    if (this.handleKeyDown) {
      document.removeEventListener("keydown", this.handleKeyDown);
    }

    this.container.querySelectorAll("[data-column]").forEach(button => {
      button.addEventListener("click", () => {
        if (this.busy || this.gameOver) return;
        this.selectedColumn = Number(button.dataset.column);
        this.render();
      });
    });

    this.container.querySelector('[data-action="left"]')
      .addEventListener("click", () => this.move(-1));

    this.container.querySelector('[data-action="right"]')
      .addEventListener("click", () => this.move(1));

    this.container.querySelector('[data-action="shoot"]')
      .addEventListener("click", () => this.showShotControls());

    this.container.querySelector('[data-action="make"]')
      .addEventListener("click", () => this.resolveShot(true));

    this.container.querySelector('[data-action="miss"]')
      .addEventListener("click", () => this.resolveShot(false));

    this.handleKeyDown = event => {
      if (this.gameOver || this.busy) return;

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        event.preventDefault();

        // Ignore held-key auto-repeat.
        if (event.repeat) return;

        this.move(event.key === "ArrowLeft" ? -1 : 1);
      }
    };

    document.addEventListener("keydown", this.handleKeyDown);
  }

  move(direction) {
    if (this.busy || this.gameOver) return;

    this.selectedColumn = Math.max(
      0,
      Math.min(this.columns - 1, this.selectedColumn + direction)
    );

    this.render();
  }

  showShotControls() {
    if (this.busy || this.gameOver) return;

    const status = this.container.querySelector("[data-status]");
    status.textContent =
      `PLAYER ${this.currentPlayer}: TAKE YOUR SHOT`;

    this.container.querySelector('[data-action="make"]').focus();
  }

async resolveShot(made) {
  if (this.busy || this.gameOver) return;

  this.busy = true;

  const board = this.container.querySelector(".connect3-board");

  // Handle a missed shot
  if (!made) {
    const marker = this.container.querySelector(
      `[data-column="${this.selectedColumn}"]`
    );

    if (board && marker) {
      const boardRect = board.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();

      const ball = document.createElement("div");
      ball.className = "connect3-shot-ball connect3-shot-miss";

      ball.style.left = `${
        markerRect.left + markerRect.width / 2 - boardRect.left
      }px`;

      ball.style.top = `${
        markerRect.top + markerRect.height / 2 - boardRect.top
      }px`;

      ball.style.transform = "translate(-50%, -50%)";

      board.appendChild(ball);

      // Allow the miss animation to play
      await new Promise(resolve => setTimeout(resolve, 500));

      ball.remove();
    }

    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.busy = false;
    this.render();

    const status = this.container.querySelector("[data-status]");
    if (status) {
      status.textContent = "MISS! TURN ENDED.";
    }

    return;
  }

  // Find the landing row
  const row = this.findOpenRow(this.selectedColumn);

  if (row === -1) {
    this.busy = false;
    this.render();

    const status = this.container.querySelector("[data-status]");
    if (status) {
      status.textContent = "COLUMN FULL — SELECT ANOTHER.";
    }

    return;
  }

  // Find the board, hoop marker, and landing cell
  const marker = this.container.querySelector(
    `[data-column="${this.selectedColumn}"]`
  );

  const targetCell = this.container.querySelector(
    `[data-row="${row}"][data-col="${this.selectedColumn}"]`
  );

  if (!board || !marker || !targetCell) {
    this.busy = false;
    return;
  }

  // Measure the positions relative to the board
  const boardRect = board.getBoundingClientRect();
  const markerRect = marker.getBoundingClientRect();
  const cellRect = targetCell.getBoundingClientRect();

  // Start the shot above the selected column
  const topCell = this.container.querySelector(
    `[data-row="0"][data-col="${this.selectedColumn}"]`
  );

  const columnRect = (
    topCell || targetCell
  ).getBoundingClientRect();

  const startX =
    columnRect.left + columnRect.width / 2 - boardRect.left;

  const startY =
    markerRect.top + markerRect.height / 2 - boardRect.top;

  // Calculate the landing position
  const landingX =
    cellRect.left + cellRect.width / 2 - boardRect.left;

  const landingY =
    cellRect.top + cellRect.height / 2 - boardRect.top;

  // Create the basketball
  const ball = document.createElement("div");
  ball.className = "connect3-shot-ball";

  ball.style.left = `${startX}px`;
  ball.style.top = `${startY}px`;
  ball.style.transform = "translate(-50%, -50%)";

  board.appendChild(ball);

  // Animate the ball into the selected cell
  try {
    const animation = ball.animate(
      [
        {
          left: `${startX}px`,
          top: `${startY}px`,
          transform: "translate(-50%, -50%)",
          offset: 0
        },
        {
          left: `${landingX}px`,
          top: `${landingY}px`,
          transform: "translate(-50%, -50%)",
          offset: 0.85
        },
        {
          left: `${landingX}px`,
          top: `${landingY}px`,
          transform: "translate(-50%, -50%)",
          offset: 1
        }
      ],
      {
        duration: 2300,
        easing: "cubic-bezier(0.35, 0, 0.65, 1)",
        fill: "forwards"
      }
    );

    await animation.finished;
  } catch (error) {
    // Continue safely if the animation is cancelled
  } finally {
    ball.remove();
  }

  // Place the token after the animation completes
  const player = this.currentPlayer;
  this.board[row][this.selectedColumn] = player;

  this.render();

  // Check for a win
  if (this.hasWon(row, this.selectedColumn, player)) {
    this.gameOver = true;

    const result = this.container.querySelector("[data-result]");

    if (result) {
      result.innerHTML = `
        <h2>PLAYER ${player} WINS!</h2>
        <button class="connect3-button" data-action="restart">
          PLAY AGAIN
        </button>
      `;

      result
        .querySelector('[data-action="restart"]')
        .addEventListener("click", () => this.start());
    }

    this.busy = false;
    this.renderBoardOnly();
    return;
  }

  // Check for a draw
  if (this.board.every(row => row.every(cell => cell !== 0))) {
    this.gameOver = true;
    this.busy = false;
    this.render();

    const result = this.container.querySelector("[data-result]");

    if (result) {
      result.innerHTML = `
        <h2>IT'S A DRAW!</h2>
        <button class="connect3-button" data-action="restart">
          PLAY AGAIN
        </button>
      `;

      result
        .querySelector('[data-action="restart"]')
        .addEventListener("click", () => this.start());
    }

    return;
  }

  // Switch players and prepare for the next turn
  this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

  this.busy = false;
  this.render();
}

  findOpenRow(column) {
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r][column] === 0) return r;
    }

    return -1;
  }

  hasWon(row, col, player) {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1]
    ];

    return directions.some(([dr, dc]) => {
      let count = 1;

      for (const sign of [-1, 1]) {
        let r = row + dr * sign;
        let c = col + dc * sign;

        while (
          r >= 0 && r < this.rows &&
          c >= 0 && c < this.columns &&
          this.board[r][c] === player
        ) {
          count++;
          r += dr * sign;
          c += dc * sign;
        }
      }

      return count >= 3;
    });
  }

  renderBoardOnly() {
    const result = this.container.querySelector("[data-result]");
    if (result) result.style.display = "block";

    this.container.querySelectorAll("button").forEach(button => {
      if (button.dataset.action !== "restart") {
        button.disabled = true;
      }
    });
  }

  destroy() {
    if (this.handleKeyDown) {
      document.removeEventListener("keydown", this.handleKeyDown);
      this.handleKeyDown = null;
    }
  }
}