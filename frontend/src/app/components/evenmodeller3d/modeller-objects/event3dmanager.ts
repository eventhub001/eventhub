import { EventType } from "@angular/router";
import { ThreeDObject } from "../models/threeobject.model";
import { EventGrid } from "./grid";
import * as THREE from 'three';
import { Asset, AssetMetadata } from "../../../interfaces";
import { GridAdditionError } from "../exceptions/exceptions";
import * as Sets from "./sets";

export class Event3DManager {

    sets: Sets.Set[] = [];
    grid: EventGrid;

    constructor(grid: EventGrid) {
        this.sets = [];
        this.grid = grid;
    }

    add(asset: Asset, col: number, floor: number, row: number) {
        const newasset = asset.clone();

        let allowedPosition = true;
        console.log("this.sets", this.sets);
        // verify if there a set created
        this.sets.forEach((set) => {
            if (set.hasAssetInPosition(col, floor, row)) {
                throw new GridAdditionError("There is already an asset is the position selected");
            }
        });
        
        newasset.col = col;
        newasset.floor = floor;
        newasset.row = row;

        if (allowedPosition) {
            const newSet = new Sets.Set("Set" + this.sets.length, this.grid, newasset);
            this.addSet(newSet);
        }
    }

    load(asset: Asset) {
        this.add(asset, asset.col, asset.floor, asset.row);
    }

    
    move(selectedAsset: {asset: Asset, position: {col: number; floor: number; row: number}}, col: number, floor: number, row: number) {
        let allowedPosition = true;

        this.sets.forEach((set) => {
            if (set.hasAssetInPosition(selectedAsset.position.col + col, selectedAsset.position.floor + floor, selectedAsset.position.row + row)) {
                throw new GridAdditionError("There is already an asset is the position selected");
            }
        });

        const foundSet = this.findSetByAsset(selectedAsset);

        console.log("foundSet", foundSet);
        if (foundSet === undefined) {
            console.log("Set not found.");
            throw new Error("Set not found.");
        }

        if (allowedPosition) {
            console.log("selectedAsset", selectedAsset);
            // this.computeSpatialObjectOccupancy(selectedAsset.asset, selectedAsset.position.col + col, selectedAsset.position.floor + floor, selectedAsset.position.row + row, scene);
            this.moveAsset(selectedAsset, selectedAsset.position.col + col, selectedAsset.position.floor + floor, selectedAsset.position.row + row, foundSet);
        }
    }

    findSetByAsset(asset: {asset: Asset, position: {col: number; floor: number; row: number}}) : Sets.Set | undefined {
        let foundSet: Sets.Set | undefined = undefined;
        this.sets.forEach((set) => {
            if (set.hasAssetInPosition(asset.position.col, asset.position.floor, asset.position.row)) {
                console.log("returning set from findSetByAsset");
                console.log(set);
                foundSet = set;
            }
        })

        if (foundSet !== undefined) {
            return foundSet;
        }

        return undefined;
    }

    rotate(selectedAsset: {asset: Asset, position: {col: number; floor: number; row: number}}, x: number, y: number, z: number) {
        // calculate if the asset can be rotated. That means to check the space the new asset will take
        selectedAsset.asset.rotate(x, y, z);
    }

    delete(selectedAsset: {asset: Asset, position: {col: number; floor: number; row: number}}, scene: THREE.Scene) {
        this.sets.forEach((set) => {
            if (set.hasAssetInPosition(selectedAsset.position.col, selectedAsset.position.floor, selectedAsset.position.row)) {
                console.log("found asset in set, ready to delete in position: ", selectedAsset.position);
                set.delete(selectedAsset);
                // remove the set if it is empty
                if (set.getAssets().length === 0) {
                    this.sets.splice(this.sets.indexOf(set), 1);
                }
                scene.remove(selectedAsset.asset.content);
            }
        });
    }

    deleteAll(scene: THREE.Scene) {
        this.sets.forEach((set) => {
            set.getAssets().forEach((asset) => {
                scene.remove(asset.content);
            })
            set.deleteAll();
            this.sets = [];
        });
    }

    moveAsset(asset: {asset: Asset, position: {col: number; floor: number; row: number}}, col: number, floor: number, row: number, currentset: Sets.Set) {

        if (!currentset) {
            throw new Error("Set not found.");
        }

        console.log("currentset", currentset.name);
        currentset.move(asset, col, floor, row);

        const positionedAsset = this.getAsset(col, floor, row);
        if (!positionedAsset) {
            throw new Error("Asset not found.");
        }

        this.sets.forEach((set) => {
            const assets = set.getAssets();
            for (let i = 0; i < assets.length; i++) {

                if (assets[i].content.uuid === positionedAsset.content.uuid) {
                    continue;
                }
                
                const from = new THREE.Box3().setFromObject(assets[i].content);
                const to = new THREE.Box3().setFromObject(positionedAsset.content);

                if (from.intersectsBox(to)) {
                    console.log(assets[i].content, " intersects with ", positionedAsset.content);
                    console.log(positionedAsset);
                    // this.delete({asset: positionedAsset, position: {col, floor, row}}, scene);
                    // this.add(asset.asset, asset.position.col, asset.position.floor, asset.position.row);
                    currentset.move({asset: positionedAsset, position: {col: col, floor: floor, row: row}}, asset.position.col, asset.position.floor, asset.position.row);
                    throw new GridAdditionError("There is an interception between the assets");
                }
                else {
                    console.log("Not intersecting");
                }
            }
        })
    }

    hasAssetInPosition(col: number, floor: number, row: number) {
        for (let i = 0; i < this.sets.length; i++) {
            if (this.sets[i].hasAssetInPosition(col, floor, row)) {
                return true;
            }
        }
        return false;
    }

    public addSet(set: Sets.Set) {
        this.sets.push(set);
    }

    // DEBUGGING FUNCTION delete when no needed and create it for the unit tests class.
    public printAssets() {
        //console.log(this.assets);
        const arr = this.sets[0].matrix.matrix;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) { // Check if the row is defined
                for (let j = 0; j < arr[i].length; j++) {
                    for (let k = 0; k < arr[i][j].length; k++) {
                        if (arr[i][j][k]) {
                            console.log(`[${i}][${j}][${k}] = ${arr[i][j][k]!.id}`);
                        }
                    }
                }
            }
        }
    }

    // debug function. Delete when no needed.
    public render(scene: THREE.Scene) {
        // render all the assets in the scene.
        console.log("total sets: ", this.sets.length);
        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];
            console.log(set);
            const arr = set.matrix.matrix;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i]) { // Check if the row is defined
                    for (let j = 0; j < arr[i].length; j++) {
                        for (let k = 0; k < arr[i][j].length; k++) {
                            if (arr[i][j][k] !== null) {
                                // render the asset
                                console.log(`[${i}][${j}][${k}] = ${arr[i][j][k]!.content.uuid}`);
                                // set.placeAsset(arr[i][j][k]!, i, j, k, this.grid, scene);
                                set.render(arr[i][j][k]!, scene);
                            }
                        }
                    }
                }
            }
        }
    }

    public computeSpatialObjectOccupancy(asset: Asset, col: number, floor: number, row: number, scene: THREE.Scene) {

        // create just the bounding box of the content.
        this.add(asset, col, floor, row);
        const positionedAsset = this.getAsset(col, floor, row);
        if (!positionedAsset) {
            throw new Error("Asset not found.");
        }

        this.sets.forEach((set) => {
            const assets = set.getAssets();
            for (let i = 0; i < assets.length; i++) {

                if (assets[i].content.uuid === positionedAsset.content.uuid) {
                    continue;
                }
                
                const from = new THREE.Box3().setFromObject(assets[i].content);
                const to = new THREE.Box3().setFromObject(positionedAsset.content);

                if (from.intersectsBox(to)) {
                    console.log(assets[i].content, " intersects with ", positionedAsset.content);
                    this.delete({asset: positionedAsset, position: {col, floor, row}}, scene);
                    throw new GridAdditionError("There is an interception between the assets");
                }
                else {
                    console.log("Placing asset");
                }
            }
        })
    }
    
    getAsset(col: number, floor: number, row: number) {
        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];
            const asset = set.getAsset(col, floor, row);
            if (asset) {
                return asset;
            }
        }
        return null;
    }

    getAssets() {
        const assets: Asset[] = [];
        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];
            assets.push(...set.getAssets());
        }
        return assets;
    }

    getAssetsAsObjects(): THREE.Object3D[] {
        const objects: THREE.Object3D[] = [];
        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];
            objects.push(...set.getAssets().map((asset) => asset.content));
        }
        return objects;
    }

    findAssetFromObject(uuid: string) : {asset: Asset, position: {col: number; floor: number; row: number}} | null {
        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];
            const asset = set.findAsset(uuid);
            if (asset) {
                return {asset: asset.asset, position: {col: asset.position.col, floor: asset.position.floor, row: asset.position.row}};
            }
        }
        return null;
    }
}