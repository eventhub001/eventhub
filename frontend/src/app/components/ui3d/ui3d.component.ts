import { AfterContentInit, Component, EventEmitter, inject, Input, OnDestroy, Output, SimpleChange, SimpleChanges } from '@angular/core'
import { Frame, Circle, Dial, Emitter, Pen, MotionController, series, LabelOnArc, Tile, Rectangle, Bitmap, Stage, Carousel, Container, DisplayObject } from 'zimjs'
import { MatrixUI } from './matriz/matriz'
import { settings, SetUpUI } from './settings/settings'
import * as UICommands from './commands/commands'
import { blobsToImages, blobToImage } from './loader/blobloader'
import { AssetSelectorComponent } from './menus/assetselector'
import { ArrowsMenu, DIRECTION, MOVE_DIRECTION, SELECTIONTYPE } from './menus/arrows'
import { AssetBitmap, AssetImg, AssetModel } from '../../interfaces'
import { SelectionArrowsPad } from './menus/selectionarrowspad'
import { arrowToAxis } from '../evenmodeller3d/input-projections/movement'
import { arrowsToRotation } from '../evenmodeller3d/input-projections/rotation'
import { DeleteActionPad } from './menus/delete'
@Component({
    selector: 'app-ui3d',
    standalone: true,
    templateUrl: './ui3d.component.html',
    styleUrls: ['./ui3d.component.css']
})
export class Ui3DComponent implements OnDestroy, AfterContentInit {
    frame: Frame | undefined
    @Input() modelMetadata: AssetModel[] = [];
    @Output() AdditionAction: EventEmitter<UICommands.addtion> = new EventEmitter<UICommands.addtion>()
    @Output() MoveAction: EventEmitter<UICommands.directional> = new EventEmitter<UICommands.directional>()
    @Output() RotationAction: EventEmitter<UICommands.directional> = new EventEmitter<UICommands.directional>()
    @Output() AddtionFromModelSelectedAction: EventEmitter<UICommands.addtion> = new EventEmitter<UICommands.addtion>()
    @Output() DeleteAction: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Input() arrowToAxis!: arrowToAxis;
    @Input() arrowToRotation!: arrowsToRotation;
    matriz?: MatrixUI;
    settings: settings;
    modelImgs: AssetBitmap[] = [];
    @Input() images: AssetImg[] = [];
    width: number = 300;
    height: number = 800;
    stage: Stage | undefined;

    selectionArrowsPad: SelectionArrowsPad | undefined;
    arrowSelection: ArrowsMenu | undefined;
    deletePad: DeleteActionPad | undefined;
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
        // hardcoded have to change of course with the setting parameters.
        const divisionwidth = 0.0476;
        const divisionheight = 0.15;

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

                const assetSelector = new AssetSelectorComponent(imgs, 10, 400, 5);
                assetSelector.onBitmapClick = (id: number) => {
                    this.AdditionAction.emit({
                        id: id
                    });
                }
                this.arrowSelection = new ArrowsMenu(PADDING, PADDING + 20, 300, 300);

                this.selectionArrowsPad = new SelectionArrowsPad(this.width / 2, this.height * 0.9, 100, 40);

                this.deletePad = new DeleteActionPad(this.width / 2, this.height * 0.8, 100, 40);

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
