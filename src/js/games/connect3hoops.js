
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
      const cells = this.board.map((row, r) => `
          ${row.map((player, c) => `
              <div class="connect3-cell">
                  ${player
                      ? `<div class="connect3-token player-${player}"></div>`
                      : ""}
              </div>
          `).join("")}
      `).join("");

      this.container.innerHTML = `
          <section class="connect3-screen">
              <h2 class="connect3-title">CONNECT 3 HOOPS</h2>

              <div class="connect3-status">
                  <div class="connect3-player player-one
                      ${this.currentPlayer === 1 ? "active" : ""}">
                      PLAYER 1
                      <small>HOOP A</small>
                  </div>

                  <div class="connect3-player player-two
                      ${this.currentPlayer === 2 ? "active" : ""}">
                      PLAYER 2
                      <small>HOOP B</small>
                  </div>
              </div>

              <p class="connect3-instruction" data-status>
                  PLAYER ${this.currentPlayer}: SELECT YOUR COLUMN
              </p>

              <div class="connect3-board">
                  <div class="connect3-column-markers">
                      ${Array.from({ length: this.columns }, (_, c) => `
                          <button
                              class="connect3-marker
                                  ${c === this.selectedColumn ? "selected" : ""}"
                              data-column="${c}"
                              aria-label="Select column ${c + 1}"
                              ${this.busy || this.gameOver ? "disabled" : ""}
                          >
                              ${c === this.selectedColumn ? "▼" : "·"}
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

      this.keyHandler = event => {
          if (this.busy || this.gameOver) return;

          if (event.key === "ArrowLeft") {
              event.preventDefault();
              this.move(-1);
          } else if (event.key === "ArrowRight") {
              event.preventDefault();
              this.move(1);
          }
      };

      document.addEventListener("keydown", this.keyHandler);
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

      if (!made) {
          this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
          this.busy = false;
          this.render();

          this.container.querySelector("[data-status]").textContent =
              "MISS! TURN ENDED.";

          return;
      }

      const row = this.findOpenRow(this.selectedColumn);

      if (row === -1) {
          this.busy = false;
          this.render();

          this.container.querySelector("[data-status]").textContent =
              "COLUMN FULL — SELECT ANOTHER.";

          return;
      }

      const player = this.currentPlayer;

      this.board[row][this.selectedColumn] = player;
      this.render();

      const cell = this.container.querySelector(
          `[data-row="${row}"][data-col="${this.selectedColumn}"]`
      );

      const token = cell?.querySelector(".connect3-token");

      if (token) {
          token.classList.add("falling");
          await new Promise(resolve => setTimeout(resolve, 450));
          token.classList.remove("falling");
      }

      if (this.hasWon(row, this.selectedColumn, player)) {
          this.gameOver = true;

          const result = this.container.querySelector("[data-result]");
          result.innerHTML = `
              <h2>PLAYER ${player} WINS!</h2>
              <button class="connect3-button" data-action="restart">
                  PLAY AGAIN
              </button>
          `;

          result.querySelector('[data-action="restart"]')
              .addEventListener("click", () => this.start());

          this.busy = false;
          this.renderBoardOnly();
          return;
      }

      if (this.board.every(row => row.every(cell => cell !== 0))) {
          this.gameOver = true;
          this.busy = false;
          this.render();

          this.container.querySelector("[data-result]").innerHTML = `
              <h2>IT'S A DRAW!</h2>
              <button class="connect3-button" data-action="restart">
                  PLAY AGAIN
              </button>
          `;

          this.container.querySelector('[data-action="restart"]')
              .addEventListener("click", () => this.start());

          return;
      }

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
      if (this.keyHandler) {
          document.removeEventListener("keydown", this.keyHandler);
      }
  }
}