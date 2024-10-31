import { Bitmap } from "zimjs/ts-src/typings/zim";

export class AssetSelectorComponent {
    assetsImgs: Bitmap[] = [];
    
    constructor(bitmap: Bitmap[]) {
        this.assetsImgs = bitmap;
     }

    public loadImgs() {
        return this.assetsImgs;
    }

}