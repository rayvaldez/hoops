
export class HeadToHeadShootout {
  constructor(container, arduinoSensor = null) {
    this.container = container;
    this.arduinoSensor = arduinoSensor;

    this.scores = { 1: 0, 2: 0 };
    this.timeRemaining = 30;
    this.timerInterval = null;
    this.gameStarted = false;
    this.gameOver = false;
    this.hoopTimeouts = [];

    this.render();
    this.cacheElements();
    this.bindControls();
    this.updateDisplay();

    this.handleKeyboardShot = this.handleKeyboardShot.bind(this);
    document.addEventListener('keydown', this.handleKeyboardShot);
  }

  render() {
    this.container.innerHTML = `
      <section class="head-to-head-game tug-game"
               aria-label="Head to Head Shootout">

        <header class="tug-header">
          <div>
            <h3>Head to Head Shootout</h3>
            <p class="tug-subtitle">
              Shoot as many baskets as you can in 30 seconds!
            </p>
          </div>

          <div class="tug-round-badge">
            <span class="tug-status-dot"></span>
            <span data-game-status>READY TO PLAY</span>
          </div>
        </header>

        <div class="tug-arena head-to-head-arena"
             data-shootout-arena>

          <div class="tug-player tug-player--one">
            <span class="tug-player-number">PLAYER 1</span>
            <h2>Blue Team</h2>
            <div class="tug-score" data-score="1">0</div>
            <span class="tug-player-hint">Shoot at your hoop!</span>
          </div>

          <div class="tug-player tug-player--two">
            <span class="tug-player-number">PLAYER 2</span>
            <h2>Orange Team</h2>
            <div class="tug-score" data-score="2">0</div>
            <span class="tug-player-hint">Shoot at your hoop!</span>
          </div>

          <!-- Central shot clock replaces the rope -->
          <div class="head-to-head-clock-area">
            <span class="head-to-head-clock-label">TIME REMAINING</span>

            <div class="head-to-head-clock"
                 data-shot-clock
                 aria-live="off">
              30
            </div>

            <span class="head-to-head-clock-caption"
                  data-clock-caption>
              SECONDS
            </span>
          </div>

          <!-- The same two basketball hoops as Hoops of War -->
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

          <!-- Start and result overlay -->
          <div class="tug-overlay" data-game-overlay>
            <div class="tug-overlay-card">
              <span class="tug-overlay-icon"
                    data-overlay-icon>🏀</span>

              <p class="tug-eyebrow"
                 data-overlay-eyebrow>READY?</p>

              <h2 data-overlay-title>
                Head to Head Shootout
              </h2>

              <p data-overlay-message>
                You have 30 seconds to score as many baskets
                as possible. The player with the highest score wins!
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
              Both players shoot simultaneously. Every basket counts!
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
    this.arena = this.container.querySelector(
      "[data-shootout-arena]"
    );

    this.status = this.container.querySelector(
      "[data-game-status]"
    );

    this.overlay = this.container.querySelector(
      "[data-game-overlay]"
    );

    this.startButton = this.container.querySelector(
      "[data-start-game]"
    );

    this.resetButton = this.container.querySelector(
      "[data-reset-game]"
    );

    this.clock = this.container.querySelector(
      "[data-shot-clock]"
    );

    this.clockCaption = this.container.querySelector(
      "[data-clock-caption]"
    );
  }

  bindControls() {
    this.startButton.addEventListener("click", () => {
      this.startGame();
    });

    this.resetButton.addEventListener("click", () => {
      this.resetGame();
    });
  }

  handleKeyboardShot(event) {
    if (!this.gameStarted) return;
    if (event.repeat) return;

    // Don't trigger shots while typing in form fields
    const target = event.target;
    if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
    ) {
        return;
    }

    const key = event.key.toLowerCase();

    if (key === 'a') {
        event.preventDefault();
        this.registerShot(1);
    } else if (key === 'l') {
        event.preventDefault();
        this.registerShot(2);
    }
}

  start() {
    this.resetGame();
  }

  startGame() {
    if (this.gameStarted) return;

    this.clearTimer();

    this.scores = { 1: 0, 2: 0 };
    this.timeRemaining = 30;
    this.gameStarted = true;
    this.gameOver = false;

    this.overlay.classList.add("is-hidden");
    this.status.textContent = "GAME IN PROGRESS";

    this.updateDisplay();

    // Start the 30-second countdown.
    this.timerInterval = window.setInterval(() => {
      this.timeRemaining--;

      this.updateDisplay();

      if (this.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  /**
   * Call this when a player-specific Arduino shot event arrives.
   *
   * Player 1: registerShot(1) from SHOT_A
   * Player 2: registerShot(2) from SHOT_B
   */
  registerShot(player) {
    if (!this.gameStarted || this.gameOver) return;
    if (player !== 1 && player !== 2) return;

    this.scores[player]++;

    this.flashHoop(player);
    this.updateDisplay();
  }

  flashHoop(player) {
    const hoop = this.container.querySelector(
      `[data-hoop="${player}"]`
    );

    if (!hoop) return;

    hoop.classList.remove("is-scoring");

    // Restart the animation if another basket arrives quickly.
    void hoop.offsetWidth;
    hoop.classList.add("is-scoring");

    const timeout = window.setTimeout(() => {
      hoop.classList.remove("is-scoring");
    }, 1400);

    this.hoopTimeouts.push(timeout);
  }

  updateDisplay() {
    this.container.querySelector('[data-score="1"]').textContent =
      this.scores[1];

    this.container.querySelector('[data-score="2"]').textContent =
      this.scores[2];

    this.clock.textContent = this.timeRemaining;

    this.clock.classList.remove(
      "is-warning",
      "is-danger",
      "is-last-second"
    );

    if (this.timeRemaining <= 10 && this.timeRemaining > 5) {
      this.clock.classList.add("is-warning");
    } else if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
      this.clock.classList.add("is-danger");
      this.clock.style.setProperty(
        "--clock-urgency",
        `${6 - this.timeRemaining}`
      );
    } else if (this.timeRemaining === 0) {
      this.clock.classList.add("is-last-second");
    }

    this.clockCaption.textContent =
      this.timeRemaining === 1 ? "SECOND" : "SECONDS";
  }

  endGame() {
    if (this.gameOver) return;

    this.clearTimer();

    this.gameStarted = false;
    this.gameOver = true;
    this.timeRemaining = 0;

    this.status.textContent = "GAME OVER";

    this.updateDisplay();

    let title;
    let message;

    if (this.scores[1] > this.scores[2]) {
      title = "Blue Team Wins!";
    } else if (this.scores[2] > this.scores[1]) {
      title = "Orange Team Wins!";
    } else {
      title = "It's a Tie!";
      message = `Both teams scored ${this.scores[1]} baskets!`;
    }

    this.container.querySelector(
      "[data-overlay-icon]"
    ).textContent = this.scores[1] === this.scores[2] ? "🤝" : "🏆";

    this.container.querySelector(
      "[data-overlay-eyebrow]"
    ).textContent = "TIME'S UP!";

    this.container.querySelector(
      "[data-overlay-title]"
    ).textContent = title;

    this.container.querySelector(
      "[data-overlay-message]"
    ).textContent =
      `Final score: ${this.scores[1]} – ${this.scores[2]}`;

    this.startButton.textContent = "PLAY AGAIN";
    this.overlay.classList.remove("is-hidden");
  }

  clearTimer() {
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetGame() {
    this.clearTimer();

    this.scores = { 1: 0, 2: 0 };
    this.timeRemaining = 30;
    this.gameStarted = false;
    this.gameOver = false;

    this.status.textContent = "READY TO PLAY";
    this.startButton.textContent = "START GAME";

    this.container.querySelector(
      "[data-overlay-icon]"
    ).textContent = "🏀";

    this.container.querySelector(
      "[data-overlay-eyebrow]"
    ).textContent = "READY?";

    this.container.querySelector(
      "[data-overlay-title]"
    ).textContent = "Head to Head Shootout";

    this.container.querySelector(
      "[data-overlay-message]"
    ).textContent =
      "You have 30 seconds to score as many baskets as possible. The player with the highest score wins!";

    this.overlay.classList.remove("is-hidden");

    this.clock.classList.remove(
      "is-warning",
      "is-danger",
      "is-last-second"
    );

    this.clock.style.removeProperty("--clock-urgency");

    this.container.querySelectorAll(".tug-hoop-zone").forEach((hoop) => {
      hoop.classList.remove("is-scoring");
    });

    this.hoopTimeouts.forEach((timeout) => {
      window.clearTimeout(timeout);
    });

    this.hoopTimeouts = [];

    this.updateDisplay();
  }

  destroy() {
    this.clearTimer();

    document.removeEventListener('keydown', this.handleKeyboardShot);

    this.hoopTimeouts.forEach((timeout) => {
      window.clearTimeout(timeout);
    });

    this.hoopTimeouts = [];

    // The Arduino sensor is shared with the rest of the app.
    // Do not disconnect it here.

    this.container.innerHTML = "";
  }
}
