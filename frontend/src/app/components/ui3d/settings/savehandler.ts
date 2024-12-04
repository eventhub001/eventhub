import * as zim from 'zimjs';

export class SaveHandlerPad {
    container: zim.Container;
    width: number;
    height: number;
    buttons: zim.Button[] = [];
    margin: number;
    constructor(x: number, y: number, width: number, height: number) {
        this.margin = 5;
        const buttonsAmt = 2;
        this.width = width;
        this.height = height;
        this.container = new zim.Container(width * buttonsAmt + this.margin * (buttonsAmt - 1), height).centerReg().loc(x, y);
        this.createSelectionPad();
    }

    createSelectionPad() {
        const rotationLabel = new zim.Label("Guardar", 13, "roboto", "white");
        const rotationButton = new zim.Button({width: this.width, height:this.height, label: rotationLabel, backgroundColor: "#40537c"}).addTo(this.container).cur().pos(0, 0, LEFT, CENTER);
        const movelabel = new zim.Label("Cargar", 13, "roboto", "white");
        const moveButton = new zim.Button({width: this.width, height:this.height, label: movelabel, backgroundColor: "#40537c"}).addTo(this.container).cur().pos(this.width + this.margin, 0, LEFT, CENTER);
    
        this.buttons.push(rotationButton);
        this.buttons.push(moveButton);

        rotationButton.on("click", () => this.saveButtonOnClick());
        moveButton.on("click", () => this.loadButtonOnClick());
    }

    saveButtonOnClick() {
        return;
    }

    loadButtonOnClick() {
        return;
    }

    hide() {
        this.container.vis(false);
    }

    show() {
        this.container.vis(true);
    }
}