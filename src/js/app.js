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

let currentGame = null;

function launchGame(gameId) {

    const Game = games[gameId];

    if (!Game) {

        console.error(`Game not found: ${gameId}`);

        return;

    }

    // Hide the main menu

    gameMenu.hidden = true;

    // Show the game

    gameArea.hidden = false;

    // Clear previous game

    gameContainer.innerHTML = "";

    // Remove previous game listeners/timers

    if (currentGame) {

        currentGame.destroy?.();

    }

    // Start selected game

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

}

document.querySelectorAll(".game-card").forEach((button) => {

    button.addEventListener("click", () => {

        launchGame(button.dataset.game);

    });

});

backToMenu.addEventListener("click", showMenu);