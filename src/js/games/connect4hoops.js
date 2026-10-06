export class Connect4Hoops {

  constructor(container) {
      this.container = container;
  }

  start() {
      this.container.innerHTML = `
          <div class="connect4-screen">
              <h2>CONNECT 4 HOOPS</h2>

              <p>
                  Connect 4 Hoops is loading...
              </p>

              <div class="test-board">
                  ${Array.from({ length: 42 }, () => "<div></div>").join("")}
              </div>
          </div>
      `;
  }
}