import { AfterContentInit, Component, EventEmitter, inject, Input, OnDestroy, Output, SimpleChange, SimpleChanges } from '@angular/core'
import { Frame, Circle, Dial, Emitter, Pen, MotionController, series, LabelOnArc, Tile, Rectangle, Bitmap, Stage, Carousel, Container, DisplayObject } from 'zimjs'
import { MatrixUI } from './matriz/matriz'
import { settings, SetUpUI } from './settings/settings'
import * as UICommands from './commands/commands'
import { blobsToImages, blobToImage } from './loader/blobloader'
import { AssetSelectorComponent } from './menus/assetselector'
import { ArrowsMenu, DIRECTION, MOVE_DIRECTION, SELECTIONTYPE } from './menus/arrows'
import { AssetBitmap, AssetImg, AssetMetadata, AssetModel, IScene3D, IScene3DSetting } from '../../interfaces'
import { SelectionArrowsPad } from './menus/selectionarrowspad'
import { arrowToAxis } from '../evenmodeller3d/input-projections/movement'
import { arrowsToRotation } from '../evenmodeller3d/input-projections/rotation'
import { DeleteActionPad } from './menus/delete'
import { SaveHandlerPad } from './settings/savehandler'
import { SceneSettingsPad } from './settings/scene-settings'
import { AlertService } from '../../services/alert.service'
@Component({
    selector: 'app-ui3d',
    standalone: true,
    templateUrl: './ui3d.component.html',
    styleUrls: ['./ui3d.component.css']
})
export class Ui3DComponent implements OnDestroy, AfterContentInit {
    frame: Frame | undefined
    @Input() modelMetadata: AssetMetadata[] = [];
    @Input() images: AssetImg[] = [];
    @Input() models: AssetModel[] = [];

    // this could go in one single command object.
    @Output() AdditionAction: EventEmitter<UICommands.addtion> = new EventEmitter<UICommands.addtion>()
    @Output() MoveAction: EventEmitter<UICommands.directional> = new EventEmitter<UICommands.directional>()
    @Output() RotationAction: EventEmitter<UICommands.directional> = new EventEmitter<UICommands.directional>()
    @Output() AddtionFromModelSelectedAction: EventEmitter<UICommands.addtion> = new EventEmitter<UICommands.addtion>()
    @Output() DeleteAction: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() SaveAction: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() SettingsAction: EventEmitter<IScene3DSetting> = new EventEmitter<IScene3DSetting>()
    @Output() LoadSceneAction: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() SaveSceneSettingAction: EventEmitter<IScene3DSetting> = new EventEmitter<IScene3DSetting>()
    @Output() MatrizViewAction: EventEmitter<boolean> = new EventEmitter<boolean>()


    isFirstLoaded: boolean = true;

    @Input() arrowToAxis!: arrowToAxis;
    @Input() arrowToRotation!: arrowsToRotation;
    
    matriz?: MatrixUI;
    settings: settings;
    saveHandlerPad: SaveHandlerPad | undefined;
    modelImgs: AssetBitmap[] = [];
    width: number = 300;
    height: number = 840;
    stage: Stage | undefined;
    showMatriz: boolean = true;

    selectionArrowsPad: SelectionArrowsPad | undefined;
    arrowSelection: ArrowsMenu | undefined;
    deletePad: DeleteActionPad | undefined;
    sceneSettingsPad: SceneSettingsPad | undefined;
    assetSelector: AssetSelectorComponent | undefined;

    alertService: any = inject(AlertService);
    constructor() {
        this.settings = SetUpUI.setUpUI(
            350, 600, 20, 15, 3, 21, 10, 3);
    }

    ngOnDestroy(): void {
        this.frame?.dispose()
    }

    ngOnChanges() {
        if (this.arrowToRotation && this.arrowSelection && this.selectionArrowsPad) {
            if (this.selectionArrowsPad?.currentSelection === SELECTIONTYPE.MOVE) {
                return;
            }
            console.log("this.arrowToRotation", this.arrowToRotation);
            this.arrowSelection!.changeArrowsRotationText(this.arrowToRotation);
            this.arrowSelection!.createLabels(SELECTIONTYPE.ROTATE);
        }
    }   

    async ngAfterContentInit() {

        this.settings.x = 21;
        this.settings.y = 10;
        this.settings.width = 20;
        this.settings.depth = 15;

        this.frame = new Frame({
            scaling: "zim",
            width: this.width,
            height: this.height,
            outerColor: blue,
            mouseMoveOutside: true, // so Pen and Dial work better
            ready: async () => {
                const PADDING = 20;

                const pen = new Pen({ min: 10, max: 60 })
                    .addTo()
                    .bot()

                this.stage = new Stage("1");

                // const imgs = await blobToImage(this.images[0].blob);
                const imgs: AssetBitmap[] = await Promise.all(
                    this.images.map(async (img) => {
                    const {id, bitmap} = await this.imgAssetToBitmap(img);
                    return {id: id, bitmap: bitmap};
                }));

                this.assetSelector = new AssetSelectorComponent(imgs, 10, 400, 5);
                this.assetSelector.onBitmapClick = (id: number) => {
                    this.AdditionAction.emit({
                        id: id
                    });
                }
                this.arrowSelection = new ArrowsMenu(PADDING, PADDING + 20, 300, 300);
                this.selectionArrowsPad = new SelectionArrowsPad(this.width / 2 + 40, this.height * 0.77, 80, 30);
                this.saveHandlerPad = new SaveHandlerPad(this.width / 2 + 40, this.height * 0.90, 80, 30);
                this.deletePad = new DeleteActionPad(this.width / 2 + 40, this.height * 0.82, 80, 30);

                this.saveHandlerPad.saveButtonOnClick = () => {
                    this.SaveAction.emit(true);
                };
                this.saveHandlerPad.loadButtonOnClick = () => {
                    this.LoadSceneAction.emit(true);
                }

                this.sceneSettingsPad = new SceneSettingsPad(this.width / 2 - 40, this.height * 0.94, 150, 30);

                if (this.isFirstLoaded) {
                    this.saveHandlerPad.hide();
                    this.deletePad.hide();
                    this.selectionArrowsPad.hide();
                    this.arrowSelection.hide();
                    this.assetSelector.hide();
                }

                this.sceneSettingsPad.sceneSettingButtonOnClick = () => {

                    if (this.isFirstLoaded) {
                        this.arrowSelection?.show();
                        this.selectionArrowsPad?.show();
                        this.deletePad?.show();
                        this.assetSelector?.show();
                        this.saveHandlerPad?.show();

                        this.isFirstLoaded = false;
                    }
                    else {
                        this.saveHandlerPad?.buttons.forEach((button) => {
                            button.vis(button.visible === false ? true : false);
                            if (button.visible === false) {
                                this.alertService.info("Recuerda que no debe de haber objetos en la escena para guardar los cambios.");
                            }
                        })
                    }

                    this.settings.width = Number(this.sceneSettingsPad?.inputs.widthInput.text);
                    this.settings.depth = Number(this.sceneSettingsPad?.inputs.depthInput.text);
                    this.settings.x = Number(this.sceneSettingsPad?.inputs.colInput.text);
                    this.settings.y = Number(this.sceneSettingsPad?.inputs.rowsInput.text);

                    this.SaveSceneSettingAction.emit({
                        width: this.settings.width,
                        depth: this.settings.depth,
                        cols: this.settings.x,
                        rows: this.settings.y
                    } as IScene3DSetting);
                }
                this.sceneSettingsPad.inputsOnChanges = () => {

                    if (this.sceneSettingsPad?.isInvalidInput()) {
                        return;
                    }

                    this.SettingsAction.emit({
                       width: Number(this.sceneSettingsPad?.inputs.widthInput.text),
                       depth: Number(this.sceneSettingsPad?.inputs.depthInput.text),
                       cols: Number(this.sceneSettingsPad?.inputs.colInput.text),
                       rows: Number(this.sceneSettingsPad?.inputs.rowsInput.text)
                    } as IScene3DSetting); 
                }

                this.sceneSettingsPad.sceneSettingCancelButtonOnClick = () => {
                    if (this.isFirstLoaded) {
                        this.arrowSelection?.show();
                        this.selectionArrowsPad?.show();
                        this.deletePad?.show();
                        this.assetSelector?.show();
                        this.saveHandlerPad?.show();

                        this.isFirstLoaded = false;
                    }

                    else {
                        this.saveHandlerPad?.buttons.forEach((button) => {
                            button.vis(button.visible === false ? true : false);
                        })
                    }

                    this.SettingsAction.emit({
                        width: this.settings.width,
                        depth: this.settings.depth,
                        cols: this.settings.x,
                        rows: this.settings.y
                    } as IScene3DSetting);

                    if (this.sceneSettingsPad && this.sceneSettingsPad.inputs) {
                        this.sceneSettingsPad.inputs.widthInput.text = this.settings.width.toString();
                        this.sceneSettingsPad.inputs.depthInput.text = this.settings.depth.toString();
                        this.sceneSettingsPad.inputs.colInput.text = this.settings.x.toString();
                        this.sceneSettingsPad.inputs.rowsInput.text = this.settings.y.toString();
                    }
                }

                this.sceneSettingsPad.sceneMatrixViewButtonOnClick = () => {
                    this.showMatriz = !this.showMatriz;
                    this.MatrizViewAction.emit(this.showMatriz);
                }

                this.deletePad.deleteButtonOnClick = () => this.DeleteAction.emit(true);
                this.selectionArrowsPad.rotationButtonOnClick = () => {
                    this.arrowSelection!.createLabels(SELECTIONTYPE.ROTATE);
                    this.arrowSelection!.arrowsColor = "#6659c5";
                    this.arrowSelection!.changeArrowsColor("#6659c5");
                    this.selectionArrowsPad!.currentSelection = SELECTIONTYPE.ROTATE
                };
                this.selectionArrowsPad.moveButtonOnClick = () => {
                    this.arrowSelection!.createLabels(SELECTIONTYPE.MOVE);
                    this.arrowSelection!.arrowsColor = "#f2622e";
                    this.arrowSelection!.changeArrowsColor("#f2622e");
                    this.selectionArrowsPad!.currentSelection = SELECTIONTYPE.MOVE
                };

                this.arrowSelection!.arrowsOnClick = (dir: DIRECTION) => {
                    if (this.selectionArrowsPad!.currentSelection === SELECTIONTYPE.MOVE) {
                        this.MoveAction.emit({
                            direction: SELECTIONTYPE.MOVE,
                            ...this.arrowToAxis[dir]
                        });
                    }
                    else if (this.selectionArrowsPad!.currentSelection === SELECTIONTYPE.ROTATE) {
                        this.RotationAction.emit({
                            direction: SELECTIONTYPE.ROTATE,
                            ...this.arrowToAxis[dir]
                        });
                    }
                }
            } 
        }) 

    }

    async imgAssetToBitmap(asset: AssetImg) : Promise<AssetBitmap> {
        const id = asset.id;
        const bitmap = await blobToImage(asset.blob);
        return {id: id, bitmap: bitmap};
    }
}
