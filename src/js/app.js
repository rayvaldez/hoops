const gameButtons = document.querySelectorAll(".game-card");

gameButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const game = button.dataset.game;

        console.log("Selected game:", game);

        if (game === "connect4hoops") {
            alert("Connect 4 Hoops selected!");
        }

        if (game === "sixty-second") {
            alert("60 Second Shootout selected!");
        }
    });
});