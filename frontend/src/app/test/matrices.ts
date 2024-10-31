import { range } from 'lodash';

export class NMatrix<T> {
    cols: number;
    layer: number;
    rows: number;
    matrix: (T | null)[][][];

    constructor(sizex: number, sizey: number, sizez: number, defaultValue: T | null) {
        this.cols = sizex;
        this.layer = sizey;
        this.rows = sizez;
        this.matrix = Array.from({ length: sizex }, () =>
            Array.from({ length: sizey }, () =>
                Array.from({ length: sizez }, () => defaultValue)
            )
        );
    }

    public show() {
        let result = `Array of size: ${this.cols}x${this.layer}x${this.rows}\n`;
        for (let i = 0; i < this.cols; i++) {
            result += `[\n`;
            for (let j = 0; j < this.layer; j++) {
                result += `[`;
                for (let k = 0; k < this.rows; k++) {
                    result += `${this.matrix[i][j][k]} `;
                }
                result += "]\n";
            }
            result += `]\n`;
        }

        return result;
    }

    public change(value: T) {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.layer; j++) {
                for (let k = 0; k < this.rows; k++) {
                    this.matrix[i][j][k] = value;
                }
            }
        }
    }

    public get(x: number, y: number, z: number): T | null {
        return this.matrix[x][y][z];
    }

    public set(x: number, y: number, z: number, value: T | null) {
        this.matrix[x][y][z] = value;
    }

    public forEach(callback: (value: T, x: number, y: number, z: number) => void) {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.layer; j++) {
                for (let k = 0; k < this.rows; k++) {
                    callback(this.matrix[i][j][k]!, i, j, k);
                }
            }
        }
    }
}