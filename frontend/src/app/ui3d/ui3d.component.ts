import { AfterContentInit, Component, EventEmitter, inject, Input, OnDestroy, Output, SimpleChange, SimpleChanges } from '@angular/core'
import { Frame, Circle, Dial, Emitter, Pen, MotionController, series, LabelOnArc, Tile, Rectangle, Bitmap, Stage, Carousel, Container, DisplayObject } from 'zimjs'
import { MatrixUI } from './matriz/matriz'
import { settings, SetUpUI } from './settings/settings'
import * as UICommands from './commands/commands'
import { AssetBitmap, AssetImg, AssetModel } from '../interfaces'
import { blobsToImages, blobToImage } from './loader/blobloader'
import { AssetSelectorComponent } from './selectors/assetselector'
import { ArrowsMenu, DIRECTION, MOVE_DIRECTION } from './arrows/arrows'
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
    @Output() MoveAction: EventEmitter<UICommands.move> = new EventEmitter<UICommands.move>()
    @Output() AddtionFromModelSelectedAction: EventEmitter<UICommands.addtion> = new EventEmitter<UICommands.addtion>()
    matriz?: MatrixUI;
    settings: settings;
    modelImgs: AssetBitmap[] = [];
    @Input() images: AssetImg[] = [];
    stage: Stage | undefined;
    
    constructor() {
        this.settings = SetUpUI.setUpUI(
            350, 600, 20, 15, 3, 21, 10, 3);
    }

    ngOnDestroy(): void {
        this.frame?.dispose()
    }

    async ngAfterContentInit() {
        // hardcoded have to change of course with the setting parameters.
        const divisionwidth = 0.0476;
        const divisionheight = 0.15;

        this.frame = new Frame({
            scaling: "zim",
            width: 400,
            height: 800,
            color: lighter,
            outerColor: blue,
            mouseMoveOutside: true, // so Pen and Dial work better
            ready: async () => {

                const pen = new Pen({ min: 10, max: 60 }, series(pink, white))
                    .addTo()
                    .bot()

                this.stage = new Stage("1");

                new MotionController(pen, "pressmove")

                console.log(this.settings);
                // const imgs = await blobToImage(this.images[0].blob);
                const imgs: AssetBitmap[] = await Promise.all(
                    this.images.map(async (img) => {
                    const {id, bitmap} = await this.imgAssetToBitmap(img);
                    return {id: id, bitmap: bitmap};
                }));

                this.matriz = new MatrixUI(this.settings.width, this.settings.height, this.settings.x, this.settings.y);

                const assetSelector = new AssetSelectorComponent(imgs, 10, 300, 5);

                assetSelector.onBitmapClick = (id: number) => {
                    this.AdditionAction.emit({
                        id: id
                    });
                }

                const arrowSelection = new ArrowsMenu(0, 0, 300, 300);

                arrowSelection.arrowsOnClick = (dir: DIRECTION) => {
                    console.log("working on arrows", dir);
                    this.MoveAction.emit(MOVE_DIRECTION[dir]);
                }

                this.matriz.onCellClick = (row: number, col: number) => {
                    console.log(`Cell clicked at row: ${row}, col: ${col}`);
                    this.AdditionAction.emit({
                        x: col,
                        z: row
                    });
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
