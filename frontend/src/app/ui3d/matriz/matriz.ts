import * as zim from 'zimjs';  

export class MatrixUI {
    rows: number;
    cols: number;
    width: number;
    height: number;
    tile: zim.Tile;
    curSelectedRow: number = -1;
    curSelectedCol: number = -1;

    public constructor(width: number, height: number, rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.width = width;
        this.height = height;
        this.tile = this.buildMatrix();
    }

    public buildMatrix() : zim.Tile {
        const tile = new zim.Tile(this.setupCells(), this.rows, this.cols, 1, 1).center();
        tile.loop((item: any, index: number) => {
            const row = Math.floor(index / this.rows);
            const col = index % this.rows;
        
            this.curSelectedRow = row;
            this.curSelectedCol = col;

            item.on('click', () => {
                console.log(index % this.rows);
                console.log(`Row: ${row}, Col: ${col}`);
                this.onCellClick(row, col);
            });
        });
        return tile;
    }

    private setupCells(): zim.Rectangle {
        const cell = new zim.Rectangle(this.width / this.rows, this.height / this.cols, 'blue');
        return cell;
    }

    public onCellClick(row: number, col: number): void {
        console.log(`Cell clicked at row: ${row}, col: ${col}`);
        // Additional custom behavior here
    }

}

