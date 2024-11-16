import { Container, Bitmap } from 'zimjs';
import { AssetBitmap } from '../../interfaces';

export class AssetSelectorComponent {
    assetsImgs: AssetBitmap[] = [];
    container: Container = new Container();
    x: number = 0;
    y: number = 0;
    padding: number = 0;

    constructor(bitmap: AssetBitmap[], x: number, y: number, padding: number) {
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
            image.bitmap.siz(110, 100);
            image.bitmap.x = this.x * index + this.padding;
            image.bitmap.y = this.y + this.padding;
            image.bitmap.addTo(this.container);
            this.x += image.bitmap.width + this.padding

            image.bitmap.on('click', () => {
                this.onBitmapClick(image.id);
            })
        })
     }

     onBitmapClick(id: number) {
        console.log("id", id);
     }

}