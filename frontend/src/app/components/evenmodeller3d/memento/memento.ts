import { Asset } from "../../../interfaces";

export interface Memento {

    getAsset(): Asset;
}

export class MementoThreeObject {

    asset: Asset;

    constructor(asset: Asset) {
        this.asset = asset;
    }
    getAsset() {
        return this.asset;
    }
}