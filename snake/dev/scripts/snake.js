'use strict';

class Snake {
    constructor(options = {}) {
        this._snakeLenght = options.snakeLenght || 5;
        this._initialSnakeSpeed = options.snakeSpeed || 10;
        this._POINT_DIM = options.pointDim || 10;
        this._color = options.snakeColor || 'blue';
        this._snakeName = options.snakeName || 'unknown';
        this._prevFrameTime = 0; // время предыдущего кадра анимации
        this._gamesLost = 0; // общее количество проигранных игр
    }

    createSnake(shiftX = 0, shiftY = 0, direction = 'right') {
        this._score = 0;
        this._prevGameLost = false; // показывает, проиграл ли игрок в прошлый раз
        this._snakeSpeed = this._initialSnakeSpeed;

        this._snakeArray = []; // массив всех точек тела змейки
        this._prevDirection = direction; // показывает, куда двигалась змейка в прошлый ход
        this._curDirection = this._prevDirection; // текущее направление, назначаемое клавишами
        for (let i = this._snakeLenght - 1; i >= 0; i--) {
            this._snakeArray.push({x: i + shiftX, y: shiftY});
        }
    }

    get cords() {
        return {
            currentDirection: this._curDirection,
            previousDirection: this._prevDirection,
            snakeArray: this._snakeArray,
            POINT_DIM: this._POINT_DIM,
            score: this._score,
            snakeSpeed: this._snakeSpeed,
            snakeColor: this._color,
            snakeDelay: 1000 / this._snakeSpeed,
            snakePrefFrameTime: this._prevFrameTime,
            snakeName: this._snakeName,
            gamesLost: this._gamesLost,
            prevGameLost: this._prevGameLost
        }
    }

    set prevFrameTime(time) {
        this._prevFrameTime = time;
    }

    set prevDirection(dir) {
        this._prevDirection = dir;
    }

    loseTheGame() {
        this._prevGameLost = true;
        this._gamesLost++;
    }

    upScore() {
        return this._score++;
    }

    bindControls(options) {
        document.addEventListener('keydown', e => {
            switch (e.which) {
                case options.right:
                    if (this._prevDirection != 'left') this._curDirection = 'right';
                    if (this._prevDirection == 'right' && e.repeat) this._snakeSpeed = this._initialSnakeSpeed * 2;
                    break;
                case options.up:
                    if (this._prevDirection != 'down') this._curDirection = 'up';
                    if (this._prevDirection == 'up' && e.repeat) this._snakeSpeed = this._initialSnakeSpeed * 2;
                    break;
                case options.left:
                    if (this._prevDirection != 'right') this._curDirection = 'left';
                    if (this._prevDirection == 'left' && e.repeat) this._snakeSpeed = this._initialSnakeSpeed * 2;
                    break;
                case options.down:
                    if (this._prevDirection != 'up') this._curDirection = 'down';
                    if (this._prevDirection == 'down' && e.repeat) this._snakeSpeed = this._initialSnakeSpeed * 2;
                    break;
            }
            //e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            switch (e.which) {
                case options.right:
                    if (this._prevDirection == 'right') this._snakeSpeed = this._initialSnakeSpeed;;
                    break;
                case options.up:
                    if (this._prevDirection == 'up') this._snakeSpeed = this._initialSnakeSpeed;;
                    break;
                case options.left:
                    if (this._prevDirection == 'left') this._snakeSpeed = this._initialSnakeSpeed;;
                    break;
                case options.down:
                    if (this._prevDirection == 'down') this._snakeSpeed = this._initialSnakeSpeed;;
                    break;
            }
        })
    }
}