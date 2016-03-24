class Food {
    constructor(options = {}) {
        this._POINT_DIM = options.pointDim || 10;
        this._points = options.points || 1;
        this._foodArray = new Array(this._points);
        this._W = options.canvasW || 500;
        this._H = options.canvasH || 500;
    }

    createFood() {
        for (let i = 0; i < this._points; i++) {
            if (!this._foodArray[i]) {
                this._foodArray[i] = {
                    x: Math.round(Math.random() * (this._W - this._POINT_DIM) / this._POINT_DIM),
                    y: Math.round(Math.random() * (this._H - this._POINT_DIM) / this._POINT_DIM)
                };
            }
        }
    }

    clearFood() {
        this._foodArray.forEach((e, ind, arr) => delete arr[ind]);
    }

    get cords() {
        return this._foodArray;
    }
}