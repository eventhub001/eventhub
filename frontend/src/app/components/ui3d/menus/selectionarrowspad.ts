import * as zim from 'zimjs';
import { SELECTIONTYPE } from './arrows';

export class SelectionArrowsPad  {
    container: zim.Container;
    width: number;
    height: number;
    buttons: zim.Button[] = [];
    margin: number;
    currentSelection: SELECTIONTYPE = SELECTIONTYPE.MOVE;
    constructor(x: number, y: number, width: number, height: number) {
        this.margin = 5;
        const buttonsAmt = 2;
        this.width = width;
        this.height = height;
        this.container = new zim.Container(width * buttonsAmt + this.margin * (buttonsAmt - 1), height).centerReg().loc(x, y);
        this.createSelectionPad();
    }

    createSelectionPad() {
        const rotationLabel = new zim.Label("Rotar", 13, "roboto", "white");
        const rotationButton = new zim.Button({width: this.width, height:this.height, label: rotationLabel, backgroundColor: "#6659c5"}).addTo(this.container).cur().pos(0, 0, LEFT, CENTER);
        const movelabel = new zim.Label("Mover", 13, "roboto", "white");
        const moveButton = new zim.Button({width: this.width, height:this.height, label: movelabel, backgroundColor: "#f2622e"}).addTo(this.container).cur().pos(this.width + this.margin, 0, LEFT, CENTER);
    
        this.buttons.push(rotationButton);
        this.buttons.push(moveButton);

        rotationButton.on("click", () => this.rotationButtonOnClick());
        moveButton.on("click", () => this.moveButtonOnClick());
    }

    rotationButtonOnClick() {
        return;
    }

    moveButtonOnClick() {
        return;
    }

    hide() {
        this.container.vis(false);
    }

    show() {
        this.container.vis(true);
    }
}