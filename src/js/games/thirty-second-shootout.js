import { ArduinoSensor } from "../arduino-sensor.js";

export class ThirtySecondShootout {



  constructor(container, sharedSensor = null, onBackToMenu) {

      this.container = container;

      this.onBackToMenu = onBackToMenu;

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

      this.ownsSensor = !sharedSensor;

        this.sensor = sharedSensor ?? new ArduinoSensor({
            onShot: () => this.registerShot(),
            onStatusChange: message => {
                const status = this.container.querySelector(
                    "[data-arduino-status]"
                );

                if (status) {
                    status.textContent = message;
                }
            }
        });

  }



  start() {

      this.renderStartScreen();

  }

  connectArduino() {
    return this.sensor.connect();
}

  renderStartScreen() {

      this.container.innerHTML = `

          <div class="shootout-screen">

              <h2>30 SECOND SHOOTOUT</h2>

              <button class="shootout-button" data-action="start">

                  START SHOOTOUT

              </button>

              <button id="back-to-menu">Back to Menu</button>

          </div>

      `;

      const backButton = this.container.querySelector("#back-to-menu");

        if (backButton) {
            backButton.addEventListener("click", () => {
                this.onBackToMenu?.();
            });
        }

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

      this.countdownAudio();

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

  thirtySecondAudio() {

      const thirtySecond = new Audio("src/assets/audio/30s-left.mp3");

      thirtySecond.play();

      thirtySecond.volume = 0.5;
      setTimeout(() => {
            const fadeDuration = 1000; // Fade out over 1000 milliseconds (1 second)
            const intervalTime = 50;   // Lower volume every 50ms for smoothness
            const steps = fadeDuration / intervalTime;
            const volumeDecrease = thirtySecond.volume / steps;

            const fadeInterval = setInterval(() => {
                if (thirtySecond.volume > volumeDecrease) {
                    thirtySecond.volume -= volumeDecrease;
                } else {
                    // 3. Fully stop once volume hits zero
                    clearInterval(fadeInterval);
                    thirtySecond.pause();
                    thirtySecond.currentTime = 0; 
                    thirtySecond.volume = 1; // Reset volume back to full for the next time it plays
                }
            }, intervalTime);

        }, 29000); // 30000ms (29s) full volume + 1000ms (1s) fade = 31 seconds total

  }

  beginShootout() {

      this.score = 0;

      this.timeRemaining = 30;

      this.gameStarted = true;

      this.gameOver = false;

      this.renderGame();

      this.attachEvents();

      this.startTimer();

      this.thirtySecondAudio();

  }

  renderGame() {

      this.container.innerHTML = `

          <div class="shootout-screen">

            <div class="arena-scoreboard-values" aria-label="Live scoreboard">

              <div class="arena-value arena-score">

                  <span data-score>0</span>

              </div>

              <div class="arena-value arena-time">

                  <span data-time>30</span>

              </div>

              <div class="arena-value arena-best">

                  <span data-best-score>${this.bestScore}</span>

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

            </div>

      `;

  }

    attachEvents() {

        this.keyHandler = (event) => {

            if (event.key === "1") {

                this.registerShot();

            }

        };

        document.addEventListener("keydown", this.keyHandler);

        const hoop = this.container.querySelector("[data-shoot]");

        if (hoop) {

            hoop.addEventListener("click", () => this.registerShot());

        }

        if (this.connectButton) {

            this.connectButton.addEventListener(

                "click",

                () => void this.sensor.connect()

            );

        }

    }

  registerShot() {

      if (!this.gameStarted || this.gameOver) {

          return;

      }

      this.score++;

      this.updateDisplay();

      this.flashScore();

      this.animateShot();
      this.scoreAudio();
      this.cheerAudio();

  }

  scoreAudio() {

      const bucket = new Audio("src/assets/audio/bucket.mp3");

      bucket.volume = 0.5;
        bucket.play().catch(error => {
            console.error("Audio playback failed:", error);
        });

  }

  countdownAudio() {

      const countdown = new Audio("src/assets/audio/countdown.mp3");

      countdown.play();

      countdown.volume = 0.5;
        countdown.play().catch(error => {
            console.error("Audio playback failed:", error);
        });

      setTimeout(() => {
            const fadeDuration = 1000; // Fade out over 1000 milliseconds (1 second)
            const intervalTime = 50;   // Lower volume every 50ms for smoothness
            const steps = fadeDuration / intervalTime;
            const volumeDecrease = countdown.volume / steps;

            const fadeInterval = setInterval(() => {
                if (countdown.volume > volumeDecrease) {
                    countdown.volume -= volumeDecrease;
                } else {
                    // 3. Fully stop once volume hits zero
                    clearInterval(fadeInterval);
                    countdown.pause();
                    countdown.currentTime = 0; 
                    countdown.volume = 1; // Reset volume back to full for the next time it plays
                }
            }, intervalTime);

        }, 2000); // 30000ms (2s) full volume + 1000ms (1s) fade = 31 seconds total  

  }

  cheerAudio() {

      const cheer = new Audio("src/assets/audio/cheer.mp3");

        // 1. Reset volume to maximum and play
        cheer.volume = 0.5;
        cheer.play();

        // 2. Start the fade-out 1 second before the 4-second limit
        // (Starts fading at 3.0s, hits total silence at exactly 4.0s)
        setTimeout(() => {
            const fadeDuration = 1000; // Fade out over 1000 milliseconds (1 second)
            const intervalTime = 50;   // Lower volume every 50ms for smoothness
            const steps = fadeDuration / intervalTime;
            const volumeDecrease = cheer.volume / steps;

            const fadeInterval = setInterval(() => {
                if (cheer.volume > volumeDecrease) {
                    cheer.volume -= volumeDecrease;
                } else {
                    // 3. Fully stop once volume hits zero
                    clearInterval(fadeInterval);
                    cheer.pause();
                    cheer.currentTime = 0; 
                    cheer.volume = 1; // Reset volume back to full for the next time it plays
                }
            }, intervalTime);

        }, 3000); // 3000ms (3s) full volume + 1000ms (1s) fade = 4 seconds total

  }

  animateShot() {

    const hoop = this.container.querySelector(".shootout-hoop");

    const hoopArea = this.container.querySelector(".shootout-hoop-area");

    if (!hoop || !hoopArea) return;

    const ball = document.createElement("div");

    ball.classList.add("shootout-ball");

    hoopArea.appendChild(ball);

    // Measure the hoop relative to its animation area.

    const areaRect = hoopArea.getBoundingClientRect();

    const hoopRect = hoop.getBoundingClientRect();

    const hoopCenterX =

        hoopRect.left + hoopRect.width / 2 - areaRect.left;

    const hoopCenterY =

        hoopRect.top + hoopRect.height / 2 - areaRect.top;

    // Start below the hoop and travel toward the rim.

    const startY = areaRect.height * 0.95;

    const rimY = hoopCenterY;

    ball.style.position = "absolute";

    ball.style.left = `${hoopCenterX}px`;

    ball.style.top = `${startY}px`;

    ball.style.transform = "translate(-50%, -50%)";

    ball.style.zIndex = "4";


    void ball.offsetWidth;

    ball.style.transition =

        "top 0.55s ease-in, transform 0.55s ease-in";

    ball.style.top = `${rimY}px`;

    ball.style.transform = "translate(-50%, -50%) scale(0.9)";

    setTimeout(() => {

        // Flash the hoop as the shot reaches the rim.

        hoop.classList.remove("score-flash");

        void hoop.offsetWidth;

        hoop.classList.add("score-flash");

        // Ball drops behind the net.

        ball.style.zIndex = "1";

        ball.style.transition = "top 0.4s ease-in";

        ball.style.top = `${rimY + 50}px`;

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

    clearInterval(this.timer);

    this.timer = setInterval(() => {

        this.timeRemaining--;

        const timeDisplay = this.container.querySelector("[data-time]");

        if (timeDisplay) {

            timeDisplay.textContent = this.timeRemaining;

        }

        const timePanel = this.container.querySelector(".arena-time");

        if (timePanel) {

            timePanel.classList.toggle(

                "timer-warning",

                this.timeRemaining <= 10 && this.timeRemaining > 5

            );

            timePanel.classList.toggle(

                "timer-danger",

                this.timeRemaining <= 5

            );

        }

        if (this.timeRemaining <= 0) {

            this.timeRemaining = 0;

            if (timeDisplay) {

                timeDisplay.textContent = "0";

            }

            clearInterval(this.timer);

            this.endGame();

        }

    }, 1000);

}

  flashScore() {

    const scorePanel = this.container.querySelector(".arena-score");

    if (!scorePanel) return;


    scorePanel.classList.remove("score-flash");

    // Force the animation to restart for rapid consecutive shots

    void scorePanel.offsetWidth;


    scorePanel.classList.add("score-flash");


    setTimeout(() => {

        scorePanel.classList.remove("score-flash");

    }, 350);

  }

  flashTimer() {

    const timer = this.container.querySelector(".arena-time");

    if (!timer) return;

    timer.classList.remove("timer-flash");

    // Restart the flash animation

    void timer.offsetWidth;

    timer.classList.add("timer-flash");

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
      
      <div class="shootout-screen shootout-game-over">
      
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

        <button id="back-to-menu">Back to Menu</button>
        
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

         const backButton = this.container.querySelector("#back-to-menu");

            if (backButton) {
                backButton.addEventListener("click", () => {
                    this.onBackToMenu?.();
                });
            }
        
        
        this.buzzerAudio();
        this.cheerEndAudio();

  }

  cheerEndAudio() {

      const cheerEnd = new Audio("src/assets/audio/cheer.mp3");

      cheerEnd.play();

      cheerEnd.volume = 0.5;
        cheerEnd.play().catch(error => {
            console.error("Audio playback failed:", error);
        });

  } 

  buzzerAudio() {

      const buzzer = new Audio("src/assets/audio/buzzer.mp3");

      buzzer.volume = 0.6;
        buzzer.play().catch(error => {
            console.error("Audio playback failed:", error);
        });

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

  async destroy() {
    clearInterval(this.timer);
    this.timer = null;

    this.removeEvents();

    // The app owns the shared sensor, so leaving a game
    // must not disconnect it.
    if (this.ownsSensor) {
        await this.sensor.disconnect();
    }
  }

}