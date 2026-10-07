export class Connect4Hoops {

    constructor(container) {
        this.container = container;

        this.rows = 6;
        this.columns = 7;

        this.board = [];
        this.currentPlayer = 1;

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
}