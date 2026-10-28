export class HoopsOfWar {
  constructor(container, arduinoSensor) {
    this.container = container;
    this.arduinoSensor = arduinoSensor;

    this.scores = { 1: 0, 2: 0 };
    this.position = 0;
    this.gameStarted = false;
    this.gameOver = false;

    this.render();
    this.cacheElements();
    this.bindControls();
    this.updateDisplay();
  }

  render() {
    this.container.innerHTML = `
      <section class="tug-game" aria-label="Hoops of War">
        <header class="tug-header">
          <div>
            <p class="tug-eyebrow">HOOPS ARENA · ARCADE MODE</p>
            <h1>Hoops of War</h1>
            <p class="tug-subtitle">
              Score baskets to pull the rope to your side!
            </p>
          </div>

          <div class="tug-round-badge">
            <span class="tug-status-dot"></span>
            <span data-game-status>READY TO PLAY</span>
          </div>
        </header>

        <div class="tug-arena" data-tug-arena>
          <div class="tug-player tug-player--one">
            <span class="tug-player-number">PLAYER 1</span>
            <h2>Blue Team</h2>
            <div class="tug-score" data-score="1">0</div>
            <span class="tug-player-hint">Shoot to pull left</span>
          </div>

          <div class="tug-player tug-player--two">
            <span class="tug-player-number">PLAYER 2</span>
            <h2>Orange Team</h2>
            <div class="tug-score" data-score="2">0</div>
            <span class="tug-player-hint">Shoot to pull right</span>
          </div>

          <div class="tug-rope-area">
            <div class="tug-rope">
              <div class="tug-rope-strands"></div>
              <div class="tug-rope-center" data-rope-marker>
                <span class="tug-center-flag">⚑</span>
              </div>
            </div>

            <div class="tug-progress">
              <div class="tug-progress-side tug-progress-side--one">
                <span class="tug-end-label">P1</span>
                <div class="tug-progress-steps" data-progress="1">
                  <span class="tug-step" data-step="1"></span>
                  <span class="tug-step" data-step="2"></span>
                  <span class="tug-step" data-step="3"></span>
                  <span class="tug-step tug-step--win" data-step="4"></span>
                </div>
              </div>

              <span class="tug-progress-center">CENTRE</span>

              <div class="tug-progress-side tug-progress-side--two">
                <div class="tug-progress-steps" data-progress="2">
                  <span class="tug-step" data-step="1"></span>
                  <span class="tug-step" data-step="2"></span>
                  <span class="tug-step" data-step="3"></span>
                  <span class="tug-step tug-step--win" data-step="4"></span>
                </div>
                <span class="tug-end-label">P2</span>
              </div>
            </div>
          </div>

          <div class="tug-hoops">
            <div class="tug-hoop-zone tug-hoop-zone--one"
                 data-hoop="1">
              <div class="tug-hoop-glow"></div>
              <div class="tug-backboard"></div>
              <div class="tug-hoop">
                <div class="tug-net"></div>
              </div>
              <div class="tug-hoop-base"></div>
              <span class="tug-hoop-label">PLAYER 1 HOOP</span>
              <span class="tug-score-feedback"
                    data-feedback="1"
                    aria-live="polite">BASKET!</span>
            </div>

            <div class="tug-hoop-zone tug-hoop-zone--two"
                 data-hoop="2">
              <div class="tug-hoop-glow"></div>
              <div class="tug-backboard"></div>
              <div class="tug-hoop">
                <div class="tug-net"></div>
              </div>
              <div class="tug-hoop-base"></div>
              <span class="tug-hoop-label">PLAYER 2 HOOP</span>
              <span class="tug-score-feedback"
                    data-feedback="2"
                    aria-live="polite">BASKET!</span>
            </div>
          </div>

          <div class="tug-overlay" data-game-overlay>
            <div class="tug-overlay-card">
              <span class="tug-overlay-icon" data-overlay-icon>🏀</span>
              <p class="tug-eyebrow" data-overlay-eyebrow>READY?</p>
              <h2 data-overlay-title>Hoops of War</h2>
              <p data-overlay-message>
                Score baskets to pull the flag to your side.
                Four steps wins!
              </p>
              <button class="tug-button"
                      type="button"
                      data-start-game>
                START GAME
              </button>
            </div>
          </div>
        </div>

        <footer class="tug-footer">
          <div class="tug-footer-tip">
            <span class="tug-tip-icon">🏀</span>
            <span>
              Every basket pulls the rope one step toward your team.
            </span>
          </div>

          <button class="tug-button tug-button--secondary"
                  type="button"
                  data-reset-game>
            RESET
          </button>
        </footer>
      </section>
    `;
  }

  cacheElements() {
    this.arena = this.container.querySelector("[data-tug-arena]");
    this.status = this.container.querySelector("[data-game-status]");
    this.overlay = this.container.querySelector("[data-game-overlay]");
    this.startButton = this.container.querySelector("[data-start-game]");
    this.resetButton = this.container.querySelector("[data-reset-game]");
  }

  bindControls() {
    this.startButton.addEventListener("click", () => {
      this.startGame();
    });

    this.resetButton.addEventListener("click", () => {
      this.resetGame();
    });
  }

  start() {
    this.resetGame();
  }

  startGame() {
    if (this.gameOver) {
      this.resetGame();
    }

    this.gameStarted = true;
    this.gameOver = false;

    this.overlay.classList.add("is-hidden");
    this.status.textContent = "GAME IN PROGRESS";

    // Arduino shot events will be connected once the existing
    // arduino-sensor.js event API has been checked.
  }

  scorePoint(player) {
    if (!this.gameStarted || this.gameOver) return;
    if (player !== 1 && player !== 2) return;

    this.scores[player]++;

    if (player === 1) {
      this.position = Math.max(-4, this.position - 1);
    } else {
      this.position = Math.min(4, this.position + 1);
    }

    this.flashHoop(player);
    this.updateDisplay();

    if (this.position === -4) {
      this.finishGame(1);
    } else if (this.position === 4) {
      this.finishGame(2);
    }
  }

  flashHoop(player) {
    const hoop = this.container.querySelector(
      `[data-hoop="${player}"]`
    );

    if (!hoop) return;

    hoop.classList.remove("is-scoring");

    // Restart the animation if the hoop scores again quickly.
    void hoop.offsetWidth;
    hoop.classList.add("is-scoring");

    window.setTimeout(() => {
      hoop.classList.remove("is-scoring");
    }, 1400);
  }

  updateDisplay() {
    this.container.querySelector('[data-score="1"]').textContent =
      this.scores[1];

    this.container.querySelector('[data-score="2"]').textContent =
      this.scores[2];

    // Centre is 50%. Each step moves the flag by 12.5%.
    const markerPosition = 50 + this.position * 12.5;

    this.arena.style.setProperty(
      "--tug-rope-position",
      `${markerPosition}%`
    );

    this.container
      .querySelectorAll('[data-progress="1"] .tug-step')
      .forEach((step) => {
        step.classList.toggle(
          "is-active",
          Number(step.dataset.step) <= Math.max(0, -this.position)
        );
      });

    this.container
      .querySelectorAll('[data-progress="2"] .tug-step')
      .forEach((step) => {
        step.classList.toggle(
          "is-active",
          Number(step.dataset.step) <= Math.max(0, this.position)
        );
      });
  }

  finishGame(player) {
    this.gameStarted = false;
    this.gameOver = true;
    this.status.textContent = "GAME OVER";

    const team = player === 1 ? "Blue Team" : "Orange Team";

    this.container.querySelector("[data-overlay-icon]").textContent = "🏆";
    this.container.querySelector("[data-overlay-eyebrow]").textContent =
      "WINNER!";

    this.container.querySelector("[data-overlay-title]").textContent =
      `${team} Wins!`;

    this.container.querySelector("[data-overlay-message]").textContent =
      `Final score: ${this.scores[1]} – ${this.scores[2]}`;

    this.startButton.textContent = "PLAY AGAIN";
    this.overlay.classList.remove("is-hidden");
  }

  resetGame() {
    this.scores = { 1: 0, 2: 0 };
    this.position = 0;
    this.gameStarted = false;
    this.gameOver = false;

    this.status.textContent = "READY TO PLAY";
    this.startButton.textContent = "START GAME";

    this.container.querySelector("[data-overlay-icon]").textContent = "🏀";

    this.container.querySelector("[data-overlay-eyebrow]").textContent =
      "READY?";

    this.container.querySelector("[data-overlay-title]").textContent =
      "Hoops of War";

    this.container.querySelector("[data-overlay-message]").textContent =
      "Score baskets to pull the flag to your side. Four steps wins!";

    this.overlay.classList.remove("is-hidden");

    this.container.querySelectorAll(".tug-hoop-zone").forEach((hoop) => {
      hoop.classList.remove("is-scoring");
    });

    this.updateDisplay();
  }

  destroy() {
    this.container.innerHTML = "";
  }
}