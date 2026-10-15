import { ArduinoSensor } from "../arduino-sensor.js";

export class Connect4Hoops {



    constructor(container) {

        this.container = container;

        this.rows = 6;

        this.columns = 7;

        this.board = [];

        this.currentPlayer = 1;
        this.gameOver = false;
        this.busy = false;
        this.selectedColumn = 3;
        this.turnSeconds = 8;
        this.turnTimer = null;
        this.sensor = new ArduinoSensor({
            onShot: () => {
                if (!this.busy && !this.gameOver) this.shootHoop(this.selectedColumn);
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
        this.players = {

            1: "",

            2: ""

        };

        this.resetBoard();

    }

    start() {

        this.renderNameInput();

    }

    renderNameInput() {

        this.container.innerHTML = `

            <div class="connect4-screen name-screen">

                <h2>CONNECT 4 HOOPS</h2>

                <div class="player-name-form">

                    <label for="player-one-name">

                        PLAYER 1 NAME

                    </label>

                    <input

                        id="player-one-name"

                        class="player-name-input"

                        type="text"

                        maxlength="15"

                        placeholder="Enter your name"

                        autocomplete="off"

                    >

                    <label for="player-two-name">

                        PLAYER 2 NAME

                    </label>

                    <input

                        id="player-two-name"

                        class="player-name-input"

                        type="text"

                        maxlength="15"

                        placeholder="Enter your name"

                        autocomplete="off"

                    >

                    <button

                        class="start-game-button"

                        type="button">

                        START GAME

                    </button>

                    <div

                        class="name-error"

                        hidden>

                    </div>

                </div>

            </div>

        `;

        const playerOneInput =

            this.container.querySelector("#player-one-name");

        const playerTwoInput =

            this.container.querySelector("#player-two-name");

        const startButton =

            this.container.querySelector(".start-game-button");

        const errorMessage =

            this.container.querySelector(".name-error");

        const startGame = () => {

            const playerOneName =

                playerOneInput.value.trim();

            const playerTwoName =

                playerTwoInput.value.trim();

            if (!playerOneName || !playerTwoName) {

                errorMessage.textContent =

                    "Please enter both player names.";

                errorMessage.hidden = false;

                return;

            }

            this.players[1] = playerOneName.toUpperCase();

            this.players[2] = playerTwoName.toUpperCase();

            this.resetBoard();

            this.render();
            this.attachEvents();
            this.startTurnClock();

        };

        startButton.addEventListener("click", startGame);

        playerOneInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                playerTwoInput.focus();

            }

        });

        playerTwoInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                startGame();

            }

        });

        playerOneInput.focus();

    }

    resetBoard() {

        this.board = Array.from(

            { length: this.rows },

            () => Array(this.columns).fill(0)

        );

        this.currentPlayer = 1;

        this.gameOver = false;

    }

    render() {

        this.container.innerHTML = `

            <div class="connect4-screen">
                <h2>CONNECT 4 HOOPS</h2>
                <div class="turn-display">${this.players[this.currentPlayer]}</div>
                <p class="connect4-turn-clock" aria-live="polite">Time left: <strong data-turn-time>8</strong>s</p>
                <p class="connect4-instruction" data-status>Select a column, then take your shot.</p>
                <div class="arduino-controls">
                    <button class="connect4-button" data-action="connect-arduino" type="button">CONNECT ARDUINO</button>
                    <span data-arduino-status role="status">Arduino not connected</span>
                </div>

                <div class="hoop-row">

                    ${this.createHoops()}

                </div>

                <div class="connect4-board">

                <div class="connect4-animation-layer"></div>

                    ${this.createCells()}

                </div>

                <div class="winner-message" hidden></div>

            </div>

        `;

        this.updateBoardDisplay();

    }

    createHoops() {

        let hoops = "";

        for (let column = 0; column < this.columns; column++) {

            hoops += `

                <button

                    class="virtual-hoop"

                    data-column="${column}"

                    aria-label="Hoop ${column + 1}">

                    <span>${column + 1}</span>

                    <div class="hoop-rim">

                        <div class="hoop-net"></div>

                    </div>

                </button>

            `;

        }

        return hoops;

    }

    createCells() {

        let cells = "";

        for (let row = 0; row < this.rows; row++) {

            for (let column = 0; column < this.columns; column++) {

                cells += `

                    <div

                        class="connect4-cell"

                        data-row="${row}"

                        data-column="${column}">

                    </div>

                `;

            }

        }

        return cells;

    }

    attachEvents() {
        if (this.keyHandler) document.removeEventListener("keydown", this.keyHandler);
        this.container.querySelectorAll(".virtual-hoop").forEach(hoop => {
            hoop.addEventListener("click", () => this.selectColumn(Number(hoop.dataset.column)));
        });
        const connectButton = this.container.querySelector('[data-action="connect-arduino"]');
        if (connectButton) connectButton.addEventListener("click", () => void this.sensor.connect());
        this.keyHandler = event => {
            if (this.gameOver || this.busy) return;
            if (event.key >= "1" && event.key <= "7") this.selectColumn(Number(event.key) - 1);
        };
        document.addEventListener("keydown", this.keyHandler);
    }

    selectColumn(column) {
        if (this.gameOver || this.busy) return;
        if (this.findAvailableRow(column) === -1) {
            const status = this.container.querySelector("[data-status]");
            if (status) status.textContent = `COLUMN ${column + 1} IS FULL — CHOOSE ANOTHER.`;
            return;
        }
        this.selectedColumn = column;
        this.container.querySelectorAll(".virtual-hoop").forEach(hoop => {
            hoop.classList.toggle("selected", Number(hoop.dataset.column) === column);
        });
        const status = this.container.querySelector("[data-status]");
        if (status) status.textContent = `COLUMN ${column + 1} SELECTED — TAKE YOUR SHOT.`;
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
            if (this.turnSeconds <= 0) this.endTurnAsMiss();
        }, 1000);
    }

    endTurnAsMiss() {
        if (this.gameOver || this.busy) return;
        this.sensor.ignoreShotsFor(700);
        clearInterval(this.turnTimer);
        this.turnTimer = null;
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateTurnDisplay();
        const status = this.container.querySelector("[data-status]");
        if (status) status.textContent = "MISS — TIME EXPIRED. TURN ENDED.";
        this.startTurnClock();
    }

    shootHoop(column) {
        if (this.gameOver || this.busy) return;
        if (this.findAvailableRow(column) === -1) {
            const status = this.container.querySelector("[data-status]");
            if (status) status.textContent = `COLUMN ${column + 1} IS FULL — SHOT IGNORED.`;
            return;
        }
        clearInterval(this.turnTimer);
        this.turnTimer = null;
        this.busy = true;

        const row = this.findAvailableRow(column);

        if (row === -1) {

            console.log(`Column ${column + 1} is full.`);

            return;

        }

        this.board[row][column] = this.currentPlayer;



        const winner = this.checkWinner(

        row,

        column,

        this.currentPlayer

        );



        this.animateDrop(row, column, () => {



        this.updateBoardDisplay();



        if (winner) {



            this.gameOver = true;



            this.highlightWinningCells(winner);



            this.showWinner(this.currentPlayer);



            return;



        }



        if (this.checkDraw()) {



            this.gameOver = true;



            this.showDraw();



            return;



        }



        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.busy = false;
        this.updateTurnDisplay();
        this.startTurnClock();



        });      

    }

    findAvailableRow(column) {

        for (let row = this.rows - 1; row >= 0; row--) {

            if (this.board[row][column] === 0) {

                return row;

            }

        }

        return -1;

    }

    updateBoardDisplay() {

        const cells =

            this.container.querySelectorAll(".connect4-cell");

        cells.forEach((cell) => {

            const row = Number(cell.dataset.row);

            const column = Number(cell.dataset.column);

            const player = this.board[row][column];

            cell.classList.remove(

                "player-one",

                "player-two"

            );

            if (player === 1) {

                cell.classList.add("player-one");

            }

            if (player === 2) {

                cell.classList.add("player-two");

            }

        });

    }



    animateDrop(row, column, onComplete) {



        const cell =

            this.container.querySelector(

                `.connect4-cell[data-row="${row}"][data-column="${column}"]`

            );

        const hoop =

            this.container.querySelector(

                `.virtual-hoop[data-column="${column}"]`

            );

        const board =

            this.container.querySelector(".connect4-board");

        const animationLayer =

            this.container.querySelector(".connect4-animation-layer");

        if (!cell || !hoop || !board || !animationLayer) {

            return;

        }

        const hoopRect =

            hoop.getBoundingClientRect();

        const cellRect =

            cell.getBoundingClientRect();

        const boardRect =

            board.getBoundingClientRect();

        const ball =

            document.createElement("div");

        ball.classList.add("flying-ball");

        if (this.currentPlayer === 1) {

            ball.classList.add("player-one-ball");

        } else {

            ball.classList.add("player-two-ball");

        }

        const startX =

            hoopRect.left + (hoopRect.width / 2);

        const startY =

            hoopRect.bottom + 5;

        const boardTop =

            boardRect.top;

        ball.style.left = `${startX}px`;

        ball.style.top = `${startY}px`;

        document.body.appendChild(ball);

        void ball.offsetWidth;

        ball.style.transition =

            "top 0.55s cubic-bezier(0.45, 0, 0.75, 1)";

        ball.style.top =

            `${boardTop - 4}px`;

        setTimeout(() => {

            ball.remove();

            const boardBall =

                document.createElement("div");

            boardBall.classList.add("flying-ball");

            if (this.currentPlayer === 1) {

                boardBall.classList.add("player-one-ball");

            } else {

                boardBall.classList.add("player-two-ball");

            }

            const cellSize = 70;

            const gap = 8;

            const spacing = cellSize + gap;

            const x =

                column * spacing + (cellSize / 2);

            const destinationY =

                row * spacing + (cellSize / 2);

            boardBall.style.left = `${x}px`;

            boardBall.style.top = `-30px`;

            animationLayer.appendChild(boardBall);

            void boardBall.offsetWidth;

            boardBall.style.position = "absolute";

            boardBall.style.transition =

                "top 0.75s cubic-bezier(0.35, 0, 0.65, 1)";

            boardBall.style.top =

                `${destinationY}px`;

            setTimeout(() => {

                boardBall.remove();

                if (onComplete) {

                    onComplete();

                }

            }, 750);

        }, 550);

    }



    highlightWinningCells(cells) {



        cells.forEach(([row, column]) => {

            const cell =

                this.container.querySelector(

                    `.connect4-cell[data-row="${row}"][data-column="${column}"]`

                );

            if (cell) {

                cell.classList.add("winning-cell");

            }

        });

    }

    updateTurnDisplay() {

        const display =

            this.container.querySelector(".turn-display");

        if (display) {

            display.textContent =

                this.players[this.currentPlayer];

        }

    }

    checkWinner(row, column, player) {



        const directions = [

            [0, 1],   // horizontal

            [1, 0],   // vertical

            [1, 1],   // diagonal down-right

            [1, -1]   // diagonal down-left

        ];

        for (const [rowDirection, columnDirection] of directions) {

            const winningCells = [

                [row, column]

            ];

            const forwardCells = this.getDirectionCells(

                row,

                column,

                rowDirection,

                columnDirection,

                player

            );

            const backwardCells = this.getDirectionCells(

                row,

                column,

                -rowDirection,

                -columnDirection,

                player

            );

            winningCells.push(...forwardCells);

            winningCells.push(...backwardCells);

            if (winningCells.length >= 4) {

                return winningCells;

            }

        }

        return null;

    }



    getDirectionCells(

        row,

        column,

        rowDirection,

        columnDirection,

        player

        ) {

        const cells = [];

        let currentRow =

            row + rowDirection;

        let currentColumn =

            column + columnDirection;

        while (

            currentRow >= 0 &&

            currentRow < this.rows &&

            currentColumn >= 0 &&

            currentColumn < this.columns &&

            this.board[currentRow][currentColumn] === player

        ) {

            cells.push([

                currentRow,

                currentColumn

            ]);

            currentRow += rowDirection;

            currentColumn += columnDirection;

        }

        return cells;

    }

    showDraw() {



        const message =

            this.container.querySelector(".winner-message");

        if (!message) {

            return;

        }

        message.innerHTML = `

            <div class="game-over-title">

                DRAW!

            </div>

            <div class="game-over-buttons">

                <button

                    class="play-again-button"

                    type="button">

                    PLAY AGAIN

                </button>

                <button

                    class="change-players-button"

                    type="button">

                    CHANGE PLAYERS

                </button>

            </div>

        `;

        message.hidden = false;

        this.attachGameOverEvents();

    };

    countDirection(

        row,

        column,

        rowDirection,

        columnDirection,

        player

    ) {

        let count = 0;

        let currentRow = row + rowDirection;

        let currentColumn = column + columnDirection;

        while (

            currentRow >= 0 &&

            currentRow < this.rows &&

            currentColumn >= 0 &&

            currentColumn < this.columns &&

            this.board[currentRow][currentColumn] === player

        ) {

            count++;

            currentRow += rowDirection;

            currentColumn += columnDirection;

        }

        return count;

    }

    showWinner(player) {



        const message =

            this.container.querySelector(".winner-message");

        if (!message) {

            return;

        }

        message.innerHTML = `

            <div class="game-over-title">

                ${this.players[player]} WINS!

            </div>

            <div class="game-over-buttons">

                <button

                    class="play-again-button"

                    type="button">

                    PLAY AGAIN

                </button>

                <button

                    class="change-players-button"

                    type="button">

                    CHANGE PLAYERS

                </button>

            </div>

        `;

        message.hidden = false;

        this.attachGameOverEvents();

    };



    attachGameOverEvents() {



        const playAgainButton =

            this.container.querySelector(".play-again-button");

        const changePlayersButton =

            this.container.querySelector(".change-players-button");

        if (playAgainButton) {

            playAgainButton.addEventListener("click", () => {



                this.destroy();

                this.resetBoard();

                this.render();

                this.attachEvents();

            });

        }

        if (changePlayersButton) {

            changePlayersButton.addEventListener("click", () => {

                this.destroy();

                this.players[1] = "";

                this.players[2] = "";

                this.renderNameInput();

            });

        }      

    }

    checkDraw() {

        for (let column = 0; column < this.columns; column++) {

            if (this.board[0][column] === 0) {

                return false;

            }

        }

        return true;

    }

    async destroy() {
        clearInterval(this.turnTimer);
        this.turnTimer = null;
        await this.sensor.disconnect();
        if (this.keyHandler) {

            document.removeEventListener(

                "keydown",

                this.keyHandler

            );

        }

    }

}