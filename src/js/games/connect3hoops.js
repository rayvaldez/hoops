import { ArduinoSensor } from "../arduino-sensor.js";



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
    this.turnSeconds = 8;
    this.turnTimer = null;
    this.sensor = new ArduinoSensor({
      onShot: () => {
        if (!this.busy && !this.gameOver) void this.resolveShot(true);
      },
      onStatusChange: message => {
        const status = this.container.querySelector("[data-arduino-status]");
        const button = this.container.querySelector('[data-action="connect-arduino"]');
        if (status) status.textContent = message;
        if (button) {
          button.disabled = this.sensor.connected;
          button.textContent = this.sensor.connected ? "ARDUINO CONNECTED" : "CONNECT ARDUINO";
        }
        if (this.sensor.connected && !this.turnTimer && !this.gameOver) this.startTurnClock();
      }
    });

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
    this.startTurnClock();

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

          <div class="connect3-animation-layer"></div>



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



          <button class="connect3-button"

            data-action="right"

            ${this.busy || this.gameOver ? "disabled" : ""}>

            RIGHT ▶

          </button>

        </div>



        <div class="connect3-turn-clock" aria-live="polite">
          Time left: <strong data-turn-time>8</strong>s
        </div>
        <div class="arduino-controls">
          <button class="connect3-button" data-action="connect-arduino" type="button">CONNECT ARDUINO</button>
          <span data-arduino-status role="status">Arduino not connected</span>
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



    const connectButton = this.container.querySelector('[data-action="connect-arduino"]');
    if (connectButton) connectButton.addEventListener("click", () => void this.sensor.connect());

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



  startTurnClock() {
    clearInterval(this.turnTimer);
    if (this.gameOver || !this.sensor.connected) return;
    this.turnSeconds = 8;
    const display = () => {
      const node = this.container.querySelector("[data-turn-time]");
      if (node) node.textContent = String(this.turnSeconds);
    };
    display();
    this.turnTimer = setInterval(() => {
      if (this.gameOver || this.busy) return;
      this.turnSeconds -= 1;
      display();
      if (this.turnSeconds <= 0) {
        clearInterval(this.turnTimer);
        this.turnTimer = null;
        void this.resolveShot(false);
      }
    }, 1000);
  }

  move(direction) {

    if (this.busy || this.gameOver) return;



    this.selectedColumn = Math.max(

      0,

      Math.min(this.columns - 1, this.selectedColumn + direction)

    );



    this.render();

  }



async resolveShot(made) {

  if (this.busy || this.gameOver) return;

  clearInterval(this.turnTimer);
  this.turnTimer = null;
  if (!made) this.sensor.ignoreShotsFor(700);
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
    this.startTurnClock();
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
    this.startTurnClock();
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



  await this.animateShotThroughBoard(

    board,

    marker,

    targetCell,

    this.selectedColumn,

  );

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
    clearInterval(this.turnTimer);
    this.turnTimer = null;
    this.renderBoardOnly();
    return;

  }



  // Check for a draw

  if (this.board.every(row => row.every(cell => cell !== 0))) {

    this.gameOver = true;

    this.busy = false;
    clearInterval(this.turnTimer);
    this.turnTimer = null;
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





async animateShotThroughBoard(board, marker, targetCell, column) {

  const grid = board.querySelector(".connect3-grid");

  const layer = board.querySelector(".connect3-animation-layer");



  if (!grid || !layer || !marker || !targetCell) return;



  const gridRect = grid.getBoundingClientRect();

  const boardRect = board.getBoundingClientRect();

  const markerRect = marker.getBoundingClientRect();

  const cellRect = targetCell.getBoundingClientRect();



  const cellStyle = getComputedStyle(targetCell);

  const cellSize = cellRect.width;

  const gridStyle = getComputedStyle(grid);

  const gap = parseFloat(gridStyle.columnGap) || 0;

  const ballSize = cellSize + 1.2;



  // Align the animation layer exactly over the grid.

  layer.style.left =

    `${gridRect.left - boardRect.left - board.clientLeft}px`;

  layer.style.top =

    `${gridRect.top - boardRect.top - board.clientTop}px`;

  layer.style.width = `${gridRect.width}px`;

  layer.style.height = `${gridRect.height}px`;



  // Each mask tile spans one cell plus its gap.

  const spacing = cellSize + gap;

  layer.style.webkitMaskSize = `${spacing}px ${spacing}px`;

  layer.style.maskSize = `${spacing}px ${spacing}px`;



  // Shift the repeating mask so each circle centres on a cell.

  layer.style.webkitMaskPosition =

    `${-gap / 2}px ${-gap / 2}px`;

  layer.style.maskPosition =

    `${-gap / 2}px ${-gap / 2}px`;



  const playerClass = this.currentPlayer === 1

    ? "player-1"

    : "player-2";



  const makeBall = () => {

    const ball = document.createElement("div");

    ball.className = `connect3-shot-ball ${playerClass}`;

    ball.style.width = `${ballSize}px`;

    ball.style.height = `${ballSize}px`;

    ball.style.transform = "translate(-50%, -50%)";

    return ball;

  };



  // Phase 1: travel from the hoop to the board face.

  const firstBall = makeBall();

  firstBall.style.position = "fixed";

  firstBall.style.zIndex = "9999";



  const startX = markerRect.left + markerRect.width / 2;

  const startY = markerRect.bottom + ballSize / 2;

  const boardEntryY = gridRect.top - ballSize / 2;



  firstBall.style.left = `${startX}px`;

  firstBall.style.top = `${startY}px`;

  document.body.appendChild(firstBall);



  try {

    await firstBall.animate(

      [

        { top: `${startY}px` },

        { top: `${boardEntryY}px` }

      ],

      {

        duration: 500,

        easing: "cubic-bezier(0.35, 0, 0.65, 1)",

        fill: "forwards"

      }

    ).finished;

  } catch (_) {

    firstBall.remove();

    return;

  }



  firstBall.remove();



  // Phase 2: travel behind the board face.

  // The mask reveals the ball only through the holes.

  const ball = makeBall();

  const layerRect = layer.getBoundingClientRect();



  const x = cellRect.left + cellRect.width / 2 - layerRect.left;

  const y = cellRect.top + cellRect.height / 2 - layerRect.top;



  ball.style.left = `${x}px`;

  ball.style.top = `${-ballSize / 2}px`;

  layer.appendChild(ball);



  try {

    await ball.animate(

      [

        { top: `${-ballSize / 2}px` },

        { top: `${y}px` }

      ],

      {

        duration: 750,

        easing: "cubic-bezier(0.35, 0, 0.65, 1)",

        fill: "forwards"

      }

    ).finished;

  } catch (_) {

    // Clean up if the animation is interrupted.

  } finally {

    ball.remove();

  }

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



  async destroy() {
    clearInterval(this.turnTimer);
    this.turnTimer = null;
    await this.sensor.disconnect();
    if (this.handleKeyDown) {

      document.removeEventListener("keydown", this.handleKeyDown);

      this.handleKeyDown = null;

    }

  }

}