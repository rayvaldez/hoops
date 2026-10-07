export class Connect4Hoops {

    constructor(container) {
        this.container = container;

        this.rows = 6;
        this.columns = 7;

        this.board = [];
        this.currentPlayer = 1;
        this.gameOver = false;

        this.resetBoard();
    }

    start() {
        this.render();
        this.attachEvents();
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
                    PLAYER ${this.currentPlayer}
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

        const hoops =
            this.container.querySelectorAll(".virtual-hoop");
    
        console.log("Hoops found:", hoops.length);
    
        hoops.forEach((hoop) => {
    
            hoop.addEventListener("click", () => {
    
                const column = Number(hoop.dataset.column);
    
                this.shootHoop(column);
            });
    
        });
    
        this.keyHandler = (event) => {
    
            console.log("Key pressed:", event.key);
    
            if (event.key >= "1" && event.key <= "7") {
    
                const column = Number(event.key) - 1;
    
                this.shootHoop(column);
            }
        };
    
        document.addEventListener("keydown", this.keyHandler);
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
            `Player ${this.currentPlayer} scored in hoop ${column + 1}`
        );
        
        this.updateBoardDisplay();
        
        const winner = this.checkWinner(
            row,
            column,
            this.currentPlayer
        );
        
        if (this.checkWinner(row, column, this.currentPlayer)) {

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

    updateTurnDisplay() {

        const display =
            this.container.querySelector(".turn-display");

        if (display) {
            display.textContent =
                `PLAYER ${this.currentPlayer}`;
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
    
            let count = 1;
    
            count += this.countDirection(
                row,
                column,
                rowDirection,
                columnDirection,
                player
            );
    
            count += this.countDirection(
                row,
                column,
                -rowDirection,
                -columnDirection,
                player
            );
    
            if (count >= 4) {
                return true;
            }
        }
    
        return false;
    }

    showDraw() {

        const message =
            this.container.querySelector(".winner-message");
    
        if (!message) {
            return;
        }
    
        message.textContent = "DRAW!";
    
        message.hidden = false;
    }
    
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
    
        message.textContent =
            `PLAYER ${player} WINS!`;
    
        message.hidden = false;
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