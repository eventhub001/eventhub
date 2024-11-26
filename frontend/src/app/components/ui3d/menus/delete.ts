import * as zim from 'zimjs';
import { SELECTIONTYPE } from './arrows';

export class DeleteActionPad  {
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
        const rotationLabel = new zim.Label("Eliminar", 13, "roboto", "white");
        const deleteButton = new zim.Button({width: this.width, height:this.height, label: rotationLabel, backgroundColor: "#e24767"}).addTo(this.container).cur().pos(0, 0, LEFT, CENTER);
    
        this.buttons.push(deleteButton);

        deleteButton.on("click", () => this.deleteButtonOnClick());
    }

    deleteButtonOnClick() {
        return;
    }

    moveButtonOnClick() {
        return;
    }
}