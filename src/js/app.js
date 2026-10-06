import { Connect4Hoops } from "./games/connect4hoops.js";

const gameMenu = document.querySelector(".game-menu");
const gameArea = document.querySelector("#game-area");
const gameContainer = document.querySelector("#game-container");
const backToMenu = document.querySelector("#back-to-menu");

const games = {
    connect4hoops: Connect4Hoops
};

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

    // Start selected game
    const game = new Game(gameContainer);
    game.start();
}

function showMenu() {
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