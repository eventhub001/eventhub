import { Container, Bitmap, Rectangle, Stage, Triangle, Label } from 'zimjs';
import { AssetBitmap } from '../../../interfaces';

type AssetSelection = {
    id: number;
    bitmap: Bitmap
    border: Rectangle | undefined
}
export class AssetSelectorComponent {
    assetsImgs: AssetSelection[] = [];
    container: Container = new Container();
    x: number = 0;
    y: number = 0;
    padding: number = 0;
    background!: Rectangle;
    pageSizeX: number = 4;
    pageSizeY: number = 3;
    imageSize: number = 70;
    currentPage: number = 1;
    maxPage: number = 1;
    nextButton!: Triangle;
    prevButton!: Triangle;
    pageNumberVis!: Label; 

    constructor(bitmap: AssetBitmap[], x: number, y: number, padding: number) {
        this.assetsImgs = bitmap.map((img) => {return {id: img.id, bitmap: img.bitmap, border: undefined}});
        this.x = x;
        this.y = y;
        this.imageSize = 60;
        this.padding = padding;
        this.container = new Container().setBounds(this.imageSize * this.pageSizeX, this.imageSize).addTo();
        this.container.loc(this.x, this.y);
        this.maxPage = Math.ceil(this.assetsImgs.length / (this.pageSizeX * this.pageSizeY));
        this.buildcontainer();
     }

     buildcontainer(reset: boolean = false) {
        if (reset) {
            this.container.dispose();
            this.container = new Container().setBounds(this.imageSize * this.pageSizeX, this.imageSize).addTo();
            this.container.loc(this.x, this.y);
        }
        // Adding the background so we can see.
        this.background = new Rectangle(
            this.pageSizeX * (this.imageSize + this.padding) + this.padding,
            this.pageSizeY * (this.imageSize + this.padding),
            "black",
            "white"
        )
            .addTo(this.container)
            .loc(0, 0)
            .alp(0.5);
    
        this.assetsImgs.forEach((image, index) => {
            // Calculate row and column based on index
            const col = index % this.pageSizeX;
            const row = Math.floor(index / this.pageSizeX);
    
            // Calculate x and y positions
            const x = col * (this.imageSize + this.padding) + this.padding;
            const y = row * (this.imageSize + this.padding) + this.padding;
    
            image.bitmap.siz(this.imageSize, this.imageSize).loc(x, y).addTo(this.container);
    
            image.bitmap.x = x;
            image.bitmap.y = y;

            image.bitmap.on("mouseover", () => {
                // Create a border around the image
                if (!image.border) {
                    image.border = new Rectangle(
                        image.bitmap.width,
                        image.bitmap.height,
                        undefined,
                        "white"
                    )
                        .addTo(this.container)
                        .loc(image.bitmap.x, image.bitmap.y);
                }
            });
    
            image.bitmap.on("mouseout", () => {
                if (image.border) {
                    image.border.dispose();
                    image.border = undefined;
                }
            });
    
            image.bitmap.on("click", () => {
                this.onBitmapClick(image.id);
            });
        });

        this.buildNextPageButtons();
    }

    buildNextPageButtons() {
        this.nextButton = new Triangle(
            this.imageSize * 0.4,
            this.imageSize* 0.4,
            this.imageSize* 0.4,
            "#f2622e"
        ).addTo(this.container).cur().loc(
            (this.pageSizeX * (this.imageSize + this.padding) + this.padding) / 2 + this.imageSize * 0.4,
            this.pageSizeY * (this.imageSize + this.padding)
        ).rot(90);

        if (this.currentPage !== 1) {
            this.prevButton = new Triangle(
                this.imageSize * 0.4,
                this.imageSize* 0.4,
                this.imageSize* 0.4,
                "#f2622e"
            ).addTo(this.container).cur().loc(
                (this.pageSizeX * (this.imageSize + this.padding) + this.padding) / 2 - this.imageSize * 0.4,
                this.pageSizeY * (this.imageSize + this.padding)
            ).rot(-90);

            this.prevButton.on("click", () => {
                this.currentPage--;
                this.buildcontainer(true);
            });
        }

        this.nextButton.on("click", () => {
            this.currentPage++;
            this.buildcontainer(true);
        });

        this.pageNumberVis = new Label(this.currentPage.toString(), 20, "roboto", "white").addTo(this.container).centerReg().loc(
            (this.pageSizeX * (this.imageSize + this.padding) + this.padding) / 2,
            this.pageSizeY * (this.imageSize + this.padding)
        );
        this.pageNumberVis.sha("black");
    }
    onBitmapClick(id: number) {
    
    }
}