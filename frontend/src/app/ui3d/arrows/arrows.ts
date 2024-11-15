import * as zim from 'zimjs';

export enum DIRECTION {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}

export const MOVE_DIRECTION = {
    [DIRECTION.UP]: { x: 0, y: 0, z: -1 },
    [DIRECTION.DOWN]: { x: 0, y: 0, z: 1 },
    [DIRECTION.LEFT]: { x: -1, y: 0, z: 0 },
    [DIRECTION.RIGHT]: { x: 1, y: 0, z: 0 },
}
export class ArrowsMenu {
    
    public arrows: zim.Triangle[] = [];
    container: zim.Container;
    x: number;
    y: number;
    width: number;
    height: number;
    offborder: number; 
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.offborder = 0.05;
        this.width = width;
        this.height = height;
        this.container = new zim.Container(width, height).loc(x, y).outline();
        this.createArrows();
    }

    createArrows() {
        const triSize = 80;
        const up = new zim.Triangle(triSize, triSize, triSize, "blue")
            .addTo(this.container)
            .cur()
            .pos(0, this.height * this.offborder, CENTER, TOP);
        const down = new zim.Triangle(triSize, triSize, triSize, "blue")
            .addTo(this.container)
            .cur()
            .pos(0, this.height * this.offborder, CENTER, BOTTOM);
        const left = new zim.Triangle(triSize, triSize, triSize, "blue")
            .addTo(this.container)
            .cur()
            .pos(this.width * this.offborder, 0, LEFT, CENTER);
        const right = new zim.Triangle(triSize, triSize, triSize, "blue")
            .addTo(this.container)
            .cur()
            .pos(this.width * this.offborder, 0, RIGHT, CENTER);

        
        down.rotation = 180;
        left.rotation = 270;
        right.rotation = 90;

        up.on("click", () => {
            this.arrowsOnClick(DIRECTION.UP);
        })
        down.on("click", () => {
            this.arrowsOnClick(DIRECTION.DOWN);
        })
        left.on("click", () => {
            this.arrowsOnClick(DIRECTION.LEFT);
        })
        right.on("click", () => {
            this.arrowsOnClick(DIRECTION.RIGHT);
        })

        this.arrows.push(up);
        this.arrows.push(down);
        this.arrows.push(left);
        this.arrows.push(right);
    
        this.arrows.forEach((arrow) => {
            arrow.on("mouseover", () => {
                arrow.color = "red";
            }) 
            arrow.on("mouseout", () => {
                arrow.color = "blue";
            })
        })
    }

    arrowsOnClick(dir: DIRECTION) {
        console.log(dir);
    }
}