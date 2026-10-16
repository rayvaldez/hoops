import { Connect3Hoops } from "./games/connect3hoops.js";
import { Connect4Hoops } from "./games/connect4hoops.js";
import { ThirtySecondShootout } from "./games/thirty-second-shootout.js";

const gameMenu = document.querySelector(".game-menu");

const gameArea = document.querySelector("#game-area");

const gameContainer = document.querySelector("#game-container");

const backToMenu = document.querySelector("#back-to-menu");

const games = {

    connect3hoops: Connect3Hoops,
    connect4hoops: Connect4Hoops,
    "thirty-second-shootout": ThirtySecondShootout

};

const arduinoFooter = document.createElement("div");
arduinoFooter.className = "app-arduino-footer";
arduinoFooter.hidden = true;

arduinoFooter.innerHTML = `
    <button
        class="shootout-button"
        data-action="connect-arduino"
        type="button"
    >
        CONNECT ARDUINO
    </button>

    <span data-arduino-status role="status">
        Arduino not connected
    </span>
`;

gameArea.appendChild(arduinoFooter);

const arduinoButton = arduinoFooter.querySelector(
    '[data-action="connect-arduino"]'
);

arduinoButton.addEventListener("click", () => {
    if (currentGame?.connectArduino) {
        void currentGame.connectArduino();
    } else {
        console.warn("The current game cannot connect to the Arduino.");
    }
});

let currentGame = null;

function launchGame(gameId) {
    const Game = games[gameId];

    if (!Game) {
        console.error(`Game not found: ${gameId}`);
        return;
    }

    gameMenu.hidden = true;
    gameArea.hidden = false;

    if (currentGame) {
        currentGame.destroy?.();
    }

    gameContainer.innerHTML = "";
    arduinoFooter.hidden = gameId !== "thirty-second-shootout";

    currentGame = new Game(gameContainer);
    currentGame.start();
}

function showMenu() {

    // Destroy current game

    if (currentGame) {

        currentGame.destroy?.();

        currentGame = null;

    }

    // Hide the game

    gameArea.hidden = true;

    // Show the menu

    gameMenu.hidden = false;

    // Remove the current game

    gameContainer.innerHTML = "";

    arduinoFooter.hidden = true;

}

document.querySelectorAll(".game-card").forEach((button) => {

    button.addEventListener("click", () => {

        launchGame(button.dataset.game);

    });

});

backToMenu.addEventListener("click", showMenu);

