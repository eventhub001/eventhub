import { EventType } from "@angular/router";
import { ThreeDObject } from "../models/threeobject.model";
import { EventGrid } from "./grid";
import { DefaultThreeDObject } from "../models/default.model";
import { NMatrix } from "./matrices";
import { Side } from "./3dtypes";
import * as THREE from 'three';
import { Asset, AssetMetadata } from "../../../interfaces";
import { GridAdditionError } from "./exceptions";
import { checkCollisionCustom } from "./3dobjects-utils";

export class Event3DManager {

    sets: Set[] = [];
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
            const newSet = new Set("Set" + this.sets.length, this.grid, newasset);
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

    findSetByAsset(asset: {asset: Asset, position: {col: number; floor: number; row: number}}) : Set | undefined {
        let foundSet: Set | undefined = undefined;
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

    moveAsset(asset: {asset: Asset, position: {col: number; floor: number; row: number}}, col: number, floor: number, row: number, currentset: Set) {

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

    public addSet(set: Set) {
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
        console.log("computed rendering");
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

export enum Direction {
    FRONT = "front",
    BACK = "back",
    LEFT = "left",
    RIGHT = "right"
}

const directionMap = {
    [Direction.FRONT]: { x: 1, z: 0 },
    [Direction.BACK]: { x: -1, z: 0 },
    [Direction.LEFT]: { x: 0, z: -1 },
    [Direction.RIGHT]: { x: 0, z: 1 },
};

function updateNewPosition(direction: Direction, indx: number, indz: number) {
    if (direction) {
        indx += directionMap[direction].x;
        indz += directionMap[direction].z;
    }
    return { indx, indz };
}

export interface Set {
    name: string;
    matrix: NMatrix<Asset>;
    add(newasset: {
        col: number;
        floor: number;
        row: number;
        grid: EventGrid;
        direction1: Direction;
        direction2?: Direction;
        gap?: number;
    }): void;
    delete(selectedAsset: {asset: Asset, position: {col: number; floor: number; row: number}}): void;

    placeAsset(asset: Asset, x: number, y: number, z: number, grid: EventGrid): void;
    hasAssetInPosition(x: number, y: number, z: number): boolean;
    getAssets(): Asset[];
    findAsset(uuid: string): {asset: Asset, position: {col: number; floor: number; row: number}} | null;
}   

export class Set implements Set {
    name: string;
    assets: Asset[] = [];
    matrix: NMatrix<Asset>;
    sideMatrix: NMatrix<{loc1: Side; loc2: Side}> | undefined; 
    grid: EventGrid;

    constructor(name: string, grid: EventGrid, initialAsset?: Asset) {
        this.name = name;
        this.grid = grid;
        this.matrix = new NMatrix<Asset>(grid.cols, grid.floor, grid.rows, null);
        if (initialAsset) {
            this.matrix.matrix[initialAsset.col][initialAsset.floor][initialAsset.row] = initialAsset;
            this.sideMatrix = new NMatrix<{loc1: Side; loc2: Side}>(grid.cols, grid.floor, grid.rows, {loc1: Side.CENTER, loc2: Side.BOTTOM});
            this.placeAsset(initialAsset, initialAsset.col, initialAsset.floor, initialAsset.row, grid);
            this.assets.push(initialAsset);

        }
    }

    public add(oldasset: {
        col: number;
        floor: number;
        row: number;
        grid: EventGrid;
        direction1: Direction;
        direction2?: Direction;
        gap?: number;
    }) : Asset | null {


        if (this.matrix.matrix[oldasset.col][oldasset.floor][oldasset.row] === null) {
            throw new Error('The asset is not in the grid');
        }
        if (oldasset.direction1 === oldasset.direction2) {
            throw new Error('Direction1 and Direction2 cannot be the same');
        }
        let newasset: Asset;

        newasset = this.matrix.matrix[oldasset.col][oldasset.floor][oldasset.row]!.clone();

        if (oldasset.gap) {
            throw new Error('The gap is not implemented yet');
            // logic for when there is a gap. I will put this to further into the project because it take a little bit more effort, but it would cool to be able to get out of the grid to acommodate the assets based on some custom gap.
        }

        else {
            let indx = newasset.x;
            let indz = newasset.z;

            ({ indx, indz } = updateNewPosition(oldasset.direction1!, indx, indz));
            
            if (oldasset.direction2)
                ({ indx, indz } = updateNewPosition(oldasset.direction2, indx, indz));


            if (indx < 0 || indx >= this.matrix.cols || indz < 0 || indz >= this.matrix.rows) {
                throw new Error('The asset is out of the grid');
            }

            // here we update the x and y according to the new position. This can be improved by restructuring what has the resopnsability to update the position. Because one can forget to update the x and y of the asset.
            newasset.x = indx;
            newasset.z = indz;

            this.matrix.matrix[indx][newasset.y][indz] = newasset;
            this.matrix.matrix[indx][newasset.y][indz]!.x = indx;
            this.matrix.matrix[indx][newasset.y][indz]!.z = indz;

            this.placeAsset(newasset, indx, newasset.y, indz, oldasset.grid);

            this.assets.push(newasset);

            return this.getAsset(indx, newasset.y, indz);
        }
    }

    delete(selectedAsset: {asset: Asset, position: {col: number; floor: number; row: number}}) {
        this.matrix.matrix[selectedAsset.position.col][selectedAsset.position.floor][selectedAsset.position.row] = null;
    }

    deleteAll() {
        this.matrix = new NMatrix<Asset>(this.grid.cols, this.grid.floor, this.grid.rows, null);
    }

    move(asset: {asset: Asset, position: {col: number; floor: number; row: number}}, col: number, floor: number, row: number) {
        console.log("removing: ", asset.position.col, asset.position.floor, asset.position.row);
        this.matrix.matrix[asset.position.col][asset.position.floor][asset.position.row] = null;
        this.matrix.matrix[col][floor][row] = asset.asset;
        this.placeAsset(asset.asset, col, floor, row);
        
    }

    public getAsset(x: number, y: number, z: number) {
        return this.matrix.matrix[x][y][z];
    }

    public placeAsset(asset: Asset, x: number, y: number, z: number) {
        if (x >= this.matrix.cols || z >= this.matrix.rows) {
            console.log(asset)
            console.error(x, y, z);
            console.log("with matrix of dims: ", this.matrix.cols, this.matrix.rows);
            throw new Error('The asset is out of the grid');
        }
        this.grid.placeAssetTo(asset, x, y, z, this.sideMatrix!.matrix[x][y][z]!.loc1, this.sideMatrix!.matrix[x][y][z]!.loc2);
    }

    public render(asset: Asset, scene: THREE.Scene) {
        scene.add(asset.content);
    }

    public hasAssetInPosition(row: number, floor: number, col: number): boolean {
        let occupiedByAsset = false;
        this.matrix.forEach((value, _i, _j, _k) => {
            if (value !== null && _i === row && _j === floor && _k === col) {
                console.error('occupied by asset in position');
                console.error(_i, _j, _k);
                console.error("asset: ", value);
                occupiedByAsset = true;
            }
        });
        return occupiedByAsset;
    }

    public getAssets(): Asset[] {
        const objects: Asset[] = [];
        this.matrix.forEach((value, _i, _j, _k) => {
            if (value !== null) {
                objects.push(value);
            }
        });
        return objects;
    }


    public findAsset(uuid: string) : {asset: Asset, position: {col: number; floor: number; row: number}} | null {
        let col = -1;
        let floor = -1;
        let row = -1;
        let asset: Asset | null = null;
        this.matrix.forEach((value, _i, _j, _k) => {
            if (value !== null && value.content.uuid === uuid) {
                asset = value;
                col = _i;
                floor = _j;
                row = _k; 
            }
        });
        if (asset === null) {
            return null;
        }
        return {asset: asset, position: {col: col, floor: floor, row: row}};
    }
}

export class ChairSet extends Set {

    constructor(name: string, grid: EventGrid, initialChair?: DefaultThreeDObject) {
        if (initialChair) {
            super(name, grid, initialChair);
        }
        else {
            super(name, grid);
        }
    }

    // remove the scene from the parameters. The final rendering should be set in another function. 
    public override placeAsset(asset: Asset, x: number, y: number, z: number) {
        this.grid.placeAssetTo(asset, x, y, z, this.sideMatrix!.matrix[x][y][z]!.loc1, this.sideMatrix!.matrix[x][y][z]!.loc2);
    }

    public override render(asset: Asset, scene: THREE.Scene) {
        scene.add(asset.content);
    }

    public override add(oldasset: {
        col: number;
        floor: number;
        row: number;
        grid: EventGrid;
        direction1: Direction;
        direction2?: Direction;
        gap?: number
    }) : Asset | null {
        // add the logic for the gap.
        const result = super.add(oldasset);
        if (result!.size.width > (oldasset.grid.width / oldasset.grid.cols) || result!.size.depth > (oldasset.grid.depth / oldasset.grid.rows)) {

            if (oldasset.col === 0 && (oldasset.direction1 === Direction.FRONT || oldasset.direction2 === Direction.FRONT)) {
                this.sideMatrix!.change({loc1: Side.BOTTOM, loc2: Side.BACK});
            }

            const assetwidth = result!.size.width;
            const assetdepth = result!.size.depth;

            this.matrix.matrix[result!.x][result!.y][result!.z] = null;
            
            const offsetx = Math.floor(assetwidth / (oldasset.grid.width / oldasset.grid.cols));
            const offsetz = Math.floor(assetdepth / (oldasset.grid.depth / oldasset.grid.rows));

            let x = result!.x;
            if (oldasset.direction1 === Direction.FRONT || oldasset.direction2 === Direction.FRONT) {
                x = result!.x + offsetx;
            }

            const z = result!.z + offsetz;
            // here we update the x and y according to the new position. This can be improved by restructuring what has the resopnsability to update the position. Because one can forget to update the x and y of the asset.
            result!.x = x;
            result!.z = z;

            this.matrix.matrix[x][oldasset.floor][z] = result!.clone();

            // this.placeAsset(result!, x, oldasset.floor, z, oldasset.grid);

            return result;
        }

        //result!.content.scale.set(0.34, 1, 1);
        return null;
    }
}