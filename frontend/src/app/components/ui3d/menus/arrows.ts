import * as zim from 'zimjs';
import { arrowsToRotation } from '../../evenmodeller3d/input-projections/rotation';

export enum DIRECTION {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}

export enum SELECTIONTYPE {
    MOVE = "move",
    ROTATE = "rotate"
}

const SELECTIONTYPE_MAP = {
    [SELECTIONTYPE.MOVE]: {
        [DIRECTION.UP]: {text: "➤", rotation: -90},
        [DIRECTION.DOWN]: {text: "➤", rotation: -90},
        [DIRECTION.LEFT]: {text: "➤", rotation: -90},
        [DIRECTION.RIGHT]: {text: "➤", rotation: -90},
    },
    [SELECTIONTYPE.ROTATE]: {
        [DIRECTION.UP]: {text: "270°", rotation: 0},
        [DIRECTION.DOWN]: {text: "90°", rotation: -180},
        [DIRECTION.LEFT]: {text: "180°", rotation: 90},
        [DIRECTION.RIGHT]: {text: "0°", rotation: -90},
    }
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
    rotationPad!: zim.Container;
    rotationsArrows: zim.Triangle[] = []; 
    labels: zim.Label[] = [];
    arrowsColor: string = "#f2622e";
    SELECTIONTYPE_MAP = SELECTIONTYPE_MAP;
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.offborder = 0.1;
        this.width = width;
        this.height = height;
        this.container = new zim.Container(width, height).loc(x, y).top();
        this.createArrows();
    }

    createArrows() {
        const triSize = 80;
        const up = new zim.Triangle(triSize, triSize, triSize, this.arrowsColor)
            .addTo(this.container)
            .cur()
            .pos(0, this.height * this.offborder, CENTER, TOP);
        const down = new zim.Triangle(triSize, triSize, triSize, this.arrowsColor)
            .addTo(this.container)
            .cur()
            .pos(0, this.height * this.offborder, CENTER, BOTTOM);
        const left = new zim.Triangle(triSize, triSize, triSize,this.arrowsColor)
            .addTo(this.container)
            .cur()
            .pos(this.width * this.offborder, 0, LEFT, CENTER);
        const right = new zim.Triangle(triSize, triSize, triSize, this.arrowsColor)
            .addTo(this.container)
            .cur()
            .pos(this.width * this.offborder, 0, RIGHT, CENTER)//.animate({ props: { rotation: 90}});

        

        down.rotation = 180;
        left.rotation = 270;
        right.rotation = 90;

        up.name = DIRECTION.UP;
        down.name = DIRECTION.DOWN;
        left.name = DIRECTION.LEFT;
        right.name = DIRECTION.RIGHT;

        up.sha("grey");
        down.sha("grey");
        left.sha("grey");
        right.sha("grey");


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
                arrow.color = this.arrowsColor;
            })
        })

        this.createLabels(SELECTIONTYPE.MOVE);
    }

    createLabels(selectionType: SELECTIONTYPE) {

        this.labels.forEach((label) => {
            label.dispose();
        })
        if (selectionType === SELECTIONTYPE.MOVE) {
            this.arrows.forEach((arrow) => {
                if (arrow.name === DIRECTION.UP || arrow.name === DIRECTION.DOWN || arrow.name === DIRECTION.LEFT || arrow.name === DIRECTION.RIGHT) {
                    const label = new zim.Label(SELECTIONTYPE_MAP[selectionType][arrow.name].text, 13, "monserrat", "white").addTo(arrow).centerReg().pos(0, 10, CENTER, BOTTOM);
                    label.rot(SELECTIONTYPE_MAP[selectionType][arrow.name].rotation);
                    this.labels.push(label);
                }
            })
        }

        if (selectionType === SELECTIONTYPE.ROTATE) {
            let rotation = 0;
            this.arrows.forEach((arrow) => {
                if (arrow.name === DIRECTION.UP || arrow.name === DIRECTION.DOWN || arrow.name === DIRECTION.LEFT || arrow.name === DIRECTION.RIGHT) {
                    const label = new zim.Label(this.SELECTIONTYPE_MAP[selectionType][arrow.name].text, 13, "monserrat", "white").addTo(arrow).centerReg().pos(0, 10, CENTER, BOTTOM);
                    label.rot(SELECTIONTYPE_MAP[selectionType][arrow.name].rotation);
                    this.labels.push(label);
                }
            })
        }
    }

    changeArrowsColor(color: string) {
        this.arrows.forEach((arrow) => {
            arrow.color = color;
        })

        this.arrowsColor = color;
    }

    arrowsOnClick(dir: DIRECTION) {
        return;
    }

    changeArrowsRotationText(arrowsToRotation: arrowsToRotation) {
        this.SELECTIONTYPE_MAP = {
            [SELECTIONTYPE.MOVE]: {
                [DIRECTION.UP]: {text: "➤", rotation: -90},
                [DIRECTION.DOWN]: {text: "➤", rotation: -90},
                [DIRECTION.LEFT]: {text: "➤", rotation: -90},
                [DIRECTION.RIGHT]: {text: "➤", rotation: -90},
            },
            [SELECTIONTYPE.ROTATE]: {
                [DIRECTION.UP]: {text:  arrowsToRotation[DIRECTION.UP]+ "°", rotation: 0},
                [DIRECTION.DOWN]: {text: arrowsToRotation[DIRECTION.DOWN] + "°", rotation: -180},
                [DIRECTION.LEFT]: {text:  arrowsToRotation[DIRECTION.LEFT] + "°", rotation: 90},
                [DIRECTION.RIGHT]: {text: arrowsToRotation[DIRECTION.RIGHT] + "°", rotation: -90},
            }
        } 
    }
}