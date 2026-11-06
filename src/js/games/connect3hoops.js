
export class Connect3Hoops {
    constructor(container, arduinoSensor = null) {
        this.container = container;
        this.sensor = arduinoSensor;

        this.rows = 5;
        this.columns = 5;
        this.board = [];

        this.currentPlayer = 1;
        this.selectedColumn = 2;

        this.gameStarted = false;
        this.gameOver = false;
        this.busy = false;
        this.wheelSpinning = false;

        this.wheelTimer = null;
        this.dropTimer = null;
        this.keyHandler = null;

        this.wheelAnimation = null;
        this.wheelFinishTimer = null;
        this.wheelHideTimer = null;

        this.resetBoard();
    }

    start() {
        this.render();
        this.attachEvents();
        this.startFirstTurnWheel();
    }

    resetBoard() {
        this.board = Array.from(
            { length: this.rows },
            () => Array(this.columns).fill(0)
        );

        this.currentPlayer = 1;
        this.selectedColumn = 2;
        this.gameStarted = false;
        this.gameOver = false;
        this.busy = false;
        this.wheelSpinning = false;
        this.scores = { 1: 0, 2: 0 };
        this.wheelRotation = 0;
    }

    render() {
        this.container.innerHTML = `
            <section class="connect3-arena">

                <header class="connect3-arena-header">
                    <h2>CONNECT 3 HOOPS</h2>
                    <p>GET THREE IN A ROW TO WIN</p>
                </header>

                <div class="connect3-match-layout">

                    <aside class="connect3-player-panel connect3-blue-panel"
                           data-player-panel="1">

                        <div class="connect3-player-number">PLAYER 1</div>
                        <div class="connect3-team-name">BLUE TEAM</div>

                        <div class="connect3-player-hoop">
                            HOOP A
                        </div>

                        <div class="connect3-player-turn"
                             data-player-turn="1">
                            WAITING
                        </div>

                        <div class="connect3-player-instruction">
                            Choose a column and shoot to place a token.
                        </div>

                        <div class="connect3-player-score"
                             data-player-score="1">0</div>

                    </aside>

                    <main class="connect3-board-area">

                        <div class="connect3-turn-prompt"
                             data-turn-prompt>
                            WAITING FOR FIRST PLAYER
                        </div>

                        <div class="connect3-column-labels">
                            ${this.createColumnLabels()}
                        </div>

                        <div class="connect3-board">
                            <div class="connect3-board-animation-layer"></div>
                            ${this.createCells()}
                        </div>

                        <div class="connect3-board-instruction">
                            <span data-board-instruction>
                                Choose a column and shoot to register your basketball.
                            </span>

                            <button
                                type="button"
                                class="connect3-play-again"
                                data-play-again
                                hidden>
                                PLAY AGAIN
                            </button>
                        </div>
                    </main>

                    <aside class="connect3-player-panel connect3-orange-panel"
                           data-player-panel="2">

                        <div class="connect3-player-number">PLAYER 2</div>
                        <div class="connect3-team-name">ORANGE TEAM</div>

                        <div class="connect3-player-hoop">
                            HOOP B
                        </div>

                        <div class="connect3-player-turn"
                             data-player-turn="2">
                            WAITING
                        </div>

                        <div class="connect3-player-instruction">
                            Choose a column and score to place a token.
                        </div>

                        <div class="connect3-player-score"
                             data-player-score="2">0</div>

                    </aside>

                </div>

                <div class="connect3-wheel-overlay" data-wheel-overlay>
                    <div class="connect3-wheel-card">

                        <p class="connect3-wheel-eyebrow">
                            CONNECT 3 HOOPS
                        </p>

                        <h2>WHO GOES FIRST?</h2>

                        <div class="connect3-wheel-pointer"></div>

                        <div class="connect3-wheel" data-wheel>
                            <div class="connect3-wheel-label blue">
                                PLAYER 1
                            </div>
                            <div class="connect3-wheel-label orange">
                                PLAYER 2
                            </div>
                        </div>

                        <p data-wheel-message>
                            Press the START button to stop the wheel.
                        </p>

                        <button type="button"
                                class="connect3-wheel-stop"
                                data-stop-wheel>
                            STOP THE WHEEL
                        </button>

                    </div>
                </div>

            </section>
        `;

        this.updateBoardDisplay();
        this.updateSelection();
        this.updatePlayerPanels();
    }

    createColumnLabels() {
        return Array.from(
            { length: this.columns },
            (_, column) => `<span>${column + 1}</span>`
        ).join("");
    }

    createCells() {
        let html = "";

        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                html += `
                    <div class="connect3-cell"
                         data-row="${row}"
                         data-column="${column}">
                    </div>
                `;
            }
        }

        return html;
    }

    attachEvents() {
        const stopButton = this.container.querySelector("[data-stop-wheel]");
        const playAgainButton = this.container.querySelector("[data-play-again]");

        stopButton?.addEventListener("click", () => {
            this.stopFirstTurnWheel();
        });

        playAgainButton?.addEventListener("click", () => {
            this.resetGame();
        });

        if (this.keyHandler) {
            document.removeEventListener("keydown", this.keyHandler);
        }

        this.keyHandler = event => {
            if (!this.gameStarted || this.gameOver || this.busy) return;

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                this.moveSelection(-1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                this.moveSelection(1);
            }

            if (event.key === " " || event.key === "Enter") {
                // Keyboard testing: place a ball.
                event.preventDefault();
                this.shootSelectedColumn();
            }
        };

        document.addEventListener("keydown", this.keyHandler);
    }

    startFirstTurnWheel() {
        const wheel = this.container.querySelector("[data-wheel]");
        if (!wheel) return;

        this.wheelSpinning = true;

        wheel.style.transform = "rotate(0deg)";

        this.wheelAnimation = wheel.animate(
            [
                { transform: "rotate(0deg)" },
                { transform: "rotate(360deg)" }
            ],
            {
                duration: 900,
                iterations: Infinity,
                easing: "linear"
            }
        );
    }

    stopFirstTurnWheel() {
        if (!this.wheelSpinning || this.gameStarted) return;

        const wheel = this.container.querySelector("[data-wheel]");
        const message = this.container.querySelector("[data-wheel-message]");
        const stopButton = this.container.querySelector("[data-stop-wheel]");
        const overlay = this.container.querySelector("[data-wheel-overlay]");

        // Capture the wheel's current angle before stopping its continuous spin.
        const matrix = new DOMMatrixReadOnly(getComputedStyle(wheel).transform);
        const currentAngle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;

        this.wheelAnimation?.cancel();
        this.wheelAnimation = null;

        wheel.style.transform = `rotate(${currentAngle}deg)`;

        const firstPlayer = Math.random() < 0.5 ? 1 : 2;
        this.currentPlayer = firstPlayer;

        const extraRotation = firstPlayer === 1 ? 1440 : 1620;
        const finalRotation = currentAngle + extraRotation;

        wheel.style.transition =
            "transform 2.5s cubic-bezier(0.12, 0.75, 0.15, 1)";

        requestAnimationFrame(() => {
            wheel.style.transform = `rotate(${finalRotation}deg)`;
        });

        message.textContent = "THE WHEEL HAS CHOSEN...";
        if (stopButton) stopButton.disabled = true;

        this.wheelFinishTimer = setTimeout(() => {
            this.wheelSpinning = false;
            this.gameStarted = true;

            message.textContent = firstPlayer === 1
                ? "PLAYER 1 — BLUE TEAM GOES FIRST!"
                : "PLAYER 2 — ORANGE TEAM GOES FIRST!";

            this.updatePlayerPanels();
            this.updateTurnPrompt();
            this.updateSelection();

            overlay.classList.add("connect3-wheel-finished");

            this.wheelHideTimer = setTimeout(() => {
                overlay.hidden = true;
            }, 1100);

        }, 2550);
    }

    moveSelection(direction) {
        if (!this.gameStarted || this.gameOver || this.busy) return;

        let nextColumn = this.selectedColumn;

        for (let attempts = 0; attempts < this.columns; attempts++) {
            nextColumn =
                (nextColumn + direction + this.columns) % this.columns;

            if (this.findAvailableRow(nextColumn) !== -1) {
                this.selectedColumn = nextColumn;
                this.updateSelection();
                return;
            }
        }

        this.updateTurnPrompt("THE BOARD IS FULL!");
    }

    updateSelection() {
        this.container.querySelectorAll(".connect3-cell").forEach(cell => {
            const column = Number(cell.dataset.column);
            const row = Number(cell.dataset.row);

            const isSelectedColumn = column === this.selectedColumn;
            const isEmpty = this.board[row][column] === 0;

            cell.classList.toggle(
                "connect3-column-selected",
                isSelectedColumn && isEmpty
            );
        });
    }

    findAvailableRow(column) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][column] === 0) return row;
        }

        return -1;
    }

    handleShot() {
        this.shootSelectedColumn();
    }

    shootSelectedColumn() {
        if (!this.gameStarted || this.gameOver || this.busy) return;

        const row = this.findAvailableRow(this.selectedColumn);

        if (row === -1) {
            this.updateTurnPrompt("THAT COLUMN IS FULL — CHOOSE ANOTHER.");
            return;
        }

        this.busy = true;

        const player = this.currentPlayer;
        const column = this.selectedColumn;

        this.animateBallDrop(row, column, player, () => {
            this.board[row][column] = player;
            this.scores[player]++;
            const scoreDisplay = this.container.querySelector(
                `[data-player-score="${player}"]`
            );

            if (scoreDisplay) {
                scoreDisplay.textContent = this.scores[player];
            }

            this.updateBoardDisplay();

            const winningCells = this.checkWinner(row, column, player);

            if (winningCells) {
                this.endGame(player, winningCells);
                return;
            }

            if (this.isBoardFull()) {
                this.endGame(0);
                return;
            }

            this.currentPlayer = player === 1 ? 2 : 1;
            this.busy = false;

            this.moveToNextAvailableColumn();
            this.updatePlayerPanels();
            this.updateTurnPrompt();
            this.updateSelection();
        });
    }

    animateBallDrop(row, column, player, onComplete) {
        const board = this.container.querySelector(".connect3-board");

        const cell = this.container.querySelector(
            `.connect3-cell[data-row="${row}"][data-column="${column}"]`
        );

        if (!board || !cell) {
            onComplete();
            return;
        }

        const boardRect = board.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();

        const ball = document.createElement("div");
        ball.className = `connect3-dropping-ball player-${player}`;

        const startX = cellRect.left + cellRect.width / 2;
        const startY = boardRect.top - 25;

        const endX = cellRect.left + cellRect.width / 2;
        const endY = cellRect.top + cellRect.height / 2;

        document.body.appendChild(ball);

        const animation = ball.animate([
            {
                left: `${startX}px`,
                top: `${startY}px`,
                transform: "translate(-50%, -50%) scale(0.8)"
            },
            {
                left: `${endX}px`,
                top: `${endY}px`,
                transform: "translate(-50%, -50%) scale(1)"
            }
        ], {
            duration: 650,
            easing: "cubic-bezier(0.35, 0, 0.65, 1)",
            fill: "forwards"
        });

        animation.onfinish = () => {
            ball.remove();
            onComplete();
        };
    }

    updateBoardDisplay() {
        this.container.querySelectorAll(".connect3-cell").forEach(cell => {
            const row = Number(cell.dataset.row);
            const column = Number(cell.dataset.column);
            const player = this.board[row][column];

            cell.classList.remove("player-1", "player-2");

            if (player) {
                cell.classList.add(`player-${player}`);
                cell.textContent = "🏀";
            } else {
                cell.textContent = "";
            }
        });
    }

    moveToNextAvailableColumn() {
        if (this.findAvailableRow(this.selectedColumn) !== -1) return;

        for (let offset = 1; offset <= this.columns; offset++) {
            const column =
                (this.selectedColumn + offset) % this.columns;

            if (this.findAvailableRow(column) !== -1) {
                this.selectedColumn = column;
                return;
            }
        }
    }

    checkWinner(row, column, player) {
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1]
        ];

        for (const [rowDirection, columnDirection] of directions) {
            const cells = [[row, column]];

            for (const sign of [-1, 1]) {
                let nextRow = row + rowDirection * sign;
                let nextColumn = column + columnDirection * sign;

                while (
                    nextRow >= 0 &&
                    nextRow < this.rows &&
                    nextColumn >= 0 &&
                    nextColumn < this.columns &&
                    this.board[nextRow][nextColumn] === player
                ) {
                    cells.push([nextRow, nextColumn]);
                    nextRow += rowDirection * sign;
                    nextColumn += columnDirection * sign;
                }
            }

            if (cells.length >= 3) return cells;
        }

        return null;
    }

    isBoardFull() {
        return this.board.every(row => row.every(cell => cell !== 0));
    }

    updatePlayerPanels() {
        [1, 2].forEach(player => {
            const panel = this.container.querySelector(
                `[data-player-panel="${player}"]`
            );
            const turn = this.container.querySelector(
                `[data-player-turn="${player}"]`
            );

            panel?.classList.toggle(
                "active",
                this.gameStarted && !this.gameOver && this.currentPlayer === player
            );

            if (turn) {
                turn.textContent = this.gameOver
                    ? "GAME OVER"
                    : this.currentPlayer === player && this.gameStarted
                        ? "YOUR TURN"
                        : "WAITING";
            }
        });
    }

    updateTurnPrompt(message = "") {
        const prompt = this.container.querySelector("[data-turn-prompt]");
        const instruction = this.container.querySelector("[data-board-instruction]");

        const defaultMessage = this.currentPlayer === 1
            ? "PLAYER 1 — BLUE TEAM'S TURN"
            : "PLAYER 2 — ORANGE TEAM'S TURN";

        if (prompt) prompt.textContent = message || defaultMessage;

        if (instruction) {
            instruction.textContent =
                "Choose a column with LEFT / RIGHT, then shoot to register.";
        }
    }

    endGame(winner, winningCells = []) {
        this.gameOver = true;
        this.busy = false;

        this.updatePlayerPanels();

        const prompt = this.container.querySelector("[data-turn-prompt]");
        const instruction = this.container.querySelector("[data-board-instruction]");
        const playAgainButton = this.container.querySelector("[data-play-again]");

        if (winner === 0) {
            prompt.textContent = "IT'S A DRAW!";
            instruction.textContent = "The board is full. Great game!";
        } else {
            prompt.textContent = winner === 1
                ? "BLUE TEAM WINS!"
                : "ORANGE TEAM WINS!";

            instruction.textContent =
                `${winner === 1 ? "PLAYER 1" : "PLAYER 2"} CONNECTED THREE!`;

            winningCells.forEach(([row, column]) => {
                const cell = this.container.querySelector(
                    `.connect3-cell[data-row="${row}"][data-column="${column}"]`
                );

                cell?.classList.add("connect3-winning-cell");
            });
        }

        // Highlight the winning player's panel
        this.container.querySelectorAll("[data-player-panel]").forEach(panel => {
            panel.classList.remove("connect3-panel-winner");
        });

        if (winner === 1 || winner === 2) {
            const winningPanel = this.container.querySelector(
                `[data-player-panel="${winner}"]`
            );

            winningPanel?.classList.add("connect3-panel-winner");
        }

        winningCells.forEach(([row, column]) => {
            const cell = this.container.querySelector(
                `.connect3-cell[data-row="${row}"][data-column="${column}"]`
            );

            cell?.classList.add("connect3-winning-cell");
        });
        
        if (playAgainButton) {
            playAgainButton.hidden = false;
        }
    }

    resetGame() {
        clearTimeout(this.dropTimer);
        clearTimeout(this.wheelFinishTimer);
        clearTimeout(this.wheelHideTimer);
        clearInterval(this.wheelTimer);

        this.wheelAnimation?.cancel();
        this.wheelAnimation = null;

        this.resetBoard();
        this.render();
        this.attachEvents();
        this.startFirstTurnWheel();
    }

    destroy() {
        clearInterval(this.wheelTimer);
        clearTimeout(this.dropTimer);
        clearTimeout(this.wheelFinishTimer);
        clearTimeout(this.wheelHideTimer);

        this.wheelAnimation?.cancel();

        if (this.keyHandler) {
            document.removeEventListener("keydown", this.keyHandler);
            this.keyHandler = null;
        }
    }
}
