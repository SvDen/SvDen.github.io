'use strict';

class SnakeGame {
    constructor(options = {}) {
        this._gameMode = options.gameMode || 'solo';
        this._firstSnakeName = options.firstSnakeName || '1-st player';
        this._secondSnakeName = options.secondSnakeName || '2-nd player';
        this._firstSnakeColor = options.firstSnakeColor || 'Blue';
        this._secondSnakeColor = options.secondSnakeColor || 'Red';
        this._canvasID = options.canvasID || 'canvas';
        this._pointDim = options.pointDim || 10;
        this._startSnakesSpeed = options.startSnakesSpeed || 10;
        this._amountOfFood = options.amountOfFood || 10;

        this._canvas = document.getElementById(this._canvasID);
        this._context = this._canvas.getContext('2d');
        this._W = this._canvas.width;
        this._H = this._canvas.height;

        this._animationKey;
        this._isGameWasLost = false;

        // привяжем контекст функции во избежание его потери при requestAnimationFrame
        this.draw = this.draw.bind(this, this._context);
    }

    // создаём змейку из конструктора и назначаем ей управление
    createSnake() {
        this.snakeArray = [];
        this.snake = new Snake({
            snakeSpeed: this._startSnakesSpeed,
            pointDim: this._pointDim,
            snakeName: this._firstSnakeName,
            snakeColor: this._firstSnakeColor
        });
        this.snake.bindControls({
            left: 37,
            right: 39,
            up: 38,
            down: 40
        });
        this.snakeArray.push(this.snake); // записали змейку в массив

        if (this._gameMode == 'duo') {
            this.snake2 = new Snake({
                snakeSpeed: this._startSnakesSpeed,
                pointDim: this._pointDim,
                snakeName: this._secondSnakeName,
                snakeColor: this._secondSnakeColor
            });
            this.snake2.bindControls({
                left: 65,
                right: 68,
                up: 87,
                down: 83
            });
            this.snakeArray.push(this.snake2); // записали змейку в массив
        }
    }

    // аналогичным образом создаём еду и определяем размеры еды
    createFood() {
        this._food = new Food({
            pointDim: this._pointDim,
            points: this._amountOfFood,
            canvasW: this._W,
            canvasH: this._H
        });
    }

    // функция начальной инициализации
    init() {
        this.createSnake();
        this.createFood();
        this.drawCountdown(5);
    }

    // функция перезапуска уровня
    refreshLevel() {
        this._food.clearFood();
        this._food.createFood({
            W: this._W,
            H: this._H
        });

        this.snakeArray.forEach((snake, ind) => {
            ind == 0 ? snake.createSnake(0, this._H / 2 / 10 - 1)
                : snake.createSnake(0, this._H / 2 / 10 + 1);
        })
    }

    // фунцкия обратного отсчёта, после которой запускается уровень
    drawCountdown(counter = 3) {
        let height = this._W / 4;

        this._isGameWasLost = false;
        this.drawScreenSaver();

        for (let i = counter; i > 0; i--) {
            setTimeout(() => {
                this.drawScreenSaver();
                this._context.font = `${height}pt Verdana`;
                this._context.fillStyle = 'red';
                let width = this._context.measureText(i).width;
                this._context.fillText(i, (this._W - width) / 2 , this._H - height * 0.5);
            }, 1000 * (counter - i));
        }
        // обновляем позиции змейки и еды

        // и планируем начало новой игры
        setTimeout(() => {
            this.refreshLevel();
            this.draw();
        }, (counter) * 1000);
    }

    // очистка канваса
    clearCanvas() {
        this._context.clearRect(0, 0, this._W, this._H);
        this._context.fillStyle = 'white';
        this._context.fillRect(0, 0, this._W, this._H);
        this._context.strokeStyle = 'black';
        this._context.strokeRect(0, 0, this._W, this._H);
    }

    // функция рисования пикселей (любых)
    createPixel(fillColor = 'blue', strokeColor = 'white', ...rest) {
        rest.forEach(e => {
            this._context.fillStyle = fillColor;
            this._context.fillRect(e.x * this._pointDim, e.y * this._pointDim, this._pointDim, this._pointDim);
            this._context.strokeStyle = strokeColor;
            this._context.strokeRect(e.x * this._pointDim, e.y * this._pointDim, this._pointDim, this._pointDim);
        });
    }

    drawSnakesMoves(food, snakes) {
        let foodCords = food.cords; // координаты и параметры еды
        this.createPixel('green', 'white', ...foodCords); // создаём еду

        let newFrameTime = new Date().getTime();

        snakes.forEach(snake => {
            let snakeCords = snake.cords; // координаты и параметры змейки

            let timePass = newFrameTime - snakeCords.snakePrefFrameTime;

            // продолжаем только если времени прошло больше, чем установленная задержка движения
            if (timePass >= snakeCords.snakeDelay) {
                snake.prevFrameTime = newFrameTime;

                let headPos = {
                    x: snakeCords.snakeArray[0].x,
                    y: snakeCords.snakeArray[0].y
                };

                let cd = snakeCords.currentDirection,
                    sDim = snakeCords.POINT_DIM,
                    snakeArray = snakeCords.snakeArray;

                switch (cd) {
                    case 'right':
                        headPos.x++;
                        break;
                    case 'left':
                        headPos.x--;
                        break;
                    case 'down':
                        headPos.y++;
                        break;
                    case 'up':
                        headPos.y--;
                        break;
                }
                // и устанавливаем направление движения
                snake.prevDirection = cd;

                //проверка коллизий, если пересечения есть, то прерываем игру и начинаем заново
                if (headPos.x * sDim >= this._W || headPos.x < 0
                    || headPos.y * sDim >= this._H || headPos.y < 0
                    || snakeArray.some(e => e.x == headPos.x && e.y == headPos.y)) // самопересечение
                {
                    cancelAnimationFrame(this._animationKey);
                    snake.loseTheGame();
                    this._isGameWasLost = true;
                    return;
                }

                let tail = {}; // создаём хвост
                let eatenFood; // и получаем координаты еды, которую змейка съела (если съела) в этот ход

                // перебираем массив с едой, если присутствует касание еды, то забираем координаты и удаляем еду из массива
                foodCords.forEach((e, ind, arr) => {
                    if (e.x == headPos.x && e.y == headPos.y) {
                        eatenFood = e;
                        delete arr[ind]; // удадяем еду
                    }
                    else return e;
                });

                // проверка, была ли съедена еда
                if (eatenFood) {
                    Object.assign(tail, eatenFood); // вместо хвоста берем координаты еды
                    snake.upScore(); // добавляем очки
                    this._food.createFood(); // пересоздаём еду, отрисована будет на следующем кадре
                } else {
                    tail = snakeArray.pop(); // если еда съедена не была, то берем хвостовую часть
                    Object.assign(tail, headPos);
                }
                // приращиваем новую клеточку к голове
                snakeArray.unshift(tail);
            }

            // отрисовываем змейку
            this.createPixel(snakeCords.snakeColor, 'white', ...snakeCords.snakeArray);
        });
    }

    // ****основной цикл анимации!****
    draw() {
        // сразу планируем следующий цикл анимации
        this._animationKey = requestAnimationFrame(this.draw);

        this.clearCanvas();

        this.drawSnakesMoves(this._food, this.snakeArray);

        if (this._isGameWasLost) {
            this.drawCountdown();
        }

        this.drawScores(...this.snakeArray);
    }

    drawScores(...snakes) {
        snakes.forEach((snake, ind) => {
            let height = 10;
            this._context.font = `${height}pt Verdana`;
            this._context.fillStyle = snake.cords.snakeColor;
            this._context.fillText(`${snake.cords.snakeName}: ${snake.cords.score}`, 5, this._H - 5 * (ind + 1) * height / 4);
        });
    }

    // функция рисования правил либо результатов игры
    drawScreenSaver() {
        this.clearCanvas();
        let width = this._W * .8;
        // если игра запускается впервые, то пишем правила и управление
        if (!this._animationKey) {
            let mainRules = 'Your goal is to eat food and grow as much as possible.'
            + ' Try to avoid toching the borders or self-crossing, if this occur the game will end.'
            + ' In the multiplayer mode snakes can cross each other with no collision.';
            this._wrapText(mainRules, 'black', (this._W - width) / 2, this._H * 0.05, width, 15);

            // прописываем инструкции для первого игрока
            let textPlayerMargin = (this._W - width) / 2;
            let firstPlayerText = this._firstSnakeName + ', use arrow keys on the keyboard to control your snake.' +
                    ' Hold key for accelerate';
            this._wrapText(firstPlayerText, this._firstSnakeColor, textPlayerMargin, this._H * 0.30, width * 0.5, 15);

            // если режим для двоих, то и для второго
            if (this._gameMode == 'duo') {
                let secondPlayerText = this._secondSnakeName + ', use W,A,S,D keys on the keyboard to control your snake.'
                    + ' Hold key for accelerate';
                this._wrapText(secondPlayerText, this._secondSnakeColor, this._W - width * 0.4 - textPlayerMargin, this._H * 0.30, width * 0.5, 15);

            }
        } else { // если игра закончилась и нужно сделать рестарт, то пишем кто выиграл и очки
            if (this._gameMode == 'duo') { // для двоих игроков

                let score1 = this.snake.cords.score,
                    score2 = this.snake2.cords.score,
                    totalScore1 = this.snake2.cords.gamesLost,
                    totalScore2 = this.snake.cords.gamesLost,
                    winner = this.snake.cords.prevGameLost ? this.snake2 : this.snake,
                    currTextScore = `${winner.cords.snakeName} win! Score: ${score1}:${score2}`,
                    mainTextScore = `Total score: ${totalScore1}:${totalScore2}`;

                this._wrapText(currTextScore, winner.cords.snakeColor, (this._W - width) / 2, this._H * 0.1, width, 15);
                this._wrapText(mainTextScore, 'black', (this._W - width) / 2, this._H * 0.2, width, 25);
            } else { // для одиночной игры
                let score = this.snake.cords.score,
                    totalScore = this.snake.cords.gamesLost,
                    currTextScore = `You took ${score} scores!`,
                    mainTextScore = `${totalScore} games has been played`;

                this._wrapText(currTextScore, this.snake.cords.snakeColor, (this._W - width) / 2, this._H * 0.1, width, 15);
                this._wrapText(mainTextScore, 'black', (this._W - width) / 2, this._H * 0.2, width, 25);

            }
        }
    }

    // функция обёртки для текста на канвасе
    _wrapText(text, color, x, y, maxWidth, lineHeight) {
        let words = text.split(' ');
        let line = '';

        this._context.fillStyle = color;
        this._context.font = `${lineHeight}pt Verdana`;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = this._context.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this._context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight * 1.4;
            }
            else {
                line = testLine;
            }
        }
        this._context.fillText(line, x, y);
    }
}