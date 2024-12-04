import * as zim from 'zimjs';

export class SceneSettingsPad {
    container: zim.Container;
    width: number;
    height: number;
    buttons: zim.Button[] = [];
    inputs: {colInput: zim.TextInput, rowsInput: zim.TextInput, widthInput: zim.TextInput, depthInput: zim.TextInput} = {} as {colInput: zim.TextInput, rowsInput: zim.TextInput, widthInput: zim.TextInput, depthInput: zim.TextInput};
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
        const sceneSettingLabel = new zim.Label("Guardar", 13, "roboto", "white");
        const sceneSettingCancelLabel = new zim.Label("X", 13, "roboto", "white");
        const sceneSettingButton = new zim.Button({width: this.width, height:this.height, label: sceneSettingLabel, backgroundColor: "#40537c"}).addTo(this.container).cur().pos(0, 0, RIGHT, CENTER);
        const sceneSettingCancelButton = new zim.Button({width: this.margin * 5, height:this.height, label: sceneSettingCancelLabel, backgroundColor: "#e24767"}).addTo(this.container).cur().pos(0, (-this.height - this.margin) * 3, RIGHT, CENTER);
        const sceneMatrixViewLabel = new zim.Label("Ver matriz", 13, "roboto", "white");
        const sceneMatrixViewButton = new zim.Button({width: this.width, height:this.height, label: sceneMatrixViewLabel, backgroundColor: "#40537c"}).addTo(this.container).cur().pos(0, this.height + this.margin, RIGHT, CENTER);

        const colInput = new zim.TextInput({width: this.width / 2 - this.margin, height: this.height, label: "Columnas", placeholder: "Columnas", size: 13, inputType: "number"}).addTo(this.container).pos(this.width, -this.height - this.margin, LEFT, CENTER);
        const rowsInput = new zim.TextInput({width: this.width / 2 - this.margin, height: this.height, label: "Columnas", placeholder: "Filas", size: 13, inputType: "number"}).addTo(this.container).pos(0, -this.height - this.margin, RIGHT, CENTER);
        const widthInput = new zim.TextInput({width: this.width / 2 - this.margin, height: this.height, label: "Ancho", placeholder: "Ancho", size: 13, inputType: "number"}).addTo(this.container).pos(this.width, (-this.height - this.margin) * 2, LEFT, CENTER);
        const depthInput = new zim.TextInput({width: this.width / 2 - this.margin, height: this.height, label: "Largo", placeholder: "Largo", size: 13, inputType: "number"}).addTo(this.container).pos(0, (-this.height - this.margin ) * 2, RIGHT, CENTER);

        this.buttons.push(sceneSettingButton);
        this.buttons.push(sceneSettingCancelButton);
        this.buttons.push(sceneMatrixViewButton);

        this.inputs.colInput = colInput;
        this.inputs.rowsInput = rowsInput;
        this.inputs.widthInput = widthInput;
        this.inputs.depthInput = depthInput;

        Object.values(this.inputs).forEach((input) => {
            this.buttons[0].on("click", () => {
                input.vis(!input.visible);
                this.buttons[0].text = input.visible ? "Guardar" : "Configurar escena";
                this.buttons[1].vis(input.visible);
            });
            this.buttons[1].on("click", () => {
                input.vis(!input.visible);
                this.buttons[0].text = input.visible ? "Guardar" : "Configurar escena";
                this.buttons[1].vis(input.visible);
            });

            input.on("input", () => this.inputsOnChanges());
        });

        sceneMatrixViewButton.on("click", () => this.sceneMatrixViewButtonOnClick());

        sceneSettingButton.on("click", () => this.sceneSettingButtonOnClick());
        sceneSettingCancelButton.on("click", () => this.sceneSettingCancelButtonOnClick());
    }

    sceneSettingButtonOnClick() {
        return;
    }

    sceneSettingCancelButtonOnClick() {
        return;
    }

    inputsOnChanges() {
        return;
    }

    sceneMatrixViewButtonOnClick() {
        return;
    }

    isInvalidInput() {
        return this.inputs.colInput.text == "" || this.inputs.rowsInput.text == "" || this.inputs.widthInput.text == "" || this.inputs.depthInput.text == "";
    }
}