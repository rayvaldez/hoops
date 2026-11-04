
import { ArduinoSensor } from "./arduino-sensor.js";
import { Connect3Hoops } from "./games/connect3hoops.js";
import { Connect4Hoops } from "./games/connect4hoops.js";
import { ThirtySecondShootout } from "./games/thirty-second-shootout.js";
import { HoopsOfWar } from "./games/hoops-of-war.js";
import { HeadToHeadShootout } from "./games/head-to-head-shootout.js";

const gameMenu = document.querySelector(".game-menu");
const gameArea = document.querySelector("#game-area");
const gameContainer = document.querySelector("#game-container");
// const backToMenu = document.querySelector("#back-to-menu");

const games = {
    "thirty-second-shootout": ThirtySecondShootout,
    "hoops-of-war": HoopsOfWar,
    "connect3hoops": Connect3Hoops,
    "connect4hoops": Connect4Hoops,
    "head-to-head-shootout": HeadToHeadShootout
};

let currentGame = null;
let arduinoSensor;

// Sports-arena header
document.body.classList.add("sports-arena-app");

const arenaHeader = document.createElement("header");
arenaHeader.className = "arena-header";
arenaHeader.innerHTML = `
    <div class="arena-brand"
     role="button"
     tabindex="0"
     aria-label="Return to game menu"
     title="Return to game menu">
        <div class="arena-brand-mark" aria-hidden="true">🏀</div>
        <div class="arena-brand-copy">
            <p>COURTSIDE ARCADE</p>
            <h1>HOOPS ARENA</h1>
        </div>
    </div>
    <div class="arena-header-tag">3 GAMES · 1 COURT</div>
`;

document.body.prepend(arenaHeader);

// Allow the logo and title to return to the game menu.
const arenaBrand = arenaHeader.querySelector(".arena-brand");

arenaBrand.addEventListener("click", () => {
    showMenu();
});

// Also support keyboard activation.
arenaBrand.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showMenu();
    }
});

// Persistent Arduino status bar
const arduinoFooter = document.createElement("footer");
arduinoFooter.className = "app-arduino-footer";
arduinoFooter.dataset.state = "disconnected";
arduinoFooter.innerHTML = `
    <div class="arduino-status-copy">
        <span class="arduino-status-dot" data-arduino-dot
              aria-hidden="true"></span>
        <div class="arduino-status-text">
            <strong>HARDWARE SENSOR</strong>
            <span data-arduino-status role="status" aria-live="polite">
                ARDUINO not connected
            </span>
        </div>
    </div>

    <button
        class="shootout-button arduino-connect-button"
        data-action="connect-arduino"
        type="button">
        CONNECT ARDUINO
    </button>
`;

document.body.appendChild(arduinoFooter);

const arduinoButton = arduinoFooter.querySelector(
    '[data-action="connect-arduino"]'
);

function updateArduinoUI(message) {
    const status = arduinoFooter.querySelector("[data-arduino-status]");

    const connected = Boolean(arduinoSensor?.connected);
    const connecting =
        !connected && /select.*port|connecting/i.test(message);

    if (status) {
        status.textContent = message;
    }

    arduinoFooter.dataset.state = connected
        ? "connected"
        : connecting
            ? "connecting"
            : /failed|unavailable|error/i.test(message)
                ? "error"
                : "disconnected";

    arduinoButton.textContent = connected
        ? "DISCONNECT ARDUINO"
        : connecting
            ? "CONNECTING…"
            : "Connect";

    arduinoButton.disabled = connecting;
}


// One sensor instance for the entire app.
arduinoSensor = new ArduinoSensor({
    onShot: () => {
        if (currentGame instanceof ThirtySecondShootout) {
            currentGame.registerShot();
        }
    },

    onStart: () => {
        startSelectedGame();
    },

    onLeft: () => {
        moveMenuSelection("LEFT");
    },

    onRight: () => {
        moveMenuSelection("RIGHT");
    },

    onStatusChange: updateArduinoUI
});

updateArduinoUI("Hoop not connected");


// The button remains available on the menu and in every game.
arduinoButton.addEventListener("click", async () => {
    if (arduinoSensor.connected) {
        await arduinoSensor.disconnect();
    } else {
        await arduinoSensor.connect();
    }
});

function launchGame(gameId) {
    const Game = games[gameId];

    if (!Game) {
        console.error(`Game not found: ${gameId}`);
        return;
    }

    if (currentGame) {
        currentGame.destroy?.();
    }

    gameMenu.hidden = true;
    gameArea.hidden = false;
    gameContainer.innerHTML = "";

    // Pass the shared sensor into the game.
    currentGame = new Game(gameContainer, arduinoSensor, showMenu);
    arduinoSensor.sendCommand("BEGIN");
    currentGame.start();
}

function showMenu() {
    if (currentGame) {
        currentGame.destroy?.();
        currentGame = null;
    }

    gameArea.hidden = true;
    gameMenu.hidden = false;
    gameContainer.innerHTML = "";
    arduinoSensor.endGame();

    // Deliberately keep the shared Arduino connection open.
}

function getGameCards() {
    return [...document.querySelectorAll(".game-card")];
}

function moveMenuSelection(direction) {
    // Only navigate when the game menu is visible.
    if (gameMenu.hidden) return;

    const cards = getGameCards();
    if (!cards.length) return;

    const currentIndex = cards.indexOf(document.activeElement);

    let nextIndex;

    if (currentIndex === -1) {
        nextIndex = direction === "RIGHT" ? 0 : cards.length - 1;
    } else {
        nextIndex =
            (currentIndex + (direction === "RIGHT" ? 1 : -1) + cards.length)
            % cards.length;
    }

    cards[nextIndex].focus();
}

function startSelectedGame() {
    if (!gameMenu.hidden) {
        const cards = getGameCards();

        const selectedCard = cards.includes(document.activeElement)
            ? document.activeElement
            : cards[0];

        selectedCard?.click();
        return;
    }

    // If a game is already open, activate its start/play-again button.
    const gameStartButton = gameContainer.querySelector(
        "[data-start-game]"
    );

    gameStartButton?.click();
}

document.querySelectorAll(".game-card").forEach((button) => {
    button.addEventListener("click", () => {
        launchGame(button.dataset.game);
    });
});