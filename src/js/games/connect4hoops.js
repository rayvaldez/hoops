export class Connect4Hoops {

    constructor(container) {
        this.container = container;
        this.rows = 6;
        this.columns = 7;
    }

    start() {
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="connect4-screen">

                <h2>CONNECT 4 HOOPS</h2>

                <div class="connect4-board">
                    ${this.createCells()}
                </div>

            </div>
        `;
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
}