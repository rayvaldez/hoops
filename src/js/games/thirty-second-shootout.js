export class ThirtySecondShootout {

  constructor(container) {

      this.container = container;

      this.score = 0;

      this.bestScore =
          Number(localStorage.getItem(
              "shootoutBestScore"
          )) || 0;

      this.timeRemaining = 30;

      this.gameStarted = false;

      this.gameOver = false;

      this.timer = null;

      this.keyHandler = null;
  }

  start() {

      this.renderStartScreen();

  }

  renderStartScreen() {

      this.container.innerHTML = `
          <div class="shootout-screen">

              <h2>30 SECOND SHOOTOUT</h2>

              <div class="shootout-message">
                  Ready?
              </div>

              <button class="shootout-button" data-action="start">
                  START SHOOTOUT
              </button>

          </div>
      `;

      const startButton =
          this.container.querySelector(
              '[data-action="start"]'
          );

      startButton.addEventListener(
          "click",
          () => this.startGame()
      );
  }

  startGame() {

      this.score = 0;

      this.timeRemaining = 30;

      this.gameStarted = false;

      this.gameOver = false;

      this.renderCountdown();

  }

  renderCountdown() {

      this.container.innerHTML = `
          <div class="shootout-screen">

              <h2>30 SECOND SHOOTOUT</h2>

              <div class="shootout-countdown">
                  3
              </div>

          </div>
      `;

      let count = 3;

      const countdown = setInterval(() => {

          count--;

          const display =
              this.container.querySelector(
                  ".shootout-countdown"
              );

          if (!display) {

              clearInterval(countdown);

              return;
          }

          if (count > 0) {

              display.textContent = count;

          } else {

              clearInterval(countdown);

              display.textContent = "GO!";

              setTimeout(() => {

                  this.beginShootout();

              }, 500);
          }

      }, 1000);
  }

  beginShootout() {

      this.score = 0;

      this.timeRemaining = 30;

      this.gameStarted = true;

      this.gameOver = false;

      this.renderGame();

      this.attachEvents();

      this.startTimer();

  }

  renderGame() {

      this.container.innerHTML = `
          <div class="shootout-screen">

              <h2>30 SECOND SHOOTOUT</h2>

              <div class="shootout-stats">

          <div class="shootout-stat">
              <span class="shootout-stat-label">
                  TIME
              </span>

              <span
                  class="shootout-stat-value"
                  data-time
              >
                  30
              </span>
          </div>

          <div class="shootout-stat">
              <span class="shootout-stat-label">
                  SCORE
              </span>

              <span
                  class="shootout-stat-value"
                  data-score
              >
                  0
              </span>
          </div>

          <div class="shootout-stat">
              <span class="shootout-stat-label">
                  BEST
              </span>

              <span
                  class="shootout-stat-value"
                  data-best-score
              >
                  ${this.bestScore}
              </span>
          </div>

        </div>

              <div class="shootout-hoop-area">

                <button
                    class="shootout-hoop"
                    data-shoot
                    aria-label="Shoot"
                >

                    <span class="shootout-backboard"></span>

                    <span class="shootout-rim">
                        <span class="shootout-net"></span>
                    </span>

                </button>

              </div>

              <div class="shootout-instruction">

                  Press
                  <strong>1</strong>
                  to shoot

              </div>

          </div>
      `;
  }

  attachEvents() {

      this.keyHandler = (event) => {

          if (event.key === "1") {

              this.registerShot();

          }

      };

      document.addEventListener(
          "keydown",
          this.keyHandler
      );

      const hoop =
          this.container.querySelector(
              "[data-shoot]"
          );

      hoop.addEventListener(
          "click",
          () => this.registerShot()
      );
  }

  registerShot() {

      if (!this.gameStarted || this.gameOver) {

          return;
      }

      this.score++;

      this.updateDisplay();

      this.animateShot();
  }

  animateShot() {

    const hoop =
        this.container.querySelector(
            ".shootout-hoop"
        );

    const hoopArea =
        this.container.querySelector(
            ".shootout-hoop-area"
        );

    if (!hoop || !hoopArea) {

        return;
    }

    const ball =
        document.createElement("div");

    ball.classList.add("shootout-ball");

    hoopArea.appendChild(ball);

    ball.style.position = "absolute";

    ball.style.left = "50%";

    ball.style.top = "100%";

    ball.style.transform =
        "translate(-50%, -50%)";

    ball.style.zIndex = "4";

    void ball.offsetWidth;

    // Ball travels upward in front of the hoop

    ball.style.transition =
        "top 0.55s ease-in, transform 0.55s ease-in";

    ball.style.top = "48%";

    ball.style.transform =
        "translate(-50%, -50%) scale(0.9)";

        setTimeout(() => {

          // Ball has reached the rim.
          // Flash the hoop as the shot goes in.
      
          hoop.classList.remove("score-flash");
      
          void hoop.offsetWidth;
      
          hoop.classList.add("score-flash");
      
          // Move the ball behind the net.
      
          ball.style.zIndex = "1";
      
          ball.style.transition =
              "top 0.4s ease-in";
      
          ball.style.top = "70%";
      
          setTimeout(() => {
      
              hoop.classList.remove("score-flash");
      
          }, 350);
      
      }, 550);

    setTimeout(() => {

        ball.remove();

    }, 1000);
}

  updateDisplay() {

      const scoreDisplay =
          this.container.querySelector(
              "[data-score]"
          );

      if (scoreDisplay) {

          scoreDisplay.textContent =
              this.score;
      }
  }

  startTimer() {

    this.timer = setInterval(() => {

        this.timeRemaining--;

        const timeDisplay =
            this.container.querySelector(
                "[data-time]"
            );

        if (timeDisplay) {

            timeDisplay.textContent =
                this.timeRemaining;

            timeDisplay.classList.remove(
                "timer-warning",
                "timer-danger"
            );

            if (this.timeRemaining <= 5) {

                timeDisplay.classList.add(
                    "timer-danger"
                );

            } else if (this.timeRemaining <= 10) {

                timeDisplay.classList.add(
                    "timer-warning"
                );

            }

        }

        if (this.timeRemaining <= 0) {

            this.endGame();

        }

    }, 1000);
}

  endGame() {

    this.gameOver = true;

    this.gameStarted = false;

    clearInterval(this.timer);

    this.timer = null;

    this.removeEvents();

    const newHighScore =
      this.score > this.bestScore;

    if (newHighScore) {

        this.bestScore = this.score;

        localStorage.setItem(
            "shootoutBestScore",
            this.bestScore
        );

    }

    this.renderGameOver(newHighScore);

  }

  renderGameOver(newHighScore = false) {

      this.container.innerHTML = `
          <div class="shootout-screen">

              <h2>TIME!</h2>

              <div class="shootout-message">
                  FINAL SCORE
              </div>

              <div class="shootout-score">
                  ${this.score}
              </div>

              <div class="shootout-best">
                  BEST: ${this.bestScore}
              </div>

              ${newHighScore ? `
                  <div class="shootout-new-record">
                      NEW HIGH SCORE!
                  </div>
              ` : ""}
              
              <div class="game-over-buttons">

                  <button
                      class="shootout-button"
                      data-action="play-again"
                  >
                      PLAY AGAIN
                  </button>

              </div>

          </div>
      `;

      const playAgainButton =
          this.container.querySelector(
              '[data-action="play-again"]'
          );

      playAgainButton.addEventListener(
          "click",
          () => this.startGame()
      );
  }

  removeEvents() {

      if (this.keyHandler) {

          document.removeEventListener(
              "keydown",
              this.keyHandler
          );

          this.keyHandler = null;
      }
  }

  destroy() {

      clearInterval(this.timer);

      this.timer = null;

      this.removeEvents();
  }
}