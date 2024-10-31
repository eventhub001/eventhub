import { AfterContentInit, Component, EventEmitter, inject, Input, OnDestroy, Output, SimpleChange, SimpleChanges } from '@angular/core'
import { Frame, Circle, Dial, Emitter, Pen, MotionController, series, LabelOnArc, Tile, Rectangle, Bitmap, Stage, Carousel, DisplayObject } from 'zimjs'
import { MatrixUI } from './matriz/matriz'
import { settings, SetUpUI } from './settings/settings'
import * as UICommands from './commands/commands'
import { AssetModel } from '../interfaces'
import { AuthService } from '../services/auth.service'
import { ModelService } from '../services/model/model.service'
import { blobsToImages, blobToImage } from './loader/fileloader'

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
    currentChair: number[] = [2, 0];
    matriz?: MatrixUI;
    settings: settings;
    modelService: ModelService = inject(ModelService);
    modelImgs: Map<number, Bitmap> = new Map<number, Bitmap>();
    @Input() images: Blob[] = [];
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
            height: 600,
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
                const imgs = await blobToImage(this.images[0]);

                this.matriz = new MatrixUI(this.settings.width, this.settings.height, this.settings.x, this.settings.y);

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

    title = 'ZIM Template';
}
