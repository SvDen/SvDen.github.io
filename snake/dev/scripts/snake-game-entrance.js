'use strict';

document.forms.snakeGameForm.onsubmit = function(e) {
    let gameMode = (this.isSecondPlayer.checked) ? 'duo' : 'solo',

        firstSnakeName = this.firstPlayerName.value,
        secondSnakeName = this.secondPlayerName.value,

        firstSnakeColor = this.firstPlayerColor.value,
        secondSnakeColor = this.secondPlayerColor.value,

        startSnakesSpeed = this.startSnakesSpeed.value,
        amountOfFood = this.amountOfFood.value;


    console.log(startSnakesSpeed);

    let game = new SnakeGame({
        gameMode,
        firstSnakeName,
        secondSnakeName,
        firstSnakeColor,
        secondSnakeColor,
        startSnakesSpeed,
        amountOfFood
    });
    game.init();

    document.getElementById('snake-game-container').classList.add('hidden');

    return false;
}