import { Container, Bitmap } from 'zimjs';

export class AssetSelectorComponent {
    assetsImgs: Bitmap[] = [];
    container: Container = new Container();
    x: number = 0;
    y: number = 0;
    padding: number = 0;

    constructor(bitmap: Bitmap[], x: number, y: number, padding: number) {
        this.assetsImgs = bitmap;
        this.x = x;
        this.y = y;
        this.padding = padding;
        this.container = new Container();
        this.container.pos(this.x, this.y);
        this.buildcontainer();
        this.container.drag({all: true});
     }

     buildcontainer() {
        this.assetsImgs.forEach((image, index) => {
            image.siz(20, 20);
            image.x = this.x * index + this.padding;
            image.y = this.y + this.padding;
            image.addTo(this.container);
            this.x += image.width + this.padding
        })
     }

}