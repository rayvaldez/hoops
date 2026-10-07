export class Connect4Hoops {

    constructor(container) {
    
        this.container = container;
    
        this.rows = 6;
    
        this.columns = 7;
    
        this.board = [];
    
        this.currentPlayer = 1;
    
        this.gameOver = false;
    
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
    
                <div class="turn-display">
    
                    ${this.players[this.currentPlayer]}
    
                </div>
    
                <div class="hoop-row">
    
                    ${this.createHoops()}
    
                </div>
    
                <div class="connect4-board">
    
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

        // Remove any previous keyboard listener
        // before creating a new one.
        if (this.keyHandler) {
        
            document.removeEventListener(
                "keydown",
                this.keyHandler
            );
        
        }
        
        const hoops =
            this.container.querySelectorAll(".virtual-hoop");
        
        console.log("Hoops found:", hoops.length);
        
        hoops.forEach((hoop) => {
        
            hoop.addEventListener("click", () => {
        
                const column =
                    Number(hoop.dataset.column);
        
                this.shootHoop(column);
        
            });
        
        });
        
        this.keyHandler = (event) => {
        
            console.log("Key pressed:", event.key);
        
            if (
                event.key >= "1" &&
                event.key <= "7"
            ) {
        
                const column =
                    Number(event.key) - 1;
        
                this.shootHoop(column);
        
            }
        
        };
        
        document.addEventListener(
            "keydown",
            this.keyHandler
        );
        
    }
        
    
    shootHoop(column) {
    
        if (this.gameOver) {
    
            return;
    
        }
    
        const row = this.findAvailableRow(column);
    
        if (row === -1) {
    
            console.log(`Column ${column + 1} is full.`);
    
            return;
    
        }
    
        this.board[row][column] = this.currentPlayer;
    
        console.log(
    
            `${this.players[this.currentPlayer]} scored in hoop ${column + 1}`
    
        );
    
        this.updateBoardDisplay();
    
        const winner = this.checkWinner(
            row,
            column,
            this.currentPlayer
            );
            
            if (winner) {
            
            this.gameOver = true;
            
            this.highlightWinningCells(winner);
            
            this.showWinner(this.currentPlayer);
            
            return;
              
            }            
    
        if (winner) {
    
            this.gameOver = true;
    
            this.showWinner(this.currentPlayer);
    
            return;
    
        }
    
        if (this.checkDraw()) {
    
            this.gameOver = true;
    
            this.showDraw();
    
            return;
    
        }
    
        this.currentPlayer =
    
            this.currentPlayer === 1 ? 2 : 1;
    
        this.updateTurnDisplay();
    
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
    
    destroy() {
    
        if (this.keyHandler) {
    
            document.removeEventListener(
    
                "keydown",
    
                this.keyHandler
    
            );
    
        }
    
    }
    
}
    